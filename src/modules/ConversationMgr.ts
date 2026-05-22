import { SOMETHING_BAD_IN_BACKEND } from '@/utility/constants';
import { useServiceStore } from '@/stores/serviceStore';
import { useSessionStore } from '@/stores/sessionStore';
import { add } from 'ionicons/icons';
import { useChatStore } from '@/stores/chatStore';
export class ConversationManager {
    
    private isListening = false;
    private currentTranscript = ""; 

    constructor() {
    }

    public async startInteraction(onReady?: () => void, onError?: (error: string) => void): Promise<void> {
        const sttService = useServiceStore().sttService
        this.currentTranscript = "";
        // Use the STT service instance to start listening
        await sttService?.startListening(
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
        const sttService = useServiceStore().sttService
        if (this.isListening) {
            await sttService?.stopListening(); 
            this.isListening = false;
        }
    }
    public async getCurrentTranscript(): Promise<string> {
        return this.currentTranscript;
    }
    public async resetTranscript(): Promise<void> {
        this.currentTranscript = "";
    }
    public async processTextInteraction(text: string): Promise<void> {
        try {
            const connectionService = useServiceStore().connectionService
            const sessionId = useSessionStore().sessionId
            const finalAnimalText = await connectionService?.sendChatRequest(sessionId, text);
            await this.speak(finalAnimalText ?? "unknown");
            
        } catch (error) {
            useChatStore().addErrorResponse();
            this.speak(SOMETHING_BAD_IN_BACKEND);

        }
    }

    public async speak(text: string): Promise<void> {
        const ttsService = useServiceStore().ttsService
        await ttsService?.speak(text);
    }

    public async stopSpeaking(): Promise<void> {
        const ttsService = useServiceStore().ttsService
        await ttsService?.stopSpeaking();
    }
}