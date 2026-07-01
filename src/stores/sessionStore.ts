import type { AnimalData } from '@/utility/AnimalData';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useChatStore } from './chatStore';

export const useSessionStore = defineStore('session', () => {
  
  const recognizedAnimal = ref<AnimalData | null>(null);
  const multipleAnimals = ref<AnimalData[] | null>(null);
  const sessionId = ref(crypto.randomUUID());

  function updateRecognizedAnimal(newAnimal: AnimalData) {
    if (recognizedAnimal.value?.animalType !== newAnimal.animalType){
      recognizedAnimal.value = newAnimal;
      sessionId.value = crypto.randomUUID();
      const chatStore = useChatStore();
      chatStore.clearMessages();
      chatStore.clearQuiz();
    }
    if(multipleAnimals.value) {
      multipleAnimals.value = null;
    }
  }  

  function multipleAnimalsDetected(newAnimals: AnimalData[]) {
    if(!recognizedAnimal.value) multipleAnimals.value = newAnimals;
  }
    
  function getAnimalType(){
    return recognizedAnimal.value?.animalType;
  }

  return {
    recognizedAnimal,
    multipleAnimals,
    sessionId,
    updateRecognizedAnimal,
    multipleAnimalsDetected,
    getAnimalType
  };
});