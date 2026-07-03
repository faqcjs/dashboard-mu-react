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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Cabecera de Rankings */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="cinzel text-lg font-bold text-[#c084fc] tracking-wider">
            ⚔ Rankings del Servidor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Clasificaciones en tiempo real por clase</p>
        </div>

        {/* Buscador de personajes */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre..."
            className="bg-white/5 border border-[#1f2937] rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#c084fc]/50 transition-colors w-48 sm:w-60"
          />
          <button
            type="submit"
            className="bg-[#c084fc]/15 hover:bg-[#c084fc]/25 border border-[#c084fc]/35 text-[#c084fc] rounded-xl px-4 py-2 text-xs font-semibold cinzel tracking-wider whitespace-nowrap transition-all"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Tarjeta de Filtros */}
      <div className="bg-[#11131e] border border-[#1f2937] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Filtro de Ranking</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Clasificación actual de: <span className="text-[#c084fc] font-bold">{currentClassInfo.name}</span></p>
        </div>

        <select
          value={classFilterId}
          onChange={handleClassChange}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#c084fc]/60 transition-colors w-full sm:w-auto"
        >
          {CLASS_FILTERS.map((c) => (
            <option key={c.id} value={c.id} className="bg-[#11131e] text-slate-300">
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
