import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'menu',
      component: () => import('@/views/MainMenu.vue')
    },
    {
      path: '/game',
      component: () => import('@/views/GameLayout.vue'),
      redirect: '/game/cultivation',
      children: [
        {
          path: 'cultivation',
          name: 'cultivation',
          component: () => import('@/views/game/CultivationView.vue')
        },
        {
          path: 'adventure',
          name: 'adventure',
          component: () => import('@/views/game/AdventureView.vue')
        },
        {
          path: 'inventory',
          name: 'inventory',
          component: () => import('@/views/game/InventoryView.vue')
        },
        {
          path: 'skills',
          name: 'skills',
          component: () => import('@/views/game/SkillView.vue')
        },
        {
          path: 'shop',
          name: 'shop',
          component: () => import('@/views/game/ShopView.vue')
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/game/ProfileView.vue')
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/game/SettingsView.vue')
        },
        {
          path: 'battle',
          name: 'battle',
          component: () => import('@/views/game/BattleView.vue')
        }
      ]
    }
  ]
})

export default router
