import { CameraPreview, type CameraPreviewOptions } from "@capacitor-community/camera-preview";

export interface CameraService {
    getCameraFrame(): Promise<{value: String}>
}

export class DeviceCameraService implements CameraService {
    async start(previewParent: string) {
        var options: CameraPreviewOptions = {
            position: 'front',
            parent: previewParent,
            toBack: true, // overlay ui
        };
        await CameraPreview.start(options);
    }

    async stop() {
        await CameraPreview.stop();
    }

    async getCameraFrame(): Promise<{value: String}> {
        var res = await CameraPreview.captureSample({quality: 100});
        return res;
    }
}