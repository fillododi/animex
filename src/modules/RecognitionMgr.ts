import { type CameraService } from "@/services/CameraService"
import type { ConnectionService } from "@/services/ConnectionService"
import { useRecognitionStore } from "@/stores/recognitionStore"

export class RecognitionManager {
    private readonly store = useRecognitionStore()
    private readonly connectionService: ConnectionService
    private readonly cameraService: CameraService
    private sessionId: string
    private frameId: number
    private interval: NodeJS.Timeout | undefined

    constructor(conn: ConnectionService, cam: CameraService) {
        this.sessionId = ""
        this.frameId = 0
        this.connectionService = conn
        this.cameraService = cam
    }
    
    /**
     * Initiates a new recognition loop with a new session ID,
     * starts the camera and connection services if necessary.
     */
    async startRecognitionLoop() {
        if (!this.cameraService.isActive()) {
            await this.cameraService.start()
        }
        if (!this.connectionService.isActive()) {
            await this.connectionService.start().catch()
        }

        this.sessionId = crypto.randomUUID()
        this.frameId = 0

        clearInterval(this.interval)
        let mgr = this
        this.interval = setInterval(function() {mgr.snapshotLoop()}, import.meta.env.VITE_RECOGNITION_TIMER_MS)
    }

    /**
     * Stops the ongoing recognition loop, stops the camera service if necessary.
     * 
     * @remark Does NOT stop the connection service.
     */
    async stopRecognitionLoop() {
        if (this.cameraService.isActive()) {
            await this.cameraService.stop()
        }

        clearInterval(this.interval)
    }

    /**
     * @returns The pinia store containing the recognitions received by the manager.
     * @see {@link useRecognitionStore}
     */
    getStore() {
        return this.store
    }

    private snapshotLoop() {
        //Check if the loop should end
        if (!this.cameraService.isActive() || !this.connectionService.isActive()) {
            this.stopRecognitionLoop()
            return
        }

        this.cameraService.getCameraFrame().then((frame) =>
            this.connectionService.sendRecognitionRequest(this.sessionId, this.frameId, frame.value).then(
                (data) => { 
                    if (data) {
                        this.store.addRecognition(data)
                        this.frameId++
                    }
                }
            )
        )
        .catch()
    }
}