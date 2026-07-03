<template>
    <IonPage>
        <IonContent>
            <div style="margin-top: 15px; display: flex; gap: 10px; align-items: center;">
                <ion-button v-if="!isGyroActive" @click="enableGyroscope">Enable Camera Control</ion-button>
                <ion-button @click="sceneManager.spawnFoodOfType(FoodType.PLANT)">+ Plant</ion-button>
                <ion-button @click="sceneManager.spawnFoodOfType(FoodType.MEAT)">+ Meat</ion-button>
            </div>
            <div ref="sceneContainer" class="scene-container"></div>
        </IonContent>
    </IonPage>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { IonButton, IonContent, IonPage, onIonViewDidLeave, onIonViewWillEnter } from '@ionic/vue';
import { VRSceneManager } from '@/modules/VRSceneMgr';
import { Motion } from '@capacitor/motion';
import { Vector3 } from 'three';
import { FoodType } from '@/utility/AnimalType';
import { assert } from '@/utility/assert';

const sceneContainer = ref(null);
const isGyroActive = ref(false);

const sceneManager = new VRSceneManager();
let gyroListener = null;

onMounted(() => {
    // Initialize
    sceneContainer.value.appendChild(sceneManager.getRendererDOM());
    sceneManager.activate();
    window.addEventListener('resize', onWindowResize);
});

onIonViewWillEnter(() => {
    sceneManager.activate();
})

onIonViewDidLeave(() => {
    sceneManager.deactivate();
})

// Resizer
const onWindowResize = () => {
    sceneManager.onResize();
};

const enableGyroscope = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        /* iOS specific permission gathering */
        try {
            const response = await DeviceOrientationEvent.requestPermission();
            
            assert(response === 'granted', "Gyroscope Permission not granted")
            await startGyro();
        } catch (error) {
            throw Error("Gyroscope Permission Error")
        }
    } else {
        /* Android */
        await startGyro();
    }
}

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
    isGyroActive.value = true;
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