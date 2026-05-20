import { sttService, ttsService } from '@/services/SpeechService';
import { fetchAnimalResponse } from '@/services/AIService';
import { connectionService, type ConnectionService } from '@/services/ConnectionService';

export class ConversationManager {
    
    private isListening = false;
    private currentTranscript = ""; 
    private sessionId : string;
    private readonly connectionService: ConnectionService;
    constructor(conn: ConnectionService) {
        this.sessionId = crypto.randomUUID();
        this.connectionService = conn;
    }

    public async startInteraction(onReady?: () => void, onError?: (error: string) => void): Promise<void> {
        // Use the STT service instance to start listening
        await sttService.startListening(
            (transcript) => {
                this.currentTranscript = transcript;
            },
            (error) => {
                if (onError) {
                    onError(error);
                }
            },
            () => {
                this.isListening = true;
                onReady?.(); 
            }
        );
    }
    public async stopListening(): Promise<void>{
        if (this.isListening) {
            await sttService.stopListening(); 
            this.isListening = false;
        }
    }
    public async getCurrentTranscript(): Promise<string> {
        return this.currentTranscript;
    }
    public async resetTranscript(): Promise<void> {
        this.currentTranscript = "";
    }

    public async processTextInteraction(text: string): Promise<{ animalText: string }> {
        try {
            const finalAnimalText = await fetchAnimalResponse(text);
            return {
                animalText: finalAnimalText
            };
        } catch (error) {
            return {
                animalText: "Roar! Ho un po' di mal di pancia al server... dammi un minuto e riprova!"
            };
        }
    }

    public async speak(text: string): Promise<void> {
        await ttsService.speak(text);
    }
}

export const conversationManager = new ConversationManager(connectionService);
