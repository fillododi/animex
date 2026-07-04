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
          tab="vr" 
          href="/main/vr"
          :disabled="sessionStore.recognizedAnimal === null"
        >
          <i class="fa-solid fa-vr-cardboard"></i>
          <ion-icon :icon="cube"></ion-icon>
          <ion-label v-if="sessionStore.recognizedAnimal">Visione VR</ion-label>
        </ion-tab-button>

      </ion-tab-bar>
    </ion-tabs>
    
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonLabel, IonIcon } from '@ionic/vue';
import { useSessionStore } from '@/stores/sessionStore';
import { camera, chatbubbles, cube } from 'ionicons/icons';

const sessionStore = useSessionStore();
</script>

<style scoped>

.text-white { color: var(--background-light, #fff8dc); }
.text-lime { color: var(--primary, #fb6237); }

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
  --background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  /*padding-bottom: var(--ion-safe-area-bottom, 0px);*/
}

ion-tab-button {
  --color: var(background-dark, #2c2a26);
  --color-selected: var(--secondary, #fac400);
  transition: all 0.3s;
}

ion-tab-button i {
  font-size: 20px;
  margin-bottom: 4px;
}


ion-tab-button.tab-selected i {
  transform: translateY(-3px);
}


ion-tab-button ion-icon {
  font-size: 24px; 
  margin-bottom: 4px;
  transition: transform 0.3s ease;
}


ion-tab-button.tab-selected ion-icon {
  transform: translateY(-4px);
}

@media (prefers-color-scheme: dark) {
  .custom-tab-bar {
    --background: rgba(0, 0, 0, 0.85);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  ion-tab-button {
    --color: var(--background-light, #fff8dc);
    --color-selected: var(--primary, #fb6237);
  }
}
</style>