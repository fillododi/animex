<template>
  <ion-page>
    

    <ion-tabs>
      
      <ion-router-outlet></ion-router-outlet>

      <ion-tab-bar slot="bottom" class="custom-tab-bar">
        
        <ion-tab-button 
          tab="chat" 
          href="/main/chat" 
          :disabled="sessionStore.recognizedAnimal === null"
        >
          <ion-icon :icon="chatbubbles"></ion-icon>
          <ion-label v-if="sessionStore.recognizedAnimal">Assistente</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="scanner" href="/main/scanner">
          <ion-icon :icon="camera"></ion-icon>
          <ion-label>Scanner</ion-label>
        </ion-tab-button>

        <ion-tab-button 
          tab="ar" 
          href="/main/ar"
          :disabled="sessionStore.recognizedAnimal === null"
        >
          <i class="fa-solid fa-vr-cardboard"></i>
          <ion-icon :icon="cube"></ion-icon>
          <ion-label v-if="sessionStore.recognizedAnimal">Visione AR</ion-label>
        </ion-tab-button>

      </ion-tab-bar>
    </ion-tabs>
    
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonLabel, IonIcon } from '@ionic/vue';
import { useSessionStore } from '@/stores/sessionStore';
import { globalUiState } from '@/utility/UiState';
import { camera, chatbubbles, cube } from 'ionicons/icons';

const sessionStore = useSessionStore();
const uiState = globalUiState;
</script>

<style scoped>

.text-white { color: #ffffff; }
.text-lime { color: var(--lime, #deff9a); }

body.keyboard-is-open .custom-tab-bar {
  opacity: 0 !important;
  pointer-events: none;
}
.custom-tab-bar {
  position: absolute !important;
  bottom: 0;
  width: 100%;
  /*height: calc(60px + var(--ion-safe-area-bottom, 0px));*/
  z-index: 10;
  --background: var(--dark, #000);
  border-top: 1px solid #222;
  /*padding-bottom: var(--ion-safe-area-bottom, 0px);*/
}

ion-tab-button {
  --color: #666;
  --color-selected: var(--lime, #deff9a);
  transition: all 0.3s;
}

ion-tab-button i {
  font-size: 20px;
  margin-bottom: 4px;
}

/* Effetto sollevamento per il tab attivo */
ion-tab-button.tab-selected i {
  transform: translateY(-3px);
}

/*DA QUI*/

ion-tab-button ion-icon {
  font-size: 24px; /* Un po' più grandi per renderle più leggibili */
  margin-bottom: 4px;
  transition: transform 0.3s ease;
}

/* Effetto sollevamento per il tab attivo */
ion-tab-button.tab-selected ion-icon {
  transform: translateY(-4px);
}
</style>