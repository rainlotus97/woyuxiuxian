<template>
  <BaseModal
    :visible="!!announcement"
    :title="announcement?.title || '道友留步'"
    @close="closeAnnouncement"
  >
    <div class="announcement-content">
      <p
        v-for="(line, i) in visibleContent"
        :key="i"
        class="announcement-line"
      >
        {{ line }}
      </p>
    </div>
    <template #footer>
      <GameButton v-if="!allShown" @click="showNext">继续阅读</GameButton>
      <GameButton v-else @click="closeAnnouncement">关闭</GameButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useModal } from '@/composables/useModal'
import BaseModal from './BaseModal.vue'
import GameButton from '@/components/common/GameButton.vue'

const { currentAnnouncement: announcement, closeAnnouncement } = useModal()

const lineIndex = ref(1)

const allShown = computed(() => {
  if (!announcement.value) return true
  return lineIndex.value >= announcement.value.content.length
})

const visibleContent = computed(() => {
  if (!announcement.value) return []
  return announcement.value.content.slice(0, lineIndex.value)
})

const showNext = () => {
  if (announcement.value && lineIndex.value < announcement.value.content.length) {
    lineIndex.value++
  }
}

watch(announcement, (val) => {
  if (val) {
    lineIndex.value = 1
  }
})
</script>

<style scoped>
.announcement-content {
  min-height: 80px;
}

.announcement-line {
  font-size: 0.875rem;
  line-height: 1.8;
  margin-bottom: 8px;
  color: #e8e4d8;
}
</style>
