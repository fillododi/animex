<template>
  <div class="dynamic-message-container" v-if="shouldShow">
    
    <div v-if="uiState.getProcessing()" class="message-card thinking">
      <p>Elaborazione in corso...</p>
    </div>
    
    <div v-else-if="chatStore.activeQuestion" class="message-card quiz">
      <span class="role-badge">ESPERTO</span>
      <p>{{ chatStore.activeQuestion.prompt }}</p>
      <div v-if="chatStore.activeQuestion.type === 'multiple_choice' && chatStore.activeQuestion.choices && chatStore.activeQuestion.choices.length > 0" class="inline-quiz-options">              
        <ion-button 
          v-for="(choice, i) in chatStore.activeQuestion.choices" 
          :key="i"
          size="small"
          fill="outline"
          class="quiz-choice-btn"
          @click="handleTextSubmit(choice)"
          :disabled="uiState.getProcessing()"
        >
          {{ choice }}
        </ion-button>
      </div>

      <!-- Bottoni per Vero/Falso -->
      <div v-else-if="chatStore.activeQuestion.type === 'yes_no'" class="inline-quiz-options">
        <ion-button 
          size="small"
          fill="outline"
          class="quiz-choice-btn"
          @click="handleTextSubmit('Vero')"
          :disabled="uiState.getProcessing()"
        >
          Vero
        </ion-button>
        <ion-button 
          size="small"
          fill="outline"
          class="quiz-choice-btn"
          @click="handleTextSubmit('Falso')"
          :disabled="uiState.getProcessing()"
        >
          Falso
        </ion-button>
      </div>
      <div v-else class="hint">Usa il microfono per rispondere!</div>
    </div>
    
    <div v-else-if="lastBotMessage" class="message-card text-msg">
      <span class="role-badge">ESPERTO</span>
      <p>{{ lastBotMessage.content }}</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { globalUiState } from '@/utility/UiState';
import { IonButton } from '@ionic/vue';
import { useManagerStore } from '@/stores/managerStore';
import { CHAT_STATUS, SOMETHING_BAD_IN_BACKEND } from '@/utility/constants';

const chatStore = useChatStore();
const uiState = globalUiState;
const managerStore = useManagerStore();
const conversationManager = computed(() => managerStore.conversationManager);

const lastBotMessage = computed(() => {
  for (let i = chatStore.messages.length - 1; i >= 0; i--) {
    const message = chatStore.messages[i];
    if (message?.role === 'model') {
      return message;
    }
  }
  return null;
});

const isVisible = ref(false); 
let timeoutId: ReturnType<typeof setTimeout> | null = null;

watch(
  () => [
    uiState.getProcessing(),
    uiState.getSpeaking(),
    chatStore.activeQuestion,
    chatStore.messages.length 
  ],
  ([isProcessing, isSpeaking]) => {
    isVisible.value = true; 
    
    if (timeoutId) clearTimeout(timeoutId);
    
    if (isProcessing || isSpeaking) {
      return;
    }

    timeoutId = setTimeout(() => {
      if (!chatStore.activeQuestion) isVisible.value = false;
    }, 10000);
  },
  { deep: true } 
);

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId);
});

const shouldShow = computed(() => {
  return isVisible.value && (uiState.getProcessing() || chatStore.activeQuestion || lastBotMessage.value);
});

const handleTextSubmit = async (answer: string) => {
  await conversationManager.value?.stopSpeaking();
  if (!answer || uiState.getProcessing()) return;
  
  uiState.setProcessing(true);
  uiState.setStatusMessage(CHAT_STATUS.THINKING);
  
  try {
    await conversationManager.value?.validateQuiz(answer);
    uiState.setStatusMessage(CHAT_STATUS.SUCCESS);  
  } catch (error: any) {
    uiState.setStatusMessage((SOMETHING_BAD_IN_BACKEND) as any);
  } finally {
    uiState.setProcessing(false);
    uiState.setQuizStatus(false);
    uiState.setSpeaking(false);
  }
};
</script>

<style scoped>
.dynamic-message-container {
  position: absolute;
  top: 130px; 
  left: 15px;
  right: 85px; 
  z-index: 15;
}

.message-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  padding: 16px;
  border-radius: 18px;
  border-bottom-left-radius: 4px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  animation: slide-up 0.3s ease-out forwards;
}

.message-card p {
  margin: 0;
  color: var(--background-dark, #2c2a26);
  font-size: 15px;
  line-height: 1.4;
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-weight: 500;
}

.role-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  color: var(--primary, #fb6237);
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.quiz {
  border: 2px solid var(--secondary, #fac400);
}

.hint {
  font-size: 12px;
  color: #666;
  font-style: italic;
  margin-top: 8px;
}

.thinking p {
  font-style: italic;
  color: #666;
}

.inline-quiz-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  margin-bottom: 4px;
}

.quiz-choice-btn {
  --border-radius: 8px;
  --border-color: var(--secondary, #fac400);
  --color: var(--secondary, #fac400);
  margin: 0;
  text-transform: none; 
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-weight: 600;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-color-scheme: dark) {
  .message-card {
    background: rgba(0, 0, 0, 0.65);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .message-card p {
    color: var(--background-light, #fff8dc);
  }
  .hint, .thinking p {
    color: #aaa;
  }
  .quiz-choice-btn {
    --border-color: var(--primary, #fb6237);
    --color: var(--primary, #fb6237);
  }
}
</style>