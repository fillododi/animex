<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-title class="ion-text-center logo-title">
          <span class="text-white">ANIM</span><span class="text-lime">EX</span>
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :scroll-y= "false" :class="uiState.isRecording ? 'camera-on' : 'camera-off'">
      <div class="result-banner" v-if="sessionStore.recognizedAnimal">
        Rilevato: <strong>{{ sessionStore.recognizedAnimal.displayName }}</strong>
      </div>

      <div class="floating-controls">
        
        <!-- Camera Spenta -->
        <BaseButton 
          v-if="!uiState.isRecording"
          testo="AVVIA SCANNER" 
          :icona="camera"
          variante="stile-input"
          @click="handleStart"
          class="btn-action"
        />

        <!-- Camera Accesa-->
        <BaseButton 
          v-else
          testo="CHIUDI SCANNER" 
          :icona="close"
          variante="pericolo" 
          @click="handleStop" 
          class="btn-action"
        />
      </div>
      <video ref="videoElement" class="camera-video" autoplay playsinline muted></video>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { IonPage, IonContent, onIonViewDidLeave, alertController, IonHeader, IonToolbar, IonTitle, onIonViewDidEnter } from '@ionic/vue';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { RecognitionManager } from '@/modules/RecognitionMgr';
import { useServiceStore } from '@/stores/serviceStore';
import { useSessionStore } from '@/stores/sessionStore';
import BaseButton from '@/components/BaseButton.vue';
import { camera, close } from 'ionicons/icons';

// --- INITIALIZATION ---
const serviceStore = useServiceStore();
const recog = new RecognitionManager();
const sessionStore = useSessionStore();
const videoElement = ref<HTMLVideoElement | null>(null);

onMounted(() => {
  if(!videoElement.value) {
    uiState.statusMessage = "Camera video element not found.";
    return;
  }
  serviceStore.setCameraService(videoElement.value);
})

// --- UI STATE VARIABLES ---
const uiState = reactive({
  isRecording: false,
  statusMessage: ""
});

// --- EVENT HANDLERS ---
const handleStart = async () => {
    try {
      serviceStore.setCameraService(videoElement.value);
      await recog.startRecognitionLoop();
      
      uiState.isRecording = true;
      document.documentElement.style.setProperty('--nav-display', 'none');
      
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        await showSettingsAlert();
      }
      else if(error.name !== 'AbortError' || !error.message.includes('aborted')){
        const alert = await alertController.create({
          header: 'Fotocamera non disponibile',
          message: 'Temporaneo inutilizzo della fotocamera. Dettagli: ' + error.message,
          buttons: ['OK']
        });
        await alert.present();
      }
    }
};

const handleStop = async () => {
  await recog.stopRecognitionLoop();
  uiState.isRecording = false;
};

onIonViewDidLeave(async () => {
  if(uiState.isRecording) {
    handleStop();
  }
  serviceStore.resetCameraService();
});

const showSettingsAlert = async () => {
  const alert = await alertController.create({
    header: 'Fotocamera Disabilitata',
    message: "L'app ha bisogno della fotocamera per riconoscere gli animali. Vuoi aprire le impostazioni del telefono per consentire l'accesso?",
    buttons: [
      {
        text: 'Annulla',
        role: 'cancel',
        handler: () => {
          uiState.statusMessage = "Permessi fotocamera negati";
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
  }catch{
    const alert = await alertController.create({
      header: 'Errore',
      message: 'Impossibile aprire le impostazioni. Per favore, aprile manualmente e consenti l\'accesso alla fotocamera.',
      buttons: ['OK']
    });
    await alert.present();
  }
};

</script>

<style scoped>
.camera-off {
  --background: #ffffff;
  transition: --background 0.3s ease;
}

.camera-on {
  --background: transparent;
}

.camera-box {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1; 
}

.floating-controls {
  position: absolute;
  bottom: calc(75px + var(--ion-safe-area-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  justify-content: center;
  width: 90%;
}

.btn-action {
  width: 100%;
  max-width: 300px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5); /* Effetto ombra per farlo staccare dal video */
}

.result-banner {
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  color: var(--lime, #deff9a);
  padding: 12px 25px;
  border-radius: 30px;
  font-weight: bold;
  z-index: 10;
  border: 1px solid rgba(222, 255, 154, 0.3);
  text-align: center;
}

.custom-toolbar {
  --background: var(--dark, #0a0a0a);
  --border-width: 0;
  border-bottom: 1px solid #222;
}
.logo-title {
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
}
.text-white { color: #ffffff; }
.text-lime { color: var(--lime, #deff9a); }
</style>

<style>
/* --- MAKES CAMERA VISIBLE --- */
  body { background: transparent; }
  ion-content { --background: transparent; }
  .camera-video {
    z-index: -1; /* Ensure the video is behind other content */
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>