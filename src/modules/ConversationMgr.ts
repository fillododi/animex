/*import { requestMicrophonePermission, startRecording, stopRecording, releaseStream, playSpeechToText,  playTextToSpeech, stopSpeechRecognition } from '@/services/SpeechService';
import { fetchAnimalResponse } from '@/services/AIService';
// --- PUBLIC FUNCTIONS (Exposed to the View) ---
let isListening = false;
let finalUserText = "";
//let recognitionEndResolver: (() => void) | null = null;
let recognitionResolver: ((text: string) => void) | null = null;
export async function startInteraction(onReady?: () => void): Promise<void> {
    finalUserText = "";
    recognitionResolver = null;
    isListening = false;
    //const granted = await requestMicrophonePermission();
    //if (!granted) {
    //    throw new Error("Microphone permission denied by the user.");
    //}
    
    playSpeechToText(
    (transcript) => {
        console.log('[MGR] STT result:', transcript);
        recognitionResolver?.(transcript);
        recognitionResolver = null;
    },
    (error) => {
        console.error('[MGR] STT error:', error);
        recognitionResolver?.('');
        recognitionResolver = null;
    },
    () => {
        console.log('[MGR] onEnd called');
        isListening = false;
        recognitionResolver?.('');
        recognitionResolver = null;
    },
    () => {
      console.log('[MGR] microphone ready');
      isListening = true;
      onReady?.(); // ← notifica la Vue
    }
  );
}
export function getIsListening(): boolean {
  return isListening;
}
export async function stopAndProcessInteraction(): Promise<{ userText: string, animalText: string }> {
    //const audioUrl = await stopRecording();
    //releaseStream();
    console.log('[MGR] stopAndProcessInteraction called');
    const waitForRecognitionEnd = new Promise<string>((resolve) => {
    recognitionResolver = resolve;
    });
    stopSpeechRecognition(); 
    finalUserText = await waitForRecognitionEnd; // aspetta che il riconoscimento confermi di aver finito
    console.log('[MGR] stopAndProcessInteraction called');
    console.log('[MGR] finalUserText at stop time:', `"${finalUserText}"`);
    let finalAnimalText = "";
    console.log('[MGR] recognition stopped');
    try {
        // 1. Perform Speech-to-Text
        //finalUserText = await convertSpeechToText(audioUrl);
        
        // 2. CHECK: Did the user actually say something?
        if (!finalUserText || finalUserText.trim() === "") {
            // SCENARIO A: Silence or audio not understood
            console.warn('[MGR] ⚠️ finalUserText is empty - going to fallback');
            finalUserText = "[Nessuna parola rilevata]";
            finalAnimalText = "Scusa umano, c'era troppo rumore o hai parlato pianissimo. Puoi ripetere?";
        
        } else {
            // SCENARIO B: All good, query the AI
            console.log('[MGR] ✅ Sending to AI:', finalUserText);
            finalAnimalText = await fetchAnimalResponse(finalUserText);
        }

    } catch (error) {
        // SCENARIO C: Servers (STT or AI) are down / offline
        finalUserText = "[Errore di sistema]";
        finalAnimalText = "Roar! Ho un po' di mal di pancia al server... dammi un minuto e riprova!";
    }

    // 3. ALWAYS make the animal speak (whether it's a real response or asking to repeat)
    await playTextToSpeech(finalAnimalText);

    // 4. Return the result to the View, whatever it is
    return { 
        userText: finalUserText, 
        animalText: finalAnimalText 
    };
}*/
import { playSpeechToText, playTextToSpeech, stopSpeechRecognition } from '@/services/SpeechService';
import { fetchAnimalResponse } from '@/services/AIService';

// --- VARIABILI DI STATO ---
let isListening = false;
let currentTranscript = ""; // Mantiene il testo ascoltato
let recognitionResolver: ((text: string) => void) | null = null;

export async function startInteraction(onReady?: () => void): Promise<void> {
    currentTranscript = "";
    recognitionResolver = null;
    isListening = false;
    
    playSpeechToText(
        (transcript) => {
            console.log('[MGR] STT result:', transcript);
            currentTranscript = transcript; // Salva il testo, ma NON risolvere ancora la Promise
        },
        (error) => {
            console.error('[MGR] STT error:', error);
        },
        () => {
            console.log('[MGR] onEnd called. Transcript is:', currentTranscript);
            isListening = false;
            
            // L'evento onEnd è l'ultimo a scattare. Se qualcuno sta aspettando la Promise, la risolviamo qui.
            if (recognitionResolver) {
                recognitionResolver(currentTranscript);
                recognitionResolver = null;
            }
        },
        () => {
            console.log('[MGR] microphone ready');
            isListening = true;
            onReady?.();
        }
    );
}

export function getIsListening(): boolean {
  return isListening;
}

export async function stopAndProcessInteraction(): Promise<{ userText: string, animalText: string }> {
    console.log('[MGR] stopAndProcessInteraction called');
    
    let finalUserText = currentTranscript;

    // Se sta ancora ascoltando, forziamo lo stop e aspettiamo l'evento onEnd
    if (isListening) {
        const waitForRecognitionEnd = new Promise<string>((resolve) => {
            recognitionResolver = resolve;
        });
        stopSpeechRecognition(); 
        finalUserText = await waitForRecognitionEnd;
    } else {
        console.log('[MGR] STT era già fermo. Uso il testo accumulato.');
    }

    console.log('[MGR] finalUserText at stop time:', `"${finalUserText}"`);
    let finalAnimalText = "";
    
    try {
        if (!finalUserText || finalUserText.trim() === "") {
            console.warn('[MGR] ⚠️ finalUserText is empty - going to fallback');
            finalUserText = "[Nessuna parola rilevata]";
            finalAnimalText = "Scusa umano, c'era troppo rumore o hai parlato pianissimo. Puoi ripetere?";
        } else {
            console.log('[MGR] ✅ Sending to AI:', finalUserText);
            finalAnimalText = await fetchAnimalResponse(finalUserText);
        }
    } catch (error) {
        finalUserText = "[Errore di sistema]";
        finalAnimalText = "Roar! Ho un po' di mal di pancia al server... dammi un minuto e riprova!";
    }

    await playTextToSpeech(finalAnimalText);

    return { 
        userText: finalUserText, 
        animalText: finalAnimalText 
    };
}
