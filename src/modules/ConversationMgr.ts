import { sttService, ttsService } from '@/services/SpeechService';
import { fetchAnimalResponse } from '@/services/AIService';

export class ConversationManager {
    
    private isListening = false;
    private currentTranscript = ""; 

    public async startInteraction(onReady?: () => void): Promise<void> {
        this.currentTranscript = "";
        this.isListening = false;
        
        // Use the STT service instance to start listening
        await sttService.startListening(
            (transcript) => {
                this.currentTranscript = transcript;
            },
            (_error) => {
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
    public async forcedStopListening(): Promise<void> {
        await sttService.forceStopListening();
        this.isListening = false;
        this.currentTranscript = "";
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

export const conversationManager = new ConversationManager();
