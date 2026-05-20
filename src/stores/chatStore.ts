import { defineStore } from 'pinia';
import { ref, markRaw } from 'vue';
import { type Message, type MessageRole } from '@/utility/Types';
import { EMPTY_INPUT_ANIMAL_TEXT, SOMETHING_BAD_IN_BACKEND } from '@/utility/constants';

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([]); 

  function addUserMessage(text: string) {
    // Use markRaw to prevent Vue from making the Message instance reactive
    const userMsg = markRaw({ content: text, role: "user" as MessageRole, timestamp: new Date(), ok: true });
    messages.value.push(userMsg);
  }

  function addBotMessage(text: string) {
    const botMsg = markRaw({ content: text, role: "model" as MessageRole, timestamp: new Date(), ok: true });
    messages.value.push(botMsg);
  }

  function addEmptyResponse() {
    const userMsg = markRaw({ content: EMPTY_INPUT_ANIMAL_TEXT, role: "model" as MessageRole, timestamp: new Date(), ok: false });
    messages.value.push(userMsg);
  }

  function addErrorResponse() {
    const userMsg = markRaw({ content: SOMETHING_BAD_IN_BACKEND, role: "model" as MessageRole, timestamp: new Date(), ok: false });
    messages.value.push(userMsg);
  }

  function clearMessages() {
    messages.value = [];
  }

  return {
    messages,
    addUserMessage,
    addBotMessage,
    addEmptyResponse,
    addErrorResponse,
    clearMessages
  };
});