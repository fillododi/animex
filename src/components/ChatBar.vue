<template>
  <div class="vertical-chat-bar">
    
    <!-- Tasto Muto (Appare solo se il bot sta parlando) -->
    <BaseButton 
      v-if="isSpeaking"
      :icona="volumeHigh" 
      variante="grigio" 
      rotondo 
      @click="$emit('stop-audio')"
    />

    <!-- Tasto Cestino (Appare solo se stai registrando l'audio) -->
    <BaseButton 
      v-else-if="isListening"
      :icona="trash" 
      variante="pericolo" 
      rotondo 
      @click="$emit('cancel-recording')"
    />

    <!-- Tasto "+" Quiz (Appare quando non si parla e non si ascolta) -->
    <BaseButton 
      v-else
      :icona="add" 
      variante="grigio" 
      rotondo 
      @click="$emit('open-quiz-menu')"
    />

    <div class="divider"></div>

    <!-- Tasto INVIA (Appare MENTRE registri per inviare l'audio) -->
    <BaseButton 
      v-if="isListening"
      :icona="send" 
      variante="grigio" 
      rotondo 
      @click="$emit('send-audio')"
    />

    <!-- Tasto Microfono (Appare quando NON registri) -->
    <BaseButton 
      v-else
      :icona="mic" 
      variante="grigio" 
      rotondo 
      @click="$emit('toggle-microphone')"
    />

  </div>
</template>

<script setup>
import BaseButton from './BaseButton.vue'
import { mic, trash, volumeHigh, add, send } from 'ionicons/icons'; // <-- Aggiunto 'send'

defineProps({
  isListening: { type: Boolean, default: false },
  isSpeaking: { type: Boolean, default: false } 
})

// <-- Aggiunto 'send-audio' agli emits
defineEmits(['toggle-microphone', 'stop-audio', 'cancel-recording', 'open-quiz-menu', 'send-audio'])
</script>

<style scoped>
.vertical-chat-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
}
.divider {
  width: 70%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 2px 0;
}
</style>