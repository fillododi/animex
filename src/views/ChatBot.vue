<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button v-show="!isRecording" @click="handleSafeBack">
            Back
          </ion-button>
        </ion-buttons>
        <ion-title>Chatbot Interaction</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding chat-background">
      
      <div class="status-banner" :class="{ active: isRecording }">
        {{ chatStore.currentStatus }}
      </div>

      <div class="controls-container">
        <ion-button 
          expand="block" 
          @click="handleStart" 
          :disabled="isRecording || chatStore.isProcessing"
          color="primary"
        >
          1. START SPEAKING
        </ion-button>

        <ion-button 
          expand="block" 
          @click="handleStop" 
          :disabled="!isRecording || !isMicReady || chatStore.isProcessing"
          color="danger"
          style="margin-top: 15px;"
        >
          2. STOP & SEND
        </ion-button>
      </div>

      <div class="chat-container">
        <div 
          v-for="(msg, index) in chatStore.messages" 
          :key="index" 
          class="message-wrapper"
          :class="msg.getSender() === chatStore.myUserId ? 'wrapper-right' : 'wrapper-left'"
        >
          <div 
            class="message-bubble"
            :class="msg.getSender() === chatStore.myUserId ? 'user-bubble' : 'animal-bubble'"
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
          v-model="inputText" 
          placeholder="Scrivi un messaggio..." 
          @keyup.enter="handleTextSubmit"
          :disabled="chatStore.isProcessing || isRecording"
          class="ion-padding-horizontal"
        ></ion-input>
        
        <ion-buttons slot="end">
          <ion-button 
            @click="handleTextSubmit" 
            :disabled="chatStore.isProcessing || isRecording || !inputText.trim()" 
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
import { ref} from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonInput, IonFooter, useBackButton } from '@ionic/vue';
import { conversationManager } from '@/modules/ConversationMgr';
import { useChatStore } from '@/stores/chatStore';
import { EMPTY_INPUT_ANIMAL_TEXT } from '@/utility/constants';
import { useRouter} from 'vue-router';
// --- CHAT INITIALIZATION ---

const chatStore = useChatStore();

// --- UI STATE VARIABLES ---
const isRecording = ref(false);
const isMicReady = ref(false);
const inputText = ref("");
const router = useRouter();

// --- EVENT HANDLERS ---

const handleStart = async () => {
  try {
    chatStore.setStatus("⏳ Inizializzazione microfono...");
    isRecording.value = true;
    isMicReady.value = false;
    
    await conversationManager.startInteraction(() => {
      isMicReady.value = true;
      chatStore.setStatus("🎤 Microfono attivo, parla ora!");
    });
    
  } catch (error: any) {
    chatStore.setStatus("Error: " + error.message);
  }
};

const handleStop = async () => {
  isRecording.value = false;
  chatStore.setProcessing(true);
  chatStore.setStatus("⚙️ Sto pensando...");
  try {
    await conversationManager.stopListening();
    const userText = await conversationManager.getCurrentTranscript();
    if(userText.trim()) {
      chatStore.addUserMessage(userText);
      const response = await conversationManager.processTextInteraction(userText);
      handleResponse(response);
    }
    else {
      handleResponse({ animalText: EMPTY_INPUT_ANIMAL_TEXT });
    }
  } catch (error: any) {
    chatStore.setStatus("Error: " + error.message);
  } finally {
    chatStore.setProcessing(false);
  }
};

const handleTextSubmit = async () => {
  const text = inputText.value.trim();
  if (!text || chatStore.isProcessing) return;

  inputText.value = ""; 
  chatStore.setProcessing(true);
  chatStore.addUserMessage(text);
  try {
    const result = await conversationManager.processTextInteraction(text);
    handleResponse(result);
  } catch (error: any) {
    chatStore.setStatus("Error: " + error.message);
  }
   finally {
    chatStore.setProcessing(false);
  }
  
};

const handleResponse = (response: { animalText: string }) => {
  chatStore.addBotMessage(response.animalText);
  conversationManager.speak(response.animalText);
  chatStore.setStatus("✅ Risposta ricevuta!");
};

const handleSafeBack = () => {
  router.replace('/home');
};

useBackButton(10, (processNextHandler) => {
  if (isRecording.value) {
    chatStore.setStatus("⚠️ Devi cliccare STOP prima di uscire!");
  } else {
    processNextHandler(); 
  }
});

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