<script setup>
import BaseButton from './BaseButton.vue'
import { mic, send, trash, volumeHigh, add, close } from 'ionicons/icons';

defineProps({
  modelValue: { type: String, default: '' },
  isListening: { type: Boolean, default: false },
  isSpeaking: { type: Boolean, default: false },
  isQuizActive: { type: Boolean, default: false } 
})

const emit = defineEmits(['update:modelValue', 'send', 'toggle-microphone', 'focus', 'blur', 'stop-audio', 'cancel-recording', 'open-quiz-menu', 'cancel-quiz'])

function onInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="global-input-bar">
    
    <BaseButton 
      v-if="isSpeaking"
      :icona="volumeHigh" 
      variante="grigio" 
      rotondo 
      @click="$emit('stop-audio')"
    />

    <BaseButton 
      v-else-if="isListening"
      :icona="trash" 
      variante="grigio" 
      rotondo 
      @click="$emit('cancel-recording')"
    />

    <BaseButton 
      v-else-if="isQuizActive"
      :icona="close" 
      variante="pericolo" 
      rotondo 
      @click="$emit('cancel-quiz')"
    />

    <BaseButton 
      v-else
      :icona="add" 
      variante="grigio" 
      rotondo 
      @click="$emit('open-quiz-menu')"
    />

    <input 
      type="text" 
      :value="modelValue" 
      @input="onInput"
      @keyup.enter="$emit('send')"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
      placeholder="Chiedi all'IA..." 
    >
    
    <BaseButton 
      :icona="mic" 
      variante="grigio" 
      rotondo 
      :attivo="isListening"
      @click="!isListening && $emit('toggle-microphone')"
    />
    
    <BaseButton 
      :icona="send" 
      variante="grigio" 
      rotondo 
      @mousedown.prevent="$emit('send')"
      @touchstart.prevent="$emit('send')"
    />

  </div>
</template>

<style scoped>
/* LIGHT MODE (DEFAULT) */
.global-input-bar {
  padding: 10px 15px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-shrink: 0;
  z-index: 15;
  transition: none !important;
  will-change: transform;

  background: var(--background-light, #fff8dc);
  color: #000000;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}
.global-input-bar input {
  flex: 1;
  border: 1px solid transparent;
  padding: 10px 15px;
  border-radius: 20px;
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-size: var(--text-base, 15px);
  outline: none;
  transition: none !important;
  will-change: transform;
  
  background: rgba(0, 0, 0, 0.05);
  color: #000000;
}
.global-input-bar input:focus {
  border-color: var(--primary, #fb6237);
  background: rgba(0, 0, 0, 0.08);
}

/* DARK MODE  */
@media (prefers-color-scheme: dark) {
  .global-input-bar {
    background: var(--background-dark,#2c2a26);
    color: var(--background-light, #fff8dc);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  .global-input-bar input {
    background: rgba(255, 255, 255, 0.1);
    color: var(--background-light, #fff8dc);
  }
  .global-input-bar input:focus {
    background: rgba(255, 255, 255, 0.15);
  }
}
</style>