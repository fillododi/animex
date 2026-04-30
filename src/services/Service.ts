export interface Service {
    /**
     * Activates the service.
     * @requires The service to not be currently running. (this.isActive() == false)
     */
    start(): void
    /**
     * Deactivates the service.
     * @requires The service to be currently running. (this.isActive() == true)
     */
    stop(): void
    /**
     * @returns true if the service is currently running.
     */
    isActive(): boolean
}