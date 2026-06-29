<template>
  <ion-page>

    <ion-content class="ion-padding chat-background">

      <div class="recognized-animal-banner" 
      v-if="sessionStore.recognizedAnimal">
        {{ sessionStore.recognizedAnimal.displayName }}
      </div>

      <div class="status-banner" :class="{ active: uiState.getRecording() }">
        {{ uiState.getStatusMessage() }}
      </div>

        <ion-button 
          v-if="!uiState.getShowQuizOptions()"
          expand="block" 
          @click="uiState.setShowQuizOptions(true)" 
          :disabled="uiState.getRecording() || uiState.getProcessing() || chatStore.activeQuestion != null "
          color="secondary"
          style="margin-top: 15px;"
        >
          FAMMI UN QUIZ
        </ion-button>

        <div v-else style="margin-top: 15px; display: flex; gap: 10px; align-items: center;">
          <ion-button 
            expand="block" 
            @click="handleQuizRequest('easy')" 
            :disabled="uiState.getProcessing()"
            color="success"
            style="flex: 1; margin: 0;"
          >
            FACILE
          </ion-button>
          
          <ion-button 
            expand="block" 
            @click="handleQuizRequest('medium')" 
            :disabled="uiState.getProcessing()"
            color="warning"
            style="flex: 1; margin: 0;"
          >
            MEDIO
          </ion-button>

          <ion-button 
            fill="clear" 
            color="medium" 
            @click="uiState.setShowQuizOptions(false)"
            style="margin: 0;"
          >
            X
          </ion-button>
        </div>

      <div class="chat-container">
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
    
    <ion-footer>
      <InputBar 
        v-model="inputTextModel"
        :isListening="uiState.getRecording()"
        :isSpeaking="uiState.getSpeaking()"
        @toggle-microphone="toggleMicrophone"
        @cancel-recording="handleCancel"
        @stop-audio="handleStopAudio"
        @send="uiState.getRecording() ? handleStop() : handleTextSubmit()"
        @focus="handleInputFocus"
        @blur="uiState.setUsingKeyboard(false)"
      />
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, shallowRef, onMounted, ref, watch } from 'vue';
import { IonPage, IonContent, IonButton, IonFooter, onIonViewDidLeave, alertController } from '@ionic/vue';
import ChatBubble from '@/components/ChatBubble.vue';
import InputBar from '@/components/InputBar.vue';
import { ConversationManager } from '@/modules/ConversationMgr';
import { useChatStore } from '@/stores/chatStore';
import { CHAT_STATUS } from '@/utility/constants';
import { type DifficultyLevel} from '@/utility/Types';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { useSessionStore } from '@/stores/sessionStore';
import {globalUiState} from '@/utility/UiState';
// --- CHAT INITIALIZATION ---

const chatStore = useChatStore();
const sessionStore = useSessionStore();
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
  //await conversationManager.value?.stopSpeaking();
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
  if (uiState.getProcessing()) return;
  if (uiState.getSpeaking()) {
    await handleStopAudio();
  }
  handleStart();
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

</script>

<style scoped>

.chat-background {
  --background: #f0f2f5; 
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
  padding: 12px;
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
.controls-container {
  margin-bottom: 30px;
}

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
.wrapper-right {
  justify-content: flex-end;
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

.user-bubble {
  background-color: #dcf8c6; 
  color: #000000;
  border-bottom-right-radius: 4px; 
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

.time-stamp {
  font-size: 11px;
  color: #888;
  align-self: flex-end;
  margin-top: 4px;
  margin-left: 15px;
}
.quiz-bubble {
  border: 2px solid #3880ff; /* Dà un bordo colorato per far capire che è un quiz */
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
  text-transform: none; /* Evita tutto maiuscolo per le risposte lunghe */
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

@keyframes popIn {
  from { opacity: 0; transform: scale(0.9) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>