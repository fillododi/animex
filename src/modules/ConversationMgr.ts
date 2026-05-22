import { SOMETHING_BAD_IN_BACKEND } from '@/utility/constants';
import { useServiceStore } from '@/stores/serviceStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useChatStore } from '@/stores/chatStore';
import type { QuizQuestionDTO, DifficultyLevel, QuizValidationResultDTO } from '@/utility/Types';
export class ConversationManager {
    
    private isListening = false;
    private currentTranscript = ""; 

    constructor() {
    }

    public async startInteraction(onReady?: () => void, onError?: (error: string) => void): Promise<void> {
        const sttService = useServiceStore().sttService
        this.currentTranscript = "";
        // Use the STT service instance to start listening
        await sttService?.startListening(
            (transcript) => {
                this.currentTranscript = transcript;
            },
            (error) => {
                if (onError) {
                    onError(error);
                }
            },
            () => {
                this.isListening = true;
                onReady?.(); 
            }
        );
    }
    public async stopListening(): Promise<void>{
        const sttService = useServiceStore().sttService
        if (this.isListening) {
            await sttService?.stopListening(); 
            this.isListening = false;
        }
    }
    public async getCurrentTranscript(): Promise<string> {
        return this.currentTranscript;
    }
    public async resetTranscript(): Promise<void> {
        this.currentTranscript = "";
    }
    public async processTextInteraction(text: string): Promise<void> {
        try {
            const connectionService = useServiceStore().connectionService
            const sessionId = useSessionStore().sessionId
            const finalAnimalText = await connectionService?.sendChatRequest(sessionId, text);
            await this.speak(finalAnimalText ?? "unknown");
            
        } catch (error) {
            useChatStore().addErrorResponse();
            await this.speak(SOMETHING_BAD_IN_BACKEND);

        }
    }

    public async requestQuiz(difficulty?: DifficultyLevel): Promise<QuizQuestionDTO  | null> {
        const chatStore = useChatStore();
        try {
            const connectionService = useServiceStore().connectionService;
            const stateStore = useSessionStore();
            const currentAnimalId = stateStore.recognizedAnimal?.id;
            

            if (currentAnimalId && connectionService) {
                try {
                    const question = await connectionService.sendQuizNextRequest(stateStore.sessionId, currentAnimalId,  difficulty?? "easy");
                    if(question){
                        chatStore.setActiveQuestion(question);
                        return question; 
                    }
                    else{
                        chatStore.clearQuiz();
                        await this.speakErrorResponse();
                        return null;
                    }    
                } catch (error) {
                    chatStore.clearQuiz();
                    await this.speakErrorResponse();
                    return null;
                }
            }
        } catch (error) {
            await this.speakErrorResponse();
            return null;
        }
        await this.speakErrorResponse();
        return null;
    }

    public async validateQuiz(questionId: string, answer: string, prompt: string, choices?: string[]): Promise<QuizValidationResultDTO | null> {
        const chatStore = useChatStore();
        try {
            const connectionService = useServiceStore().connectionService;
            const stateStore = useSessionStore();
            const currentAnimalId = stateStore.recognizedAnimal?.id;
            chatStore.addUserMessage(answer);
            if (!currentAnimalId) return null;

            // If choices are provided, it's a multiple-choice question or true/false, otherwise it's an open-ended question
            if(!choices){
                const result = await connectionService?.sendQuizValidateRequest(
                    stateStore.sessionId,
                    currentAnimalId,
                    questionId,
                    answer,
                    prompt,
                );
                if(result && result.feedback){
                    chatStore.addBotMessage(result.feedback);
                    await this.speak(result.feedback);
                    chatStore.clearQuiz();
                }
                else {                    
                    await this.speakErrorResponse();
                }
                return result? result : null;
                 
            }
            else if(choices.length === 2 && choices.includes("True") && choices.includes("False")){
                const correctAnswer = chatStore.activeQuestion?.trueOrFalseAnswer;
                // Validate the user's answer against the correct answer
                const isCorrect = (answer.toLowerCase() === "true" && correctAnswer === true) || (answer.toLowerCase() === "false" && correctAnswer === false);
                const feedback = isCorrect ? "Risposta corretta!" : "Risposta errata. Riprova!";
                const result: QuizValidationResultDTO = {
                    correct: isCorrect,
                    score: isCorrect ? 1 : 0,
                    feedback,
                    //nextAction
                };
                if(result && result.feedback){
                    chatStore.addBotMessage(result.feedback);
                    await this.speak(result.feedback);
                    if(isCorrect){
                        chatStore.clearQuiz();
                    }
                }
                return result;
            }
            else if(choices.length >= 2){
                const correctAnswer = chatStore.activeQuestion?.correctAnswer;
                const isCorrect = (answer.toLowerCase() === correctAnswer?.toLowerCase());
                const feedback = isCorrect ? "Risposta corretta!" : `Risposta errata. La risposta corretta è: ${correctAnswer}`;
                const result: QuizValidationResultDTO = {
                    correct: isCorrect,
                    score: isCorrect ? 1 : 0,
                    feedback,
                    //nextAction
                };
                if(result && result.feedback){
                    chatStore.addBotMessage(result.feedback);
                    await this.speak(result.feedback);
                    chatStore.clearQuiz();    
                }
                return result;
                
            }
            
            
        } catch (error) {
            console.error("Errore nella validazione del quiz:", error);
            await this.speakErrorResponse();
            return null;
        }
        return null;
    }
    async speakErrorResponse() {
        const chatStore = useChatStore();
        chatStore.addErrorResponse();
        await this.speak(SOMETHING_BAD_IN_BACKEND);
    }

    public async speak(text: string): Promise<void> {
        const ttsService = useServiceStore().ttsService
        await ttsService?.speak(text);
    }

    public async stopSpeaking(): Promise<void> {
        const ttsService = useServiceStore().ttsService
        await ttsService?.stopSpeaking();
    }
}