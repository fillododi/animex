import type { RecognitionData } from "@/utility/RecognitionData"
import type { Service } from "./Service"
import { assert } from "@/utility/assert"
import { useChatStore } from "@/stores/chatStore"

export interface ConnectionService extends Service {
    
    start(): Promise<void>

    /**
     * Sends an image to the server and receives the recognized animals in it.
     * @param visionFrame The data of the image as a string
     * @returns The server's response
     * @throws An Error if the service is not active
     */
    sendRecognitionRequest(sessionId: string, frameId: number, visionFrame: string): Promise<RecognitionData | null>
    sendChatRequest(sessionId: string): Promise<string>
    //sendARRequest
}

export class ServerConnectionService implements ConnectionService {
    
    private active: boolean
    private readonly url: string
    private readonly timeout: number

    constructor() {
        this.active = false
        this.url = import.meta.env.VITE_BASE_URL
        this.timeout = import.meta.env.VITE_SERVER_TIMEOUT
    }

    async start(): Promise<void> {
        assert(!this.active, "Connection Service is already active!")

        const request: RequestInfo = new Request(`${this.url}/healthz`, {method: 'GET', headers: {"Content-Type": "application/json"}})
        return fetch(request).then(res => res.json())
            .then(res => {
                const resp = res as {ok: boolean, status: string}

                this.active = resp.ok
            })
            .catch(err => console.error(err))
    }

    stop(): void {
        assert(this.active, "Connection Service is already inactive!")

        this.active = false
    }

    isActive(): boolean {
        return this.active
    }

    async sendRecognitionRequest(sessionId: string, frameId: number, visionFrame: string): Promise<RecognitionData | null> {
        assert(this.active, "The connection service isn't active!")

        const body = {
            imageBase64: `data:image/jpeg;base64,${visionFrame}`,
            mimeType: 'image/jpeg',
            clientFrameId: frameId.toString(),
            sessionId: sessionId,
            //previousAnimalId
        }
        const request: RequestInfo = new Request(`${this.url}/api/v1/vision/identify`, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        })
        return fetch(request).then(res => res.json())
            .then(res => {
                return res as RecognitionData
            })
            .catch(() => {
                return null
            })
    }

    async sendChatRequest(sessionId: string): Promise<string> {
        assert(this.active, "The connection service isn't active!")
        const body = {
            sessionId: sessionId,
            animalId: "lion",
            history: useChatStore().messages
        }
        const request: RequestInfo = new Request(`${this.url}/api/v1/chat`, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        })
        try {
            const response = await fetch(request)
            const res = await response.json()
            return res.data.answer as string
        }catch(err){
            console.error(err)
            return "Error occurred while sending chat request."
        }
        
        // return the object of the answer that contains:
        //"ok": true, "data": { "answer": "Lions mostly live in African grasslands
        //and savannahs. They like open places where they can hunt and rest
        //together in prides.", "source": "gemini", "animalId": "lion",
        
    }
}
export const connectionService = new ServerConnectionService()