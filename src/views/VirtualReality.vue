<template>
    <div ref="sceneContainer" class="scene-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { VRSceneManager } from '@/modules/VRSceneMgr';

const sceneContainer = ref(null);

const sceneManager = new VRSceneManager();

onMounted(() => {
    // Initialize
    sceneContainer.value.appendChild(sceneManager.getRendererDOM());
    sceneManager.activate();
    window.addEventListener('resize', onWindowResize);
});

// Resizer
const onWindowResize = () => {
    sceneManager.onResize();
};

// Cleanup when unmounting
onBeforeUnmount(() => {
    window.removeEventListener('resize', onWindowResize);

    sceneManager.deactivate();

    if (sceneContainer.value && sceneContainer.value.contains(sceneManager.getRendererDOM())) {
        sceneContainer.value.removeChild(sceneManager.getRendererDOM());
    }
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