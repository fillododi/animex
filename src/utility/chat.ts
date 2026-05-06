// Here is the class Chat that represent a chat between a user and a bot
import { Message } from "./message";

export class Chat {
    private messages: Message[] = [];
    constructor(public userId: string) {
        this.userId = userId;
    }
    // the method addMessage adds a message to the chat
    addMessage(message: Message): void {
        this.messages.push(message);
    }
    // the method getMessages returns all the messages in the chat
    getMessages(): Message[] {
        return this.messages;
    }
}