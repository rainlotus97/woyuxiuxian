import { ref } from 'vue'

export interface ToastOptions {
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration?: number
}

export interface ToastItem extends ToastOptions {
  id: number
  visible: boolean
}

const toasts = ref<ToastItem[]>([])
let toastId = 0

const addToast = (options: ToastOptions): number => {
  const id = ++toastId
  const toast: ToastItem = {
    id,
    message: options.message,
    type: options.type || 'info',
    duration: options.duration || 2500,
    visible: true
  }

  toasts.value.push(toast)

  // 自动关闭
  const duration = toast.duration ?? 2500
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

const removeToast = (id: number): void => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value[index]!.visible = false
    // 动画结束后移除
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 300)
  }
}

const clearAll = (): void => {
  toasts.value = []
}

export const useToast = () => {
  const show = (message: string, type?: ToastOptions['type'], duration?: number): number => {
    return addToast({ message, type, duration })
  }

  const info = (message: string, duration?: number): number => show(message, 'info', duration)
  const success = (message: string, duration?: number): number => show(message, 'success', duration)
  const warning = (message: string, duration?: number): number => show(message, 'warning', duration)
  const error = (message: string, duration?: number): number => show(message, 'error', duration)

  return {
    toasts,
    show,
    info,
    success,
    warning,
    error,
    remove: removeToast,
    clearAll
  }
}
