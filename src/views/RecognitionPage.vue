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
      <div class="result-banner" v-if="sessionStore.multipleAnimals === null && sessionStore.recognizedAnimal">
         <strong>{{ sessionStore.recognizedAnimal.displayName }}</strong>
      </div>

      <div class="floating-controls">
        <div class="multiple-animals-card" v-if="sessionStore.multipleAnimals">
          <p class="question-text">Con quale animale vuoi parlare?</p>
          <div class="animal-buttons">
            <ion-button 
              v-for="(animal, index) in sessionStore.multipleAnimals" 
              :key="index"
              expand="block"
              shape="round"
              class="animal-choice-btn"
              @click="chooseAnimal(animal)"
            >
              {{ animal.displayName }}
            </ion-button>
          </div>
        </div>

        <BaseButton 
          v-if="!uiState.isRecording"
          testo="AVVIA SCANNER" 
          :icona="camera"
          variante="stile-input"
          @click="handleStart"
          class="btn-action"
        />

        <template v-else>
          
          <BaseButton 
            v-if="sessionStore.multipleAnimals"
            testo="CERCA ALTRO" 
            :icona="camera"
            variante="stile-input"
            @click="resumeScan"
            class="btn-action"
          />

          <div class="dual-buttons" v-else-if="sessionStore.recognizedAnimal">
            <BaseButton 
              testo="CERCA ALTRO" 
              :icona="camera"
              variante="stile-input"
              @click="resumeScan"
              class="btn-action half-width"
            />
            <BaseButton 
              testo="CHIUDI" 
              :icona="close"
              variante="pericolo" 
              @click="handleStop" 
              class="btn-action half-width"
            />
          </div>

          <BaseButton 
            v-else
            testo="CHIUDI SCANNER" 
            :icona="close"
            variante="pericolo" 
            @click="handleStop" 
            class="btn-action"
          />
          
        </template>
      </div>
      <video ref="videoElement" class="camera-video" autoplay playsinline muted></video>

      <DynamicMessage 
        v-if="uiState.isRecording && sessionStore.recognizedAnimal"
      />
      
      <ChatBar 
        v-if="uiState.isRecording && sessionStore.recognizedAnimal"
        :isListening="globalUiState.getRecording()"
        :isSpeaking="globalUiState.getSpeaking()"
        :isQuizActive="!!chatStore.activeQuestion"
        @toggle-microphone="toggleGlobalMic"
        @cancel-recording="eraseGlobalAudio"
        @stop-audio="stopGlobalAudio"
        @send-audio="sendGlobalAudio"
        @open-quiz-menu="isQuizModalOpen = true"
        @cancel-quiz="cancelActiveQuiz"
      />
    </ion-content>
    <QuizMenu 
      :isOpen="isQuizModalOpen" 
      @close="isQuizModalOpen = false" 
      @select-quiz="selectQuiz" 
    />
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { IonPage, IonContent, onIonViewDidLeave, alertController, IonHeader, IonToolbar, IonTitle, IonButton } from '@ionic/vue';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { RecognitionManager } from '@/modules/RecognitionMgr';
import { useServiceStore } from '@/stores/serviceStore';
import { useSessionStore } from '@/stores/sessionStore';
import BaseButton from '@/components/BaseButton.vue';
import { camera, close } from 'ionicons/icons';
import { globalUiState } from '@/utility/UiState';
import type { DifficultyLevel } from '@/utility/Types';
import { CHAT_STATUS } from '@/utility/constants';
import ChatBar from '@/components/ChatBar.vue';
import { useChatStore } from '@/stores/chatStore';
import QuizMenu from '@/components/QuizMenu.vue';
import { useManagerStore } from '@/stores/managerStore';
import DynamicMessage from '@/components/DynamicMessage.vue';
import type { AnimalData } from '@/utility/AnimalData';

// --- INITIALIZATION ---
const chatStore = useChatStore();
const serviceStore = useServiceStore();
const managerStore = useManagerStore();
const recog = new RecognitionManager();
const sessionStore = useSessionStore();
const videoElement = ref<HTMLVideoElement | null>(null);
const isQuizModalOpen = ref(false);

