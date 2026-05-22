import type { CHAT_STATUS } from "./constants";

export interface ChatUIState {
  isRecording: boolean;
  isMicReady: boolean;
  isProcessing: boolean;
  inputText: string;
  statusMessage?: string;
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

export type Quizstatus = "active" | "inactive";

export type QuizQuestionDTO = {
    id: string;
    type: string;
    prompt: string;
    choices: string[];
    correctAnswer?: string;
    trueOrFalseAnswer?: boolean;
    suggest?: string;
}

export type DifficultyLevel = "easy" | "medium" ;

export type QuizValidationResultDTO = {
    correct: boolean;
    score: number;
    feedback: string;
    //nextAction: "nextQuestion" | "retry" | "endQuiz";
}