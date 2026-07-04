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

  const rank = me ? me.RankingPos : null
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
      <div className="bg-[#11131e]/60 border border-white/5 rounded-3xl p-8 animate-pulse flex flex-col gap-6 h-[520px] justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="skeleton h-8 w-40 rounded"></div>
            <div className="skeleton h-6 w-16 rounded"></div>
          </div>
          <div className="skeleton h-5 w-52 rounded"></div>
          <div className="skeleton h-5 w-32 rounded"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-20 rounded-xl"></div>
          <div className="skeleton h-20 rounded-xl"></div>
          <div className="skeleton h-20 rounded-xl"></div>
          <div className="skeleton h-20 rounded-xl"></div>
        </div>
        <div className="space-y-4">
          <div className="skeleton h-4 w-full rounded"></div>
          <div className="skeleton h-4 w-full rounded"></div>
        </div>
        <div className="skeleton h-14 w-full rounded-2xl"></div>
      </div>
    )
  }

  const isActive = selectedCharacterName?.toLowerCase() === name.toLowerCase()

  return (
    <div
      onClick={onClick}
      className={`group relative bg-[#120d0b] border ${
        isActive
          ? 'border-[#ea580c] shadow-xl shadow-[#ea580c]/10 bg-gradient-to-br from-[#120d0b] to-[#231712]'
          : 'border-[#2e221a] hover:border-[#ea580c]/30 hover:shadow-2xl hover:shadow-black/50'
      } rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 h-[520px] select-none cursor-pointer`}
    >
      {/* Botón de eliminar (Hover) */}
      <button
        onClick={handleRemove}
        className="absolute top-4 right-4 text-slate-500 hover:text-red-400 font-bold transition-colors p-1.5 text-lg leading-none focus:outline-none z-10 opacity-0 group-hover:opacity-100"
        title="Quitar de monitoreo"
      >
        ×
      </button>

      {/* Cabecera compacta */}
      <div className="space-y-3.5">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 flex-1">
            <span className="cinzel text-xl font-bold text-[#fbbf24] truncate block" title={ch.name}>
              {ch.name}
            </span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-[#8c7d70] uppercase tracking-wider block font-bold leading-none">Rank</span>
            {rank ? (
              <span className="cinzel text-base font-black text-[#fbbf24] block mt-1">#{rank}</span>
            ) : (
              <span className="cinzel text-base font-black text-[#8c7d70] block mt-1">—</span>
            )}
          </div>
        </div>

        {/* Badge de Clase y Detalles */}
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-xs bg-[#1a1411] border border-[#2e221a] text-slate-300 font-bold px-3 py-1 rounded-lg inline-block">
              {info.name}
            </span>
          </div>

          {/* Ubicación e Info de Guild */}
          <div className="text-xs text-slate-400 space-y-1.5 font-medium">
            <div className="flex items-center gap-1.5">
              <span>Guild: <span className="font-bold text-slate-200">{guildName || 'Sin guild'}</span></span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {locStatus ? (
                <span className={`font-bold ${locStatus.color}`}>{locStatus.text}</span>
              ) : (
                <span className="text-red-500 font-bold">Offline 💀</span>
              )}
              {ch.location && (
                <span className="text-[#8c7d70] font-bold">
                  • M.{ch.location.map} ({ch.location.x}, {ch.location.y})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas compactas */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-[#18120f] border border-[#2e221a] rounded-xl p-3 text-center flex flex-col justify-center">
          <div className="text-[10px] text-[#8c7d70] uppercase font-bold tracking-wider">Resets</div>
          <div className="text-base font-black text-slate-200 mt-0.5">{ch.resets !== undefined ? ch.resets : '—'}</div>
        </div>
        <div className="bg-[#18120f] border border-[#2e221a] rounded-xl p-3 text-center flex flex-col justify-center">
          <div className="text-[10px] text-[#8c7d70] uppercase font-bold tracking-wider">M. Level</div>
          <div className="text-base font-black text-[#fbbf24] mt-0.5">{mlNum}</div>
        </div>
        <div className="bg-[#18120f] border border-[#2e221a] rounded-xl p-3 text-center flex flex-col justify-center">
          <div className="text-[10px] text-[#8c7d70] uppercase font-bold tracking-wider">GearScore</div>
          <div className="text-base font-black text-[#f97316] mt-0.5">{ch.gearScore || '—'}</div>
        </div>
        <div className="bg-[#18120f] border border-[#2e221a] rounded-xl p-3 text-center flex flex-col justify-center">
          <div className="text-[10px] text-[#8c7d70] uppercase font-bold tracking-wider">Kills / Deaths</div>
          <div className="text-sm font-black text-slate-200 mt-0.5 truncate">
            <span className="text-[#34d399]">{ch.kills || 0}</span>
            <span className="text-[#8c7d70]">/</span>
            <span className="text-red-400">{ch.deads || 0}</span>
          </div>
        </div>
      </div>

      {/* Barras de Progreso Lineales */}
      <div className="space-y-3.5">
        {/* Progreso de Nivel (0-400) */}
        <div>
          <div className="flex justify-between text-[10px] text-[#8c7d70] uppercase tracking-wider mb-1 font-bold">
            <span>Nivel: {lvl} / {MAX_LEVEL}</span>
            <span className={atMax ? 'text-[#fbbf24]' : nearMax ? 'text-[#f97316]' : 'text-[#fbbf24]'}>
              {lvlPct.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-[#1c1411] rounded-full h-2.5 overflow-hidden border border-[#2e221a]/30">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                atMax ? 'bg-gradient-to-r from-yellow-500 to-[#fbbf24]' : nearMax ? 'bg-[#f97316]' : 'bg-[#fbbf24]'
              }`}
              style={{ width: `${lvlPct}%` }}
            ></div>
          </div>
        </div>

        {/* Progreso de Master Level */}
        <div>
          <div className="flex justify-between text-[10px] text-[#8c7d70] uppercase tracking-wider mb-1 font-bold">
            <span>M. Level Exp</span>
            <span className="text-[#fbbf24]">{pct.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-[#1c1411] rounded-full h-2.5 overflow-hidden border border-[#2e221a]/30">
            <div
              className="h-full bg-gradient-to-r from-[#ea580c] to-[#fbbf24] rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Botón de ver equipamiento */}
      <div>
        <Link
          to={`/equip?name=${encodeURIComponent(ch.name || '')}`}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-[#ea580c]/10 hover:bg-[#ea580c]/20 border border-[#ea580c]/30 hover:border-[#ea580c]/50 text-[#fbbf24] text-xs font-bold py-3 rounded-xl text-center transition-all cinzel tracking-widest uppercase block focus:outline-none"
        >
          ⚔ Ver Equipamiento
        </Link>
      </div>
    </div>
  )
}
