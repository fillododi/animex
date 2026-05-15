import { type CameraService } from "@/services/CameraService"
import type { ConnectionService } from "@/services/ConnectionService"
import { useRecognitionStore } from "@/stores/recognitionStore"

export class RecognitionManager {
    private readonly store = useRecognitionStore()
    private sessionId: string
    private frameId: number
    private connectionService: ConnectionService
    private cameraService: CameraService
    private interval: NodeJS.Timeout | undefined

    constructor(conn: ConnectionService, cam: CameraService) {
        this.sessionId = ""
        this.frameId = 0
        this.connectionService = conn
        this.cameraService = cam
    }
    
    startRecognitionLoop() {
        if (!this.cameraService.isActive()) {
            this.cameraService.start()
        }
        if (!this.connectionService.isActive()) {
            this.connectionService.start().catch()
        }

        this.sessionId = crypto.randomUUID()
        this.frameId = 0

        clearInterval(this.interval)
        this.interval = setInterval(this.snapshotLoop, import.meta.env.VITE_RECOGNITION_TIMER_MS)
    }

    stopRecognition() {
        if (this.cameraService.isActive()) {
            this.cameraService.stop()
        }

        clearInterval(this.interval)
    }

    getStore() {
        return this.store
    }

    private snapshotLoop() {
        //Check if the loop should end
        if (!this.cameraService.isActive() || !this.connectionService.isActive()) {
            this.stopRecognition()
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