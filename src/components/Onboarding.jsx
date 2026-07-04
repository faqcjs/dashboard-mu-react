import React, { useState } from 'react'
import { useCharacterStore } from '../store/useCharacterStore'
import { fetchProfile } from '../services/muApi'

export default function Onboarding() {
  const [nameInput, setNameInput] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const addCharacterName = useCharacterStore(state => state.addCharacterName)

  async function handleAdd() {
    setError('')
    const trimmed = nameInput.trim()
    if (!trimmed) {
      setError('Ingresá un nombre.')
      return
    }

    setIsLoading(true)
    try {
      // Verificar si existe la cuenta/personaje
      const profile = await fetchProfile(trimmed)
      // Agregar al estado global
      addCharacterName(profile.character.name)
    } catch (e) {
      if (e.message.includes('no encontrado') || e.message.includes('404')) {
        setError('No se encontró el personaje. Revisá el nombre.')
      } else if (e.message.includes('ya está agregado')) {
        setError('El personaje ya está agregado.')
      } else {
        setError('Error de conexión o personaje inexistente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm rounded-2xl border border-[#ea580c]/35 p-6 card-glow" style={{ background: 'linear-gradient(135deg,#120d0b,#0a0807)' }}>
        <div className="cinzel text-xl font-bold text-[#fbbf24] mb-1 tracking-wider text-center">⚔ MU Personajes</div>
        <p className="text-[#8c7d70] text-sm mb-6 text-center">Ingresá el nombre de tu personaje para empezar.</p>
        
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          disabled={isLoading}
          placeholder="Nombre del personaje..."
          className="w-full bg-[#18120f] border border-[#2e221a] rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-[#8c7d70] focus:outline-none focus:border-[#fbbf24]/50 mb-2 transition-colors"
        />
        
        {error && (
          <div className="text-red-400 text-xs mb-3 text-center">
            {error}
          </div>
        )}
        
        <button
          onClick={handleAdd}
          disabled={isLoading}
          className="w-full bg-[#ea580c]/10 hover:bg-[#ea580c]/20 border border-[#ea580c]/30 text-[#fbbf24] rounded-lg px-4 py-3 text-sm font-semibold cinzel tracking-wider transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Verificando...' : 'Agregar personaje'}
        </button>
        
        {isLoading && (
          <div className="text-center text-[#8c7d70] text-xs mt-3">Buscando personaje...</div>
        )}
      </div>
    </div>
  )
}
