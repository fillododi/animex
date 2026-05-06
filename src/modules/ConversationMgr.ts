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
            onReady?.(); // Notify the Vue
        }
    );
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
