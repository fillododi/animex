import type { RecognitionData } from "@/utility/RecognitionData"
import type { Service } from "./Service"
import { assert } from "@/utility/assert"

export interface ConnectionService extends Service {
    /**
     * Sends an image to the server and receives the recognized animals in it.
     * @param visionFrame The data of the image as a string
     * @returns The server's response
     * @throws An Error if the service is not active
     */
    sendRecognitionRequest(visionFrame: string): Promise<RecognitionData | null>
    //sendChatRequest
    //sendARRequest
}

export class ServerConnectionService implements ConnectionService {
    
    private active: boolean
    private sessionID: number
    private frameID: number
    private readonly url: string
    private readonly timeout: number

    constructor() {
        this.active = false
        this.sessionID = 100000 + Math.random() * 899999
        this.frameID = 0
        this.url = import.meta.env.VITE_BASE_URL
        this.timeout = import.meta.env.VITE_SERVER_TIMEOUT
    }

    start(): Promise<void> {
        assert(!this.active, "Connection Service is already active!")

        const request: RequestInfo = new Request(`${this.url}/healthz`, {method: 'GET'})
        return fetch(request).then(res => res.json())
            .then(res => {
                const resp = res as {ok: boolean, status: string}

                console.log((resp.ok ? "Connected to server, " : "Couldn't connect to server, ") + `status: ${resp.status}`)

                this.active = resp.ok
            })
            .catch(() => console.warn("Couldn't parse server health response."))
    }

    stop(): void {
        assert(this.active, "Connection Service is already inactive!")

        this.active = false
    }

    isActive(): boolean {
        return this.active
    }

    sendRecognitionRequest(visionFrame: string): Promise<RecognitionData | null> {
        assert(this.active, "The connection service isn't active!")

        const body = {
            imageBase64: `data:image/jpeg;base64,${visionFrame}`,
            mimeType: 'image/jpeg',
            clientFrameId: this.frameID,
            sessionId: this.sessionID,
            //previousAnimalId
        }
        const request: RequestInfo = new Request(`${this.url}/api/v1/vision/identify`, {
            method: 'POST',
            body: JSON.stringify(body)
        })
        return fetch(request).then(res => res.json())
            .then(res => {
                return res as RecognitionData
            })
            .catch(() => {
                console.warn("Couldn't parse server recognition response.")
                return null
            })
    }
}