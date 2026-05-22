<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <!-- Home button -->
                <ion-buttons slot="start">
                    <ion-back-button default-href="/home" text="back"></ion-back-button>
                </ion-buttons>
                <ion-title>augmented reality</ion-title>
            </ion-toolbar>
        </ion-header>
        <div class="swapper-container">
            <!-- Video Canvas -->
            <canvas ref="outputCanvas" width="640" height="480" class="display-canvas"></canvas>

            <!-- Hidden Canvas -->
            <video ref="webcamVideo" autoplay playsinline style="display: none;"></video>
            <img ref="bgImage" src="@/assets/savana.jpg" alt="Background" style="display: none;" @load="onBgLoaded" />

            <div v-if="isLoading" class="loading-overlay">
                Loading...
            </div>
        </div>
    </ion-page>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/vue';
import { ref, onMounted, onUnmounted } from 'vue';
import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';

const outputCanvas = ref(null);
const webcamVideo = ref(null);
const bgImage = ref(null);
const isLoading = ref(true);

let imageSegmenter = null;
let animationFrameId = null;
let stream = null;
let isBgImageReady = false;

let tempCanvas = null;
let tempCtx = null;

const onBgLoaded = () => {
    isBgImageReady = true;
};

const initMediaPipe = async () => {
    try {
        /* Load wasm from tasks-vision */
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        /* Download and initialize Model */
        imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite",
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            outputCategoryMask: false,
            outputConfidenceMasks: true,
            categoryMaskOptions: {
                displayNames: [],
                /* May modify to change recognition quality */
                confidenceThreshold: 0.3
            }
        });
        /* Get camera */
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "environment"
            }
        });
        if (webcamVideo.value) {
            webcamVideo.value.srcObject = stream;
            webcamVideo.value.addEventListener("loadedmetadata", () => {
                webcamVideo.value.play();
                isLoading.value = false;
                startRenderLoop();
            });
        }
    } catch (error) {
        throw Error("Error initializing AR Camera")
    }
};

const startRenderLoop = () => {
    const video = webcamVideo.value;
    const canvas = outputCanvas.value;

    /* Check that everything is ready and works */
    if (!video || !canvas || !bgImage.value || !isBgImageReady) {
        animationFrameId = requestAnimationFrame(startRenderLoop);
        return;
    }
    if (video.readyState < 2 || video.videoWidth === 0) {
        animationFrameId = requestAnimationFrame(startRenderLoop);
        return;
    }

    const ctx = canvas.getContext("2d");
    const vWidth = video.videoWidth;
    const vHeight = video.videoHeight;

    if (!tempCanvas || tempCanvas.width !== vWidth || tempCanvas.height !== vHeight) {
        tempCanvas = document.createElement('canvas');
        tempCanvas.width = vWidth;
        tempCanvas.height = vHeight;
        tempCtx = tempCanvas.getContext('2d');
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
    }

    try {
        const startTimeMs = performance.now();
        const result = imageSegmenter.segmentForVideo(video, startTimeMs);
        if (!result || !result.confidenceMasks) {
            animationFrameId = requestAnimationFrame(startRenderLoop);
            return;
        }

        /* Get foreground (index 0) */
        const confidenceMask = result.confidenceMasks[0].getAsFloat32Array();

        tempCtx.clearRect(0, 0, vWidth, vHeight);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(bgImage.value, 0, 0, canvas.width, canvas.height);
        const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        tempCtx.drawImage(video, 0, 0, vWidth, vHeight);
        const videoData = tempCtx.getImageData(0, 0, vWidth, vHeight);

        const scaleX = vWidth / canvas.width;
        const scaleY = vHeight / canvas.height;

        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                const camX = Math.floor(x * scaleX);
                const camY = Math.floor(y * scaleY);

                const camIdx = (camY * vWidth) + camX;
                const screenIdx = (y * canvas.width) + x;

                const alpha = confidenceMask[camIdx];
                const sBytes = screenIdx * 4;
                const cBytes = camIdx * 4;

                /* If confidence is decent, draw */
                if (alpha > 0.3) {
                    canvasData.data[sBytes] = (videoData.data[cBytes] * alpha) + (canvasData.data[sBytes] * (1 - alpha));
                    canvasData.data[sBytes + 1] = (videoData.data[cBytes + 1] * alpha) + (canvasData.data[sBytes + 1] * (1 - alpha));
                    canvasData.data[sBytes + 2] = (videoData.data[cBytes + 2] * alpha) + (canvasData.data[sBytes + 2] * (1 - alpha));
                    canvasData.data[sBytes + 3] = 255;
                }
            }
        }
        ctx.putImageData(canvasData, 0, 0);
    } catch (err) {
        throw Error("Error while drawing")
    }
    animationFrameId = requestAnimationFrame(startRenderLoop);
};

/* Automatically resizes the canvas */
const resizeCanvas = () => {
    const canvas = outputCanvas.value;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};

onMounted(() => {
    resizeCanvas();
    initMediaPipe();
    window.addEventListener('resize', resizeCanvas);
});

onUnmounted(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (stream) stream.getTracks().forEach(track => track.stop());
    if (imageSegmenter) imageSegmenter.close();
    window.removeEventListener('resize', resizeCanvas);
});
</script>

<style scoped>
.fullscreen-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    z-index: 1;
    background-color: #000000;
}

.display-canvas {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.85);
    color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: sans-serif;
    z-index: 10;
}
</style>