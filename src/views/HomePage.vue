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

        <!-- Camera -->
        <ion-button @click="openCamera">Open Camera</ion-button>
        <ion-button @click="screenshot">Snap pic</ion-button>
        <div id="camera" class="camera-box" width="500" height="500"></div>
        <div v-if="capturedImage" class="overlay">
          <img :src="capturedImage" alt="CAMERA-ALT" />
        </div>
        <!-- ChatBot -->
        <ion-button router-link="/chat">
          Entra nella Chat Animex!
        </ion-button>
        <!-- Microphone -->
        <ion-button
          v-if="!isRecording"
          color="danger"
          style="margin-top: 12px;"
          @click="startMic"
        >
          🎙 Test Microphone
        </ion-button>
        <ion-button
          v-else
          color="warning"
          style="margin-top: 12px;"
          @click="stopMic"
        >
          ⏹ Stop Recording
        </ion-button>

        <div v-if="audioUrl" style="margin-top: 16px;">
          <p style="color: #4caf50; margin-bottom: 8px;">
            ✅ Microphone working — play back your recording:
          </p>
          <audio :src="audioUrl" controls style="width: 100%;" />
        </div>

        <!--Connection-->
        <ion-button v-if="!connection.isActive()" @click="connect"> Connect to server </ion-button>
        <ion-button v-if="connection.isActive() && capturedImage"> Send pic to server</ion-button>

        <p v-if="statusMessage">{{ statusMessage }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/vue'
import {
  browserRecorder,
} from '@/services/SpeechService'
import { DeviceCameraService } from '@/services/CameraService'
import { ServerConnectionService } from '@/services/ConnectionService'

const audioUrl = ref<string>('')
const statusMessage = ref('')
const isRecording = ref(false)
const capturedImage = ref()
const cam = new DeviceCameraService(200, 200, "camera")
const connection = new ServerConnectionService()

async function openCamera() {
  cam.start();
}

async function screenshot() {
  const res = await cam.getCameraFrame();
  capturedImage.value = `data:image/jpeg;base64,${res.value}`;
}

async function startMic() {
  statusMessage.value = ''
  audioUrl.value = ''

  const granted = await browserRecorder.requestMicrophonePermission()
  if (!granted) {
    statusMessage.value = 'Microphone permission not granted.'
    return
  }

  try {
    browserRecorder.startRecording()
    isRecording.value = true
    statusMessage.value = 'Recording… press Stop when done.'
  } catch (e: unknown) {
    statusMessage.value = e instanceof Error? e.message: 'Failed to start recording.'
    browserRecorder.releaseStream()
  }
}

async function stopMic() {
  try {
    audioUrl.value = await browserRecorder.stopRecording()
    statusMessage.value = ''
  } catch {
    statusMessage.value = 'Failed to stop recording.'
  } finally {
    isRecording.value = false
    browserRecorder.releaseStream()
  }
}

async function connect() {
  statusMessage.value = "Starting Connection..."

  connection.start().then(() => {
      statusMessage.value = connection.isActive() ? "Connected to server" : "Failed to connect :("
  })
}

async function sendPic() {
  connection.sendRecognitionRequest(capturedImage.value).then(res => statusMessage.value = `Received ${res}`)
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