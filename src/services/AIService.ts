export async function fetchAnimalResponse(_userText: string): Promise<string> {
    // Simulate an API call to the Animex AI backend
    return new Promise((resolve) => {
        setTimeout(() => resolve(`Roar! Ho sentito la tua domanda. Sto benissimo! 🦁`), 1500);
    });
}