import { RecognitionData } from "@/utility/RecognitionData"
import { Event, type EventListener } from "@/utility/Event"
import { type CameraService } from "./CameraService"
import type { ConnectionService } from "./ConnectionService"
import type { Service } from "./Service"
import { assert } from "@/utility/assert";

export interface RecognitionService extends Service{
    /**
     * Subscribes a listener to an event invoked when a new recognition is available.
     * @param l The listener to subscribe.
     */
    subscribe(l: EventListener<RecognitionData>): void
    /**
     * Unsubscribes a listener to an event invoked when a new recognition is available.
     * @param l The listener to unsubscribe.
     */
    unsubscribe(l: EventListener<RecognitionData>): void
    /**
     * @returns The last {@link RecognitionData} the service received.
     */
    getLatestRecognition(): RecognitionData | undefined
}

export class VisionRecognitionService implements RecognitionService {
    private active: boolean
    private onAnimalRecognized: Event<RecognitionData>
    private recognitionRecord: RecognitionData[]
    private connectionService: ConnectionService
    private cameraService: CameraService
    private interval: NodeJS.Timeout | undefined

    constructor(conn: ConnectionService, cam: CameraService) {
        this.active = false
        this.onAnimalRecognized = new Event<RecognitionData>()
        this.recognitionRecord = []
        this.connectionService = conn
        this.cameraService = cam
    }
    
    start() {
        assert(!this.active, "Recognition Service already active!")

        const snapshotTimerMS = 5000
        this.active = true
        this.interval = setInterval(this.snapshotLoop, snapshotTimerMS)
    }

    stop() {
        assert(this.active, "Recognition Service already stopped!")

        this.active = false
        clearInterval(this.interval)
    }

    isActive(): boolean {
        return this.active
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

    private snapshotLoop() {
        //Check if the loop should end
        if (!this.cameraService.isActive) {
            this.stop()
            return
        }

        this.cameraService.getCameraFrame().then((frame) =>
            this.connectionService.sendRecognitionRequest(frame.value).then(
                (data) => { if (data) this.onAnimalRecognized.invoke(data) }
            )
        )
        .catch(() => console.warn("Error in recognition loop"))
    }
}