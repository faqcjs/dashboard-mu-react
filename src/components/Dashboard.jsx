import React, { useState } from 'react'
import { useCharacterStore } from '../store/useCharacterStore'
import { useUIStore } from '../store/useUIStore'
import Onboarding from './Onboarding'
import CharacterCompactCard from './CharacterCompactCard'
import CharacterDrawer from './CharacterDrawer'

export default function Dashboard() {
  const { characterNames, setSelectedCharacterName } = useCharacterStore()
  const { openAddCharacterModal } = useUIStore()
  const [searchInput, setSearchInput] = useState('')
  const [drawerCharacterName, setDrawerCharacterName] = useState(null)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const trimmed = searchInput.trim()
    if (trimmed) {
      setDrawerCharacterName(trimmed)
      setSearchInput('')
    }
  }

  // Onboarding si no hay personajes monitoreados
  if (characterNames.length === 0) {
    return <Onboarding />
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

      {/* Cabecera Responsiva */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="cinzel text-lg font-bold text-[#fbbf24] tracking-wider flex items-center gap-2">
            🛡️ Monitoreo Detallado
          </h2>
          <p className="text-xs text-[#8c7d70] mt-0.5">Estado en vivo y estadísticas de tus personajes</p>
        </div>

        {/* Buscador de perfiles rápido */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar personaje..."
            className="bg-[#18120f] border border-[#2e221a] rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-[#8c7d70] focus:outline-none focus:border-[#fbbf24]/50 transition-colors flex-1 sm:w-48"
          />
          <button
            type="submit"
            className="bg-[#ea580c]/10 hover:bg-[#ea580c]/20 border border-[#ea580c]/30 text-[#fbbf24] rounded-xl px-4 py-2 text-xs font-semibold cinzel tracking-wider whitespace-nowrap transition-all"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Grid de Tarjetas Detalladas Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {characterNames.map((name) => (
          <CharacterCompactCard
            key={name}
            name={name}
            onClick={() => {
              setSelectedCharacterName(name)
              setDrawerCharacterName(name)
            }}
          />
        ))}

        {/* Botón Añadir Dashed, alto igual a las tarjetas (h-[520px]) */}
        <div
          onClick={openAddCharacterModal}
          className="border border-dashed border-[#2e221a] hover:border-[#fbbf24]/40 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer text-[#8c7d70] hover:text-[#fbbf24]/80 transition-all h-[520px] bg-[#120d0b]/30 hover:bg-[#120d0b]/50"
        >
          <span className="text-3xl font-bold leading-none">+</span>
          <span className="text-sm font-bold uppercase tracking-wider">Añadir personaje</span>
        </div>
      </div>

      {/* Drawer deslizante de inspección */}
      {drawerCharacterName && (
        <CharacterDrawer
          name={drawerCharacterName}
          onClose={() => setDrawerCharacterName(null)}
        />
      )}

    </div>
  )
}
