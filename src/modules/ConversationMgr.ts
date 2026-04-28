import { requestMicrophonePermission, startRecording, stopRecording, releaseStream } from '@/services/SpeechService';

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
        console.error("Network or server error:", error);
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

// --- PRIVATE INTERNAL FUNCTIONS (The core engine) ---

async function convertSpeechToText(audioUrl: string): Promise<string> {
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

async function fetchAnimalResponse(userText: string): Promise<string> {
    // Simulate an API call to the Animex AI backend
    return new Promise((resolve) => {
        setTimeout(() => resolve(`Roar! Ho sentito la tua domanda. Sto benissimo! 🦁`), 1500);
    });
}

async function playTextToSpeech(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const synth = window.speechSynthesis;
        
        if (!synth) {
            console.warn("Text-to-Speech is not supported by this browser.");
            // Resolve anyway to avoid breaking the application flow
            resolve(); 
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'it-IT'; // The animal speaks in Italian
        utterance.pitch = 1.2; 
        
        utterance.onend = () => resolve();
        utterance.onerror = (e) => reject(e);
        
        synth.speak(utterance);
    });
}