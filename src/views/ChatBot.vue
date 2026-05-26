<template>
  <ion-page>

    <ion-content class="ion-padding chat-background">
      
      <!-- Banner di stato invariato -->
      <div class="status-banner" :class="{ active: uiState.isRecording }">
        {{ uiState.statusMessage }}
      </div>
      
      <!-- <div class="controls-container">
        <ion-button expand="block" @click="handleStart" :disabled="uiState.isRecording || uiState.isProcessing" color="primary">
          REGISTRA
        </ion-button>
        <ion-button expand="block" @click="handleStop" :disabled="!uiState.isRecording || !uiState.isMicReady || uiState.isProcessing" color="danger" style="margin-top: 15px;">
          INTERROMPI
        </ion-button>
      </div> -->

      <div class="chat-container">
        <!-- Ciclo che stampa i messaggi usando il nostro componente -->
        <ChatBubble 
          v-for="(msg, index) in chatStore.messages" 
          :key="index" 
          :role="msg.role === 'user' ? 'utente' : 'ai'"
          :text="msg.content" 
        />
        
        <ChatBubble 
          v-if="uiState.isProcessing" 
          role="ai" 
          text="Elaborazione in corso..." 
          isThinking 
        />
      </div>

    </ion-content>
    
    <ion-footer>
      <InputBar 
        v-model="uiState.inputText"
        :isAscoltando="uiState.isRecording"
        @toggle-microphone="toggleMicrophone"
        @send="handleTextSubmit"
      />
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, shallowRef, onMounted} from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonInput, IonFooter, onIonViewDidLeave, useIonRouter, alertController } from '@ionic/vue';
import ChatBubble from '@/components/ChatBubble.vue';
import InputBar from '@/components/InputBar.vue';
import { ConversationManager } from '@/modules/ConversationMgr';
import { useChatStore } from '@/stores/chatStore';
import { CHAT_STATUS, EMPTY_INPUT_ANIMAL_TEXT } from '@/utility/constants';
import { chevronBackOutline } from 'ionicons/icons';
import { type ChatUIState} from '@/utility/Types';
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
  statusMessage: CHAT_STATUS.IDLE
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
    uiState.isRecording = false;
  }
};

const handleStop = async () => {
  uiState.isRecording = false;
  uiState.isProcessing = true;
  uiState.statusMessage = CHAT_STATUS.THINKING;
  try {
    await conversationManager.value?.stopListening();
    const userText = await conversationManager.value?.getCurrentTranscript();
    if(userText?.trim()) {
      const response = await conversationManager.value?.processTextInteraction(userText);
      if (response) {
        handleResponse();
      }
    }
    else {
      chatStore.addEmptyResponse();
      await conversationManager.value?.speak(EMPTY_INPUT_ANIMAL_TEXT);
    }
    uiState.statusMessage = CHAT_STATUS.SUCCESS;
  } catch (error: any) {
    uiState.statusMessage = "Errore: " + error.message;
  } finally {
    await conversationManager.value?.resetTranscript();
    uiState.isProcessing = false;
  }
};

const toggleMicrophone = () => {

  if (uiState.isProcessing) return;

  if (uiState.isRecording) {
    handleStop();
  } else {
    handleStart();
  }
};

const handleTextSubmit = async () => {
  const text = uiState.inputText.trim();
  if (!text || uiState.isProcessing) return;
  uiState.inputText = ""; 
  uiState.isProcessing = true;
  uiState.statusMessage = CHAT_STATUS.THINKING;
  try {
    await conversationManager.value?.processTextInteraction(text);
    handleResponse();
  } catch (error: any) {
    uiState.statusMessage = "Errore: " + error.message;
  }
   finally {
    uiState.isProcessing = false;
  }
  
};

const handleResponse = () => {
  uiState.statusMessage = CHAT_STATUS.SUCCESS;
};


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
</style>