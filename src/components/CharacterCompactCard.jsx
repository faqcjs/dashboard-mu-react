import React, { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useCharacterStore } from '../store/useCharacterStore'
import { useUIStore } from '../store/useUIStore'
import { classInfo, getLocationStatus, formatNum, expForML, fetchProfile, fetchRanking } from '../services/muApi'

export default function CharacterCompactCard({ name, onClick }) {
  const { selectedCharacterName, removeCharacterName } = useCharacterStore()
  const { showConfirm } = useUIStore()
  
  const prevLocStatusRef = useRef(null)

  // 1. Fetch de perfil
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['character', name.toLowerCase()],
    queryFn: () => fetchProfile(name),
    refetchInterval: 15000,
  })

  const ch = profileData?.character || {}
  const stats = profileData?.stats || {}
  const base = stats.base || {}
  const combat = stats.combat || {}
  const info = classInfo(ch.class)
  const guildName = ch.guild && typeof ch.guild === 'object' ? ch.guild.name : ch.guild
  const locStatus = getLocationStatus(ch.location)

  // 2. Fetch de rankings (para GS y Rank)
  const { data: rankingData, isLoading: isRankingLoading } = useQuery({
    queryKey: ['ranking', ch.class],
    queryFn: () => fetchRanking(ch.class),
    enabled: ch.class !== undefined,
  })

  const ranking = rankingData || []
  const topGs = ranking.length ? Math.max(...ranking.map(r => r.GearScore)) : 0
  const me = ranking.find(r => r.Name.toLowerCase() === name.toLowerCase())

  const rank = me ? '#' + me.RankingPos : '—'
  const mlNum = me ? parseInt(me.MasterLevel) : 0
  const expVal = me ? parseInt(me.MasterExperience) || 0 : 0
  const expForNext = expForML(mlNum + 1)
  const expForCurr = expForML(mlNum)
  const pct = me ? Math.min(100, Math.max(0, ((expVal - expForCurr) / (expForNext - expForCurr)) * 100)) : 0
  const missing = me ? Math.max(0, expForNext - expVal) : 0

  const MAX_LEVEL = 400
  const lvl = ch.level ? parseInt(ch.level) : 0
  const lvlPct = Math.min(100, Math.max(0, (lvl / MAX_LEVEL) * 100))
  const lvlMissing = Math.max(0, MAX_LEVEL - lvl)
  const atMax = lvl >= MAX_LEVEL
  const nearMax = lvl >= 390 && lvl < MAX_LEVEL

  // Notificaciones de Sistema
  const triggerSystemNotification = (charName, text) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`MU Monitor · ${charName}`, {
          body: `El estado del personaje cambió a: ${text}`,
          tag: charName
        })
      } catch (e) {}
    }
  }

  useEffect(() => {
    if (!isProfileLoading && ch.name) {
      const statusText = locStatus ? locStatus.text : 'Offline 💀'
      if (prevLocStatusRef.current !== null && prevLocStatusRef.current !== statusText) {
        triggerSystemNotification(ch.name, statusText)
      }
      prevLocStatusRef.current = statusText
    }
  }, [ch.name, locStatus, isProfileLoading])

  // Alerta de nivel 400
  const prevLvlAlertRef = useRef(false)
  useEffect(() => {
    if (!isProfileLoading && ch.name && nearMax && !prevLvlAlertRef.current) {
      prevLvlAlertRef.current = true
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`🚀 MU Monitor · ${ch.name}`, {
            body: `¡Solo faltan ${lvlMissing} niveles para llegar al nivel 400!`,
            tag: `${ch.name}-lvl400`
          })
        } catch (e) {}
      }
    }
    if (!nearMax) prevLvlAlertRef.current = false
  }, [isProfileLoading, ch.name, nearMax, lvlMissing])

  const handleRemove = (e) => {
    e.stopPropagation()
    showConfirm({
      title: 'Quitar del monitoreo',
      message: `¿Estás seguro de que querés quitar a ${name} del monitoreo en vivo?`,
      onConfirm: () => removeCharacterName(name)
    })
  }

  const isLoading = isProfileLoading || (ch.class !== undefined && isRankingLoading)

  if (isLoading) {
    return (
      <div className="bg-[#11131e]/60 border border-white/5 rounded-2xl p-4 animate-pulse flex flex-col gap-4 h-[340px] justify-between">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="skeleton h-4 w-28 rounded"></div>
            <div className="skeleton h-4 w-12 rounded"></div>
          </div>
          <div className="skeleton h-3 w-40 rounded"></div>
          <div className="skeleton h-3 w-20 rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="skeleton h-10 rounded-xl"></div>
          <div className="skeleton h-10 rounded-xl"></div>
          <div className="skeleton h-10 rounded-xl"></div>
        </div>
        <div className="space-y-2">
          <div className="skeleton h-2 w-full rounded"></div>
          <div className="skeleton h-2 w-full rounded"></div>
        </div>
        <div className="skeleton h-9 w-full rounded-xl"></div>
      </div>
    )
  }

  const isActive = selectedCharacterName?.toLowerCase() === name.toLowerCase()

  return (
    <div
      onClick={onClick}
      className={`group relative bg-[#11131e] border ${
        isActive
          ? 'border-[#c084fc] shadow-lg shadow-[#c084fc]/5 bg-gradient-to-br from-[#11131e] to-[#1a1429]'
          : 'border-[#1f2937] hover:border-slate-700'
      } rounded-2xl p-4 flex flex-col justify-between transition-all h-[340px] select-none`}
    >
      {/* Botón de eliminar (Hover) */}
      <button
        onClick={handleRemove}
        className="absolute top-3.5 right-3.5 text-slate-500 hover:text-red-400 font-bold transition-colors p-1 text-sm leading-none focus:outline-none z-10 opacity-0 group-hover:opacity-100"
        title="Quitar de monitoreo"
      >
        ×
      </button>

      {/* Cabecera compacta */}
      <div>
        <div className="flex justify-between items-start pr-5">
          <div className="truncate">
            <span className="cinzel text-sm font-bold text-slate-200 truncate block">{ch.name}</span>
            <span className="text-[9px] bg-slate-800 text-slate-400 font-medium px-1.5 py-0.5 rounded-full mt-1 inline-block">
              {info.name}
            </span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[8px] text-slate-500 uppercase tracking-wider block">Rank</span>
            <span className="cinzel text-xs font-black text-[#c084fc] block mt-0.5">{rank}</span>
          </div>
        </div>

        {/* Ubicación e Info de Guild */}
        <div className="text-[10px] text-slate-500 mt-2.5 space-y-1">
          <div className="flex items-center gap-1.5">
            <span>Guild: <span className="font-semibold text-slate-400">{guildName || 'Sin guild'}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            {locStatus ? (
              <span className={`font-bold ${locStatus.color}`}>{locStatus.text}</span>
            ) : (
              <span className="text-red-500 font-bold">Offline 💀</span>
            )}
            {ch.location && (
              <span className="text-slate-400">
                • M.{ch.location.map} ({ch.location.x}, {ch.location.y})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas compactas */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-black/20 border border-white/5 rounded-xl p-1.5 text-center">
          <div className="text-[8px] text-slate-500 uppercase font-semibold">Resets</div>
          <div className="text-[11px] font-bold text-slate-200 mt-0.5">{ch.resets !== undefined ? ch.resets : '—'}</div>
        </div>
        <div className="bg-black/20 border border-white/5 rounded-xl p-1.5 text-center">
          <div className="text-[8px] text-slate-500 uppercase font-semibold">GearScore</div>
          <div className="text-[11px] font-bold text-[#f97316] mt-0.5">{ch.gearScore || '—'}</div>
        </div>
        <div className="bg-black/20 border border-white/5 rounded-xl p-1.5 text-center">
          <div className="text-[8px] text-slate-500 uppercase font-semibold">Kills / D</div>
          <div className="text-[10px] font-bold text-slate-200 mt-0.5 truncate">
            <span className="text-[#34d399]">{ch.kills || 0}</span>
            <span className="text-slate-500">/</span>
            <span className="text-[#f87171]">{ch.deads || 0}</span>
          </div>
        </div>
      </div>

      {/* Barras de Progreso Lineales */}
      <div className="space-y-3">
        {/* Progreso de Nivel (0-400) */}
        <div>
          <div className="flex justify-between text-[8px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">
            <span>Nivel: {lvl} / {MAX_LEVEL}</span>
            <span className={atMax ? 'text-[#fbbf24]' : nearMax ? 'text-[#f97316]' : 'text-[#fbbf24]'}>
              {lvlPct.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                atMax ? 'bg-gradient-to-r from-yellow-500 to-amber-400' : nearMax ? 'bg-[#f97316]' : 'bg-[#fbbf24]'
              }`}
              style={{ width: `${lvlPct}%` }}
            ></div>
          </div>
        </div>

        {/* Progreso de Master Level */}
        <div>
          <div className="flex justify-between text-[8px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">
            <span>M. Level: {mlNum}</span>
            <span className="text-[#c084fc]">{pct.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#c084fc] to-[#a855f7] rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Botón de ver equipamiento */}
      <Link
        to={`/equip?name=${encodeURIComponent(ch.name || '')}`}
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-[#c084fc]/10 hover:bg-[#c084fc]/20 border border-[#c084fc]/30 hover:border-[#c084fc]/50 text-[#c084fc] text-[10px] font-bold py-2 rounded-xl text-center transition-all cinzel tracking-widest uppercase block focus:outline-none"
      >
        ⚔ Ver Equipamiento
      </Link>
    </div>
  )
}
