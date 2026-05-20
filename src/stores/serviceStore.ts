import { defineStore } from 'pinia';
import { ref } from 'vue';
import { DeviceCameraService, type CameraService } from '@/services/CameraService';
import { ServerConnectionService, type ConnectionService } from '@/services/ConnectionService';
import { NativeSTTService, NativeTTSService } from '@/services/SpeechService';
import { Position } from '@/utility/Position';

export const useServiceStore = defineStore('service', () => {
  
    const cameraService = ref<CameraService | null>(null);
    const connectionService = ref<ConnectionService | null>(null);
    const ttsService = ref<NativeTTSService | null>(null);
    const sttService = ref<NativeSTTService | null>(null);

// --- ACTIONS --- //
    
    function setCameraService(cameraRef: HTMLElement | null) {
        cameraService.value = new DeviceCameraService(
            window.innerWidth/2, 
            window.innerHeight/2, 
            new Position(0, cameraRef? cameraRef.getBoundingClientRect().top : 0)
        );
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
    connectionService,
    ttsService,
    sttService,
    setCameraService,
    setConnectionService,
    setTTSService,
    setSTTService
  };
});