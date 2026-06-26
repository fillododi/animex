<template>
    <div ref="sceneContainer" class="scene-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const sceneContainer = ref(null);

// Definition is here so that they can be cleared on unmount
let scene, camera, renderer;

let animal;
const clock = new THREE.Clock();

onMounted(() => {
    // Initialize
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;

    sceneContainer.value.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 4, 2);
    scene.add(directionalLight);

    // Animal model
    const loader = new GLTFLoader();
    loader.load('/assets/animal.glb', (gltf) => {
        animal = gltf.scene;
        animal.scale.set(0.5, 0.5, 0.5);
        animal.position.set(0, 0, -2);
        scene.add(animal);
    });

    // Background
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/assets/background.jpg', (texture) => {
        const sphereGeometry = new THREE.SphereGeometry(50, 64, 64);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        });
        const skySphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(skySphere);
    });

    window.addEventListener('resize', onWindowResize);

    renderer.setAnimationLoop(() => {
        // Apply tranform only if animal exists
        if (animal){
            animal.position.x = (clock.getElapsedTime() % 2) - 1;
        }

        // Render
        renderer.render(scene, camera);
    });
});

// Resizer
const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

// Cleanup when unmounting
onBeforeUnmount(() => {
    window.removeEventListener('resize', onWindowResize);

    renderer.setAnimationLoop(null);

    if (renderer) {
        renderer.dispose();
        if (sceneContainer.value && sceneContainer.value.contains(renderer.domElement)) {
            sceneContainer.value.removeChild(renderer.domElement);
        }
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