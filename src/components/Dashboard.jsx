import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCharacterStore } from '../store/useCharacterStore'
import { useUIStore } from '../store/useUIStore'
import { fetchProfile, fetchRanking, classInfo } from '../services/muApi'
import Onboarding from './Onboarding'
import AccountStatusCard from './AccountStatusCard'
import CharacterCard from './CharacterCard'
import CharacterCompactCard from './CharacterCompactCard'
import CharacterDrawer from './CharacterDrawer'

export default function Dashboard() {
  const { characterNames, selectedCharacterName, setSelectedCharacterName } = useCharacterStore()
  const { openAddCharacterModal } = useUIStore()
  const [searchInput, setSearchInput] = useState('')
  const [drawerCharacterName, setDrawerCharacterName] = useState(null)

  // Estado para el toast de ubicación
  const [toast, setToast] = useState(null)
  const toastTimeoutRef = useRef(null)

  // Query: Obtener el perfil detallado del personaje seleccionado
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['character', selectedCharacterName?.toLowerCase()],
    queryFn: () => fetchProfile(selectedCharacterName),
    enabled: !!selectedCharacterName,
    refetchInterval: 15000, // Refrescar cada 15 segundos
  })

  const classId = profileData?.character?.class

  // Query de Ranking (solo para pasarle la info de GS del top a la tarjeta)
  const { data: rankingData, isLoading: isRankingLoading } = useQuery({
    queryKey: ['ranking', classId],
    queryFn: () => fetchRanking(classId),
    enabled: classId !== undefined,
  })

  // Limpiar timeout del toast
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  const handleLocationStatusChange = (status) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)

    setToast(status)
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null)
    }, 4000)
  }

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

  const isLoading = isProfileLoading || (classId !== undefined && isRankingLoading)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

      {/* DISPOSITIVOS MÓVILES (md:hidden) */}
      <div className="block md:hidden space-y-6">
        {/* Sección 1: Ficha Detallada del Personaje Activo */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="cinzel text-xs text-[#fbbf24] uppercase tracking-[4px]">
              Estadísticas Detalladas
            </h3>

            {/* Pequeño buscador de perfiles rápido */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar personaje..."
                className="bg-[#18120f] border border-[#2e221a] rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-[#8c7d70] focus:outline-none focus:border-[#fbbf24]/50 transition-colors w-40"
              />
            </form>
          </div>

          <CharacterCard
            profileData={profileData}
            rankingData={rankingData}
            isLoading={isLoading}
            onLocationStatusChange={handleLocationStatusChange}
          />
        </div>

        {/* Sección 2: Panel de Monitoreo General */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="cinzel text-xs text-[#fbbf24] uppercase tracking-[4px]">
              Monitoreo en Vivo
            </h3>
          </div>

          {/* Grid de cuentas en vivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {characterNames.map((name) => (
              <AccountStatusCard key={name} name={name} />
            ))}

            {/* Botón rápido dashed para agregar */}
            <div
              onClick={openAddCharacterModal}
              className="border border-dashed border-[#2e221a] hover:border-[#fbbf24]/40 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer text-[#8c7d70] hover:text-[#fbbf24]/80 transition-all h-16 bg-[#120d0b]/30 hover:bg-[#120d0b]/50"
            >
              <span className="text-base font-bold leading-none">+</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Añadir</span>
            </div>
          </div>
        </div>
      </div>

      {/* PC / PANTALLAS GRANDES (hidden md:block) */}
      <div className="hidden md:block space-y-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="cinzel text-xs text-[#fbbf24] uppercase tracking-[4px]">
            Monitoreo Detallado
          </h3>

          {/* Buscador de perfiles rápido */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar personaje..."
              className="bg-[#18120f] border border-[#2e221a] rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-[#8c7d70] focus:outline-none focus:border-[#fbbf24]/50 transition-colors w-48"
            />
            <button
              type="submit"
              className="bg-[#ea580c]/10 hover:bg-[#ea580c]/20 border border-[#ea580c]/30 text-[#fbbf24] rounded-xl px-4 py-1.5 text-xs font-semibold cinzel tracking-wider transition-all"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Grid de Tarjetas Detalladas Finas para PC */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
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
      </div>




      {/* Drawer deslizante derecho de inspección */}
      {drawerCharacterName && (
        <CharacterDrawer
          name={drawerCharacterName}
          onClose={() => setDrawerCharacterName(null)}
        />
      )}

      {/* Toast de Safe/Farm */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex justify-center pointer-events-none transition-all duration-300">
          <div
            className="rounded-2xl px-5 py-3 text-sm font-semibold shadow-2xl flex items-center gap-2 text-white border"
            style={{
              background: toast.bg,
              borderColor: toast.border,
            }}
          >
            {toast.text}
          </div>
        </div>
      )}

    </div>
  )
}
