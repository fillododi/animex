<template>
  <ion-app>
    <ion-router-outlet />
    <AlertDisplayer />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import AlertDisplayer from '@/components/AlertDisplayer.vue';
</script>
