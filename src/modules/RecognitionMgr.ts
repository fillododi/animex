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



        // -------------------------------------------------------------
        // 🧪 INIZIO DATI FINTI PER TEST DELLA UI (MOCKING)
        // -------------------------------------------------------------
        
        // Creiamo manualmente l'array con due animali
        /*const mockAnimals: AnimalData[] = [
            {
                id: crypto.randomUUID(),
                animalType: "lion" as any, // Mettiamo 'any' per evitare problemi con l'enum durante il test
                displayName: "Leone ",
                pos: { x: 0.5, y: 0.5 }
            },
            {
                id: crypto.randomUUID(),
                animalType: "hippopotamus" as any,
                displayName: "Ippopotamo",
                pos: { x: 0.6, y: 0.4 }
            }
        ];

        // Salviamo gli animali nello store (farà apparire la bolla)
        sessionStore.multipleAnimalsDetected(mockAnimals);
        
        // Fermiamo il loop per simulare che l'IA abbia finito
        this.stopRecognitionLoop();
        
        // Interrompiamo la funzione qui per ignorare il vero server
        return;*/

        // -------------------------------------------------------------
        // 🧪 FINE DATI FINTI - Tutto ciò che c'è sotto non verrà eseguito
        // -------------------------------------------------------------
        
        // Quando la backend è pronta decommenta il blocco sotto
        
        const response =  await connectionService.sendRecognitionRequest(sessionStore.sessionId, this.frameId, frame.value)
        if (!response) return;
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
                animalType: animal.id as AnimalType,
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
        

        /*if(!response?.selectedAnimals[0]?.id || response.selectedAnimals[0]?.id === "unknown") return
        const sumX = response?.selectedAnimals[0]?.boundingPoly?.normalizedVertices?.reduce((sum, vert) => sum + vert.x, 0) ?? 0
        const sumY = response?.selectedAnimals[0]?.boundingPoly?.normalizedVertices?.reduce((sum, vert) => sum + vert.y, 0) ?? 0
        const numVerts = response?.selectedAnimals[0]?.boundingPoly?.normalizedVertices?.length ?? 1
        const animalData : AnimalData = {
            id: crypto.randomUUID(),
            animalType: (response?.selectedAnimals[0]?.id ?? "unknown") as AnimalType,
            displayName: response?.selectedAnimals[0]?.displayName ?? "Sconosciuto",
            pos: {
                x: sumX / numVerts,
                y: sumY / numVerts
            }
        }
        sessionStore.updateRecognizedAnimal(animalData)*//*
        
    }*/
    }
}