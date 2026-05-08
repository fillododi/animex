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
    public async stopListeningAndReturnText(): Promise<{userText: string}>{
        if (this.isListening) {
            await sttService.stopListening(); 
            this.isListening = false;
        }
        return { userText: this.currentTranscript };
    }
    public async stopAndProcessInteraction(userText: string): Promise<{ animalText: string }> {
        /*if (this.isListening) {
            await sttService.stopListening(); 
            this.isListening = false;
        }
        const finalUserText = this.currentTranscript;*/
        const result = (!userText || userText.trim() === "")?
        { userText: "[Nessuna parola rilevata]", animalText: "Scusa umano, c'era troppo rumore o hai parlato pianissimo. Puoi ripetere?" }:
        await conversationManager.processTextInteraction(userText);
        return {  
            animalText: result.animalText 
        };
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

// Export a singleton instance of ConversationManager to be used across the app
export const conversationManager = new ConversationManager();
