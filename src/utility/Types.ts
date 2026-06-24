import type { CHAT_STATUS } from "./constants";

export interface ChatUIState {
  isRecording: boolean;
  isMicReady: boolean;
  isProcessing: boolean;
  inputText: string;
  statusMessage?: string;
  quizStatus: boolean;
  showQuizOptions: boolean;
}

export type ChatStatus = typeof CHAT_STATUS[keyof typeof CHAT_STATUS] | `Errore: ${string}`;

export type RecognitionStatus = "LOW_CONFIDENCE" | "AMBIGUOUS" | "MATCHED_LOW_CERTAINTY" | `MATCHED`;

export type BoundingPoly = {
  vertices?: { x: number; y: number }[];
  normalizedVertices?: { x: number; y: number }[];
}

export type RecognitionDTO = {
  status: RecognitionStatus;
  selectedAnimal: {
    id: string;
    displayName: string;
    boundingPoly: BoundingPoly | undefined;
  }
}
export type MessageRole = "user" | "model";

export type Message = {
    content: string;
    role: MessageRole;
    timestamp: Date;
    ok: boolean;
};

export type QuizQuestionDTO = {
    id: string;
    type: QuizType;
    prompt: string;
    choices?: string[];
    acceptedAnswers?: string[];
    feedback: string;
    habitatRelated: boolean;
}

export type DifficultyLevel = "easy" | "medium" ;
export type QuizType = "yes_no" | "multiple_choice" | "open_text";

export type QuizValidationResultDTO = {
    correct: boolean;
    score: number;
    feedback: string;
}
// Copied from backend
export type ChatDTO = {
    answer: string,
    animalId: string,
    source: ChatSource,
    safety: {
        filtered: boolean,
        reason?: string
    },
    suggestedActions: ChatSuggestedAction[],
    fallbackReason?: string
}

export type ChatSource = "gemini" | "fallback"

export type ChatSuggestedAction = "showHabitat" | "askQuiz" | "useTextInput"