// Here is the class Chat that represent a chat between a user and a bot
import { Message } from "./message";

export class Chat {
    private messages: Message[] = [];
    constructor(public userId: string,
        public chatId: string
    ) {
    }
    // the method addMessage adds a message to the chat
    addMessage(message: Message): void {
        this.messages.push(message);
    }

    // the method getMessages returns all the messages in the chat
    getMessages(): Message[] {
        return this.messages;
    }

    // the method getUserId returns the user id of the chat
    getUserId(): string {
        return this.userId;
    }
    
    // the method getChatId returns the chat id of the chat
    getOrCreateChatId(): string {
        return this.chatId;
    }
}