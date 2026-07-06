import { defineStore } from 'pinia';
import { ref } from 'vue';
import { DeviceCameraService, type CameraService } from '@/services/CameraService';
import { ServerConnectionService, type ConnectionService } from '@/services/ConnectionService';
import { NativeSTTService, NativeTTSService } from '@/services/SpeechService';

export const useServiceStore = defineStore('service', () => {
  
    const cameraService = ref<DeviceCameraService | null>(null);
    const connectionService = ref<ConnectionService | null>(null);
    const ttsService = ref<NativeTTSService | null>(null);
    const sttService = ref<NativeSTTService | null>(null);

// --- ACTIONS --- //
    
    function setCameraService(videoElement: HTMLVideoElement | null) {
        if(!videoElement) {
            resetCameraService()
            return
        }
        if(cameraService.value) {
            resetCameraService()
        }
        cameraService.value = new DeviceCameraService(videoElement);
    }
    async function resetCameraService() {
        await cameraService.value?.stop()
        cameraService.value = null
    }

    function setConnectionService(){
        connectionService.value = new ServerConnectionService();
    }

    function setTTSService(){
        ttsService.value = new NativeTTSService();
    }

    function setSTTService(){
        sttService.value = new NativeSTTService();
    }

  return {
    cameraService,
    resetCameraService,
    connectionService,
    ttsService,
    sttService,
    setCameraService,
    setConnectionService,
    setTTSService,
    setSTTService
  };
});