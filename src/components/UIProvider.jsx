import React, { useState } from 'react'
import { useUIStore } from '../store/useUIStore'
import { useCharacterStore } from '../store/useCharacterStore'
import { fetchProfile } from '../services/muApi'

export default function UIProvider() {
  const {
    toasts,
    removeToast,
    confirmModal,
    closeConfirm,
    addCharacterModalOpen,
    closeAddCharacterModal,
    addToast
  } = useUIStore()

  const { characterNames, addCharacterName } = useCharacterStore()
  
  // Estado local para el formulario de agregar personaje
  const [characterNameInput, setCharacterNameInput] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [modalError, setModalError] = useState('')

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    setModalError('')
    const name = characterNameInput.trim()
    if (!name) {
      setModalError('Por favor ingresá un nombre.')
      return
    }

    setIsAdding(true)
    try {
      // Validar si ya está agregado localmente (ignorar mayúsculas/minúsculas)
      if (characterNames.some((n) => n.toLowerCase() === name.toLowerCase())) {
        setModalError('El personaje ya está agregado.')
        setIsAdding(false)
        return
      }

      // Consumir API para verificar existencia y formato oficial
      const profile = await fetchProfile(name)
      const officialName = profile.character.name
      
      addCharacterName(officialName)
      addToast(`Personaje "${officialName}" agregado correctamente.`, 'success')
      
      // Limpiar y cerrar
      setCharacterNameInput('')
      closeAddCharacterModal()
    } catch (err) {
      if (err.message.includes('no encontrado') || err.message.includes('404')) {
        setModalError('No se encontró el personaje. Revisá el nombre.')
      } else {
        setModalError('Error de conexión o personaje inexistente.')
      }
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <>
      {/* 1. CONTENEDOR DE TOASTS */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success'
          const isInfo = toast.type === 'info'
          
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 w-full bg-[#120d0b] border ${
                isSuccess
                  ? 'border-emerald-500/30 shadow-emerald-500/5'
                  : isInfo
                  ? 'border-[#ea580c]/30 shadow-[#ea580c]/5'
                  : 'border-red-500/30 shadow-red-500/5'
              } rounded-2xl p-4 shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-fade-in`}
            >
              <span className="text-base shrink-0 mt-0.5">
                {isSuccess ? '✅' : isInfo ? 'ℹ️' : '⚠️'}
              </span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#8c7d70] hover:text-slate-300 font-bold transition-colors text-sm leading-none"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>

      {/* 2. MODAL DE CONFIRMACIÓN */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-gradient-to-br from-[#120d0b] to-[#0a0807] border border-[#2e221a] rounded-3xl p-6 shadow-2xl transition-all scale-100">
            <h4 className="cinzel text-sm font-bold text-[#fbbf24] uppercase tracking-[3px] mb-2">
              {confirmModal.title || '¿Estás seguro?'}
            </h4>
            <p className="text-xs text-[#8c7d70] mb-6 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => closeConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-[#8c7d70] hover:text-slate-200 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => closeConfirm(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600/80 hover:bg-red-600 rounded-xl shadow-lg shadow-red-600/10 transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL DE AGREGAR PERSONAJE */}
      {addCharacterModalOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-gradient-to-br from-[#120d0b] to-[#0a0807] border border-[#ea580c]/35 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setCharacterNameInput('')
                setModalError('')
                closeAddCharacterModal()
              }}
              className="absolute top-4 right-4 text-[#8c7d70] hover:text-slate-300 font-bold transition-colors text-lg leading-none"
              disabled={isAdding}
            >
              ×
            </button>
            
            <h4 className="cinzel text-sm font-bold text-[#fbbf24] uppercase tracking-[3px] mb-1 text-center">
              Monitorear Personaje
            </h4>
            <p className="text-[11px] text-[#8c7d70] mb-5 text-center">
              Ingresá el nombre oficial del personaje para agregarlo al panel.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={characterNameInput}
                  onChange={(e) => setCharacterNameInput(e.target.value)}
                  placeholder="Nombre del personaje..."
                  disabled={isAdding}
                  className="w-full bg-[#18120f] border border-[#2e221a] rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-[#8c7d70] focus:outline-none focus:border-[#fbbf24]/50 transition-colors"
                  autoFocus
                />
                {modalError && (
                  <p className="text-red-400 text-[10px] mt-1.5 px-1 font-medium">
                    {modalError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isAdding}
                className="w-full bg-[#ea580c]/20 hover:bg-[#ea580c]/30 border border-[#ea580c]/40 text-[#fbbf24] rounded-xl px-4 py-3 text-xs font-semibold cinzel tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-t-transparent border-[#fbbf24] rounded-full animate-spin"></span>
                    <span>Verificando...</span>
                  </>
                ) : (
                  'Agregar al Panel'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
