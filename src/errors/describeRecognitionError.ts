import {
    CameraUnavailableError,
    ConnectionLostError,
    ConnectionTimeoutError,
    ConnectionUnavailableError,
    ServerUnhealthyError
} from '@/errors/RecognitionErrors'

/**
 * Translate a RecognitionError (or an unexpected error) into a message to 
 * be shown to the user. A single point where the text is decided: 
 * it used to live only inside RecognitionPage.vue, moved here because now 
 * it is also needed by GlobalRecognitionAlert.vue, so that the startup alert 
 * and the one that interrupts an already started loop tell the same thing with 
 * the same words.
 */

/**
 * 
 * @param error The error to be described
 * @returns An object with the properties `header` and `message` to be shown
 *          to the user.
 */

export const describeRecognitionError = (error: unknown): { header: string; message: string } => {
    if (error instanceof ConnectionTimeoutError) {
        return {
            header: 'Server non raggiungibile',
            message: 'Il server sta impiegando troppo tempo a rispondere. Controlla la connessione e riprova.'
        }
    }
    if (error instanceof ConnectionLostError) {
        return {
            header: 'Connessione persa',
            message: 'La connessione al server si e\' interrotta durante il riconoscimento. Verifica la rete e riprova.'
        }
    }
    if (error instanceof ServerUnhealthyError) {
        return {
            header: 'Servizio non disponibile',
            message: 'Il servizio di riconoscimento non e\' al momento disponibile. Riprova piu\' tardi.'
        }
    }
    if (error instanceof ConnectionUnavailableError) {
        return {
            header: 'Connessione assente',
            message: 'Impossibile contattare il server. Verifica la connessione a Internet.'
        }
    }
    if (error instanceof CameraUnavailableError) {
        return {
            header: 'Fotocamera non disponibile',
            message: `Temporaneo inutilizzo della fotocamera. Dettagli: ${error.message}`
        }
    }
    return {
        header: 'Errore imprevisto',
        message: error instanceof Error ? error.message : 'Si e\' verificato un errore sconosciuto.'
    }
}
