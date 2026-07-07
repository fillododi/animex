<!-- src/components/ui/ChatBubble.vue -->
<script setup>
defineProps({
  timestamp: { 
    type: String, 
    default: '' 
  },
  role: {
    type: String,
    required: true 
  },
  text: {
    type: String,
    default: ''
  },
  isThinking: {
    type: Boolean,
    default: false 
  }
})
</script>

<template>
  
  <!--  Ho assegnato dei tag alle bubble in base alla loro origine (AI o utente)
        I messaggi dell'AI generano un messaggio di attesa quando l'AI pensa
        Il tag dell'AI è nascosto mentre pensa -->

  <div class="chat-bubble" :class="[role, { 'thinking': isThinking }]">
    <div class="role-tag" v-if="!isThinking">
      {{ role === 'ai' ? 'ESPERTO' : 'TU' }}
    </div>
    
    <!-- Testo del messaggio -->
    <div class="text">
      {{ text }}
    </div>

    <span v-if="timestamp" class="time-stamp">
      {{ timestamp }}
    </span>
  </div>
</template>

<style scoped>
.chat-bubble {
  padding: 12px 16px;
  border-radius: var(--radius-card, 18px);
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-size: var(--text-base, 14px);
  max-width: 85%;
  word-wrap: break-word; 
  animation: fade-in 0.3s ease-out; 
  margin-bottom: 12px;
}

/* Stile per i messaggi dell'IA */
.chat-bubble.ai {
  background: var(--background-light, #fff8dc);
  color: var(--background-dark, #2c2a26);
  align-self: flex-start;
  border-bottom-left-radius: 4px; /* Rende la coda della nuvoletta più netta */
}

/* Stile per i messaggi dell'Utente */
.chat-bubble.utente {
  background: var(--secondary, #fac400);
  color: var(--background-dark, #2c2a26);
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}

/* Etichette */
.role-tag {
  font-size: 9px;
  font-weight: 800;
  opacity: 0.5;
  margin-bottom: 4px;
  letter-spacing: 1px;
}

.chat-bubble.thinking {
  font-style: italic;
  color: var(--secondary, #fac400);
  background: transparent;
  border: 1px dashed #ccc;
  align-self: flex-start;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>