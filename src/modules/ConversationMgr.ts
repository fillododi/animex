export async function simulaRispostaAnimale(): Promise<string> {
    return new Promise((resolve) => {
        setTimeout(() => { resolve("Roar! Ho sentito la tua voce, piccolo umano! 🦁"); }, 1500);
        // L'animale ci mette 1.5 secondi a rispondere
    });
};