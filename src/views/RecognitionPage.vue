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
      <div v-if="recogStore">
        Recogs received: {{ recogStore.recognitions.length }}, Last recog: {{ recogStore.latestRecognition }}
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, shallowRef} from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, onIonViewDidLeave, useIonRouter } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';
import { RecognitionManager } from '@/modules/RecognitionMgr';
import { DeviceCameraService } from '@/services/CameraService';
import { Capacitor } from '@capacitor/core';
import { Position } from '@/utility/Position';
import { ServerConnectionService } from '@/services/ConnectionService';
import { RecognitionData } from '@/utility/RecognitionData';
import { AnimalData } from '@/utility/AnimalData';
import { AnimalType } from '@/utility/AnimalType';
import { useRecognitionStore } from '@/stores/recognitionStore';

// --- INITIALIZATION ---
const recog = shallowRef<RecognitionManager | null>(null);
const recogStore = useRecognitionStore();

onMounted(() => {
  let cam: DeviceCameraService;
  const par = document.getElementById("camera")
  if (Capacitor.getPlatform() == 'web') {
    cam = new DeviceCameraService(window.innerWidth, window.innerHeight/2, par ? par.id : "camera");
  }
  else {
    cam = new DeviceCameraService(window.innerWidth/2, window.innerHeight/2, new Position(0, par? par.getBoundingClientRect().top : 0));
  }

  const conn = new ServerConnectionService();

  recog.value = new RecognitionManager(conn, cam);
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
      await recog.value?.startRecognitionLoop()

      uiState.isRecording = true;
      uiState.statusMessage = "Running";
      recog.value?.getStore().addRecognition(new RecognitionData([new AnimalData(0, AnimalType.ANIMAL, new Position(0,0))]))
    }
    catch (error) {uiState.statusMessage = (error as Error).message;}
};

const handleStop = async () => {
  uiState.statusMessage = "Stopping recognition manager";
  
  await recog.value?.stopRecognitionLoop()

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