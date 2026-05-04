<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="Back"></ion-back-button>
        </ion-buttons>
        <ion-title>Chatbot Logic Test</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      
      <!-- SYSTEM STATUS BANNER -->
      <div class="status-banner" :class="{ active: isRecording }">
        {{ currentStatus }}
      </div>

      <!-- TEST CONTROLS -->
      <div class="controls-container">
        <ion-button 
          expand="block" 
          @click="handleStart" 
          :disabled="isRecording || isProcessing"
          color="primary"
        >
          1. START RECORDING
        </ion-button>

        <ion-button 
          expand="block" 
          @click="handleStop" 
          :disabled="!isRecording || !isMicReady || isProcessing"
          color="danger"
          style="margin-top: 15px;"
        >
          2. STOP & PROCESS
        </ion-button>
      </div>

      <hr style="margin: 30px 0;">

      <!-- DEBUG OUTPUT -->
      <div class="debug-section">
        <h3>Manager Output:</h3>
        
        <div class="debug-box">
          <strong>User Text (STT):</strong>
          <p>{{ debugUserText }}</p>
        </div>

        <div class="debug-box">
          <strong>Animal Text (AI):</strong>
          <p>{{ debugAnimalText }}</p>
        </div>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonBackButton } from '@ionic/vue';

// Import the manager you just built
import { startInteraction, stopAndProcessInteraction } from '@/modules/ConversationMgr';

// --- STATE VARIABLES ---
const isRecording = ref(false);
const isProcessing = ref(false);
const currentStatus = ref("Idle - Waiting to start");
const isMicReady = ref(false);

const debugUserText = ref("-");
const debugAnimalText = ref("-");

// --- EVENT HANDLERS ---

const handleStart = async () => {
  try {
    currentStatus.value = "⏳ Inizializzazione microfono...";
    isRecording.value = true;
    isMicReady.value = false;
    // Call your manager to start the flow
    await startInteraction(() => {
      isMicReady.value = true;
      currentStatus.value = "🎤 Microfono attivo, parla ora!";
    });
    // Reset debug texts
    debugUserText.value = "-";
    debugAnimalText.value = "-";
  } catch (error: any) {
    currentStatus.value = "Error: " + error.message;
  }
};

const handleStop = async () => {
  isRecording.value = false;
  isProcessing.value = true;
  currentStatus.value = "⚙️ Processing (STT -> AI -> TTS)...";
  
  try {
    // Call your manager to handle all the background logic
    const result = await stopAndProcessInteraction();
    
    // Display the results returned by your manager
    debugUserText.value = result.userText;
    debugAnimalText.value = result.animalText;
    
    currentStatus.value = "✅ Flow complete! (Animal should be speaking)";
  } catch (error: any) {
    currentStatus.value = "Process Error: " + error.message;
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
.status-banner {
  background-color: #f1f2f6;
  color: #2f3542;
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
  font-weight: bold;
  border: 1px solid #ced6e0;
  transition: all 0.3s ease;
}

.status-banner.active {
  background-color: #ff4757;
  color: white;
  border-color: #ff4757;
}

.controls-container {
  padding: 10px 0;
}

.debug-section h3 {
  color: #747d8c;
  margin-bottom: 15px;
}

.debug-box {
  background-color: #000000;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border-left: 4px solid #3742fa;
}

.debug-box p {
  margin: 10px 0 0 0;
  font-size: 16px;
  color: #FFFFFF;
}
</style>