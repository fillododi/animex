import { useServiceStore } from "@/stores/serviceStore"
import { useSessionStore } from "@/stores/sessionStore"
import type { AnimalData } from "@/utility/AnimalData"
import type { AnimalType } from "@/utility/AnimalType"

export class RecognitionManager {
    private frameId: number
    private interval: NodeJS.Timeout | undefined

    constructor() {
        this.frameId = 0
    }
    
    /**
     * Initiates a new recognition loop with a new session ID,
     * starts the camera and connection services if necessary.
     */
    async startRecognitionLoop() {
        const cameraService = useServiceStore().cameraService
        if (!(cameraService && cameraService.isActive())) {
            await cameraService?.start()
        }
        const connectionService = useServiceStore().connectionService
        if (!(connectionService && connectionService.isActive())) {
            await connectionService?.start()
        }
        const sessionStore = useSessionStore()
        this.frameId = 0

        clearInterval(this.interval)
        const mgr = this
        this.interval = setInterval(function() {mgr.snapshotLoop()}, import.meta.env.VITE_RECOGNITION_TIMER_MS)
    }

    /**
     * Stops the ongoing recognition loop, stops the camera service if necessary.
     * 
     * @remark Does NOT stop the connection service.
     */
    async stopRecognitionLoop() {
        /*const cameraService = useServiceStore().cameraService
        if (cameraService && cameraService.isActive()) {
            await cameraService.stop()
        }*/

        clearInterval(this.interval)
    }


    private async snapshotLoop() {
        const cameraService = useServiceStore().cameraService
        const connectionService = useServiceStore().connectionService
        const sessionStore = useSessionStore()
        //Check if the loop should end
        if (!cameraService?.isActive() || !connectionService?.isActive()) {
            this.stopRecognitionLoop()
            return
        }
        const frame = await cameraService.getCameraFrame()
        this.frameId++
        const response =  await connectionService.sendRecognitionRequest(sessionStore.sessionId, this.frameId, frame.value)
        if(!response?.selectedAnimal.id || response.selectedAnimal.id === "unknown") return
        const sumX = response?.selectedAnimal.boundingPoly?.normalizedVertices?.reduce((sum, vert) => sum + vert.x, 0) ?? 0
        const sumY = response?.selectedAnimal.boundingPoly?.normalizedVertices?.reduce((sum, vert) => sum + vert.y, 0) ?? 0
        const numVerts = response?.selectedAnimal.boundingPoly?.normalizedVertices?.length ?? 1
        const animalData : AnimalData = {
            id: crypto.randomUUID(),
            animalType: (response?.selectedAnimal.id ?? "unknown") as AnimalType,
            displayName: response?.selectedAnimal.displayName ?? "Sconosciuto",
            pos: {
                x: sumX / numVerts,
                y: sumY / numVerts
            }
        }
        sessionStore.updateRecognizedAnimal(animalData)
        
    }
}