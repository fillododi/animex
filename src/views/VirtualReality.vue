<template>
    <IonPage>
        <IonContent :scroll-y="false">
            <div ref="sceneContainer" class="scene-container"></div>
            <div class="vr-ui-layer">
                <ChatBar 
                isVRMode
                @spawn-plant="sceneManager.spawnFoodOfType(FoodType.PLANT)"
                @spawn-meat="sceneManager.spawnFoodOfType(FoodType.MEAT)"
                />
                <DynamicMessage />
            </div>
            

        </IonContent>
    </IonPage>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { IonContent, IonPage, onIonViewDidLeave, onIonViewWillEnter } from '@ionic/vue';
import { VRSceneManager } from '@/modules/VRSceneMgr';
import { Motion } from '@capacitor/motion';
import { Vector3 } from 'three';
import { FoodType } from '@/utility/AnimalType';
import { assert } from '@/utility/assert';
import ChatBar from '@/components/ChatBar.vue';
import DynamicMessage from '@/components/DynamicMessage.vue';

const sceneContainer = ref(null);
const isGyroActive = ref(false);

const sceneManager = new VRSceneManager();
let gyroListener = null;

onMounted(() => {
    // Initialize
    sceneContainer.value.appendChild(sceneManager.getRendererDOM());
    window.addEventListener('resize', onWindowResize);
});

onIonViewWillEnter(() => {
    enableGyroscope()
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
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1; 
    overflow: hidden;
}

.vr-ui-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.vr-ui-layer > * {
    pointer-events: auto;
}
</style>