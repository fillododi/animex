export interface Service {
    /**
     * Activates the service.
     * @throws An Error if the service is currently active.
     */
    start(): void
    /**
     * Deactivates the service.
     * @throws An Error if the service is currently inactive.
     */
    stop(): void
    /**
     * @returns true if the service is currently running.
     */
    isActive(): boolean
}