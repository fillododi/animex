import type { Service } from "./Service"
import { assert } from "@/utility/assert"
import { useChatStore } from "@/stores/chatStore"
import type { ChatDTO, MessageRole, QuizQuestionDTO, QuizType, QuizValidationResultDTO, RecognitionDTO } from "@/utility/Types"
import { useSessionStore } from "@/stores/sessionStore"
import { type DifficultyLevel } from "@/utility/Types"

export interface ConnectionService extends Service {
    
    start(): Promise<void>

    /**
     * Sends an image to the server and receives the recognized animals in it.
     * @param visionFrame The data of the image as a string
     * @returns The server's response
     * @throws An Error if the service is not active
     */
    sendRecognitionRequest(sessionId: string, frameId: number, visionFrame: string): Promise<RecognitionDTO | null>
    sendChatRequest(sessionId: string, text: string): Promise<ChatDTO | null>
    sendQuizNextRequest(sessionId: string, animalId: string, difficulty: DifficultyLevel, oldQuestions: string[], types: QuizType[]): Promise<QuizQuestionDTO | null>
    sendQuizValidateRequest(sessionId: string, animalId: string, questionId: string, answer: string, prompt: string): Promise<QuizValidationResultDTO | null>
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
        const res = await fetch(request)
        const json = await res.json()
        this.active = json.ok
    }

    stop(): void {
        assert(this.active, "Connection Service is already inactive!")

        this.active = false
    }

    isActive(): boolean {
        return this.active
    }

    async sendRecognitionRequest(sessionId: string, frameId: number, visionFrame: string): Promise<RecognitionDTO | null> {
        assert(this.active, "The connection service isn't active!")
        const recognizedAnimal = useSessionStore().recognizedAnimal
        const body = {
            imageBase64: `data:image/jpeg;base64,${visionFrame}`,
            mimeType: 'image/jpeg',
            clientFrameId: frameId.toString(),
            sessionId: sessionId,
            ...(recognizedAnimal ? {previousAnimalId: recognizedAnimal.id} : {})
        }
        const request: RequestInfo = new Request(`${this.url}/api/v1/vision/identify`, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        })
        return fetch(request).then(res => res.json())
            .then(res => {
                return res.data as RecognitionDTO
            })
            .catch(() => {
                return null
            })
    }

    async sendChatRequest(sessionId: string, text: string): Promise<ChatDTO | null> {
        const chatStore = useChatStore()
        chatStore.addUserMessage(text)
        assert(this.active, "The connection service isn't active!")
        const sessionStore = useSessionStore()
        const recognizedAnimal = sessionStore.recognizedAnimal
        const body = {
            sessionId: sessionId,
            animalId: recognizedAnimal?.animalType,
            history: chatStore.messages.filter((msg: { ok: boolean }) => msg.ok).map((msg: { role: MessageRole; content: string }) => ({role: msg.role, text: msg.content})),
            message: text
        }
        const request: RequestInfo = new Request(`${this.url}/api/v1/chat`, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        })
        try {
            const response = await fetch(request)
            const res = await response.json()
            const message = res.data.answer as string
            if(message && message.trim() != ""){
                chatStore.setOk(true)
            }
            return res.data as ChatDTO
        }catch{
            return null
        }
        
        // return the object of the answer that contains:
        //"ok": true, "data": { "answer": "Lions mostly live in African grasslands
        //and savannahs. They like open places where they can hunt and rest
        //together in prides.", "source": "gemini", "animalId": "lion",
        
    }

    async sendQuizNextRequest(sessionId: string, animalId: string, difficulty: DifficultyLevel, oldQuestions: string[], types: QuizType[]): Promise<QuizQuestionDTO | null> {
        const body = {
            sessionId,
            animalId,
            difficulty,
            previousQuestionIds: oldQuestions,
            allowedQuizTypes: types,
            mode : "animal"
        };
        const request = new Request(`${this.url}/api/v1/quiz/next`, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });
        try {
            const response = await fetch(request);
            const res = await response.json();
            return res.data.question ; 
        } catch{
            return null;
        }
    }

    async sendQuizValidateRequest(sessionId: string, animalId: string, questionId: string, answer: string, prompt: string): Promise<QuizValidationResultDTO | null> {
        const body = {
            sessionId: sessionId,
            animalId: animalId,
            questionId: questionId,
            answer: answer,
            prompt: prompt,
        };
        const request = new Request(`${this.url}/api/v1/quiz/validate`, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });
        try {
            const response = await fetch(request);
            const res = await response.json();
            return res.data ; 
        } catch{
            return null;
        }
    }
}