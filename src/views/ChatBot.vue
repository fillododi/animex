<template>
  <ion-page>
    <ion-header class="ion-no-border">
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

          <div class="status-banner" :class="{ active: uiState.getRecording() }">
            <div class="status-text">{{ uiState.getStatusMessage() }}</div>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding chat-background">
      <div class="chat-container" :style="{ 
             paddingBottom: kbHeight > 0 ? `${kbHeight + 20}px` : `calc(130px + var(--ion-safe-area-bottom, 0px))`, 
             transition: 'padding-bottom 0.25s cubic-bezier(0.32, 0.72, 0, 1)' 
           }">
        <!-- Ciclo che stampa i messaggi usando il nostro componente -->
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
      
            <ion-button size="small" fill="clear" color="medium" @click="chatStore.clearQuiz()">
              Annulla
            </ion-button>
          </div>
        </div>
      </div>

    </ion-content>
    
    <ion-footer
      class="ion-no-border"
      :style="{ 
        position: 'absolute',
        bottom: 0,
        width: '100%',
        transform: kbHeight > 0 ? `translateY(-${kbHeight}px)` : `translateY(calc(-50px - var(--ion-safe-area-bottom, 0px)))`,
        transition: 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)' 
      }"
    >
      <InputBar 
        v-model="inputTextModel"
        :isListening="uiState.getRecording()"
        :isSpeaking="uiState.getSpeaking()"
        @toggle-microphone="toggleMicrophone"
        @cancel-recording="handleCancel"
        @stop-audio="handleStopAudio"
        @send="uiState.getRecording() ? handleStop() : handleTextSubmit()"
        @open-quiz-menu="openMenuQuiz()"
      />
    </ion-footer>
    <ion-modal 
      :is-open="isQuizModalOpen" 
      @didDismiss="isQuizModalOpen = false" 
      :initial-breakpoint="0.30" 
      :breakpoints="[0, 0.30]"
    >
      <ion-content class="whatsapp-modal-content">
        <div class="whatsapp-menu">
          
          <div class="menu-item" @click="selectQuiz('easy')">
            <div class="icon-circle easy-color">
              <ion-icon :icon="happy"></ion-icon>
            </div>
            <span>Quiz facile</span>
          </div>

          <div class="menu-item" @click="selectQuiz('medium')">
            <div class="icon-circle medium-color">
              <ion-icon :icon="extensionPuzzle"></ion-icon>
            </div>
            <span>Quiz medio</span>
          </div>

        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, shallowRef, onMounted, ref, watch } from 'vue';
import { IonPage, IonContent, IonButton, IonFooter, onIonViewDidLeave, alertController, IonHeader, IonToolbar, IonTitle, IonIcon, IonModal } from '@ionic/vue';
import ChatBubble from '@/components/ChatBubble.vue';
import InputBar from '@/components/InputBar.vue';
import { ConversationManager } from '@/modules/ConversationMgr';
import { useChatStore } from '@/stores/chatStore';
import { CHAT_STATUS } from '@/utility/constants';
import { type DifficultyLevel} from '@/utility/Types';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { useSessionStore } from '@/stores/sessionStore';
import {globalUiState} from '@/utility/UiState';
import { addCircleOutline, happy, extensionPuzzle } from 'ionicons/icons';
import { Keyboard } from '@capacitor/keyboard';
// --- CHAT INITIALIZATION ---

const chatStore = useChatStore();
const sessionStore = useSessionStore();
const kbHeight = ref(0);
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
const conversationManager = shallowRef<ConversationManager | null>(null);
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
  conversationManager.value = new ConversationManager();
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
  }
);

watch(
  () => chatStore.activeQuestion,
  (newQuestion) => {
    if (newQuestion) {
      uiState.setProcessing(false);
      uiState.setStatusMessage(CHAT_STATUS.SUCCESS);
      uiState.setSpeaking(true);
    }
  }
);
// --- EVENT HANDLERS ---

const handleStart = async () => {
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

const handleInputFocus = async () => {
  uiState.setUsingKeyboard(true);
  if (uiState.getSpeaking()) {
    await handleStopAudio();
  }
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
    uiState.setStatusMessage(CHAT_STATUS.IDLE);
  } 
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
</script>
<style scoped>
.chat-background {
  --background: #f0f2f5; 
}

/* --- TOOLBAR E BANNER FISSI --- */
.custom-toolbar {
  --background: var(--dark, #f0f2f5);
  --border-width: 0;
  border-bottom: 1px solid #222;
}
.banners-toolbar {
  --background: var(--ion-color-light, #f0f2f5);
  --min-height: auto;
  --border-width: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}
.logo-title {
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
}
.text-white { color: #ffffff; }
.text-lime { color: var(--lime, #deff9a); }

.fixed-banners {
  background: var(--ion-color-light, #f0f2f5);
  padding: 15px 15px 5px 15px;
}
.recognized-animal-banner {
  background-color: #4caf50;
  color: white;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.status-banner {
  background-color: #ffffff;
  color: #2f3542;
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
  background-color: #ff4757;
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
  border: 2px solid #3880ff; 
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
  --border-color: #3880ff;
  --color: #3880ff;
  margin: 0;
  text-transform: none; 
}
.info-text {
  font-size: 13px;
  color: #666;
  font-style: italic;
  margin-top: 10px;
}
.animate-pop {
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

/* --- MENU QUIZ WHATSAPP --- */
.whatsapp-modal-content {
  --background: #f0f2f5;
}
.whatsapp-menu {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 40px 20px;
}
.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.icon-circle {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 30px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}
.menu-item:active .icon-circle {
  transform: scale(0.95); 
}
.easy-color { background: #4caf50; } 
.medium-color { background: #ff9800; } 
.menu-item span {
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-weight: 600;
  color: #444;
  font-size: 14px;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.9) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>