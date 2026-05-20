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

    <ion-content>
      
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
          BEGIN RECOGNITION
        </ion-button>

        <ion-button 
          expand="block" 
          @click="handleStop" 
          :disabled="!uiState.isRecording || uiState.isProcessing"
          color="danger"
          style="margin-top: 15px;"
        >
          STOP
        </ion-button>
      </div>

      <div id="camera" class="camera-box"></div>
      <div v-if="sessionStore.recognizedAnimal">
        Recog received: {{ sessionStore.recognizedAnimal }}
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, onIonViewDidLeave, useIonRouter } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';
import { RecognitionManager } from '@/modules/RecognitionMgr';
import { useServiceStore } from '@/stores/serviceStore';
import { useSessionStore } from '@/stores/sessionStore';

// --- INITIALIZATION ---
const serviceStore = useServiceStore();
const recog = new RecognitionManager();
const sessionStore = useSessionStore();

onMounted(() => {
  const par = document.getElementById("camera")
  serviceStore.setCameraService(par);
})

// --- UI STATE VARIABLES ---
const ionRouter = useIonRouter();
const uiState = reactive({
  isRecording: false,
  isProcessing: false,
  inputText: "",
  statusMessage: ""
});

// --- EVENT HANDLERS ---
const handleStart = async () => {
    uiState.statusMessage = "Opening camera";

    try {
      await recog.startRecognitionLoop()

      uiState.isRecording = true;
      uiState.statusMessage = "Running";
    }
    catch (error) {uiState.statusMessage = (error as Error).message;}
};

const handleStop = async () => {
  uiState.statusMessage = "Stopping recognition manager";
  
  await recog.stopRecognitionLoop()

  uiState.isRecording = false
  uiState.statusMessage = "Stopped"
};


onIonViewDidLeave(async () => {
  if(uiState.isRecording) {
    uiState.isRecording = false;
    uiState.statusMessage = "";
  } 
});

</script>

// --- MAKES CAMERA VISIBLE ---
<style>
  body { background: transparent; }
  ion-content { --background: transparent; }
</style>