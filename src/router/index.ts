import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

import ChatView from '../views/ChatBot.vue';
import VirtualReality from '@/views/VirtualReality.vue';
import RecogView from '../views/RecognitionPage.vue';
import MainLayout from '../views/MainLayout.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/main/scanner'
  },
  {
    path: '/main',
    name: 'MainLayout',
    component: MainLayout,
    
    children: [
      {
        path: '',
        redirect: '/main/scanner'
      },
      {
        path: 'chat', 
        name: 'Chat',
        component: ChatView
      },
      {
        path: 'scanner', 
        name: 'RecognitionPage',
        component: RecogView
      },
      
      {
        path: 'vr',
        name: 'VR',
        component: VirtualReality
      }
      
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
