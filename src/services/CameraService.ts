import { CameraPreview, type CameraPreviewOptions } from "@capacitor-community/camera-preview";

export interface CameraService {
    active: boolean
    getCameraFrame(): Promise<{value: String}>
}

export class DeviceCameraService implements CameraService {
    active: boolean = false

    async start(previewParent: string) {
        var options: CameraPreviewOptions = {
            position: 'front',
            parent: previewParent,
            toBack: true, // overlay ui
        }
        await CameraPreview.start(options).then(() => this.active = true)
    }

    async stop() {
        await CameraPreview.stop().then(() => this.active = false)
    }

    async getCameraFrame(): Promise<{value: String}> {
        var res = await CameraPreview.captureSample({quality: 100})
        return res
    }
}