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
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
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