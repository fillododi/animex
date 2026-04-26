<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="Indietro"></ion-back-button>
        </ion-buttons>
        
        <ion-title>Chat con l'Animale</ion-title>
        
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      
      <h2>Risposta dell'animale:</h2>
      <p> {{ rispostaAnimale }} </p> 
      
      <br><br>

      <ion-button @click="inviaMessaggioDiProva">
        Fai ciao all'animale!
      </ion-button>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// 1. Importiamo le cose che ci servono
import { ref } from 'vue'; // ref serve per creare variabili "magiche" che si aggiornano da sole
import { 
    IonPage,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton,
    IonButtons, 
    IonBackButton 
    } from '@ionic/vue'; // Importiamo i "mattoncini" visivi di Ionic

// 2. Creiamo una variabile reattiva (che cambia nel tempo)
// All'inizio, la stringa è vuota.
const rispostaAnimale = ref("...");

// 3. Creiamo la funzione che viene chiamata quando si preme il bottone
const inviaMessaggioDiProva = () => {
  
  // Immaginiamo che qui in mezzo il "Conversation Manager" parli con l'intelligenza artificiale.
  // Per ora, facciamo finta che l'IA risponda dopo 1 secondo.
  
  rispostaAnimale.value = "Sto pensando..."; // .value è obbligatorio quando usiamo ref() in <script>

  setTimeout(() => {
    // Dopo un secondo, cambiamo il valore della variabile. 
    // Vue se ne accorgerà e aggiornerà il testo sullo schermo automaticamente!
    rispostaAnimale.value = "Roar! Ciao piccolo umano! 🦁";
  }, 1000);

};
</script>

<style scoped>
/* Qui potresti mettere regole grafiche specifiche, es. per rendere il testo più grande */
p {
  font-size: 18px;
  color: #333;
  font-style: italic;
}
</style>