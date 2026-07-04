<template>
  <ion-page>
    <ion-header class="ion-no-border" >
      <ion-toolbar class="custom-toolbar">
        <ion-title class="ion-text-center logo-title">
          <span class="text-white">ANIM</span><span class="text-lime">EX</span>
        </ion-title>
      </ion-toolbar>
      <ion-toolbar class="banners-toolbar">
        <div class="fixed-banners">
          <div class="recognized-animal-banner" v-if="sessionStore.recognizedAnimal">
            {{ sessionStore.recognizedAnimal.displayName }}
          </div>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content ref="contentRef" class="ion-padding chat-background" :scroll-events="true" @ionScrollStart="hideKeyboard">
      <div class="chat-container" :style="{ 
             paddingBottom: kbHeight > 0 
            ? (isIOS ? `${kbHeight + 20}px` : '70px') 
            : `calc(130px + var(--ion-safe-area-bottom, 0px))`, 
            transition: 'padding-bottom 0.25s cubic-bezier(0.32, 0.72, 0, 1)'
     }">
        
        <ChatBubble 
          v-for="(msg, index) in chatStore.messages" 
          :key="index" 
          :role="msg.role === 'user' ? 'utente' : 'ai'"
          :text="msg.content" 
        />
        
        <ChatBubble 
          v-if="uiState.getProcessing()" 
          role="ai" 
          text="Elaborazione in corso..." 
          isThinking 
        />
        
        <div v-if="chatStore.activeQuestion" class="message-wrapper wrapper-left animate-pop">
          <div class="message-bubble animal-bubble quiz-bubble">
      
            <p><strong>🧩 Quiz:</strong> {{ chatStore.activeQuestion.prompt }}</p>
      
            <div v-if="chatStore.activeQuestion.type === 'multiple_choice' && chatStore.activeQuestion.choices && chatStore.activeQuestion.choices.length > 0" class="inline-quiz-options">              
              <ion-button 
                v-for="(choice, i) in chatStore.activeQuestion.choices" 
                :key="i"
                size="small"
                fill="outline"
                class="quiz-choice-btn"
                @click="handleTextSubmit(choice)"
                :disabled="uiState.getProcessing()"
              >
                {{ choice }}
              </ion-button>
            </div>

            <div v-else-if="chatStore.activeQuestion.type === 'yes_no'" class="inline-quiz-options">
              <ion-button 
                size="small"
                fill="outline"
                class="quiz-choice-btn"
                @click="handleTextSubmit('Vero')"
                :disabled="uiState.getProcessing()"
              >
                Vero
              </ion-button>
              <ion-button 
                size="small"
                fill="outline"
                class="quiz-choice-btn"
                @click="handleTextSubmit('Falso')"
                :disabled="uiState.getProcessing()"
              >
                Falso
              </ion-button>
            </div>

            <div v-else >
              <p class="info-text">Rispondi scrivendo o parlando...</p>
            </div>
      
            
          </div>
        </div>
      </div>

    </ion-content>
    
    <ion-footer
      class="ion-no-border" :style="{ 
        transform: kbHeight > 0 
          ? (isIOS ? `translateY(-${kbHeight}px)` : `translateY(0px)`) 
          : `translateY(calc(-50px - var(--ion-safe-area-bottom, 0px)))`,
        transition: 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)' 
      }">

      <InputBar 
        v-model="inputTextModel"
        :isListening="uiState.getRecording()"
        :isSpeaking="uiState.getSpeaking()"
        :isQuizActive="!!chatStore.activeQuestion"
        @toggle-microphone="toggleMicrophone"
        @cancel-recording="handleCancel"
        @stop-audio="handleStopAudio"
        @send="uiState.getRecording() ? handleStop() : handleTextSubmit()"
        @open-quiz-menu="openMenuQuiz()"
        @cancel-quiz="cancelActiveQuiz"
      />
    </ion-footer>
    <QuizMenu 
      :isOpen="isQuizModalOpen" 
      @close="isQuizModalOpen = false" 
      @select-quiz="selectQuiz" 
    />
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue';
import { IonPage, IonContent, IonButton, IonFooter, onIonViewDidLeave, alertController, IonHeader, IonToolbar, IonTitle} from '@ionic/vue';
import ChatBubble from '@/components/ChatBubble.vue';
import InputBar from '@/components/InputBar.vue';
import { useChatStore } from '@/stores/chatStore';
import { CHAT_STATUS } from '@/utility/constants';
import { type DifficultyLevel} from '@/utility/Types';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { useSessionStore } from '@/stores/sessionStore';
import {globalUiState} from '@/utility/UiState';
import { Keyboard } from '@capacitor/keyboard';
import QuizMenu from '@/components/QuizMenu.vue';
import { useManagerStore } from '@/stores/managerStore';
import { Capacitor } from '@capacitor/core';
// --- CHAT INITIALIZATION ---

