<template>
  <ion-page>
    <ion-content :class="uiState.isRecording ? 'camera-on' : 'camera-off'">
      
      <div class="result-banner" v-if="sessionStore.recognizedAnimal">
        Rilevato: <strong>{{ sessionStore.recognizedAnimal }}</strong>
      </div>

      <div id="camera" class="camera-box"></div>

      <div class="floating-controls">
        
        <!-- Camera Spenta -->
        <BaseButton 
          v-if="!uiState.isRecording"
          testo="AVVIA SCANNER" 
          icona="📷"
          variante="stile-input"
          @click="handleStart" 
          :disabled="uiState.isProcessing"
          class="btn-action"
        />

        <!-- Camera Accesa-->
        <BaseButton 
          v-else
          testo="CHIUDI SCANNER" 
          icona="✖️"
          variante="pericolo" 
          @click="handleStop" 
          :disabled="uiState.isProcessing"
          class="btn-action"
        />

      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { IonPage, IonContent, onIonViewDidLeave, useIonRouter, alertController } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';
import { RecognitionManager } from '@/modules/RecognitionMgr';
import { useServiceStore } from '@/stores/serviceStore';
import { useSessionStore } from '@/stores/sessionStore';
import BaseButton from '@/components/BaseButton.vue';

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
    try {
      await recog.startRecognitionLoop();
      
      uiState.isRecording = true;
      document.documentElement.style.setProperty('--nav-display', 'none');
      
    } catch (error: any) {
      console.error("Errore avvio fotocamera:", error);
      
      const alert = await alertController.create({
        header: 'Fotocamera non disponibile',
        message: 'Temporaneo inutilizzo della fotocamera. Dettagli: ' + error.message,
        buttons: ['OK']
      });
      await alert.present();
    }
};

const handleStop = async () => {
  await recog.stopRecognitionLoop();
  uiState.isRecording = false;
  
};

onIonViewDidLeave(async () => {
  if(uiState.isRecording) {
    uiState.isRecording = false;
    document.documentElement.style.setProperty('--nav-display', 'flex');
  } 
});

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
  bottom: 30px; /* Distanza dal fondo */
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
</style>

<style>
/* --- MAKES CAMERA VISIBLE --- */
  body { background: transparent; }
  ion-content { --background: transparent; }
</style>