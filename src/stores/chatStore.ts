import { defineStore } from 'pinia';
import { ref, markRaw } from 'vue';
import { Message } from '@/utility/message';
import { getOrCreateUserId } from '@/utility/user';

export const useChatStore = defineStore('chat', () => {
  const myUserId = ref(getOrCreateUserId());
  const messages = ref<Message[]>([]); 

  function addUserMessage(text: string) {
    // Use markRaw to prevent Vue from making the Message instance reactive
    const userMsg = markRaw(new Message(text, myUserId.value, new Date()));
    messages.value.push(userMsg);
  }

  function addBotMessage(text: string) {
    const botMsg = markRaw(new Message(text, "bot_animal", new Date()));
    messages.value.push(botMsg);
  }

  return {
    myUserId,
    messages,
    addUserMessage,
    addBotMessage
  };
});