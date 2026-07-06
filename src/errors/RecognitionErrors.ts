/**
 * Error hierarchy for the recognition startup flow
 * (camera acquisition + connection health-check).
 *
 * Goals:
 *  - Allow callers to use `instanceof` instead of checking
 *    strings like `error.name` / `error.message`.
 *  - Have a code-readable `code` (useful for logs/analytics).
 *  - Separate the technical cause (`cause`) from the message shown
 *    to the user, which remains a responsibility of the UI layer
 *    (see RecognitionPage.vue -> describeRecognitionError).
 */

export type RecognitionErrorCode =
    | "CAMERA_PERMISSION_DENIED"
    | "CAMERA_START_ABORTED"
    | "CAMERA_UNAVAILABLE"
    | "CONNECTION_TIMEOUT"
    | "CONNECTION_UNAVAILABLE"
    | "CONNECTION_LOST"
    | "SERVER_UNHEALTHY"

export abstract class RecognitionError extends Error {
    abstract readonly code: RecognitionErrorCode
    readonly cause?: unknown

    protected constructor(message: string, cause?: unknown) {
        super(message)
        this.name = this.constructor.name
        this.cause = cause
        // Without this line, on some compilation targets (e.g., ES5)
        // the prototype chain breaks when extending "Error" and
        // "instanceof CameraUnavailableError" might always evaluate to
        // false. It costs nothing and avoids a very insidious bug to track down. 
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

/**
 * Camera startup was aborted (e.g., the user navigated
 * away or clicked again while the start was in progress). It is not a real
 * error to show to the user.
 */
export class CameraPermissionDeniedError extends RecognitionError {
    readonly code = "CAMERA_PERMISSION_DENIED" as const
    constructor(cause?: unknown) {
        super("Permesso fotocamera negato", cause)
    }
}

/**
 * The camera is unusable for a reason other than permission
 * denied (in use by another app, missing hardware, generic error...).
 */
export class CameraStartAbortedError extends RecognitionError {
    readonly code = "CAMERA_START_ABORTED" as const
    constructor(cause?: unknown) {
        super("Avvio fotocamera interrotto", cause)
    }
}

/**
 * La fotocamera non è utilizzabile per un motivo diverso dal permesso
 * negato (in uso da un'altra app, hardware assente, errore generico...).
 */
export class CameraUnavailableError extends RecognitionError {
    readonly code = "CAMERA_UNAVAILABLE" as const
    constructor(message: string, cause?: unknown) {
        super(message, cause)
    }
}

/** The health-check did not respond within the maximum allowed time. */
export class ConnectionTimeoutError extends RecognitionError {
    readonly code = "CONNECTION_TIMEOUT" as const
    constructor(timeoutMs: number, cause?: unknown) {
        super(`Il server non ha risposto entro ${timeoutMs}ms`, cause)
    }
}

/**
 * Unable to properly contact the server (network down, host
 * down, HTTP status not ok, invalid response...).
 */
export class ConnectionUnavailableError extends RecognitionError {
    readonly code = "CONNECTION_UNAVAILABLE" as const
    constructor(message: string = "Impossibile contattare il server", cause?: unknown) {
        super(message, cause)
    }
}

/**
 * The connection was established successfully (the initial
 * health-check succeeded, the loop had already started) but dropped
 * during recognition: network lost mid-session, host
 * became unreachable, request rejected by the server.
 *
 * Distinct from ConnectionUnavailableError because the correct message
 * is different: here the user must be told that something that was
 * working has stopped, not that it never managed to
 * start.
 */
export class ConnectionLostError extends RecognitionError {
    readonly code = "CONNECTION_LOST" as const
    constructor(message: string = "Connessione al server persa durante il riconoscimento", cause?: unknown) {
        super(message, cause)
    }
}

/**
 * The server responded correctly but indicates a not "ok" status
 * (e.g., maintenance, unavailable external dependency).
 */
export class ServerUnhealthyError extends RecognitionError {
    readonly code = "SERVER_UNHEALTHY" as const
    constructor(cause?: unknown) {
        super("Il server ha risposto, ma segnala uno stato non disponibile", cause)
    }
}

/**
 * Normalizes an untyped error coming from the CameraService
 * (whose implementation we do not control) into a RecognitionError,
 * so callers of startRecognitionLoop() only have to handle a single type of
 * exception instead of having to remember which services throw what.
 */
export function normalizeCameraError(err: unknown): RecognitionError {
    if (err instanceof RecognitionError) return err
    if (err instanceof DOMException && err.name === "NotAllowedError") {
        return new CameraPermissionDeniedError(err)
    }
    if (err instanceof DOMException && err.name === "AbortError") {
        return new CameraStartAbortedError(err)
    }
    const message = err instanceof Error ? err.message : String(err)
    return new CameraUnavailableError(message, err)
}

/**
 * Normalizes an untyped error coming from the ConnectionService
 * (whose implementation we do not control) into a RecognitionError.
 * It should be used for errors that arrive AFTER the connection was already
 * active (i.e., inside the loop), not for those of the initial health-check
 * that ConnectionService should already throw as
 * ConnectionTimeoutError / ConnectionUnavailableError / ServerUnhealthyError.
 */
export function normalizeConnectionError(err: unknown): RecognitionError {
    if (err instanceof RecognitionError) return err
    const message = err instanceof Error ? err.message : String(err)
    return new ConnectionLostError(message, err)
}
