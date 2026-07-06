import { useServiceStore } from "@/stores/serviceStore"
import { useSessionStore } from "@/stores/sessionStore"
import { useErrorStore } from "@/stores/errorStore"
import type { AnimalData } from "@/utility/AnimalData"
import { AnimalType } from "@/utility/AnimalType"
import {
    CameraUnavailableError,
    ConnectionUnavailableError,
    normalizeCameraError,
    normalizeConnectionError
} from "@/errors/RecognitionErrors"

export class RecognitionManager {
    private frameId: number
    private interval: NodeJS.Timeout | undefined
    private isRunning: boolean = false

    private consecutiveNetworkErrors: number = 0
    private readonly MAX_NETWORK_ERRORS: number = 3

    constructor() {
        this.frameId = 0
    }
    
    /**
     * Initiates a new recognition loop with a new session ID,
     * starts the camera and connection services if necessary.
     */
    async startRecognitionLoop() {
        useErrorStore().clearLoopError()
        this.consecutiveNetworkErrors = 0
        const cameraService = useServiceStore().cameraService
        if (!cameraService) {
            throw new CameraUnavailableError("Servizio fotocamera non inizializzato")
        }
        if (!cameraService.isActive()) {
            try {
                await cameraService.start()
            } catch (err) {
                throw normalizeCameraError(err)
            }
        }
        const connectionService = useServiceStore().connectionService
        if (!connectionService) {
            throw new ConnectionUnavailableError("Servizio di connessione non inizializzato")
        }
        if (!connectionService.isActive()) {
            await connectionService.start()
        }
        this.frameId = 0
        this.isRunning = true
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
        this.isRunning = false
        clearInterval(this.interval)
    }

    async closeCamera(){
        const cameraService = useServiceStore().cameraService;
        if (cameraService && cameraService.isActive()) {
            cameraService.stop();
        }
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
        /**
         * Before this try/catch, an error here (camera that stops, 
         * or more commonly connection lost mid-session) would come out as 
         * an unhandled promise rejection: the loop would go silent and no 
         * one would be notified. Now we catch it, stop the loop (continuing 
         * to query an unreachable server is useless) and report the error 
         * in a global store: who shows it to the user no longer depends on 
         * which page is active at that moment.
         */
        const frame = await cameraService.getCameraFrame().catch((err) => {
            if (!this.isRunning) return null; 
            this.stopRecognitionLoop();
            useErrorStore().reportLoopError(normalizeCameraError(err));
            return null;
        });
        if(!frame) return;
        this.frameId++

        const response = await connectionService.sendRecognitionRequest(sessionStore.sessionId, this.frameId, frame.value)
            .then((res) => {
                this.consecutiveNetworkErrors = 0; 
                return res;
            })
            .catch((err) => {
                if (!this.isRunning) return null; 
                
                this.consecutiveNetworkErrors++;
                if (this.consecutiveNetworkErrors >= this.MAX_NETWORK_ERRORS) {
                    this.stopRecognitionLoop();
                    useErrorStore().reportLoopError(normalizeConnectionError(err));
                }
                return null;
            });
        if (!response || !this.isRunning) return;
        const rawAnimals = response.selectedAnimals ?? (response.selectedAnimal ? [response.selectedAnimal] : []);
        if (rawAnimals.length === 0) return;
        const validAnimals: AnimalData[] = [];
        for (const animal of rawAnimals) {
            if (animal.id === "unknown" || !animal.id) continue;
            const sumX = animal.boundingPoly?.normalizedVertices?.reduce((sum, vert) => sum + vert.x, 0) ?? 0
            const sumY = animal.boundingPoly?.normalizedVertices?.reduce((sum, vert) => sum + vert.y, 0) ?? 0
            const numVerts = animal.boundingPoly?.normalizedVertices?.length ?? 1
            const animalData : AnimalData = {
                id: crypto.randomUUID(),
                animalType: AnimalType.fromString(animal.id),
                displayName: animal.displayName ?? "Sconosciuto",
                pos: {
                    x: sumX / numVerts,
                    y: sumY / numVerts
                }
            }
            validAnimals.push(animalData);
        }
        if (validAnimals.length === 0) return;
        const uniqueAnimals = validAnimals.filter((animal, index, self) =>
                index === self.findIndex((t) => t.animalType === animal.animalType)
        );
        if (uniqueAnimals.length === 1 && uniqueAnimals[0]) {
            sessionStore.updateRecognizedAnimal(uniqueAnimals[0]);
            this.stopRecognitionLoop()
            return;
        } else if (uniqueAnimals.length > 1) {
            sessionStore.multipleAnimalsDetected(uniqueAnimals);
            this.stopRecognitionLoop()
            return;
        }
    }
}

