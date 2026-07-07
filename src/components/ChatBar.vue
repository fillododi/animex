<template>
  <div class="vertical-chat-bar"
    :class="{ 'muting-mode': sessionStore.multipleAnimals !== null, 'hidden-bg': sessionStore.multipleAnimals !== null && !globalUiState.getSpeaking() }">
    <BaseButton 
      v-if="sessionStore.multipleAnimals !== null && globalUiState.getSpeaking()"
      :icona="volumeHigh" 
      variante="grigio" 
      rotondo 
      @click="stopGlobalAudio"
    />
    <template v-else-if="sessionStore.multipleAnimals === null">
      <template v-if="isVRMode">
        <BaseButton :icona="leaf" variante="grigio" rotondo @click="$emit('spawn-plant')" />
        <BaseButton :icona="restaurant" variante="grigio" rotondo @click="$emit('spawn-meat')" />
        <div class="divider"></div>
      </template>

      <BaseButton v-if="globalUiState.getSpeaking()" :icona="volumeHigh" variante="grigio" rotondo @click="stopGlobalAudio" />
      <BaseButton v-else-if="globalUiState.getRecording()" :icona="trash" variante="pericolo" rotondo @click="eraseGlobalAudio" />
      <BaseButton v-else-if="!!chatStore.activeQuestion" :icona="close" variante="pericolo" rotondo @click="cancelActiveQuiz" />
      <BaseButton v-else :icona="gameController" variante="grigio" rotondo @click="isQuizModalOpen = true" />
      <BaseButton v-if="sessionStore.multipleAnimals !== null && globalUiState.getSpeaking()" :icona="volumeHigh" variante="grigio" rotondo @click="stopGlobalAudio"
      />

      <div class="divider"></div>

      <BaseButton v-if="globalUiState.getRecording()" :icona="send" variante="grigio" rotondo @click="sendGlobalAudio" />
      <BaseButton v-else :icona="mic" variante="grigio" rotondo @click="toggleGlobalMic" />
    </template>
  </div>

  <QuizMenu 
    :isOpen="isQuizModalOpen" 
    @close="isQuizModalOpen = false" 
    @select-quiz="selectQuiz" 
  />
</template>

<script setup>
import { ref } from 'vue';
import BaseButton from './BaseButton.vue';
import QuizMenu from '@/components/QuizMenu.vue';
import { mic, trash, volumeHigh, send, close, gameController, leaf, restaurant} from 'ionicons/icons'; 
import { globalUiState } from '@/utility/UiState';
import { useChatStore } from '@/stores/chatStore';
import { useManagerStore } from '@/stores/managerStore';
import { CHAT_STATUS } from '@/utility/constants';
import {useSessionStore } from '@/stores/sessionStore';
import { alertController } from '@ionic/vue';
const chatStore = useChatStore();
const managerStore = useManagerStore();
const sessionStore = useSessionStore();
const isQuizModalOpen = ref(false);

defineProps({
  isVRMode: { type: Boolean, default: false } 
});

defineEmits(['spawn-plant', 'spawn-meat']);


const toggleGlobalMic = async () => {
  if (globalUiState.getProcessing() || globalUiState.getRecording()) return;
  if (globalUiState.getSpeaking()) {
    await managerStore.conversationManager?.stopSpeaking();
    globalUiState.setSpeaking(false);
  }
  await managerStore.conversationManager?.stopListening();
  
  try {
     globalUiState.setStatusMessage(CHAT_STATUS.INITIALIZING);
     globalUiState.setRecording(true);
     globalUiState.setMicReady(false);

    await managerStore.conversationManager?.startInteraction(() => {
      globalUiState.setMicReady(true);
      globalUiState.setStatusMessage(CHAT_STATUS.RECORDING);
    }, (errorMessage) => {
      if (errorMessage === 'NEEDS_SETTINGS') {
          showSettingsAlert();
          // This if is to prevent overwriting the alert message if the user has already been prompted
          if(uiState.getStatusMessage() != CHAT_STATUS.DENIED_HARD){
            uiState.setStatusMessage(CHAT_STATUS.DENIED_HARD);
          }
        } else if (errorMessage === 'FIRST_DENIAL') {
          uiState.setStatusMessage(CHAT_STATUS.DENIED_SOFT);
        } else {
          uiState.setStatusMessage(("Errore: " + errorMessage));
        }
      globalUiState.setRecording(false);
      globalUiState.setMicReady(false);
    });
  } catch (error) {
    globalUiState.setStatusMessage(("Errore: " + error.message));
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
  } catch (error) {
    globalUiState.setStatusMessage(("Errore: " + error.message));
  } finally {
    await managerStore.conversationManager?.resetTranscript();
    globalUiState.setProcessing(false);
    globalUiState.setQuizStatus(false);
    globalUiState.setSpeaking(false);
  }
};

const selectQuiz = async (difficulty) => {
  isQuizModalOpen.value = false;
  globalUiState.setProcessing(true);
  globalUiState.setStatusMessage(CHAT_STATUS.THINKING);
  await managerStore.conversationManager?.stopSpeaking();
  
  try {
    const manager = managerStore.conversationManager;
    const isQuizLoaded = manager ? await manager.requestQuiz(difficulty) : false;
    globalUiState.setQuizStatus(isQuizLoaded);
    globalUiState.setStatusMessage(isQuizLoaded ? CHAT_STATUS.QUIZ_LOADED : CHAT_STATUS.NO_QUIZ_AVAILABLE);
  } catch (error) {
    globalUiState.setStatusMessage(("Errore quiz: " + error.message));
  } finally {
    globalUiState.setProcessing(false);
    globalUiState.setSpeaking(false);
  }
};

const cancelActiveQuiz = () => {
  chatStore.clearQuiz();
  globalUiState.setQuizStatus(false);
  globalUiState.setStatusMessage(CHAT_STATUS.IDLE);
};

const showSettingsAlert = async () => {
  const alert = await alertController.create({
    header: 'Microfono Disabilitato',
    message: "L'app ha bisogno del microfono e del riconoscimento vocale per ascoltare la tua voce. Apri le impostazioni del telefono per consentire l'accesso",
    buttons: [
      {
        text: 'Annulla',
        role: 'cancel',
        handler: () => {
          uiState.setStatusMessage(CHAT_STATUS.DENIED_SOFT);
        }
      }
    ]
  });

  await alert.present();
};

</script>

<style scoped>
.vertical-chat-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  background: var(--background-light, #fff8dc);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 40px;
  border: 1px solid var(--secondary, #fac400);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  transition: all 0.3s ease;
}
.muting-mode {
  top: calc(50% - 60px); 
}
.divider {
  width: 70%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 2px 0;
}
.hidden-bg {
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border: none !important;
  box-shadow: none !important;
}
@media (prefers-color-scheme: dark) {
  .vertical-chat-bar {
    background: var(--background-dark, #2c2a26);
    border-color: var(--primary, #fb6237);
  }
}
</style>