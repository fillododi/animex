<template>
  <ion-page>
    <ion-header class="overlay-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="ionRouter.back()">
            <ion-icon slot="start" :icon="chevronBackOutline"></ion-icon>
            Indietro
          </ion-button>
        </ion-buttons>

        <ion-title>Chatbot Interaction</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="chat-content" fullscreen>
      <video
        ref="videoEl"
        class="camera-video"
        autoplay
        playsinline
        muted
      ></video>

      <div class="overlay-ui">
        <div class="status-banner" :class="{ active: uiState.isRecording }">
          {{ uiState.statusMessage }}
        </div>

        <div class="controls-container">
          <ion-button
            expand="block"
            @click="handleStart"
            :disabled="uiState.isRecording"
            color="primary"
          >
            BEGIN RECOGNITION
          </ion-button>

          <ion-button
            expand="block"
            @click="handleStop"
            :disabled="!uiState.isRecording"
            color="danger"
          >
            STOP
          </ion-button>
        </div>

        <div class="result-box">
          Recog received: {{ sessionStore.recognizedAnimal }}
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  onIonViewDidLeave,
  useIonRouter,
} from "@ionic/vue";
import { chevronBackOutline } from "ionicons/icons";

import { RecognitionManager } from "@/modules/RecognitionMgr";
import { useServiceStore } from "@/stores/serviceStore";
import { useSessionStore } from "@/stores/sessionStore";
import { DeviceCameraService } from "@/services/CameraService";

const serviceStore = useServiceStore();
const sessionStore = useSessionStore();

const recog = new RecognitionManager();
const ionRouter = useIonRouter();

const videoEl = ref<HTMLVideoElement | null>(null);

const uiState = reactive({
  isRecording: false,
  statusMessage: "",
});

onMounted(() => {
  if (!videoEl.value) {
    uiState.statusMessage = "Camera video element not found";
    return;
  }
  serviceStore.setCameraService(videoEl.value);
});

const handleStart = async () => {
  uiState.statusMessage = "Opening camera";

  try {
    await recog.startRecognitionLoop();

    uiState.isRecording = true;
    uiState.statusMessage = "Running";
  } catch (error) {
    uiState.isRecording = false;
    uiState.statusMessage = (error as Error).message;
  }
};

const handleStop = async () => {
  uiState.statusMessage = "Stopping recognition manager";

  try {
    await recog.stopRecognitionLoop();

    uiState.isRecording = false;
    uiState.statusMessage = "Stopped";
  } catch (error) {
    uiState.statusMessage = (error as Error).message;
  }
};

onIonViewDidLeave(async () => {
  if (uiState.isRecording) {
    uiState.isRecording = false;
    uiState.statusMessage = "";

    await recog.stopRecognitionLoop();
  }
});
</script>

<style>
body {
  background: black;
}

ion-content {
  --background: black;
}

.chat-content::part(scroll) {
  position: relative;
  overflow: hidden;
}

/* Video camera vero DOM element */
.camera-video {
  position: absolute;
  inset: 0;

  width: 100%;
  height: 100%;

  object-fit: cover;
  background: black;

  z-index: 0;
}

/* Tutta la UI Ionic sopra il video */
.overlay-ui {
  position: relative;
  z-index: 10;

  min-height: 100%;

  display: flex;
  flex-direction: column;
  gap: 16px;

  padding: 16px;
}

/* Header sopra la camera */
.overlay-header {
  position: relative;
  z-index: 20;
}

.status-banner {
  position: relative;
  z-index: 20;

  padding: 12px;
  border-radius: 8px;

  background: rgba(0, 0, 0, 0.65);
  color: white;
}

.status-banner.active {
  background: rgba(0, 120, 255, 0.75);
}

.controls-container {
  display: flex;
  flex-direction: column;
  gap: 15px;

  position: relative;
  z-index: 20;
}

.result-box {
  position: relative;
  z-index: 20;

  margin-top: auto;

  padding: 12px;
  border-radius: 8px;

  background: rgba(255, 255, 255, 0.85);
  color: black;
}
</style>