import { EMPTY_INPUT_ANIMAL_TEXT, SOMETHING_BAD_IN_BACKEND } from '@/utility/constants';
import { useServiceStore } from '@/stores/serviceStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useChatStore } from '@/stores/chatStore';
import type { DifficultyLevel, QuizValidationResultDTO } from '@/utility/Types';
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
                    this.speakErrorResponse();
                    return false;
                } 
                else{
                    chatStore.addBotMessage(response.answer);
                    this.speak(response.answer);
                }
            }
            
        } catch (error) {
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
                if (!currentAnimalId || !connectionService) {
                    this.speakErrorResponse();
                    return false; 
                }
                const question = await connectionService.sendQuizNextRequest(
                    stateStore.sessionId, 
                    currentAnimalId,  
                    difficulty,
                    chatStore.getOldQuestions().length > 0 ? chatStore.getOldQuestions() : [],
                    ["yes_no", "multiple_choice"]
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
                chatStore.clearQuiz();
                this.speakErrorResponse();
                return false;
            }
            return true;
        }

        public async validateQuiz(answer: string): Promise<void> {
            
            const chatStore = useChatStore();

            try {
                chatStore.addUserMessage(answer);
                const result = await this.evaluateQuizAnswer(answer);
                if (result && result.feedback) {
                    chatStore.addBotMessage(result.feedback);
                    this.speak(result.feedback);
                    chatStore.clearQuiz();
                } else {
                    this.speakErrorResponse();
                }
                
            } catch{
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

            if (!questionId || !prompt) return null;
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
                const correctAnswers = chatStore.activeQuestion?.acceptedAnswers?.map(ans => ans.toLowerCase());
                const isCorrect = correctAnswers?.includes(answer.toLowerCase()) ?? false;
                return {
                    correct: isCorrect,
                    score: isCorrect ? 1 : 0,
                    feedback: isCorrect ? activeQuestion?.feedback : "Risposta errata, mi dispiace!"
                };
            }

            // CASE C: Multiple Choice (>=2 choices)
            if (activeQuestion.type === "multiple_choice") {
                const correctAnswers = chatStore.activeQuestion?.acceptedAnswers?.map(ans => ans.toLowerCase());
                const isCorrect = correctAnswers?.includes(answer.toLowerCase()) ?? false;
                return {
                    correct: isCorrect,
                    score: isCorrect ? 1 : 0,
                    feedback: isCorrect ? activeQuestion?.feedback : "Risposta errata, mi dispiace!"
                };
            }

            return null;
        }

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