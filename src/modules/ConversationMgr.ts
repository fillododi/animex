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

// --- STATE VARIABLE ---
let isListening = false;
let currentTranscript = ""; // Keep track of the current transcript as it comes in, so we have it ready when stopping

// --- PUBLIC FUNCTIONS (Exposed to the View) ---

export async function startInteraction(onReady?: () => void): Promise<void> {
    currentTranscript = "";
    isListening = false;
    
    
    await playSpeechToText(
        (transcript) => {
            currentTranscript = transcript;
        },
        (error) => {
            console.error('[MGR] STT error:', error);
        },
        () => {
            console.log('[MGR] microphone ready');
            isListening = true;
            onReady?.(); // Notifica la Vue
        }
    );
}

export function getIsListening(): boolean {
  return isListening;
}

export async function stopAndProcessInteraction(): Promise<{ userText: string, animalText: string }> {
    console.log('[MGR] stopAndProcessInteraction called');
    
    // If we are still listening, we need to stop the recognition first
    if (isListening) {
        await stopSpeechRecognition(); 
        isListening = false;
    }

    let finalUserText = currentTranscript;
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
