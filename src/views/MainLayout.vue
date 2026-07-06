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
          <!-- <i class="fa-solid fa-vr-cardboard"></i> -->
          <ion-icon :icon="cube"></ion-icon>
          <ion-label v-if="sessionStore.recognizedAnimal">Visione VR</ion-label>
        </ion-tab-button>

      </ion-tab-bar>
    </ion-tabs>
    
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonLabel, IonIcon } from '@ionic/vue';
import { useSessionStore } from '@/stores/sessionStore';
import { camera, chatbubbles, cube } from 'ionicons/icons';
import { Keyboard } from '@capacitor/keyboard';
import type { PluginListenerHandle } from '@capacitor/core';

const sessionStore = useSessionStore();

const listeners: { hide?: PluginListenerHandle; show?: PluginListenerHandle } = {};
onMounted(async () => {
  listeners.hide = await Keyboard.addListener('keyboardWillShow', () => {
    document.body.classList.add('keyboard-is-open');
  });
  listeners.show = await Keyboard.addListener('keyboardWillHide', () => {
    document.body.classList.remove('keyboard-is-open');
  });
});

onUnmounted(() => {
  listeners.hide?.remove();
  listeners.show?.remove();
});
</script>

<style scoped>

.text-white { color: var(--background-light, #fff8dc); }
.text-lime { color: var(--primary, #fb6237); }

body.keyboard-is-open .custom-tab-bar {
  display: none !important;
}
.custom-tab-bar {
  --background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
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