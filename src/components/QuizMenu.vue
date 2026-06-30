<template>
  <ion-modal 
    :is-open="isOpen" 
    @didDismiss="$emit('close')" 
    :initial-breakpoint="0.30" 
    :breakpoints="[0, 0.30]"
  >
    <ion-content class="whatsapp-modal-content">
      <div class="whatsapp-menu">
        
        <div class="menu-item" @click="seleziona('easy')">
          <div class="icon-circle easy-color">
            <ion-icon :icon="happy"></ion-icon>
          </div>
          <span>Quiz facile</span>
        </div>

        <div class="menu-item" @click="seleziona('medium')">
          <div class="icon-circle medium-color">
            <ion-icon :icon="extensionPuzzle"></ion-icon>
          </div>
          <span>Quiz medio</span>
        </div>

      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { IonModal, IonContent, IonIcon } from '@ionic/vue';
import { happy, extensionPuzzle } from 'ionicons/icons';
import type { DifficultyLevel } from '@/utility/Types';

// Riceve lo stato di apertura dalla pagina genitore
defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

// Comunica alla pagina genitore quando chiudere o quale quiz è stato scelto
const emit = defineEmits(['close', 'select-quiz']);

const seleziona = (difficolta: DifficultyLevel) => {
  emit('select-quiz', difficolta);
};
</script>

<style scoped>
/* --- MENU QUIZ STILE WHATSAPP --- */
.whatsapp-modal-content {
  --background: var(--background-light, #fff8dc);
}
.whatsapp-menu {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 40px 20px;
}
.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.icon-circle {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 30px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}
.menu-item:active .icon-circle {
  transform: scale(0.95); 
}
.easy-color { background: var(--primary, #fb6237); } 
.medium-color { background: var(--secondary, #fac400); } 
.menu-item span {
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-weight: 600;
  color: var(--background-dark, #2c2a26);
  font-size: 14px;
}
@media (prefers-color-scheme: dark) {
  .whatsapp-modal-content {
    --background: var(--background-dark, #2c2a26);
  }
  .menu-item span {
    color: var(--background-light, #fff8dc);
  }
}
</style>