const chatStore = useChatStore();
const sessionStore = useSessionStore();
const managerStore = useManagerStore();
const conversationManager = computed(() => managerStore.conversationManager);
const kbHeight = ref(0);
const contentRef = ref();
const isIOS = Capacitor.getPlatform() === 'ios';
// --- UI STATE VARIABLES ---
const uiState = globalUiState;
const inputTextModel = computed({
  get() {
    return uiState.getInputText();
  },
  set(newValue: string) {
    uiState.setInputText(newValue);
  }
});

onMounted(() => {
  // Keyboard event listeners to adjust the UI when the keyboard is shown or hidden
  Keyboard.addListener('keyboardWillShow', (info) => {
    kbHeight.value = info.keyboardHeight;
    document.body.classList.add('keyboard-is-open');
  });
  Keyboard.addListener('keyboardWillHide', () => {
    kbHeight.value = 0;
    document.body.classList.remove('keyboard-is-open');
  });
  managerStore.initConversationManager();
});

// --- WATCHERS TO SYNC AUDIO AND UI ---

watch(
  () => chatStore.messages.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      const lastMsg = chatStore.messages[newLength - 1];
      if (lastMsg &&lastMsg.role === 'model') {
        uiState.setProcessing(false);
        uiState.setStatusMessage(CHAT_STATUS.SUCCESS);
        uiState.setSpeaking(true);
      }
    }
    scrollDown();
  }
);

watch(
  () => chatStore.activeQuestion,
  (newQuestion) => {
    if (newQuestion) {
      uiState.setProcessing(false);
      uiState.setStatusMessage(CHAT_STATUS.SUCCESS);
      uiState.setSpeaking(true);
      scrollDown();
    }
  }
);
// --- EVENT HANDLERS ---

const handleStart = async () => {
  await conversationManager.value?.stopListening();
  try {
     uiState.setStatusMessage(CHAT_STATUS.INITIALIZING);
     uiState.setRecording(true);
     uiState.setMicReady(false);

    await conversationManager.value?.startInteraction(() => {
      uiState.setMicReady(true);
      uiState.setStatusMessage(CHAT_STATUS.RECORDING);
      }, (errorMessage) => {
        if (errorMessage === 'NEEDS_SETTINGS') {
          showSettingsAlert();
          // This if is to prevent overwriting the alert message if the user has already been prompted
          if(uiState.getStatusMessage() != CHAT_STATUS.DENIED_HARD){
            uiState.setStatusMessage(CHAT_STATUS.DENIED_HARD);
          }
        } else if (errorMessage === 'FIRST_DENIAL') {
          uiState.setStatusMessage(CHAT_STATUS.DENIED_SOFT);
        } else {
          uiState.setStatusMessage(("Errore: " + errorMessage) as any);
        }
         uiState.setRecording(false);
         uiState.setMicReady(false);
      });
    
  } catch (error: any) {
    await uiState.setStatusMessage(("Errore: " + error.message) as any);
    uiState.setRecording(false);
  }
};

