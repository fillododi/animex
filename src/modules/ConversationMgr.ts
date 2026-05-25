import { EMPTY_INPUT_ANIMAL_TEXT, SOMETHING_BAD_IN_BACKEND } from '@/utility/constants';
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
    public async processTextInteraction(text: string): Promise<boolean> {
        const chatStore = useChatStore();
        try {
            if(!text) {
                chatStore.addEmptyResponse();
                this.speak(EMPTY_INPUT_ANIMAL_TEXT);
                return false;
            }else { 
                const connectionService = useServiceStore().connectionService
                const sessionId = useSessionStore().sessionId
                const response = await connectionService?.sendChatRequest(sessionId, text);
                if(!response || response.answer.trim() === ""){
                    console.log("[CM] No response received from the server for the chat request.");
                    this.speakErrorResponse();
                    return false;
                } 
                else{
                    chatStore.addBotMessage(response.answer);
                    this.speak(response.answer);
                }
            }
            
        } catch (error) {
            console.log("[CM] 2 No response received from the server for the chat request.");
            this.speakErrorResponse()
            return false;
        }
        return true;
    }

    public async requestQuiz(difficulty: DifficultyLevel): Promise<boolean> {
            const chatStore = useChatStore();
            
            try {
                const connectionService = useServiceStore().connectionService;
                const stateStore = useSessionStore();
                const currentAnimalId = stateStore.recognizedAnimal?.animalType;
                console.log("[CM] Requesting quiz for animal ID:", currentAnimalId, "with difficulty:", difficulty);
                if (!currentAnimalId || !connectionService) {
                    this.speakErrorResponse();
                    return false; 
                }

                const question = await connectionService.sendQuizNextRequest(
                    stateStore.sessionId, 
                    currentAnimalId,  
                    difficulty
                );

                if (question) {
                    chatStore.setActiveQuestion(question);
                    this.speak(question.prompt);
                    if(question.type === "yes_no"){
                        this.speak("Vero o Falso");
                    }
                    else if(question.type === "multiple_choice" && question.choices){
                        for (const choice of question.choices?? []) {
                            this.speak(choice);
                        }
                    }
                } 
                else {
                    chatStore.clearQuiz();
                    this.speakErrorResponse();
                    return false;
                }

            } catch (error) {
                console.error("Errore durante la richiesta del quiz:", error);
                chatStore.clearQuiz();
                this.speakErrorResponse();
                return false;
            }
            return true;
        }

        public async validateQuiz(answer: string): Promise<void> {
            
            const chatStore = useChatStore();

            try {
                console.log("[CM] Validating quiz answer:", answer);
                chatStore.addUserMessage(answer);
                const result = await this.evaluateQuizAnswer(answer);
                console.log("[CM] Quiz validation result:", result);
                if (result && result.feedback) {
                    chatStore.addBotMessage(result.feedback);
                    this.speak(result.feedback);
                    chatStore.clearQuiz();
                } else {
                    console.log("[CM] No feedback received from quiz validation.");
                    this.speakErrorResponse();
                }
                
            } catch (error) {
                console.error("Errore nella validazione del quiz:", error);
                this.speakErrorResponse();
            }
        }

        private async evaluateQuizAnswer(answer: string): Promise<QuizValidationResultDTO | null> {

            const stateStore = useSessionStore();
            const currentAnimalId = stateStore.recognizedAnimal?.animalType;
            const chatStore = useChatStore();
            const activeQuestion = chatStore.activeQuestion;
            
            if (!currentAnimalId) return null;
            const questionId = activeQuestion?.id;
            const prompt = activeQuestion?.prompt;
            //const choices = activeQuestion?.choices;

            if (!questionId || !prompt) return null;
            console.log("[CM] Evaluating quiz answer for question ID:", questionId, "with prompt:", prompt);
            // CASE A: Open-ended question (no choices provided) - delegate validation to the backend
            if (activeQuestion.type === "open_text") {
                const connectionService = useServiceStore().connectionService;
                const result = await connectionService?.sendQuizValidateRequest(
                    stateStore.sessionId,
                    currentAnimalId,
                    questionId,
                    answer,
                    prompt,
                );
                return result ?? null;
            }

            // CASE B: True/False 
            if (activeQuestion.type === "yes_no") {
                console.log("[CM] Evaluating True/False quiz answer. User answer:", answer);
                const correctAnswer = chatStore.activeQuestion?.acceptedAnswer;
                const isCorrect = (answer.toLowerCase() === "vero" && correctAnswer === true) || 
                                (answer.toLowerCase() === "falso" && correctAnswer === false);
                return {
                    correct: isCorrect,
                    score: isCorrect ? 1 : 0,
                    feedback: isCorrect ? "Risposta corretta!" : "Risposta errata, mi dispiace!"
                };
            }

            // CASE C: Multiple Choice (>=2 choices)
            if (activeQuestion.type === "multiple_choice") {
                console.log("[CM] Evaluating multiple-choice quiz answer. User answer:", answer);
                const correctAnswer = chatStore.activeQuestion?.acceptedAnswer;
                const isCorrect = (answer.toLowerCase() === correctAnswer?.toString().toLowerCase());
                return {
                    correct: isCorrect,
                    score: isCorrect ? 1 : 0,
                    feedback: isCorrect ? "Risposta corretta!" : `Risposta errata, mi dispiace! La risposta corretta è: ${correctAnswer}`
                };
            }

            return null;
        }


    /*public async requestQuiz(difficulty: DifficultyLevel): Promise<QuizQuestionDTO  | null> {
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
                const feedback = isCorrect ? "Risposta corretta!" : "Risposta errata, mi dispiace!";
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
                else {                    
                    await this.speakErrorResponse();
                }
                return result;
            }
            else if(choices.length >= 2){
                const correctAnswer = chatStore.activeQuestion?.correctAnswer;
                const isCorrect = (answer.toLowerCase() === correctAnswer?.toLowerCase());
                const feedback = isCorrect ? "Risposta corretta!" : `Risposta errata, mi dispiace! La risposta corretta è: ${correctAnswer}`;
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
                else {                    
                    await this.speakErrorResponse();
                }
                return result;
                
            }
            
            
        } catch (error) {
            console.error("Errore nella validazione del quiz:", error);
            await this.speakErrorResponse();
            return null;
        }
        return null;
    }*/

    async speakErrorResponse() {
        const chatStore = useChatStore();
        chatStore.addErrorResponse();
        await this.speak(SOMETHING_BAD_IN_BACKEND);
    }

    private async speak(text: string): Promise<void> {
        const ttsService = useServiceStore().ttsService
        await ttsService?.speak(text);
    }

    public async stopSpeaking(): Promise<void> {
        const ttsService = useServiceStore().ttsService
        await ttsService?.stopSpeaking();
    }       
}