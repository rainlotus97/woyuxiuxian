<template>
  <RouterView />
  <!-- Toast 容器 -->
  <ToastContainer />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import ToastContainer from '@/components/toast/ToastContainer.vue'
import { useAudio } from '@/composables/useAudio'

const { startBgm } = useAudio()

onMounted(() => {
  // 生产环境禁止选中和复制
  if (!import.meta.env.DEV) {
    document.body.classList.add('no-select')
  }
  // 尝试启动背景音乐（需要用户首次交互后才能播放）
  startBgm()
})
</script>
