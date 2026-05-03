import { type Service } from "./Service"
import { CameraPreview, type CameraPreviewOptions } from "@capacitor-community/camera-preview";
import { assert } from "@/utility/assert";

export interface CameraService extends Service {
    /**
     * Takes a frame from the current camera view
     * 
     * @returns A promise containing the frame's data as a String
     * @throws An Error if the service isn't active.
     */
    getCameraFrame(): Promise<{value: string}>
}

export class DeviceCameraService implements CameraService {
    private previewParent: string
    private width: number
    private height: number
    private active: boolean

    constructor(parent: string, w: number, h: number) {
        this.active = false
        this.previewParent = parent
        this.width = w
        this.height = h
    }

    async start() {
        assert(!this.active, "Camera Service already active!")

        const options: CameraPreviewOptions = {
            position: 'front',
            parent: this.previewParent,
            toBack: true, // overlay ui
            width: this.width,
            height: this.height
        };
        await CameraPreview.start(options).then(() => this.active = true);
    }

    async stop() {
        assert(this.active, "Camera Service already stopped!")

        await CameraPreview.stop().then(() => this.active = false)
    }

    isActive(): boolean {
        return this.active
    }

    async getCameraFrame(): Promise<{value: string}> {
        assert(this.active, "Can't capture a frame from an inactive camera!")

        return await CameraPreview.captureSample({quality: 100});
    }
}