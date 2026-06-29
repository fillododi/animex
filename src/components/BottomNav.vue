<script setup>
import { useSessionStore } from '@/stores/sessionStore';
import { globalUiState } from '@/utility/UiState';

const sessionStore = useSessionStore();
const uiState = globalUiState;
// Riceviamo da App.vue il numero della pagina attuale (0, 1 o 2)
defineProps({
  modelValue: {
    type: Number,
    required: true
  }
})

// Azione che definisce il cambio pagina
const emit = defineEmits(['update:modelValue'])

// Cambio pagina
function changePage(indice) {
  if(sessionStore.recognizedAnimal !== null) {
    emit('update:modelValue', indice)
  }
}
</script>

<template>
  <nav class="bottom-nav" v-show="!uiState.getUsingKeyboard()">
    
    <!-- Tasto 0: Assistente -->
    <div 
      class="nav-item" 
      :class="{
        active: sessionStore.recognizedAnimal !== null && modelValue === 0
      }" 
      @click="changePage(0)"
    >
      <i class="fa-solid fa-message"></i>
      <span>{{ sessionStore.recognizedAnimal ? 'Assistente' : '' }}</span>
    </div>
    
    <!-- Tasto 1: Scanner -->
    <div 
      class="nav-item" 
      :class="{ active: modelValue === 1 }" 
      @click="changePage(1)"
    >
      <i class="fa-solid fa-camera"></i>
      <span>Scanner</span>
    </div>
    
    <!-- Tasto 2: Visione AR -->
    <div 
      class="nav-item" 
      :class="{ active: sessionStore.recognizedAnimal !== null && modelValue === 2 }" 
      @click="changePage(2)"
    >
      <i class="fa-solid fa-vr-cardboard"></i>
      <span>{{ sessionStore.recognizedAnimal ? 'Visione AR' : '' }}</span>
    </div>

  </nav>
</template>

<style scoped>
.bottom-nav {
  display: flex;
  justify-content: space-around;
  background: var(--dark, #000);
  padding: 15px 10px calc(15px + var(--ion-safe-area-bottom, 0px)) 10px;;
  border-top: 1px solid #222;
  flex-shrink: 0;
  z-index: 10;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  width: 33%;
}

.nav-item i { 
  font-size: 20px; 
}

.nav-item span { 
  font-size: 10px; 
  font-weight: 700; 
  text-transform: uppercase; 
  letter-spacing: 1px;
}

/* Pagina selezionata */
.nav-item.active { 
  color: var(--lime, #deff9a); 
}

.nav-item.active i { 
  transform: translateY(-3px); 
}
</style>