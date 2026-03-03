<template>
  <RouterView />
  <!-- Toast 容器 -->
  <ToastContainer />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import ToastContainer from '@/components/toast/ToastContainer.vue'

onMounted(() => {
  // 生产环境禁止选中和复制
  if (!import.meta.env.DEV) {
    document.body.classList.add('no-select')
  }
  // 背景音乐由各个页面自行管理，不在 App 层面自动播放
})
</script>
