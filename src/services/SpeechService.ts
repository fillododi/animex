/*import { TextToSpeech } from "@capacitor-community/text-to-speech"

let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let audioStream: MediaStream | null = null

export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioStream = stream
    return true
  } catch {
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

export async function convertSpeechToText(_audioUrl: string): Promise<string> {
    // Simulate an API call to a Speech-to-Text service (e.g., Whisper)
    return new Promise((resolve) => {
        setTimeout(() => {
            // MODIFY HERE TO TEST:
            // Change `true` to `false` to simulate the child staying silent
            const didChildSpeak = false; 

            if (didChildSpeak) {
                resolve("Ciao animale, come stai?");
            } else {
                resolve(""); // Return an empty string (silence)
            }
        }, 1500);
    });
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
}*/
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
let recognition: any = null;
export function playSpeechToText(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void,
    onEnd?: () => void,
    onStart?: () => void  ): void {

    const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
    console.log('[STT] SpeechRecognition available:', !!SpeechRecognition);
    if (!SpeechRecognition) {
      onError?.('SpeechRecognition not supported');
      return;
      }
      if (recognition) {
        recognition.onstart = null;
        recognition.onspeechstart = null;
        recognition.onspeechend = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        try {
            recognition.abort();
        } catch(e) { /* ignora errori di abort */ }
        recognition = null;
    }
    recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    console.log('[STT] Recognition configured, about to start...');
    
    recognition.onstart = () => {
      console.log('[STT] ✅ Recognition STARTED - microphone is listening');
      onStart?.();
    };

    recognition.onspeechstart = () => {
      console.log('[STT] 🎤 Speech DETECTED - user is speaking');
    };

    recognition.onspeechend = () => {
      console.log('[STT] 🔇 Speech ENDED - user stopped speaking');
    };

    recognition.onresult = (event: any) => {
      console.log('[STT] ✅ Result received:', event.results);
      /*const transcript = event.results[0][0].transcript;
      console.log('[STT] Transcript:', transcript);
      onResult(transcript);*/
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript;
      }
      console.log('[STT] Transcript:', finalTranscript);
      onResult(finalTranscript);
    };
    recognition.onerror = (event: any) => {
      console.error('[STT] ❌ Error:', event.error, event.message);
    if (event.error !== 'no-speech') {
      onError?.(event.error);
      }
    };
    recognition.onend = () => {
      console.log('[STT] Recognition ENDED');
      onEnd?.();
    };
    recognition.start();
    console.log('[STT] Recognition START command issued');
}
export function stopSpeechRecognition(): void {
  if (recognition) {
      console.log('[STT] Stop command issued');
      recognition.stop();
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
