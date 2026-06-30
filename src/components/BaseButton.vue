<script setup>
import { IonIcon } from '@ionic/vue';

defineProps({
  testo: {
    type: String,
    default: ''
  },
  icona: {
    type: [String, Object], // Ora accetta sia stringhe (emoji/font-awesome) che oggetti (Ionicons)
    default: ''
  },
  variante: {
    type: String,
    default: 'primario'
  },
  rotondo: {
    type: Boolean,
    default: false 
  },
  attivo: {
    type: Boolean,
    default: false 
  }
})
</script>

<template>
  <button 
    class="base-btn" 
    :class="[variante, { 'btn-rotondo': rotondo, 'is-active': attivo }]"
  >
    <span v-if="icona" class="icona">
      <i v-if="typeof icona === 'string' && icona.includes('fa-')" :class="icona"></i>
      
      <span v-else-if="typeof icona === 'string' && icona.length <= 4">{{ icona }}</span>
      
      <ion-icon v-else :icon="icona" class="custom-ion-icon"></ion-icon>
    </span>

    <span v-if="testo" class="testo">{{ testo }}</span>
    
    <slot></slot>
  </button>
</template>

<style scoped>
/* Aggiungiamo uno stile per allineare perfettamente le nuove icone */
.custom-ion-icon {
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* --- Il resto del tuo CSS originale rimane INVARIATO --- */
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
.primario {
  background: transparent;
  color: var(--lime, #deff9a);
  border-color: var(--lime, #deff9a);
}
.primario:hover { background: rgba(222, 255, 154, 0.1); }
.secondario {
  background: rgba(0, 0, 0, 0.7);
  color: var(--lime, #deff9a);
  border-color: var(--lime, #deff9a);
}
.secondario:hover { background: rgba(0, 0, 0, 0.9); }
.pericolo {
  background: var(--danger, #ff4757);
  color: #fff;
  border-color: var(--danger, #ff4757);
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
}
.pericolo:hover { background: #ff2e43; }
.grigio {
  background: #f5f5f5;
  color: #000;
  border-color: #f5f5f5;
}
.grigio:hover { background: #e0e0e0; }
.btn-rotondo {
  padding: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  flex-shrink: 0;
}
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
  border-color: var(--lime, #deff9a); 
  background: #fafafa;
}
@keyframes pulse-mic {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); box-shadow: 0 0 15px rgba(255, 71, 87, 0.6); }
  100% { transform: scale(1); }
}
</style>