import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ConversationManager } from '@/modules/ConversationMgr';

export const useManagerStore = defineStore('manager', () => {
  const conversationManager = ref<ConversationManager | null>(null);

  function initConversationManager() {
    if (!conversationManager.value) {
      conversationManager.value = new ConversationManager();
    }
  }

  return {
    conversationManager,
    initConversationManager
  };
});