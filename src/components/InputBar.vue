<script setup>
import BaseButton from './BaseButton.vue'

defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  isListening: {
    type: Boolean,
    default: false
  },
  isSpeaking: {       // <-- NUOVA PROP
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:modelValue', 
  'send',             
  'toggle-microphone',
  'cancel-recording', 
  'stop-audio',       // <-- NUOVO EVENTO
  'focus',              
  'blur'       
])

function onInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="global-input-bar">
    
    <template v-if="!isListening">
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
        v-if="isSpeaking"
        icona="⏹️" 
        variante="pericolo" 
        rotondo 
        @click="$emit('stop-audio')"
      />
      
      <BaseButton 
        v-else-if="modelValue.trim().length === 0"
        icona="🎤" 
        variante="grigio" 
        rotondo 
        @click="$emit('toggle-microphone')"
      />

      <BaseButton 
        v-else
        icona="⬆️" 
        variante="grigio" 
        rotondo 
        @mousedown.prevent="$emit('send')"
        @touchstart.prevent="$emit('send')"
      />
    </template>

    <template v-else>
      <div class="recording-indicator">
        <span class="recording-dot">🔴</span>
        <span class="recording-text">Registrazione in corso...</span>
      </div>

      <BaseButton 
        icona="🗑️" 
        variante="pericolo" 
        rotondo 
        @click="$emit('cancel-recording')"
      />

      <BaseButton 
        icona="⬆️" 
        variante="grigio" 
        rotondo 
        @mousedown.prevent="$emit('send')"
        @touchstart.prevent="$emit('send')"
      />
    </template>

  </div>
</template>

<style scoped>
/* Il CSS rimane esattamente identico a prima! */
.global-input-bar {
  padding: 10px 15px;
  display: flex;
  gap: 10px;
  background: var(--white, #ffffff);
  align-items: center;
  border-top: 1px solid #eee;
  flex-shrink: 0;
  z-index: 15;
  color: var(--dark);
}

.global-input-bar input {
  flex: 1;
  border: 1px solid #ddd;
  padding: 10px 15px;
  border-radius: 20px;
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-size: var(--text-base, 15px);
  outline: none;
  transition: border-color 0.3s;
}

.global-input-bar input:focus {
  border-color: var(--lime, #deff9a);
}

.recording-indicator {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 5px;
}

.recording-text {
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-size: 15px;
  font-weight: 600;
  color: #666;
}

.recording-dot {
  animation: pulse-dot 1s infinite alternate;
  font-size: 14px;
}

@keyframes pulse-dot {
  from { opacity: 0.3; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1.1); }
}
</style>