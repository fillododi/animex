import type { CHAT_STATUS } from "./constants";

export interface ChatUIState {
  isRecording: boolean;
  isMicReady: boolean;
  isProcessing: boolean;
  inputText: string;
  statusMessage?: string;
}

export type ChatStatus = typeof CHAT_STATUS[keyof typeof CHAT_STATUS] | `Errore: ${string}`;