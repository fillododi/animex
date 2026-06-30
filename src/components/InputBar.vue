<script setup>
import BaseButton from './BaseButton.vue'
import { mic, send, volumeMute, trash, volumeHigh, add } from 'ionicons/icons';

defineProps({
  modelValue: { type: String, default: '' },
  isListening: { type: Boolean, default: false },
  isSpeaking: { type: Boolean, default: false } 
})

const emit = defineEmits(['update:modelValue', 'send', 'toggle-microphone', 'focus', 'blur', 'stop-audio', 'cancel-recording', 'open-quiz-menu'])

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

.global-input-bar {
  padding: 10px 15px;
  display: flex;
  gap: 10px;
  background: var(--white, #ffffff);
  align-items: center;
  border-top: 1px solid #eee;
  flex-shrink: 0;
  z-index: 15;
  color: var(--dark, #000);
}
.global-input-bar input {
  flex: 1;
  border: 1px solid #ddd;
  padding: 10px 15px;
  border-radius: 20px;
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-size: var(--text-base, 15px);
  outline: none;
  transition: none !important;
  will-change: transform;
}
.global-input-bar input:focus {
  border-color: var(--lime, #deff9a);
}
</style>