import { TextToSpeech } from "@capacitor-community/text-to-speech"

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
}