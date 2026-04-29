import { RecognitionData } from "@/utility/RecognitionData"
import { Event, type EventListener } from "@/utility/Event"
import { type CameraService } from "./CameraService"

export interface RecognitionService {
    active: boolean
    subscribe(l: EventListener<RecognitionData>): void
    unsubscribe(l: EventListener<RecognitionData>): void
    getLatestRecognition(): RecognitionData | undefined
}

export class VisionRecognitionService implements RecognitionService {
    active: boolean
    private onAnimalRecognized: Event<RecognitionData>
    private recognitionRecord: RecognitionData[]
    private cameraService: CameraService
    private interval: NodeJS.Timeout | undefined

    constructor(cam: CameraService) {
        this.active = false
        this.onAnimalRecognized = new Event<RecognitionData>()
        this.recognitionRecord = []
        this.cameraService = cam
    }
    
    start() {
        let snapshotTimerMS = 5000
        this.interval = setInterval(this.sendSnapshot, snapshotTimerMS)
    }

    stop() {
        this.active = false
        clearInterval(this.interval)
    }

    subscribe(l: EventListener<RecognitionData>) {
        this.onAnimalRecognized.subscribe(l)
    }

    unsubscribe(l: EventListener<RecognitionData>) {
        this.onAnimalRecognized.unsubscribe(l)
    }

    getLatestRecognition(): RecognitionData | undefined {
        return this.recognitionRecord.at(-1)
    }

    private sendSnapshot() {
        if (!this.active || !this.cameraService.active) {
            this.active = false
            clearInterval(this.interval)
        }

        //this.cameraService.getCameraFrame().then((frame) => send frame to server)
    }
}