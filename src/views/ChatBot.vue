<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="ionRouter.back()" >
            <ion-icon slot="start" :icon="chevronBackOutline"></ion-icon>
            Indietro
          </ion-button>
        </ion-buttons>
        <ion-title>Chatbot Interaction</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding chat-background">
      
      <div class="status-banner" :class="{ active: uiState.isRecording }">
        {{ uiState.statusMessage }}
      </div>

      <div class="controls-container">
        <ion-button 
          v-if="!uiState.isRecording"
          expand="block" 
          @click="handleStart" 
          :disabled="uiState.isProcessing"
          color="primary"
        >
          REGISTRA
        </ion-button>

        <ion-button 
          v-else
          expand="block" 
          @click="handleStop" 
          :disabled="!uiState.isMicReady || uiState.isProcessing"
          color="danger"
          style="margin-top: 15px;"
        >
          INTERROMPI
        </ion-button>

        <ion-button 
          v-if="!uiState.showQuizOptions"
          expand="block" 
          @click="uiState.showQuizOptions = true" 
          :disabled="uiState.isRecording || uiState.isProcessing || chatStore.activeQuestion != null "
          color="secondary"
          style="margin-top: 15px;"
        >
          FAMMI UN QUIZ
        </ion-button>

        <div v-else style="margin-top: 15px; display: flex; gap: 10px; align-items: center;">
          <ion-button 
            expand="block" 
            @click="handleQuizRequest('easy')" 
            :disabled="uiState.isProcessing"
            color="success"
            style="flex: 1; margin: 0;"
          >
            FACILE
          </ion-button>
          
          <ion-button 
            expand="block" 
            @click="handleQuizRequest('medium')" 
            :disabled="uiState.isProcessing"
            color="warning"
            style="flex: 1; margin: 0;"
          >
            MEDIO
          </ion-button>

          <ion-button 
            fill="clear" 
            color="medium" 
            @click="uiState.showQuizOptions = false"
            style="margin: 0;"
          >
            X
          </ion-button>
        </div>
      </div>

      <div class="chat-container">
        <div 
          v-for="(msg, index) in chatStore.messages" 
          :key="index" 
          class="message-wrapper"
          :class="msg.role === 'user' ? 'wrapper-right' : 'wrapper-left'"
        >
          <div 
            class="message-bubble"
            :class="msg.role === 'user' ? 'user-bubble' : 'animal-bubble'"
          >
            <p>{{ msg.content }}</p>
            
            <span class="time-stamp">
              {{ msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </span>
          </div>
        </div>
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
                :disabled="uiState.isProcessing"
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
                :disabled="uiState.isProcessing"
              >
                Vero
              </ion-button>
              <ion-button 
                size="small"
                fill="outline"
                class="quiz-choice-btn"
                @click="handleTextSubmit('Falso')"
                :disabled="uiState.isProcessing"
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
      <ion-toolbar>
        <ion-input 
          v-model="uiState.inputText" 
          placeholder="Scrivi un messaggio..." 
          @keyup.enter="handleTextSubmit"
          :disabled="uiState.isProcessing || uiState.isRecording"
          class="ion-padding-horizontal"
          autocomplete="on"
          autocorrect="on"
          :spellcheck="true"
          inputmode="text"
          autocapitalize="sentences"
        ></ion-input>
        
        <ion-buttons slot="end">
          <ion-button 
            @click="handleTextSubmit" 
            :disabled="uiState.isProcessing || uiState.isRecording || !uiState.inputText.trim()" 
            color="primary"
          >
            >
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, shallowRef, onMounted } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonInput, IonFooter, onIonViewDidLeave, useIonRouter, alertController } from '@ionic/vue';
import { ConversationManager } from '@/modules/ConversationMgr';
import { useChatStore } from '@/stores/chatStore';
import { CHAT_STATUS } from '@/utility/constants';
import { chevronBackOutline } from 'ionicons/icons';
import { type ChatUIState, type DifficultyLevel} from '@/utility/Types';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
// --- CHAT INITIALIZATION ---

const chatStore = useChatStore();
// --- UI STATE VARIABLES ---
const ionRouter = useIonRouter();
const uiState = reactive<ChatUIState>({
  isRecording: false,
  isMicReady: false,
  isProcessing: false,
  inputText: "",
  statusMessage: CHAT_STATUS.IDLE,
  quizStatus: false,
  showQuizOptions: false,
});

const conversationManager = shallowRef<ConversationManager | null>(null);
onMounted(() => {
  conversationManager.value = new ConversationManager();
});
// --- EVENT HANDLERS ---

