import { type Service } from "./Service"
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
    private active: boolean
    private stream: MediaStream |  undefined
    private videoElement: HTMLVideoElement
    private startingPromise: Promise<void> | null = null;

    constructor(videoElement: HTMLVideoElement) {
        this.stream = undefined
        this.active = false
        this.videoElement = videoElement
    }

    async start() {
        assert(!this.active, "Camera Service already active!")
        if (this.startingPromise) {
            return this.startingPromise;
        }
        this.startingPromise = (async () => {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" } },
                audio: false
            });
            this.videoElement.srcObject = this.stream;
            this.videoElement.muted = true;
            this.videoElement.playsInline = true;
            this.videoElement.autoplay = true;
            await this.videoElement.play();
            this.active = true;
        })();
        try {
            await this.startingPromise;
        } finally {
            this.startingPromise = null;
        }
    }

    async stop() {
        if (!this.active) return
        this.stream?.getTracks().forEach(track => track.stop())
        this.videoElement.srcObject = null
        this.active = false
    }

    isActive(): boolean {
        return this.active
    }

    async getCameraFrame(): Promise<{value: string}> {
        assert(this.active, "Can't capture a frame from an inactive camera!")
        const width = this.videoElement.videoWidth
        const height = this.videoElement.videoHeight
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext("2d")
        assert(context !== null, "Failed to get canvas context!")
        context.drawImage(this.videoElement, 0, 0, width, height)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
        const base64 = dataUrl.split(",")[1]
        return { value: base64 ?? "" }
    }
}
