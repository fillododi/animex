<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Blank</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Blank</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <strong>Ready to create an app?</strong>
        <p>
          Start with Ionic
          <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">
            UI Components
          </a>
        </p>

        <!-- ChatBot -->
        <ion-button router-link="/chat">
          Entra nella Chat Animex!
        </ion-button>
        <!-- Recognition -->
        <ion-button router-link="/cam">
          Inizia riconoscimento!
        </ion-button>
        

        <div v-if="audioUrl" style="margin-top: 16px;">
          <p style="color: #4caf50; margin-bottom: 8px;">
            ✅ Microphone working — play back your recording:
          </p>
          <audio :src="audioUrl" controls style="width: 100%;" />
        </div>

        <!--Connection-->
        <ion-button v-if="!(connection && connection.isActive())" @click="connect"> Connect to server </ion-button>

        <p v-if="statusMessage">{{ statusMessage }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/vue'
import { useServiceStore } from '@/stores/serviceStore';
import { useSessionStore } from '@/stores/sessionStore';
import type { AnimalData } from '@/utility/AnimalData';

const audioUrl = ref<string>('')
const statusMessage = ref('')


const serviceStore = useServiceStore();
const connection = serviceStore.connectionService;
async function connect() {
  statusMessage.value = "Starting Connection..."
  if(!connection) {
    statusMessage.value = "Connection service not initialized :(";
    return;
  }
  try{
    await connection.start()
    statusMessage.value = connection.isActive() ? "Connected to server" : "Failed to connect :("
  } catch (error) {
    statusMessage.value = "Error connecting to server :(";
  }
}
</script>

<style scoped>
/* Make sure every container is transparent */
html, body, ion-app, ion-content, .ion-page {
  --background: transparent !important;
  background-color: transparent !important;
  background: transparent !important;
}

#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
#container strong { font-size: 20px; line-height: 26px; }
#container p { font-size: 16px; line-height: 22px; color: #8c8c8c; margin: 0; }
#container a { text-decoration: none; }
</style>