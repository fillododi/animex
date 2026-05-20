import type { AnimalData } from '@/utility/AnimalData';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useChatStore } from './chatStore';

export const useSessionStore = defineStore('session', () => {
  
  const recognizedAnimal = ref<AnimalData | null>(null);
  const sessionId = ref(crypto.randomUUID());


  function updateRecognizedAnimal(newAnimal: AnimalData) {
    recognizedAnimal.value = newAnimal;
    const chatStore = useChatStore();
    chatStore.clearMessages();
  }  
    
  function clearSession() {
    recognizedAnimal.value = null;
    sessionId.value = crypto.randomUUID();
    const chatStore = useChatStore();
    chatStore.clearMessages();
  }
  
  function getAnimalType(){
    return recognizedAnimal.value?.animalType;
  }

  return {
    recognizedAnimal,
    sessionId,
    updateRecognizedAnimal,
    clearSession,
    getAnimalType
  };
});