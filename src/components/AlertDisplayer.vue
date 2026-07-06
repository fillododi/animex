<template>
  <!-- This component observes the store and presents an ion-alert when needed. 
   It should be mounted ONCE at the root of the app (e.g., App.vue), alongside 
   ion-router-outlet — NOT inside a single page — so it remains mounted while 
   the user navigates between RecognitionPage, ChatBot, VirtualReality, etc. -->
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { alertController } from '@ionic/vue';
import { useErrorStore } from '@/stores/errorStore';
import { describeRecognitionError } from '@/errors/describeRecognitionError';

const alertStore = useErrorStore();

watch(
  () => alertStore.activeLoopError,
  async (error) => {
    if (!error) return;

    const { header, message } = describeRecognitionError(error);
    const alert = await alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();

    // Clean the store only AFTER the user has actually seen and closed the alert 
    // (not immediately after opening it): this way, if for some reason the same
    // error occurs again, the watcher will detect it again instead of considering 
    // it "already handled".
       
    await alert.onDidDismiss();
    alertStore.clearLoopError();
  }
);
</script>
