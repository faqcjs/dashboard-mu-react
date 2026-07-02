import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCharacterStore } from '../store/useCharacterStore'
import { fetchProfile, getLocationStatus } from '../services/muApi'

export default function AccountStatusCard({ name }) {
  const { selectedCharacterName, setSelectedCharacterName, removeCharacterName } = useCharacterStore()

  // Query silenciosa para obtener el estado del personaje en el grid de monitoreo
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['character', name.toLowerCase()],
    queryFn: () => fetchProfile(name),
    refetchInterval: 15000, // Actualizar cada 15 segundos el estado general
  })

  const isActive = selectedCharacterName?.toLowerCase() === name.toLowerCase()

  if (isLoading) {
    return (
      <div className="bg-[#11131e]/50 border border-white/5 rounded-2xl p-4 animate-pulse flex items-center justify-between h-16">
        <div className="space-y-1.5">
          <div className="skeleton h-3 w-16 rounded"></div>
          <div className="skeleton h-2 w-10 rounded"></div>
        </div>
        <div className="skeleton h-3 w-12 rounded-full"></div>
      </div>
    )
  }

  const ch = profileData?.character || {}
  const locStatus = getLocationStatus(ch.location)

  return (
    <div
      onClick={() => setSelectedCharacterName(name)}
      className={`group relative bg-[#11131e] border ${
        isActive ? 'border-[#c084fc] shadow-lg shadow-[#c084fc]/5 bg-gradient-to-br from-[#11131e] to-[#1a1429]' : 'border-[#1f2937] hover:border-slate-700'
      } rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all h-16 select-none`}
    >
      <div className="truncate pr-4">
        <div className="text-xs font-bold text-slate-200 truncate">{name}</div>
        <div className="text-[10px] text-slate-500 truncate mt-0.5">GS: {ch.gearScore || '—'}</div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {locStatus ? (
          <span className={`text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded ${locStatus.color}`}>
            {locStatus.text.replace(' En safe', 'Safe').replace(' Farmeando', 'Farm')}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded">
            Offline
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation()
            if (confirm(`¿Quitar a ${name} del monitoreo?`)) {
              removeCharacterName(name)
            }
          }}
          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 font-bold transition-opacity p-1 text-sm leading-none focus:outline-none"
          title="Eliminar"
        >
          ×
        </button>
      </div>
    </div>
  )
}
