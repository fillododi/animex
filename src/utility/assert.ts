/**
 * Asserts a given condition to be true: if it is, nothing happens, if it's not, an Error will be thrown. After this is called, the condition is guaranteed to be true.
 * @param condition the condition to verify
 * @param message message to output in case an Error is thrown
 */
export function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        throw Error(message);
    }
}