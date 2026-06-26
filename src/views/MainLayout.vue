<template>
  <ion-page>
    
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-title class="ion-text-center logo-title">
          <span class="text-white">ANIM</span><span class="text-lime">EX</span>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <!-- AREA A SCORRIMENTO -->
    <div class="slider-viewport">
      
      <!-- Bottom nav -->
      <div 
        class="slider-track" 
        :style="{ transform: `translateX(-${paginaAttiva * 33.3333}%)` }"
      >
        
        <!-- PAGINA 0: CHAT -->
        <div class="page-wrapper">
          <ChatView /> <!-- Qui viene iniettata la tua intera pagina Chat -->
        </div>

        <!-- PAGINA 1: SCANNER -->
        <div class="page-wrapper">
          <ScannerView /> <!-- Qui viene iniettata la tua intera pagina Fotocamera -->
        </div>

        <!-- PAGINA 2: VISIONE AR -->
        <div class="page-wrapper">
          <AugmentedReality />
        </div>

      </div>
    </div>

    <BottomNav v-model="paginaAttiva" />
    
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle } from '@ionic/vue';

import BottomNav from '@/components/BottomNav.vue';

import ChatView from '@/views/ChatBot.vue';
import ScannerView from '@/views/RecognitionPage.vue';
import AugmentedReality from './AugmentedReality.vue';
// import ARView from '@/views/ARView.vue'; // Scommenta quando hai la pagina AR

// Imposta la pagina di partenza (1 = Scanner al centro)
const paginaAttiva = ref(1);
</script>

<style scoped>
.slider-viewport {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden; 
  position: relative;
  background-color: var(--dark, #000);
}

/* Il binario lungo il triplo dello schermo (100% * 3 pagine) */
.slider-track {
  display: flex;
  width: 300%;
  height: 100%;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform; /* Ottimizza l'animazione per i telefoni */
}

.page-wrapper {
  width: 33.3333%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.placeholder-ar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  background-image: url('https://images.unsplash.com/photo-1511497584788-8767fe7d98f1?auto=format&fit=crop&w=1280&q=80');
  background-size: cover;
}
.placeholder-ar h2 {
  background: rgba(0,0,0,0.7);
  padding: 10px 20px;
  border-radius: 20px;
}

.custom-toolbar {
  --background: var(--dark, #0a0a0a);
  --border-width: 0;
  border-bottom: 1px solid #222;
}

.logo-title {
  font-family: var(--font-main, 'Urbanist', sans-serif);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
}

.text-white { color: #ffffff; }
.text-lime { color: var(--lime, #deff9a); }
</style>