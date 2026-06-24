import { ref, computed } from 'vue'

// 公告模态框状态
interface Announcement {
  title: string
  content: string[]
}

const currentAnnouncement = ref<Announcement | null>(null)

// 物品获得模态框状态
export interface AcquiredItem {
  name: string
  description?: string
  quantity: number
  quality?: 'normal' | 'fine' | 'excellent' | 'supreme'
  icon?: string
}

const acquiredItems = ref<AcquiredItem[]>([])
const currentItemIndex = ref(0)

// 确认对话框状态
interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

const confirmOptions = ref<ConfirmOptions | null>(null)

export const useModal = () => {
  // 公告相关
  const showAnnouncement = (title: string, content: string[]): void => {
    currentAnnouncement.value = { title, content }
  }

  const closeAnnouncement = (): void => {
    currentAnnouncement.value = null
  }

  // 物品获得相关
  const showItemAcquire = (items: AcquiredItem | AcquiredItem[]): void => {
    const itemList = Array.isArray(items) ? items : [items]
    acquiredItems.value = itemList
    currentItemIndex.value = 0
  }

  const nextItem = (): void => {
    if (currentItemIndex.value < acquiredItems.value.length - 1) {
      currentItemIndex.value++
    } else {
      acquiredItems.value = []
      currentItemIndex.value = 0
    }
  }

  const closeItemAcquire = (): void => {
    acquiredItems.value = []
    currentItemIndex.value = 0
  }

  // 确认对话框相关
  const showConfirm = (options: ConfirmOptions): void => {
    confirmOptions.value = options
  }

  const handleConfirm = (): void => {
    confirmOptions.value?.onConfirm?.()
    confirmOptions.value = null
  }

  const handleCancel = (): void => {
    confirmOptions.value?.onCancel?.()
    confirmOptions.value = null
  }

  const currentItem = computed(() => acquiredItems.value[currentItemIndex.value])
  const isLastItem = computed(() => currentItemIndex.value >= acquiredItems.value.length - 1)

  return {
    // 公告
    currentAnnouncement,
    showAnnouncement,
    closeAnnouncement,

    // 物品获得
    acquiredItems,
    currentItemIndex,
    currentItem,
    isLastItem,
    showItemAcquire,
    nextItem,
    closeItemAcquire,

    // 确认对话框
    confirmOptions,
    showConfirm,
    handleConfirm,
    handleCancel
  }
}
