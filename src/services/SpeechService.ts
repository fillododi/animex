import { SpeechRecognition } from '@capgo/capacitor-speech-recognition';
import { TextToSpeech } from "@capacitor-community/text-to-speech";

// =============================================================
// 1. SPEECH-TO-TEXT (LISTENING WITH NATIVE CAPACITOR PLUGIN)
// =============================================================
export class NativeSTTService {
    private recognitionListener: any = null;

    public async startListening(
        onResult: (transcript: string) => void,
        onError?: (error: string) => void,
        onStart?: () => void  
    ): Promise<void> {
        try {
            const initialStatus = await SpeechRecognition.checkPermissions();
            if (initialStatus.speechRecognition === 'denied') {
                onError?.('NEEDS_SETTINGS');
                return;
            }
            const permissions = await SpeechRecognition.requestPermissions();
            if (permissions.speechRecognition !== 'granted') {
                onError?.('FIRST_DENIAL');
                return;
            }

            if (this.recognitionListener) {
                await this.recognitionListener.remove();
                this.recognitionListener = null;
            }

            this.recognitionListener = await SpeechRecognition.addListener('partialResults', (data: any) => {
                if (data.matches && data.matches.length > 0) {
                    onResult(data.matches[0]); 
                }
            });

            await SpeechRecognition.start({
                language: 'it-IT',
                maxResults: 1,
                prompt: 'Parla ora...',
                partialResults: true,
                popup: false 
            });

            onStart?.();

        } catch (error: any) {
            onError?.(error.message);   
        }
    }

    public async stopListening(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
        await SpeechRecognition.stop().catch(() => {});
        if (this.recognitionListener) {
            await this.recognitionListener.remove();
            this.recognitionListener = null;
        }
        
    }

}

// =============================================================
// 2. TEXT-TO-SPEECH (NATIVE CAPACITOR PLUGIN)
// =============================================================
export class NativeTTSService {
    
    public async speak(text: string): Promise<void> {
        await TextToSpeech.speak({
            text,
            lang: 'it-IT',
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            category: 'ambient',
            queueStrategy: 1
        });
    }

    public async stopSpeaking(): Promise<void> {
        await TextToSpeech.stop();
    }
}