const handleStop = async () => {
  uiState.setRecording(false);
  uiState.setProcessing(true);
  uiState.setStatusMessage(CHAT_STATUS.THINKING);
  uiState.setUsingKeyboard(false);
  try {
    await conversationManager.value?.stopListening();
    const userText = conversationManager.value ? await conversationManager.value?.getCurrentTranscript() : "";
    if(uiState.getQuizStatus()){
      await conversationManager.value?.validateQuiz(userText);
      uiState.setStatusMessage(CHAT_STATUS.SUCCESS);
    } 
    else{
      await conversationManager.value?.processTextInteraction(userText);
      uiState.setStatusMessage(CHAT_STATUS.SUCCESS);
    }
  } catch (error: any) {
    uiState.setStatusMessage(("Errore: " + error.message) as any);
  } finally {
    await conversationManager.value?.resetTranscript();
    uiState.setProcessing(false);
    uiState.setQuizStatus(false);
    uiState.setSpeaking(false);
  }
};


const toggleMicrophone = async () => {
  if (uiState.getProcessing() || uiState.getRecording()) return;
  if (uiState.getSpeaking()) {
    await handleStopAudio();
  }
  if (uiState.getRecording()) {
    await conversationManager.value?.stopListening();
    await conversationManager.value?.resetTranscript();
    uiState.setRecording(false);
    uiState.setStatusMessage(CHAT_STATUS.IDLE);
  } else {
    handleStart();
  }
};

const handleCancel = async () => {
  if (uiState.getRecording()) {
    await conversationManager.value?.stopListening();
    await conversationManager.value?.resetTranscript(); 
    uiState.setRecording(false);
    uiState.setStatusMessage(CHAT_STATUS.IDLE);
  }
};

const handleStopAudio = async () => {
  await conversationManager.value?.stopSpeaking();
  uiState.setSpeaking(false);
};


const handleTextSubmit = async (selectedAnswer?: string | Event) => {
  const clickedAnswer = typeof selectedAnswer === 'string' ? selectedAnswer : "";
  const text = clickedAnswer || uiState.getInputText().trim();
  await conversationManager.value?.stopSpeaking();
  if (!text  || uiState.getProcessing()) return;
  uiState.setInputText("");
  uiState.setProcessing(true);
  uiState.setStatusMessage(CHAT_STATUS.THINKING);
  try {
    if(uiState.getQuizStatus()){ 
      await conversationManager.value?.validateQuiz(text);
    }else {
      await conversationManager.value?.processTextInteraction(text);
    }
     uiState.setStatusMessage(CHAT_STATUS.SUCCESS);  
  } catch (error: any) {
    uiState.setStatusMessage(("Errore: " + error.message) as any);
  }
   finally {
    uiState.setProcessing(false);
    uiState.setQuizStatus(false);
    uiState.setSpeaking(false);
  }
  
};

const handleQuizRequest = async (difficulty: DifficultyLevel) => {
  uiState.setShowQuizOptions(false);
  uiState.setProcessing(true);
  uiState.setStatusMessage(CHAT_STATUS.THINKING);
  await conversationManager.value?.stopSpeaking();
  try {
    uiState.setQuizStatus(conversationManager.value ? await conversationManager.value.requestQuiz(difficulty) : false);
    uiState.getQuizStatus() ? uiState.setStatusMessage(CHAT_STATUS.QUIZ_LOADED) : uiState.setStatusMessage(CHAT_STATUS.NO_QUIZ_AVAILABLE);
  } catch (error: any) {
    uiState.setStatusMessage(("Errore quiz: " + error.message) as any);
  } finally {
    uiState.setProcessing(false);
    uiState.setSpeaking(false);
  }
};


onIonViewDidLeave(async () => {
  if(uiState.getRecording()) {
    await conversationManager.value?.stopListening();
    await conversationManager.value?.resetTranscript();
    uiState.setRecording(false);
  }
  uiState.setStatusMessage(CHAT_STATUS.IDLE);
  await conversationManager.value?.stopSpeaking();
  document.body.classList.remove('keyboard-is-open');
});

const showSettingsAlert = async () => {
  const alert = await alertController.create({
    header: 'Microfono Disabilitato',
    message: "L'app ha bisogno del microfono e del riconoscimento vocale per ascoltare la tua voce. Vuoi aprire le impostazioni del telefono per consentire l'accesso?",
    buttons: [
      {
        text: 'Annulla',
        role: 'cancel',
        handler: () => {
          uiState.setStatusMessage(CHAT_STATUS.DENIED_SOFT);
        }
      },
      {
        text: 'Apri Impostazioni',
        role: 'confirm',
        handler: () => {
          openSettings();
        }
      }
    ]
  });

  await alert.present();
};

