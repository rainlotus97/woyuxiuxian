import { createRouter, createWebHistory } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore'

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
      meta: { layoutMode: 'normal' },
      redirect: '/game/cultivation',
      children: [
        {
          path: 'cultivation',
          name: 'cultivation',
          component: () => import('@/views/game/CultivationView.vue'),
          meta: { layoutMode: 'normal' }
        },
        {
          path: 'adventure',
          name: 'adventure',
          component: () => import('@/views/game/AdventureView.vue'),
          meta: { layoutMode: 'normal' }
        },
        {
          path: 'inventory',
          name: 'inventory',
          component: () => import('@/views/game/InventoryView.vue'),
          meta: { layoutMode: 'normal' }
        },
        {
          path: 'skills',
          name: 'skills',
          component: () => import('@/views/game/SkillView.vue'),
          meta: { layoutMode: 'normal' }
        },
        {
          path: 'shop',
          name: 'shop',
          component: () => import('@/views/game/ShopView.vue'),
          meta: { layoutMode: 'normal' }
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/game/ProfileView.vue'),
          meta: { layoutMode: 'normal' }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/game/SettingsView.vue'),
          meta: { layoutMode: 'normal' }
        },
        // 新增页面路由
        {
          path: 'map',
          name: 'map',
          component: () => import('@/views/game/MapView.vue'),
          meta: { layoutMode: 'normal' }
        },
        {
          path: 'sect',
          name: 'sect',
          component: () => import('@/views/game/SectView.vue'),
          meta: { layoutMode: 'normal' }
        },
        {
          path: 'companion',
          name: 'companion',
          component: () => import('@/views/game/CompanionView.vue'),
          meta: { layoutMode: 'normal' }
        },
        // 故事系统入口
        {
          path: 'story',
          name: 'story',
          component: () => import('@/views/game/StoryView.vue'),
          meta: { layoutMode: 'immersive' }
        }
      ]
    },
    // 战斗页面独立，全屏显示
    {
      path: '/game/battle',
      name: 'battle',
      component: () => import('@/views/game/BattleView.vue'),
      meta: { fullScreen: true, layoutMode: 'battle' }
    }
  ]
})

router.beforeEach((to) => {
  if (!to.path.startsWith('/game')) return true

  const playerStore = usePlayerStore()
  if (!playerStore.created) {
    return { path: '/', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
