export interface EventListener<TArg> {
    onEvent(arg: TArg): void
}

export class Event<TArg> {
    private listeners: EventListener<TArg>[] = []

    subscribe(l: EventListener<TArg>): void {
        if (this.listeners.includes(l)) return
        this.listeners.push(l)
    }

    unsubscribe(l: EventListener<TArg>): void {
        if (!this.listeners.includes(l)) return
        this.listeners = this.listeners.splice(this.listeners.indexOf(l), 1)
    }

    invoke(arg: TArg): void {
        this.listeners.forEach(l => l.onEvent(arg));
    }
}