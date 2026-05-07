export interface EventListener<TArg> {
    onEvent(arg: TArg): void
}

export class Event<TArg> {
    private listeners: EventListener<TArg>[] = []

    /**
     * Subscribes a listener to the event.
     * @param l The listener to subscribe.
     */
    subscribe(l: EventListener<TArg>) {
        if (this.listeners.includes(l)) return
        this.listeners.push(l)
    }

    /**
     * Unsubscribes a listener from the event.
     * @param l The listener to unsubscribe.
     */
    unsubscribe(l: EventListener<TArg>) {
        if (!this.listeners.includes(l)) return
        this.listeners = this.listeners.splice(this.listeners.indexOf(l), 1)
    }

    /**
     * Calls the onEvent method on all listeners.
     * @see {@link EventListener.onEvent()} for the method call.
     * @param arg The argument to pass to the listeners.
     */
    invoke(arg: TArg) {
        this.listeners.forEach(l => l.onEvent(arg));
    }
}