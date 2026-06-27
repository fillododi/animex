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
  }
})

const emit = defineEmits([
  'update:modelValue', // Aggiorna il testo mentre l'utente digita
  'send',             // Quando l'utente preme la freccia o il tasto Invio
  'toggle-microphone',  // Quando l'utente preme il microfono
  'focus',              // Quando l'utente tocca la barra per scrivere
  'blur'       
])

function onInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="global-input-bar">
    
    <!-- Campo di testo -->
    <input 
      type="text" 
      :value="modelValue" 
      @input="onInput"
      @keyup.enter="$emit('send')"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
      placeholder="Chiedi all'IA..." 
    >
    
    <!-- Tasto Microfono -->
    <BaseButton 
      :icona=" isListening ? '🔴' : '🎤'" 
      variante="grigio" 
      rotondo 
      :attivo=" isListening"
      @click="$emit('toggle-microphone')"
    />

    <!-- Tasto Invia -->
    <BaseButton 
      icona="⬆️" 
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
  color: var(--dark)
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
</style>