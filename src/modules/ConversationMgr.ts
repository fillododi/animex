import { NativeSTTService, NativeTTSService, sttService, ttsService } from '@/services/SpeechService';
import { fetchAnimalResponse } from '@/services/AIService';
import { connectionService, type ConnectionService } from '@/services/ConnectionService';
import { useConversationManagerStore } from '@/stores/conversationManagerStore';
import { SOMETHING_BAD_IN_BACKEND } from '@/utility/constants';

export class ConversationManager {
    
    private isListening = false;
    private currentTranscript = ""; 

    constructor() {
    }

    public async startInteraction(onReady?: () => void, onError?: (error: string) => void): Promise<void> {
        this.currentTranscript = "";
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
    // Since sendChatRequest directly load from chatStore, we do not need to pass the text as parameter
    public async processTextInteraction(text: string): Promise<{ animalText: string }> {
        try {
            const finalAnimalText = await fetchAnimalResponse(text);
            //const stateStore = useConversationManagerStore();
            //const currentSessionId = stateStore.sessionId;
            //const finalAnimalText = await this.connectionService.sendChatRequest(currentSessionId);
            return {
                animalText: finalAnimalText
            };
        } catch (error) {
            return {
                animalText: SOMETHING_BAD_IN_BACKEND
            };
        }
    }

    public async speak(text: string): Promise<void> {
        await ttsService.speak(text);
    }
}