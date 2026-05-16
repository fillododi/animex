// Here there is the class Message
export class Message {
    constructor(public content: string, 
        public sender: string, 
        public timestamp: Date) 
        {}
    // the method getContent returns the content of the message
    getContent(): string {
        return this.content;
    }
    // the method getSender returns the sender of the message
    getSender(): string {
        return this.sender;
    }
    // the method getTimestamp returns the timestamp of the message
    getTimestamp(): Date {
        return this.timestamp;
        }
    setContent(content: string): void {
        this.content = content;
    }
    setSender(sender: string): void {
        this.sender = sender;
    }
    setTimestamp(timestamp: Date): void {
        this.timestamp = timestamp;
    }
}