  import { SpeechRecognition } from '@capacitor-community/speech-recognition';
  import { TextToSpeech } from "@capacitor-community/text-to-speech"
  let mediaRecorder: MediaRecorder | null = null
  let audioChunks: Blob[] = []
  let audioStream: MediaStream | null = null
export async function requestMicrophonePermission(): Promise<boolean> {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioStream = stream
        return true
    } 
    catch {
        return false
    }
}
export function startRecording(): void {
    if (!audioStream) throw new Error('No audio stream available.')

    audioChunks = []
    mediaRecorder = new MediaRecorder(audioStream)

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) audioChunks.push(event.data)
    }

    mediaRecorder.start()
}

export function stopRecording(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) return reject(new Error('No active recording.'))

    mediaRecorder.onstop = () => {
      const actualMimeType = mediaRecorder?.mimeType || 'audio/mp4'
      const audioBlob = new Blob(audioChunks, { type: actualMimeType })
      const audioUrl = URL.createObjectURL(audioBlob)
      resolve(audioUrl)
    }
    mediaRecorder.stop()
  })
}
export function releaseStream(): void {
  audioStream?.getTracks().forEach(track => track.stop())
  audioStream = null
  mediaRecorder = null
  audioChunks = []
}
let recognitionListener: any = null;

export async function playSpeechToText(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void,
    onStart?: () => void  
): Promise<void> {
    try {
        // 1. Check permissions and request if not granted
        const permissions = await SpeechRecognition.requestPermissions();
        if (permissions.speechRecognition !== 'granted') {
            onError?.('Permesso di riconoscimento vocale negato');
            return;
        }

        // 2. Remove any existing listener to avoid duplicates
        if (recognitionListener) {
            await recognitionListener.remove();
            recognitionListener = null;
        }

        // 3. Listen for results (including partial results)
        recognitionListener = await SpeechRecognition.addListener('partialResults', (data: any) => {
            // data.matches is an array of possible transcriptions, we take the first one if available
            if (data.matches && data.matches.length > 0) {
                console.log('[STT NATIVO] Trascrizione:', data.matches[0]);
                onResult(data.matches[0]); 
            }
        });

        // 4. Start recognition with desired options
        await SpeechRecognition.start({
            language: 'it-IT',
            maxResults: 1,
            prompt: 'Parla ora...', // Shows a prompt on Android to indicate that the user should speak
            partialResults: true,
            popup: false // Disable the default Android popup for a more seamless experience
        });

        console.log('[STT NATIVO] ✅ Avviato');
        onStart?.();

    } catch (error: any) {
        console.error('[STT NATIVO] ❌ Errore:', error);
        onError?.(error.message);
    }
}

export async function stopSpeechRecognition(): Promise<void> {
    try {
        await SpeechRecognition.stop();
        if (recognitionListener) {
            await recognitionListener.remove();
            recognitionListener = null;
        }
        console.log('[STT NATIVO] 🛑 Fermato');
    } catch (error) {
        console.error('[STT NATIVO] Errore durante lo stop:', error);
    }
}

export async function playTextToSpeech(text: string)  {
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
export async function stopTextToSpeech() {
  await TextToSpeech.stop();
}
