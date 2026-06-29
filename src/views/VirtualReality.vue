<template>
    <div ref="sceneContainer" class="scene-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { VRSceneManager } from '@/modules/VRSceneMgr';
import { Motion } from '@capacitor/motion';
import { Vector3 } from 'three';

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
    // I have not been able to test if this works yet because of other compilation errors.
    gyroListener = await Motion.addListener('orientation', (event) => {
        if (event) {
            sceneManager.updateCameraRotation(new Vector3(event.alpha ?? 0, event.beta ?? 0, event.gamma ?? 0));
        }
    })
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