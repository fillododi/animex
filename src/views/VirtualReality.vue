<template>
    <IonPage>
        <IonContent>
            <div style="margin-top: 15px; display: flex; gap: 10px; align-items: center;">
                <ion-button @click="sceneManager.spawnFoodOfType(FoodType.PLANT)">+ Plant</ion-button>
                <ion-button @click="sceneManager.spawnFoodOfType(FoodType.MEAT)">+ Meat</ion-button>
            </div>
            <div ref="sceneContainer" class="scene-container"></div>
        </IonContent>
    </IonPage>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { IonButton, IonContent, IonPage, onIonViewDidLeave, onIonViewDidEnter } from '@ionic/vue';
import { VRSceneManager } from '@/modules/VRSceneMgr';
import { Motion } from '@capacitor/motion';
import { Vector3 } from 'three';
import { FoodType } from '@/utility/AnimalType';

const sceneContainer = ref(null);

const sceneManager = new VRSceneManager();
let gyroListener = null;

onMounted(() => {
    // Initialize
    sceneContainer.value.appendChild(sceneManager.getRendererDOM());
    sceneManager.activate();
    startGyro();
    window.addEventListener('resize', onWindowResize);
});

// Resizer
const onWindowResize = () => {
    sceneManager.onResize();
};

const startGyro = async () => {
    gyroListener = await Motion.addListener('orientation', (event) => {
        if (event) {
            sceneManager.updateCameraRotation(new Vector3(
                (event.beta ?? 0) * Math.PI / 180,
                (event.alpha ?? 0) * Math.PI / 180,
                -(event.gamma ?? 0) * Math.PI / 180
            ));
        }
    });
};
// Cleanup when unmounting
onBeforeUnmount(() => {
    window.removeEventListener('resize', onWindowResize);

    sceneManager.deactivate();

    if (sceneContainer.value && sceneContainer.value.contains(sceneManager.getRendererDOM())) {
        sceneContainer.value.removeChild(sceneManager.getRendererDOM());
    }
    if (gyroListener)
        Motion.removeAllListeners();
});
</script>

<style scoped>
.scene-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    margin: 0;
    padding: 0;
}
</style>