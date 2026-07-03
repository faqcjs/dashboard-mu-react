import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCharacterStore } from '../store/useCharacterStore'
import { useUIStore } from '../store/useUIStore'
import { fetchProfile, fetchRanking, classInfo } from '../services/muApi'
import Onboarding from './Onboarding'
import AccountStatusCard from './AccountStatusCard'
import CharacterCard from './CharacterCard'
import CharacterDrawer from './CharacterDrawer'

export default function Dashboard() {
  const { characterNames, selectedCharacterName } = useCharacterStore()
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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

      {/* Sección 1: Panel de Monitoreo General */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="cinzel text-xs text-slate-500 uppercase tracking-[4px]">
            Monitoreo en Vivo
          </h3>
        </div>

        {/* Grid de cuentas en vivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {characterNames.map((name) => (
            <AccountStatusCard key={name} name={name} />
          ))}

        </div>
      </div>

      {/* Sección 2: Ficha Detallada del Personaje Activo */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="cinzel text-xs text-slate-500 uppercase tracking-[4px]">
            Estadísticas Detalladas
          </h3>

          {/* Pequeño buscador de perfiles rápido */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar personaje..."
              className="bg-white/5 border border-[#1f2937] rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#c084fc]/50 transition-colors w-40 sm:w-48"
            />
            <button type="submit" className="hidden">Buscar</button>
          </form>
        </div>

        <CharacterCard
          profileData={profileData}
          rankingData={rankingData}
          isLoading={isLoading}
          onLocationStatusChange={handleLocationStatusChange}
        />

        {/* Botón rápido dashed para agregar */}
        <div className="mt-4">
          <div
            onClick={openAddCharacterModal}
            className="border-2 border-dashed border-[#1f2937] hover:border-slate-600 rounded-2xl p-4 flex items-center justify-center gap-2 cursor-pointer text-slate-500 hover:text-slate-300 transition-all h-16"
          >
            <span className="text-lg font-bold leading-none">+</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Añadir cuenta</span>
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
