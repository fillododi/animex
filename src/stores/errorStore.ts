import { defineStore } from "pinia"
import type { RecognitionError } from "@/errors/RecognitionErrors"

interface RecognitionAlertState {
    activeLoopError: RecognitionError | null
}

/**
 * Global state for errors that interrupt an already started recognition loop
 * (camera or connection lost during the loop).
 * 
 * Why a separate store and not a simple throw/catch like for startup errors? 
 * Because snapshotLoop() is invoked by a setInterval internal to RecognitionManager, 
 * not by a click handler on RecognitionPage.vue: there is no "caller" in the UI ready 
 * to catch it, nor a way to know if the user is still on that page when the error occurs.
 * 
 * By writing the error here instead, a component mounted only once at the root of the app 
 * (see GlobalRecognitionAlert.vue) can observe it reactively and show it, regardless of 
 * which page/tab is active at that moment.
 */
export const useErrorStore = defineStore("recognitionAlert", {
    state: (): RecognitionAlertState => ({
        activeLoopError: null
    }),
    actions: {
        reportLoopError(error: RecognitionError) {
            if (this.activeLoopError !== null) return;
            this.activeLoopError = error
        },
        clearLoopError() {
            this.activeLoopError = null
        }
    }
})
