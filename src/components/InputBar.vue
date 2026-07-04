<script setup>
import { IonButton, IonIcon, IonInput } from '@ionic/vue';
import { mic, send, trash, volumeHigh, gameController, close } from 'ionicons/icons';

defineProps({
  modelValue: { type: String, default: '' },
  isListening: { type: Boolean, default: false },
  isSpeaking: { type: Boolean, default: false },
  isQuizActive: { type: Boolean, default: false } 
})

const emit = defineEmits(['update:modelValue', 'send', 'toggle-microphone', 'focus', 'blur', 'stop-audio', 'cancel-recording', 'open-quiz-menu', 'cancel-quiz'])

function onInput(event) {
  // L'evento di Ionic restituisce il valore nel detail o direttamente nel target
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="global-input-bar">
    
    <!-- Pulsante Stop Audio -->
    <ion-button 
      v-if="isSpeaking"
      fill="clear"
      color="medium"
      shape="round"
      @click="$emit('stop-audio')"
    >
      <ion-icon slot="icon-only" :icon="volumeHigh" />
    </ion-button>

    <!-- Pulsante Elimina Registrazione -->
    <ion-button 
      v-else-if="isListening"
      fill="clear"
      color="medium"
      shape="round"
      @click="$emit('cancel-recording')"
    >
      <ion-icon slot="icon-only" :icon="trash" />
    </ion-button>

    <!-- Pulsante Chiudi Quiz (Variante Pericolo) -->
    <ion-button 
      v-else-if="isQuizActive"
      fill="clear"
      color="danger"
      shape="round"
      @click="$emit('cancel-quiz')"
    >
      <ion-icon slot="icon-only" :icon="close" />
    </ion-button>

    <!-- Pulsante Apri Menu Quiz -->
    <ion-button 
      v-else
      fill="clear"
      color="medium"
      shape="round"
      @click="$emit('open-quiz-menu')"
    >
      <ion-icon slot="icon-only" :icon="gameController" />
    </ion-button>

    <!-- Campo di Input -->
    <ion-input 
      type="text" 
      :value="modelValue" 
      @ionInput="onInput"
      @keyup.enter="$emit('send')"
      @ionFocus="$emit('focus')"
      @ionBlur="$emit('blur')"
      placeholder="Chiedi all'IA..." 
      class="chat-input"
    ></ion-input>
    
    <!-- Pulsante Microfono -->
    <ion-button 
      fill="clear"
      :color="isListening ? 'danger' : 'medium'"
      shape="round"
      :class="{ 'active': isListening }"
      @click="!isListening && $emit('toggle-microphone')"
    >
      <ion-icon slot="icon-only" :icon="mic" />
    </ion-button>
    
    <!-- Pulsante Invia -->
    <ion-button 
      fill="clear"
      color="medium"
      shape="round"
      @mousedown.prevent="$emit('send')"
      @touchstart.prevent="$emit('send')"
    >
      <ion-icon slot="icon-only" :icon="send" />
    </ion-button>

  </div>
</template>

<style scoped>
/* LIGHT MODE (DEFAULT) */
.global-input-bar {
  padding: 10px 15px;
  display: flex;
  gap: 5px;
  align-items: center;
  flex-shrink: 0;
  z-index: 15;
  transition: none !important;
  will-change: transform;

  background: var(--background-light, #fff8dc);
  color: #000000;
  border-top: 1px solid rgba(0, 0, 0, 0.1);

  width: 100%;
  box-sizing: border-box;
}

/* Stile Ion-Input */
.chat-input {
  flex: 1;
  border: 1px solid transparent;
  border-radius: 20px;
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-size: var(--text-base, 15px);
  outline: none;
  transition: none !important;
  will-change: transform;
  
  /* Variabili CSS di Ionic per lo Shadow DOM */
  --padding-top: 10px;
  --padding-bottom: 10px;
  --padding-start: 15px;
  --padding-end: 15px;
  --background: rgba(0, 0, 0, 0.05);
  --color: #000000;
  
  min-width: 0;
}

/* Quando l'input Ionic è a fuoco, sfrutta la classe .ion-focused */
.chat-input.ion-focused {
  border-color: var(--primary, #fb6237);
  --background: rgba(0, 0, 0, 0.08);
}

/* DARK MODE */
@media (prefers-color-scheme: dark) {
  .global-input-bar {
    background: var(--background-dark, #2c2a26);
    color: var(--background-light, #fff8dc);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .chat-input {
    --background: rgba(255, 255, 255, 0.1);
    --color: var(--background-light, #fff8dc);
  }
  
  .chat-input.ion-focused {
    --background: rgba(255, 255, 255, 0.15);
  }
}
</style>