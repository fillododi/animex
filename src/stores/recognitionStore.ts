import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getOrCreateUserId } from '@/utility/user';
import { RecognitionData } from '@/utility/RecognitionData';

export const useRecognitionStore = defineStore('recognition', () => {
  const myUserId = ref(getOrCreateUserId());
  const recognitions = ref<RecognitionData[]>([]);
  const latestRecognition = ref<RecognitionData>()

  function addRecognition(rec: RecognitionData) {
    recognitions.value.push(rec);
    latestRecognition.value = rec
  }

  return {
    myUserId,
    recognitions,
    latestRecognition,
    addRecognition
  };
});