onMounted(() => {
  if(!videoElement.value) {
    uiState.statusMessage = "Camera video element not found.";
    return;
  }
  serviceStore.setCameraService(videoElement.value);
  managerStore.initConversationManager();
})

// --- UI STATE VARIABLES ---
const uiState = reactive({
  isRecording: false,
  statusMessage: ""
});
// --- WHATCHERS ---
watch(
  () => chatStore.messages.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      const lastMsg = chatStore.messages[newLength - 1];
      if (lastMsg && lastMsg.role === 'model') {
        globalUiState.setProcessing(false);
        globalUiState.setStatusMessage(CHAT_STATUS.SUCCESS);
        globalUiState.setSpeaking(true); 
      }
    }
  }
);

watch(
  () => chatStore.activeQuestion,
  (newQuestion) => {
    if (newQuestion) {
      globalUiState.setProcessing(false);
      globalUiState.setStatusMessage(CHAT_STATUS.SUCCESS);
      globalUiState.setSpeaking(true); 
    }
  }
);
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

const resumeScan = async () => {
  sessionStore.multipleAnimals = null;
  sessionStore.recognizedAnimal = null; 
  await recog.startRecognitionLoop();
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
  if (globalUiState.getRecording()) {
    await managerStore.conversationManager?.stopListening();
    await managerStore.conversationManager?.resetTranscript();
    globalUiState.setRecording(false);
  }
  globalUiState.setStatusMessage(CHAT_STATUS.IDLE);
  await managerStore.conversationManager?.stopSpeaking();
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
const selectQuiz = async (difficulty: DifficultyLevel) => {
  isQuizModalOpen.value = false;
  
  globalUiState.setProcessing(true);
  globalUiState.setStatusMessage(CHAT_STATUS.THINKING);
  await managerStore.conversationManager?.stopSpeaking();
  
  try {
    const manager = managerStore.conversationManager;
    const isQuizLoaded = manager ? await manager.requestQuiz(difficulty) : false;
    globalUiState.setQuizStatus(isQuizLoaded);
    globalUiState.setStatusMessage(isQuizLoaded ? CHAT_STATUS.QUIZ_LOADED : CHAT_STATUS.NO_QUIZ_AVAILABLE);
  } catch (error: any) {
    globalUiState.setStatusMessage(("Errore quiz: " + error.message) as any);
  } finally {
    globalUiState.setProcessing(false);
    globalUiState.setSpeaking(false);
  }
};

const toggleGlobalMic = async () => {
  if (globalUiState.getProcessing() || globalUiState.getRecording()) return;
  
  if (globalUiState.getSpeaking()) {
    await managerStore.conversationManager?.stopSpeaking();
    globalUiState.setSpeaking(false);
  }
  try {
       await managerStore.conversationManager?.stopListening();
     } catch(e) {}
  
  try {
     globalUiState.setStatusMessage(CHAT_STATUS.INITIALIZING);
     globalUiState.setRecording(true);
     globalUiState.setMicReady(false);

    await managerStore.conversationManager?.startInteraction(() => {
      globalUiState.setMicReady(true);
      globalUiState.setStatusMessage(CHAT_STATUS.RECORDING);
    }, (errorMessage) => {
      globalUiState.setStatusMessage(("Errore: " + errorMessage) as any);
      globalUiState.setRecording(false);
      globalUiState.setMicReady(false);
    });
  } catch (error: any) {
    globalUiState.setStatusMessage(("Errore: " + error.message) as any);
    globalUiState.setRecording(false);
  }
};

const eraseGlobalAudio = async () => {
  if (globalUiState.getRecording()) {
    await managerStore.conversationManager?.stopListening();
    await managerStore.conversationManager?.resetTranscript(); 
    globalUiState.setRecording(false);
    globalUiState.setStatusMessage(CHAT_STATUS.IDLE);
  }
};

const stopGlobalAudio = async () => {
  await managerStore.conversationManager?.stopSpeaking();
  globalUiState.setSpeaking(false);
};

const sendGlobalAudio = async () => {
  globalUiState.setRecording(false);
  globalUiState.setProcessing(true);
  globalUiState.setStatusMessage(CHAT_STATUS.THINKING);

  try {
    await managerStore.conversationManager?.stopListening();
    const userText = managerStore.conversationManager ? await managerStore.conversationManager.getCurrentTranscript() : "";
    
    if (globalUiState.getQuizStatus()) {
      await managerStore.conversationManager?.validateQuiz(userText);
      globalUiState.setStatusMessage(CHAT_STATUS.SUCCESS);
    } else {
      await managerStore.conversationManager?.processTextInteraction(userText);
      globalUiState.setStatusMessage(CHAT_STATUS.SUCCESS);
    }
  } catch (error: any) {
    globalUiState.setStatusMessage(("Errore: " + error.message) as any);
  } finally {
    await managerStore.conversationManager?.resetTranscript();
    globalUiState.setProcessing(false);
    globalUiState.setQuizStatus(false);
    
    globalUiState.setSpeaking(false) 
  }
};

const chooseAnimal = (animal: AnimalData) => {
    sessionStore.updateRecognizedAnimal(animal);
  };

const cancelActiveQuiz = () => {
  chatStore.clearQuiz();
  globalUiState.setQuizStatus(false);
  globalUiState.setStatusMessage(CHAT_STATUS.IDLE);
};
</script>

<style scoped>
.camera-off {
  --background: var(--background-light, #fff8dc);;
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
  flex-direction: column; 
  align-items: center;    
  gap: 15px;
  width: 90%;
}

.stile-input {
  background: var(--background-light, #fff8dc);
  color: var(--background-dark, #2c2a26);
  border-color: var(--secondary, #fac400); 
}

.stile-input:hover {
  border-color: var(--secondary, #fac400); 
  background: var(--background-light, #fff8dc);
}

.multiple-animals-card {
  background: var(--background-light, #fff8dc);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  width: 100%; 
  border: 1px solid var(--secondary, #fac400);
  animation: slideUpCard 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.dual-buttons {
  display: flex;
  gap: 12px;
  width: 100%;
  max-width: 300px;
  justify-content: center;
}

.half-width {
  flex: 1;
  margin: 0;
  max-width: none;
}

.btn-action {
  width: 100%;
  max-width: 300px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5); 
}

.result-banner {
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  color: var(--primary, #fb6237);
  padding: 12px 25px;
  border-radius: 30px;
  font-weight: bold;
  z-index: 10;
  border: 1px solid rgba(222, 255, 154, 0.3);
  text-align: center;
}

.custom-toolbar {
  --background: var(--background-light, #fff8dc);
  --border-width: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.logo-title {
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
}
.text-white { color: #000000; }
.text-lime { color: var(--primary, #fb6237); }
.question-text {
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-weight: 700;
  font-size: 18px;
  color: var(--background-dark, #2c2a26); 
  margin-top: 0;
  margin-bottom: 15px;
  text-align: center;
}
.animal-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.animal-choice-btn {
  --background: var(--secondary, #fac400); 
  --color: var(--background-dark, #2c2a26); 
  margin: 0;
  font-weight: 600;
  letter-spacing: 1px;
}
@media (prefers-color-scheme: dark) {
  .camera-off {
    --background: var(--background-dark, #2c2a26);
  }
  .custom-toolbar {
    --background: var(--background-dark, #2c2a26);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .text-white { color: var(--background-light, #fff8dc); }
  .multiple-animals-card {
    background: var(--background-dark, #2c2a26);
    border: 1px solid var(--primary, #fb6237);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5); 
  }
  
  .question-text {
    color: var(--background-light, #fff8dc); 
  }
  .animal-choice-btn {
    --background: var(--primary, #fb6237); 
    --color: var(--background-light, #fff8dc); 
  }
  .stile-input {
    background: var(--background-dark, #2c2a26);
    color: var(--background-light, #fff8dc);
    border-color: var(--primary, #fb6237); 
  }

  .stile-input:hover {
    border-color: var(--primary, #fb6237); 
    background: var(--background-dark, #2c2a26);
  }
}

@keyframes slideUpCard {
  from { 
    opacity: 0; 
    transform: translateY(60px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
</style>

<style>

  body { background: transparent; }
  ion-content { --background: transparent; }
  .camera-video {
    z-index: -1; 
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>