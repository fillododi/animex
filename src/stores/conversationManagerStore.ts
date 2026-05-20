import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useChatStore } from '@/stores/chatStore'; 

export const useConversationManagerStore = defineStore('conversationManager', () => {
    const sessionId = ref(crypto.randomUUID());
    const currentAnimalId = ref<string | null>(null);
    
    function updateRecognizedAnimal(newAnimalId: string) {
        if (currentAnimalId.value !== newAnimalId) {
            currentAnimalId.value = newAnimalId;
            sessionId.value = crypto.randomUUID();
            const chatStore = useChatStore();
            chatStore.clearMessages();   
        }    
    }

    return {
        sessionId,
        currentAnimalId,         
        updateRecognizedAnimal,  
    };
});