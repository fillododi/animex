import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

import HomePage from '../views/HomePage.vue';
import ChatView from '../views/ChatBot.vue';
import RecogView from '../views/RecognitionPage.vue';
import MainLayout from '../views/MainLayout.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/main/scanner'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
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
      // IN FUTURE: We can add an AR view route here, but it's currently commented out for now.
      /*
      {
        path: 'ar',
        name: 'ARView',
        component: () => import('../views/ARView.vue')
      }
      */
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
