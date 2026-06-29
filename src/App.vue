<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@capawesome/capacitor-navigation-bar';
import { Capacitor } from '@capacitor/core';

async function setupSystemBars() {
  if (Capacitor.isNativePlatform()) {
    try {
      // 1. Status Bar (In alto)
      await StatusBar.setStyle({ style: Style.Dark }); // Testo bianco
      await StatusBar.setBackgroundColor({ color: '#0a0a0a' }); // Stesso colore della tua topbar
      
      // 2. Navigation Bar (In basso - Solo Android, su iOS gestisce la home indicator)
      if (Capacitor.getPlatform() === 'android') {
        await NavigationBar.setColor({ color: '#000000' }); // Stesso nero della tua BottomNav
        
      }
    } catch (e) {
      console.warn('I plugin delle barre di sistema non sono supportati su questo dispositivo.', e);
    }
  }
}

// Richiama questa funzione nel mounted() o nell'entry point
setupSystemBars();
</script>
