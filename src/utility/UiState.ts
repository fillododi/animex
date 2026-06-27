import { CHAT_STATUS } from "./constants";
import { reactive } from "vue";
export class UiState {
    
    private isRecording: boolean = false;
    private isMicReady: boolean = false;
    private isProcessing: boolean = false;
    private inputText: string = "";
    
    private statusMessage: typeof CHAT_STATUS[keyof typeof CHAT_STATUS] | `Errore: ${string}` | undefined = CHAT_STATUS.IDLE;
    
    private quizStatus: boolean = false;
    private showQuizOptions: boolean = false;
    private usingKeyboard: boolean = false;

    constructor() {}

    public setRecording(isRecording: boolean): void {
        this.isRecording = isRecording;
    }
    public getRecording(): boolean {
        return this.isRecording;
    }
    public setMicReady(isMicReady: boolean): void {
        this.isMicReady = isMicReady;
    }
    public getMicReady(): boolean {
        return this.isMicReady;
    }
    public setProcessing(isProcessing: boolean): void {
        this.isProcessing = isProcessing;
    }
    public getProcessing(): boolean {
        return this.isProcessing;
    }
    public setInputText(inputText: string): void {
        this.inputText = inputText;
    }
    public getInputText(): string {
        return this.inputText;
    }
    public setStatusMessage(statusMessage: typeof CHAT_STATUS[keyof typeof CHAT_STATUS] | `Errore: ${string}` | undefined): void {
        this.statusMessage = statusMessage;
    }
    public getStatusMessage(): typeof CHAT_STATUS[keyof typeof CHAT_STATUS] | `Errore: ${string}` | undefined {
        return this.statusMessage;
    }
    public setQuizStatus(quizStatus: boolean): void {
        this.quizStatus = quizStatus;
    }
    public getQuizStatus(): boolean {
        return this.quizStatus;
    }
    public setShowQuizOptions(showQuizOptions: boolean): void {
        this.showQuizOptions = showQuizOptions;
    }
    public getShowQuizOptions(): boolean {
        return this.showQuizOptions;
    }
    public setUsingKeyboard(usingKeyboard: boolean): void {
        this.usingKeyboard = usingKeyboard;
    }
    public getUsingKeyboard(): boolean {
        return this.usingKeyboard;
    }
}
export const globalUiState = reactive(new UiState());