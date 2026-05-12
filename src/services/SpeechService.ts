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
        await SpeechRecognition.stop().catch(() => {}); 
        try {
            const permissions = await SpeechRecognition.requestPermissions();
            if (permissions.speechRecognition !== 'granted') {
                onError?.('Permesso di riconoscimento vocale negato');
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
        
        await SpeechRecognition.stop().catch(() => {});
        if (this.recognitionListener) {
            await this.recognitionListener.remove();
            console.log("[SS] Microfono disattivato e listener rimosso.");
            this.recognitionListener = null;
        }
        
    }

    public async forceStopListening(): Promise<void> {
        try {
            await SpeechRecognition.forceStop();
            await SpeechRecognition.removeAllListeners().catch(() => {});
            
            if (this.recognitionListener) {
                await this.recognitionListener.remove();
                this.recognitionListener = null;
            }
            console.log("Microfono disattivato d'emergenza (Abort) e listener pulito.");
        } catch (error) {
            console.warn("Il microfono era già chiuso o errore di abort:", error);
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
}

// =============================================================
// 3. UTILITY TEST MICROPHONE BROWSER (OLD FLOW)
// =============================================================
export class BrowserAudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private audioStream: MediaStream | null = null;

    public async requestMicrophonePermission(): Promise<boolean> {
        try {
            this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            return true;
        } catch {
            return false;
        }
    }

    public startRecording(): void {
        if (!this.audioStream) throw new Error('No audio stream available.');
        this.audioChunks = [];
        this.mediaRecorder = new MediaRecorder(this.audioStream);
        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
            if (event.data.size > 0) this.audioChunks.push(event.data);
        };
        this.mediaRecorder.start();
    }

    public stopRecording(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) return reject(new Error('No active recording.'));
            this.mediaRecorder.onstop = () => {
                const actualMimeType = this.mediaRecorder?.mimeType || 'audio/mp4';
                const audioBlob = new Blob(this.audioChunks, { type: actualMimeType });
                const audioUrl = URL.createObjectURL(audioBlob);
                resolve(audioUrl);
            };
            this.mediaRecorder.stop();
        });
    }

    public releaseStream(): void {
        this.audioStream?.getTracks().forEach(track => track.stop());
        this.audioStream = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
    }
}

// Export singleton instances of the services to be used across the app
export const sttService = new NativeSTTService();
export const ttsService = new NativeTTSService();
export const browserRecorder = new BrowserAudioRecorder();

