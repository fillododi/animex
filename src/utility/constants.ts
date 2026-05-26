// Labels for localStorage
//export const STORAGE_USER_KEY = 'animex_user_id';
//export const STORAGE_CHAT_KEY = 'animex_chat_id';
export const EMPTY_INPUT_ANIMAL_TEXT = "Scusa umano, non ho sentito bene. Puoi ripetere?";
//Labels for answer an empty user input
export const SOMETHING_BAD_IN_BACKEND = "Ops, sembra che ci sia un problema con il mio cervello elettronico. Riprova tra poco!";
// Labels for chat status
export const CHAT_STATUS = {
  IDLE: "Pronto ad ascoltare",
  INITIALIZING: "⏳ Inizializzazione microfono...",
  RECORDING: "🎤 Microfono attivo, parla ora!",
  THINKING: "⚙️ Sto pensando...",
  SUCCESS: "✅ Risposta ricevuta!",
  DENIED_SOFT: "❌ Permesso negato. Scrivi il messaggio usando la tastiera oppure clicca su 'Registra' e concedi l'accesso al microfono.",
  DENIED_HARD: "⚠️  In attesa dei permessi del microfono",
  SETTINGS_ERROR: "❌ Errore nell'apertura delle impostazioni.",
  QUIZ_LOADING: "⏳ Caricamento quiz in corso...",
  QUIZ_LOADED: "✅ Quiz pronto! Scegli la risposta corretta.",
  NO_QUIZ_AVAILABLE: "❌ Nessun quiz disponibile per questo animale."
} as const;
// Labels for active quiz status
export const QUIZ_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;