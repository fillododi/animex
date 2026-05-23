<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/home" text="Back"></ion-back-button>
                </ion-buttons>
                <ion-title>Augmented Reality</ion-title>
            </ion-toolbar>
        </ion-header>
        <a-scene embedded arjs="sourceType: webcam; debugUIEnabled: false;" vr-mode-ui="enabled: false">
            <!-- DEFAULT MARKER PRESET FOR TESTING (TODO: change it)
                    (https://ar-js-org.github.io/AR.js/data/images/hiro.png)
                    Point the camera to the image at the link to make the box appear -->
            <a-marker preset="hiro">
                <a-box position="0 0.5 0" color="red" scale="1 1 1" rotation="0 0 0"></a-box>
            </a-marker>
        </a-scene>
    </ion-page>
</template>
<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/vue';
import '@ar-js-org/ar.js/aframe/build/aframe-ar.js';
import { onUnmounted } from 'vue';

onUnmounted(() => {
    /* arjs puts the camera as a <video> tag *outside* of the ionic scope, so it needs to be deleted manually */

    // If camera recording (<video>) is present, stop it and delete it
    const video = document.querySelector('#arjs-video') as HTMLVideoElement;
    if (video) {
        const stream = video.srcObject as MediaStream;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }
        video.remove();
    }

    // Delete potential artifacts and reset body styles
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.parentNode?.removeChild(scene);
    }
    document.body.style.top = '';
    document.body.style.position = '';
    document.documentElement.classList.remove('a-fullscreen');
});
</script>

<style>

/* Keep the UI */
html, body {
    top: 0 !important;
    left: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    position: fixed !important;
    width: 100% !important;
    height: 100% !important;
    overflow: auto !important;
}
</style>