const openSettings = async () => {
  try {
    await NativeSettings.open({
      optionAndroid: AndroidSettings.ApplicationDetails, 
      optionIOS: IOSSettings.App
    });
  } catch (e) {
    uiState.setStatusMessage(CHAT_STATUS.SETTINGS_ERROR);
  }
};


const isQuizModalOpen = ref(false);

const selectQuiz = (difficulty: DifficultyLevel) => {
  isQuizModalOpen.value = false; 
  handleQuizRequest(difficulty); 
};

const openMenuQuiz = () => {
  if (uiState.getRecording() || uiState.getProcessing() || chatStore.activeQuestion != null) return;
  isQuizModalOpen.value = true;
};

// --- GESTURE KEYBOARD ---
const hideKeyboard = async () => {
  if (kbHeight.value > 0) {
    await Keyboard.hide();
  }
};

const scrollDown = async () => {
  await nextTick();
  setTimeout(() => {
    contentRef.value?.$el.scrollToBottom(300); 
  }, 100);
};
const cancelActiveQuiz = () => {
  chatStore.clearQuiz();
  globalUiState.setQuizStatus(false);
  globalUiState.setStatusMessage(CHAT_STATUS.IDLE);
};
</script>
<style scoped>
ion-page, ion-content, .chat-background {
  --background: #ffffff !important;
  background: #ffffff !important;
}

/* --- TOOLBAR E BANNER FISSI --- */
.custom-toolbar {
  --background: var(--white, #ffffff);
  --border-width: 0;
}
.banners-toolbar, .fixed-banners, ion-footer {
  --background: var(--white, #ffffff);
}
.logo-title {
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
}
.text-white { color: var(--background-dark, #2c2a26);}
.text-lime { color: var(--secondary, #fac400); }

.recognized-animal-banner {
  background-color: var(--secondary, #fac400);
  color: var(--background-light, #fff8dc);
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.status-banner {
  background-color: var(--secondary, #fac400); 
  color: var(--background-dark, #2c2a26);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-between; 
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}
.status-banner.active {
  background-color: var(--danger, #ff4757);
  color: white;
}
.status-text {
  flex: 1;
  text-align: center;
}

/* --- CHAT CONTAINER & BUBBLES --- */
.chat-container {
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
}
.message-wrapper {
  display: flex;
  margin-bottom: 12px;
  width: 100%;
}
.wrapper-left {
  justify-content: flex-start;
}
.message-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 18px;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px rgba(0,0,0,0.15);
}
.animal-bubble {
  background-color: #ffffff;
  color: #000000;
  border-bottom-left-radius: 4px;
}
.message-bubble p {
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
  word-wrap: break-word;
}
.quiz-bubble {
  border: 2px solid var(--secondary, #fac400); 
  min-width: 250px;
}
.inline-quiz-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  margin-bottom: 6px;
}
.quiz-choice-btn {
  --border-radius: 8px;
  --border-color: var(--primary, #fb6237);
  --color: var(--primary, #fb6237);
  margin: 0;
  text-transform: none; 
}
.info-text {
  font-size: 13px;
  color: var(--background-dark, #2c2a26);
  font-style: italic;
  margin-top: 10px;
}
.animate-pop {
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@media (prefers-color-scheme: dark) {
  ion-page, ion-content, .chat-background {
    --background: var(--background-dark,#2c2a26) !important;
  }
  .custom-toolbar {
    --background: var(--background-dark,#2c2a26);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .banners-toolbar, .fixed-banners, ion-footer {
    --background: var(--background-dark,#2c2a26);
  }
  .text-white { 
    color: var(--background-light, #fff8dc); /* Scritta 'ANIM' bianca di notte */
  }
  .text-lime { 
    color: var(--primary, #fb6237); 
  }
  .recognized-animal-banner{
    background-color: var(--primary, #fb6237);
    color: var(--background-dark, #2c2a26); 
  }
  /* Risolve il problema della scritta che non si vede! */
  .status-banner {
    background-color: var(--secondary, #fac400); 
    color: var(--background-light, #fff8dc);
  }
  
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.9) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
