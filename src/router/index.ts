import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

import HomePage from '../views/HomePage.vue';
import ChatView from '../views/ChatBot.vue';
import AugmentedReality from '@/views/AugmentedReality.vue';
import RecogView from '../views/RecognitionPage.vue';
import MainLayout from '../views/MainLayout.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/main'
  },
  {
    path: '/main',
    name: 'MainLayout',
    component: MainLayout
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatView
  },
  {
    path: '/ar',
    name: 'AR',
    component: AugmentedReality
  },
  {
    path: '/cam',
    name: 'RecognitionPage',
    component: RecogView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
