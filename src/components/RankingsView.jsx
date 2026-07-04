import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCharacterStore } from '../store/useCharacterStore'
import { fetchProfile, fetchRanking, classInfo, CLASS_MAP } from '../services/muApi'
import RankingTable from './RankingTable'
import CharacterDrawer from './CharacterDrawer'

// Opciones de clases únicas para el filtro
const CLASS_FILTERS = [
  { id: 'all', name: 'Todas las Razas' },
  { id: 0, name: 'Dark Wizard' },
  { id: 1, name: 'Dark Knight' },
  { id: 33, name: 'Elf' },
  { id: 48, name: 'Magic Gladiator' },
  { id: 64, name: 'Lord Emperor' },
  { id: 80, name: 'Summoner' },
  { id: 96, name: 'Rage Fighter' },
]

export default function RankingsView() {
  const { selectedCharacterName } = useCharacterStore()
  const [searchInput, setSearchInput] = useState('')
  const [drawerCharacterName, setDrawerCharacterName] = useState(null)
  const [classFilterId, setClassFilterId] = useState('all')

  // Query 1: Obtener el perfil del personaje seleccionado (para resaltar o uso secundario)
  const { data: profileData } = useQuery({
    queryKey: ['character', selectedCharacterName?.toLowerCase()],
    queryFn: () => fetchProfile(selectedCharacterName),
    enabled: !!selectedCharacterName,
  })

  // Query 2: Obtener ranking filtrado (empieza en 'all')
  const { data: rankingData, isLoading: isRankingLoading } = useQuery({
    queryKey: ['ranking', classFilterId],
    queryFn: () => fetchRanking(classFilterId),
  })

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const trimmed = searchInput.trim()
    if (trimmed) {
      setDrawerCharacterName(trimmed)
      setSearchInput('')
    }
  }

  const handleClassChange = (e) => {
    const val = e.target.value
    setClassFilterId(val === 'all' ? 'all' : parseInt(val))
  }

  const currentClassInfo = classInfo(classFilterId)
  const isLoading = isRankingLoading

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Cabecera de Rankings */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="cinzel text-lg font-bold text-[#fbbf24] tracking-wider flex items-center gap-2">
            ⚔ Rankings del Servidor
          </h2>
          <p className="text-xs text-[#8c7d70] mt-0.5">Clasificaciones en tiempo real por clase</p>
        </div>

        {/* Buscador de personajes */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre..."
            className="bg-[#18120f] border border-[#2e221a] rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-[#8c7d70] focus:outline-none focus:border-[#fbbf24]/50 transition-colors w-48 sm:w-60"
          />
          <button
            type="submit"
            className="bg-[#ea580c]/10 hover:bg-[#ea580c]/20 border border-[#ea580c]/30 text-[#fbbf24] rounded-xl px-4 py-2 text-xs font-semibold cinzel tracking-wider whitespace-nowrap transition-all"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Tarjeta de Filtros */}
      <div className="bg-[#120d0b] border border-[#2e221a] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Filtro de Ranking</h3>
          <p className="text-[11px] text-[#8c7d70] mt-0.5">Clasificación actual de: <span className="text-[#fbbf24] font-bold">{currentClassInfo.name}</span></p>
        </div>

        <select
          value={classFilterId}
          onChange={handleClassChange}
          className="bg-[#18120f] border border-[#2e221a] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#fbbf24]/50 transition-colors w-full sm:w-auto"
        >
          {CLASS_FILTERS.map((c) => (
            <option key={c.id} value={c.id} className="bg-[#120d0b] text-slate-300">
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla del Ranking */}
      <RankingTable
        rankingData={rankingData}
        selectedName={selectedCharacterName}
        onRowClick={(name) => setDrawerCharacterName(name)}
        isLoading={isLoading}
      />

      {/* Drawer deslizante lateral */}
      {drawerCharacterName && (
        <CharacterDrawer
          name={drawerCharacterName}
          onClose={() => setDrawerCharacterName(null)}
        />
      )}
    </div>
  )
}
