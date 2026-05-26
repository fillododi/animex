import { type Service } from "./Service"
import { CameraPreview, type CameraPreviewOptions } from "@capacitor-community/camera-preview";
import { assert } from "@/utility/assert";
import { Position } from "@/utility/Position";

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
    private previewOpts: CameraPreviewOptions
    private active: boolean

    /**
     * @param width The width of the camera preview in pixels.
     * @param height The height of the camera view in pixels.
     * @param parent The id of the html object to use as a parent (web only).
     */
    constructor(width: number, height: number, parent: string)
    /**
     * @param width The width of the camera preview in pixels.
     * @param height The height of the camera view in pixels.
     * @param origin The screen coordinates of the preview's origin (mobile only).
     */
    constructor(width: number, height: number, origin: Position)
    constructor(width: number, height: number, position: string | Position, toBack?: boolean) {
        this.active = false
        this.previewOpts = {
            position: 'rear',
            toBack: toBack ?? true,
            width: width,
            height: height,
            parent: typeof(position) == 'string' ? position : undefined,
            x: position instanceof Position ? position.x : undefined,
            y: position instanceof Position ? position.y : undefined
        }
    }

    async start() {
        assert(!this.active, "Camera Service already active!")

        await CameraPreview.start(this.previewOpts).then(() => this.active = true);
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
