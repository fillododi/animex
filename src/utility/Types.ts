export interface ChatUIState {
  isRecording: boolean;
  isMicReady: boolean;
  isProcessing: boolean;
  inputText: string;
  statusMessage?: string;
}