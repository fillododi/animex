import { requestMicrophonePermission, startRecording, stopRecording, releaseStream, convertSpeechToText,  playTextToSpeech } from '@/services/SpeechService';
import { fetchAnimalResponse } from '@/services/AIService';
// --- PUBLIC FUNCTIONS (Exposed to the View) ---

export async function startInteraction(): Promise<void> {
    const granted = await requestMicrophonePermission();
    if (!granted) {
        throw new Error("Microphone permission denied by the user.");
    }
    
    startRecording();
}

export async function stopAndProcessInteraction(): Promise<{ userText: string, animalText: string }> {
    const audioUrl = await stopRecording();
    releaseStream();

    let finalUserText = "";
    let finalAnimalText = "";

    try {
        // 1. Perform Speech-to-Text
        finalUserText = await convertSpeechToText(audioUrl);

        // 2. CHECK: Did the user actually say something?
        if (!finalUserText || finalUserText.trim() === "") {
            // SCENARIO A: Silence or audio not understood
            finalUserText = "[Nessuna parola rilevata]";
            finalAnimalText = "Scusa umano, c'era troppo rumore o hai parlato pianissimo. Puoi ripetere?";
        
        } else {
            // SCENARIO B: All good, query the AI
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
}