const handleStart = async () => {
  try {
    uiState.statusMessage = CHAT_STATUS.INITIALIZING;
    uiState.isRecording = true;
    uiState.isMicReady = false;
    
    await conversationManager.value?.startInteraction(() => {
      uiState.isMicReady = true;
      uiState.statusMessage = CHAT_STATUS.RECORDING;
      }, (errorMessage) => {
        if (errorMessage === 'NEEDS_SETTINGS') {
          showSettingsAlert();
          // This if is to prevent overwriting the alert message if the user has already been prompted
          if(uiState.statusMessage != CHAT_STATUS.DENIED_HARD){
            uiState.statusMessage = CHAT_STATUS.DENIED_HARD;
          }
        } else if (errorMessage === 'FIRST_DENIAL') {
          uiState.statusMessage = CHAT_STATUS.DENIED_SOFT;
        } else {
          uiState.statusMessage = "Errore: " + errorMessage;
        }
        uiState.isRecording = false;
        uiState.isMicReady = false;
      });
    
  } catch (error: any) {
    uiState.statusMessage = "Errore: " + error.message;
  }
};

const handleStop = async () => {
  await conversationManager.value?.stopSpeaking();
  uiState.isRecording = false;
  uiState.isProcessing = true;
  uiState.statusMessage = CHAT_STATUS.THINKING;
  try {
    await conversationManager.value?.stopListening();
    const userText = conversationManager.value ? await conversationManager.value?.getCurrentTranscript() : "";
    if(uiState.quizStatus){
      await conversationManager.value?.validateQuiz(userText)? 
      uiState.statusMessage = CHAT_STATUS.SUCCESS : uiState.statusMessage = CHAT_STATUS.NO_QUIZ_AVAILABLE;
    } 
    else{
      await conversationManager.value?.processTextInteraction(userText)? 
      uiState.statusMessage = CHAT_STATUS.SUCCESS : uiState.statusMessage = CHAT_STATUS.IDLE;
    }
  } catch (error: any) {
    uiState.statusMessage = "Errore: " + error.message;
  } finally {
    await conversationManager.value?.resetTranscript();
    uiState.isProcessing = false;
    uiState.quizStatus = false;
  }
};

const handleTextSubmit = async (selectedAnswer?: string | Event) => {
  const clickedAnswer = typeof selectedAnswer === 'string' ? selectedAnswer : "";
  const text = clickedAnswer || uiState.inputText.trim();
  await conversationManager.value?.stopSpeaking();
  if (!text  || uiState.isProcessing) return;
  uiState.inputText = "";
  uiState.isProcessing = true;
  uiState.statusMessage = CHAT_STATUS.THINKING;
  try {
    if(uiState.quizStatus){ 
      await conversationManager.value?.validateQuiz(text);
    }else {
      await conversationManager.value?.processTextInteraction(text);
    }
     uiState.statusMessage = CHAT_STATUS.SUCCESS;  
  } catch (error: any) {
    uiState.statusMessage = "Errore: " + error.message;
  }
   finally {
    uiState.isProcessing = false;
    uiState.quizStatus = false;
  }
  
};

const handleQuizRequest = async (difficulty: DifficultyLevel) => {
  uiState.showQuizOptions = false;
  uiState.isProcessing = true;
  uiState.statusMessage = CHAT_STATUS.THINKING;
  try {
    uiState.quizStatus = conversationManager.value ? await conversationManager.value.requestQuiz(difficulty) : false;
    uiState.quizStatus ? uiState.statusMessage = CHAT_STATUS.QUIZ_LOADED : uiState.statusMessage = CHAT_STATUS.NO_QUIZ_AVAILABLE;
  } catch (error: any) {
    uiState.statusMessage = "Errore quiz: " + error.message;
  } finally {
    uiState.isProcessing = false;
  }
};
/*
const handleQuizAnswer = async (selectedAnswer: string) => {
  if (!uiState.quizStatus) return;
  
  uiState.isProcessing = true;
  uiState.statusMessage = CHAT_STATUS.THINKING;

  try {
    await conversationManager.value?.validateQuiz(selectedAnswer);
    uiState.statusMessage = CHAT_STATUS.SUCCESS;
    uiState.quizStatus = false;

  } catch (error: any) {
    uiState.statusMessage = "Errore validazione: " + error.message;
  } finally {
    uiState.isProcessing = false;
  }
};
*/

onIonViewDidLeave(async () => {
  if(uiState.isRecording) {
    await conversationManager.value?.stopListening();
    await conversationManager.value?.resetTranscript();
    uiState.isRecording = false;
    uiState.statusMessage = CHAT_STATUS.IDLE;
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
          uiState.statusMessage = CHAT_STATUS.DENIED_SOFT;
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
    uiState.statusMessage = CHAT_STATUS.SETTINGS_ERROR;
  }
};

</script>

<style scoped>

.chat-background {
  --background: #f0f2f5; 
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