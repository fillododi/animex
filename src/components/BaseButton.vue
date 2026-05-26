<script setup>
defineProps({
  testo: {
    type: String,
    default: ''
  },
  icona: {
    type: String,
    default: ''
  },
  variante: {
    type: String,
    default: 'primario' // Può essere: 'primario', 'secondario', 'pericolo'
  },
  rotondo: {
    type: Boolean,
    default: false // Se true, diventa un bottone circolare (es. per il microfono)
  },
  attivo: {
    type: Boolean,
    default: false // Usato per far "lampeggiare" il microfono quando registra
  }
})

// <BaseButton testo="ATTIVA SCANNER" variante="primario" />
// <BaseButton testo="SPEGNI AR" icona="fa-solid fa-cube" variante="pericolo" />
// <BaseButton icona="🎤" variante="grigio" rotondo :attivo="isAscoltando" />
</script>

<template>
  <button 
    class="base-btn" 
    :class="[
      variante, 
      { 'btn-rotondo': rotondo, 'is-active': attivo }
    ]"
  >
    <span v-if="icona" class="icona">
      <i v-if="icona.includes('fa-')" :class="icona"></i>
      <span v-else>{{ icona }}</span> <!-- Nel caso sia un'emoji -->
    </span>

    <span v-if="testo" class="testo">{{ testo }}</span>
    
    <slot></slot>
  </button>
</template>

<style scoped>
/* STILE BASE (Comune a tutti i bottoni) */
.base-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 25px;
  border-radius: var(--radius-round, 50px);
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-size: var(--text-base, 15px);
  font-weight: 700;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  outline: none;
}

/* --- VARIANTI DI COLORE --- */

/* 1. Scanner */
.primario {
  background: transparent;
  color: var(--lime, #deff9a);
  border-color: var(--lime, #deff9a);
}
.primario:hover {
  background: rgba(222, 255, 154, 0.1);
}

/* 2. attivare l'AR */
.secondario {
  background: rgba(0, 0, 0, 0.7);
  color: var(--lime, #deff9a);
  border-color: var(--lime, #deff9a);
}
.secondario:hover {
  background: rgba(0, 0, 0, 0.9);
}

/* 3. spegnere l'AR */
.pericolo {
  background: var(--danger, #ff4757);
  color: #fff;
  border-color: var(--danger, #ff4757);
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
}
.pericolo:hover {
  background: #ff2e43;
}

/* input testuale */
.grigio {
  background: #f5f5f5;
  color: #000;
  border-color: #f5f5f5;
}
.grigio:hover {
  background: #e0e0e0;
}


/* --- MODIFICATORI DI FORMA E STATO --- */

/* Bottone Circolare (Microfono, Invio) */
.btn-rotondo {
  padding: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  flex-shrink: 0; /* Impedisce che si schiacci */
}

/* Animazione Pulsante per il Microfono in registrazione */
.is-active {
  background: var(--danger, #ff4757) !important;
  color: white !important;
  border-color: var(--danger, #ff4757) !important;
  animation: pulse-mic 1.5s infinite;
}

.stile-input {
  background: #ffffff;
  color: var(--dark, #0a0a0a);
  border-color: #ddd;
}

.stile-input:hover {
  /* Al tocco, il bordo diventa verde lime */
  border-color: var(--lime, #deff9a); 
  background: #fafafa;
}

@keyframes pulse-mic {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); box-shadow: 0 0 15px rgba(255, 71, 87, 0.6); }
  100% { transform: scale(1); }
}
</style>

