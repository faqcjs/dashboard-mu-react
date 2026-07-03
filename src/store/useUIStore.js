import { create } from 'zustand'

export const useUIStore = create((set, get) => ({
  // Notificaciones (Toasts)
  toasts: [],
  
  addToast: (message, type = 'error') => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, message, type }
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }))
    
    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
      get().removeToast(id)
    }, 4000)
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  },

  // Modal de Confirmación
  confirmModal: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  },

  showConfirm: ({ title, message, onConfirm, onCancel }) => {
    set({
      confirmModal: {
        isOpen: true,
        title,
        message,
        onConfirm,
        onCancel
      }
    })
  },

  closeConfirm: (confirmed) => {
    const { onConfirm, onCancel } = get().confirmModal
    
    set({
      confirmModal: {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null
      }
    })

    if (confirmed && onConfirm) {
      onConfirm()
    } else if (!confirmed && onCancel) {
      onCancel()
    }
  },

  // Modal de Agregar Personaje
  addCharacterModalOpen: false,
  openAddCharacterModal: () => set({ addCharacterModalOpen: true }),
  closeAddCharacterModal: () => set({ addCharacterModalOpen: false })
}))
