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
          expand="block" 
          @click="handleStart" 
          :disabled="uiState.isRecording || uiState.isProcessing"
          color="primary"
        >
          REGISTRA
        </ion-button>

        <ion-button 
          expand="block" 
          @click="handleStop" 
          :disabled="!uiState.isRecording || !uiState.isMicReady || uiState.isProcessing"
          color="danger"
          style="margin-top: 15px;"
        >
          INTERROMPI
        </ion-button>
      </div>

      <div class="chat-container">
        <div 
          v-for="(msg, index) in chatStore.messages" 
          :key="index" 
          class="message-wrapper"
          :class="msg.getSender() === 'user' ? 'wrapper-right' : 'wrapper-left'"
        >
          <div 
            class="message-bubble"
            :class="msg.getSender() === 'user' ? 'user-bubble' : 'animal-bubble'"
          >
            <p>{{ msg.getContent() }}</p>
            
            <span class="time-stamp">
              {{ msg.getTimestamp().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </span>
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
import { reactive, shallowRef, onMounted} from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonInput, IonFooter, onIonViewDidLeave, useIonRouter, alertController } from '@ionic/vue';
import { ConversationManager } from '@/modules/ConversationMgr';
import { useChatStore } from '@/stores/chatStore';
import { CHAT_STATUS, EMPTY_INPUT_ANIMAL_TEXT, SOMETHING_BAD_IN_BACKEND } from '@/utility/constants';
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
      chatStore.addUserMessage(userText);
      const response = await conversationManager.value?.processTextInteraction(userText);
      if (response) {
        handleResponse(response);
      }
      else {
        handleResponse({ animalText: SOMETHING_BAD_IN_BACKEND });
      }
    }
    else {
      handleResponse({ animalText: EMPTY_INPUT_ANIMAL_TEXT });
    }
  } catch (error: any) {
    uiState.statusMessage = "Errore: " + error.message;
  } finally {
    await conversationManager.value?.resetTranscript();
    uiState.isProcessing = false;
  }
};

const handleTextSubmit = async () => {
  const text = uiState.inputText.trim();
  if (!text || uiState.isProcessing) return;
  uiState.inputText = ""; 
  uiState.isProcessing = true;
    uiState.statusMessage = CHAT_STATUS.THINKING;
  chatStore.addUserMessage(text);
  try {
    const result = await conversationManager.value?.processTextInteraction(text);
    if (result) {
      handleResponse(result);
    }
    else {
      handleResponse({ animalText: SOMETHING_BAD_IN_BACKEND });
    }
  } catch (error: any) {
    uiState.statusMessage = "Errore: " + error.message;
  }
   finally {
    uiState.isProcessing = false;
  }
  
};

const handleResponse = (response: { animalText: string }) => {
  chatStore.addBotMessage(response.animalText);
  conversationManager.value?.speak(response.animalText);
  uiState.statusMessage = CHAT_STATUS.SUCCESS;
};


onIonViewDidLeave(async () => {
  if(uiState.isRecording) {
    await conversationManager.value?.stopListening();
    await conversationManager.value?.resetTranscript();
    uiState.isRecording = false;
    uiState.statusMessage = CHAT_STATUS.IDLE;
  } 
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