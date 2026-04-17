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
          <ion-title size="large">
            Blank
          </ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <strong>Ready to create an app?</strong>
        <p>
          Start with Ionic 
          <a 
            target="_blank" 
            rel="noopener noreferrer" 
            href="https://ionicframework.com/docs/components"
          >
            UI Components
          </a>
        </p>
        <ion-button @click="openCamera">Open Camera</ion-button>
        <div v-if="imageUrl" style="margin-top: 16px;">
          <img :src="imageUrl" alt="Captured" style="width: 100%; border-radius: 12px;" />
        </div>
        <p v-if="statusMessage">{{ statusMessage }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/vue'
import { requestCameraPermission, takePhoto } from '@/services/CameraService'

const imageUrl = ref<string>('')
const statusMessage = ref('')

async function openCamera() {
  const granted: boolean = await requestCameraPermission()

  if (!granted) {
    statusMessage.value = 'Camera permission not granted.'
    return
  }

  try {
    const photo = await takePhoto()
    imageUrl.value = photo.webPath ?? ''
    statusMessage.value = 'Camera working correctly.'
  } catch (error) {
    statusMessage.value = 'Camera failed to open.'
  }
}
</script>

<style scoped>
#container {
  text-align: center;
  
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  
  color: #8c8c8c;
  
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
