<template>
  <TransitionGroup name="story-toast" tag="div" class="story-notification-stack">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="story-notification"
      :class="notification.type"
    >
      {{ notification.message }}
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import type { StoryNotification } from '@/story/storyStore'

defineProps<{
  notifications: StoryNotification[]
}>()
</script>

<style scoped>
.story-notification-stack {
  position: fixed;
  right: 18px;
  bottom: 86px;
  z-index: 220;
  display: grid;
  gap: 10px;
  width: min(320px, calc(100vw - 32px));
}

.story-notification {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(109, 134, 121, 0.18);
  background: rgba(255, 255, 255, 0.94);
  color: #36514b;
  box-shadow: 0 16px 34px rgba(73, 103, 94, 0.18);
  font-size: 13px;
  line-height: 1.5;
}

.story-notification.success {
  border-color: rgba(93, 151, 96, 0.28);
  color: #2f6939;
}

.story-notification.warning {
  border-color: rgba(188, 138, 52, 0.34);
  color: #8a5d22;
}

.story-notification.error {
  border-color: rgba(188, 78, 73, 0.34);
  color: #8c3f3a;
}

.story-toast-enter-active,
.story-toast-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.story-toast-enter-from,
.story-toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
