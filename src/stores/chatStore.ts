import { defineStore } from 'pinia';
import { ref, markRaw } from 'vue';
import { type Message, type MessageRole, type QuizQuestionDTO } from '@/utility/Types';
import { EMPTY_INPUT_ANIMAL_TEXT, SOMETHING_BAD_IN_BACKEND } from '@/utility/constants';

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([]); 
  const activeQuestion = ref<QuizQuestionDTO | null>(null);
  const oldQuestions = ref<QuizQuestionDTO[]>([]);

  function addUserMessage(text: string) {
    // Use markRaw to prevent Vue from making the Message instance reactive
    const userMsg = markRaw({ content: text, role: "user" as MessageRole, timestamp: new Date(), ok: false });
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

  function setActiveQuestion(question: QuizQuestionDTO) {
        activeQuestion.value = question;
    }


  function clearQuiz() {
    if(activeQuestion.value){
      oldQuestions.value.push(activeQuestion.value);
    }
    activeQuestion.value = null;
  }

  function setOk(ok: boolean) {
    if(messages.value.length > 0){
      const lastMessage = messages.value[messages.value.length - 1];
      if(lastMessage?.role === "user"){
        lastMessage.ok = ok;
      }
    }
  }

  return {
    messages,
    activeQuestion,
    addUserMessage,
    addBotMessage,
    addEmptyResponse,
    addErrorResponse,
    clearMessages,
    setOk,
    setActiveQuestion,
    clearQuiz
  };
});