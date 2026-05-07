<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="Back"></ion-back-button>
        </ion-buttons>
        <ion-title>Chatbot Interaction</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding chat-background">
      
      <div class="status-banner" :class="{ active: isRecording }">
        {{ currentStatus }}
      </div>

      <div class="controls-container">
        <ion-button 
          expand="block" 
          @click="handleStart" 
          :disabled="isRecording || isProcessing"
          color="primary"
        >
          1. START SPEAKING
        </ion-button>

        <ion-button 
          expand="block" 
          @click="handleStop" 
          :disabled="!isRecording || !isMicReady || isProcessing"
          color="danger"
          style="margin-top: 15px;"
        >
          2. STOP & SEND
        </ion-button>
      </div>

      <div class="chat-container">
        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          class="message-wrapper"
          :class="msg.getSender() === myUserId ? 'wrapper-right' : 'wrapper-left'"
        >
          <div 
            class="message-bubble"
            :class="msg.getSender() === myUserId ? 'user-bubble' : 'animal-bubble'"
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
          :disabled="isProcessing || isRecording"
          class="ion-padding-horizontal"
        ></ion-input>
        
        <ion-buttons slot="end">
          <ion-button 
            @click="handleTextSubmit" 
            :disabled="isProcessing || isRecording || !inputText.trim()" 
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
import { ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonBackButton, IonInput, IonFooter } from '@ionic/vue';
import { conversationManager } from '@/modules/ConversationMgr';
import { Chat } from '@/utility/chat';
import { Message } from '@/utility/message';
import { getOrCreateUserId } from '@/utility/user';

// --- CHAT INITIALIZATION ---

// 1. Get the real persistent User ID
const myUserId = getOrCreateUserId();
// 2. Generate a unique ID for this chat session
const newChatId = ref<Chat>(new Chat(myUserId));

// 3. Initialize the Chat instance
const currentChat = ref<Chat>(new Chat(newChatId.value.getChatId(), myUserId));

/** * 4. REACTIVITY FIX: 
 * We create a reactive reference to the messages array.
 * Vue will track this array to update the UI.
 */
const messages = ref<Message[]>([]);

// --- UI STATE VARIABLES ---
const isRecording = ref(false);
const isProcessing = ref(false);
const currentStatus = ref("Ready to listen");
const isMicReady = ref(false);
const inputText = ref("");
// --- EVENT HANDLERS ---

const handleStart = async () => {
  try {
    currentStatus.value = "⏳ Initializing microphone...";
    isRecording.value = true;
    isMicReady.value = false;
    
    await conversationManager.startInteraction(() => {
      isMicReady.value = true;
      currentStatus.value = "🎤 Microphone active, speak now!";
    });
    
  } catch (error: any) {
    currentStatus.value = "Error: " + error.message;
  }
};

const handleStop = async () => {
  isRecording.value = false;
  isProcessing.value = true;
  currentStatus.value = "⚙️ Processing interaction...";
  
  try {
    const result = await conversationManager.stopAndProcessInteraction();
    
    // 5. Create Message objects using the REAL myUserId
    const userMsg = new Message(result.userText, myUserId, new Date());
    const animalMsg = new Message(result.animalText, "bot_animal", new Date());
    
    // 6. Update the logical class
    currentChat.value.addMessage(userMsg);
    currentChat.value.addMessage(animalMsg);
    
    /**
     * 7. UPDATE THE UI:
     * We sync the reactive 'messages' ref with the data from our class.
     * The spread operator [...] creates a new array reference, forcing Vue to re-render.
     */
    messages.value = [...currentChat.value.getMessages()];
    
    // Note: If you updated your Chat class to use a single array as we discussed,
    // you would just do: messages.value = [...currentChat.value.getMessages()];

    currentStatus.value = "✅ Response received!";
  } catch (error: any) {
    currentStatus.value = "Error: " + error.message;
  } finally {
    isProcessing.value = false;
  }
};

const handleTextSubmit = async () => {
  const text = inputText.value.trim();
  if (!text || isProcessing.value) return;

  inputText.value = ""; 
  isProcessing.value = true;

  try {
    const result = await conversationManager.processTextInteraction(text);
    
    // 2. Create and push objects in one go
    currentChat.value.addMessage(new Message(result.userText, myUserId, new Date()));
    currentChat.value.addMessage(new Message(result.animalText, "bot_animal", new Date()));
    
    // 3. Sync UI
    messages.value = [...currentChat.value.getMessages()];
  } catch (error: any) {
    currentStatus.value = "Error: " + error.message;
  }
   finally {
    isProcessing.value = false;
  }
  
};

</script>

<style scoped>
/* (Styles remain the same as your previous version) */
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