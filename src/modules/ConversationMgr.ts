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

    public async stopAndProcessInteraction(): Promise<{ userText: string, animalText: string }> {
        
        if (this.isListening) {
            await sttService.stopListening(); 
            this.isListening = false;
        }

        let finalUserText = this.currentTranscript;
        let finalAnimalText = "";
        
        try {
            if (!finalUserText || finalUserText.trim() === "") {
                finalUserText = "[Nessuna parola rilevata]";
                finalAnimalText = "Scusa umano, c'era troppo rumore o hai parlato pianissimo. Puoi ripetere?";
            } else {
                finalAnimalText = await fetchAnimalResponse(finalUserText);
            }
        } catch (error) {
            finalUserText = "[Errore di sistema]";
            finalAnimalText = "Roar! Ho un po' di mal di pancia al server... dammi un minuto e riprova!";
        }

        // Use the TTS service instance to speak the response
        await ttsService.speak(finalAnimalText);

        return { 
            userText: finalUserText, 
            animalText: finalAnimalText 
        };
    }

    public async processTextInteraction(text: string): Promise<{ userText: string, animalText: string }> {
        
        let finalAnimalText = "";
        
        try {
            finalAnimalText = await fetchAnimalResponse(text);
        } catch (error) {
            finalAnimalText = "Roar! Ho un po' di mal di pancia al server... dammi un minuto e riprova!";
        }

        // Use the TTS service instance to speak the response
        await ttsService.speak(finalAnimalText);

        return { 
            userText: text, 
            animalText: finalAnimalText 
        };
    }
}

// Export a singleton instance of ConversationManager to be used across the app
export const conversationManager = new ConversationManager();
