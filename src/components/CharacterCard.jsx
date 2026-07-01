import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCharacterStore } from '../store/useCharacterStore'
import { classInfo, getLocationStatus, formatNum, expForML } from '../services/muApi'

export default function CharacterCard({ profileData, rankingData, isLoading, onLocationStatusChange }) {
  const saveExpOnLoad = useCharacterStore(state => state.saveExpOnLoad)
  const getExpDelta = useCharacterStore(state => state.getExpDelta)
  const prevLocStatusRef = useRef(null)

  const ch = profileData?.character || {}
  const stats = profileData?.stats || {}
  const base = stats.base || {}
  const combat = stats.combat || {}
  const info = classInfo(ch.class)
  // La API puede devolver guild como objeto {name, mark, score, master} o como string
  const guildName = ch.guild && typeof ch.guild === 'object' ? ch.guild.name : ch.guild
  const ranking = rankingData || []
  
  const topGs = ranking.length ? Math.max(...ranking.map(r => r.GearScore)) : 0
  const me = ranking.find(r => r.Name.toLowerCase() === ch.name?.toLowerCase())

  const locStatus = getLocationStatus(ch.location, ch.isOnline)

  // Web Notification API Trigger
  const triggerSystemNotification = (charName, text) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`MU Monitor · ${charName}`, {
          body: `El estado del personaje cambió a: ${text}`,
          tag: charName // Evita notificaciones duplicadas para el mismo personaje
        })
      } catch (e) {
        // En algunos entornos móviles puede fallar
      }
    }
  }

  useEffect(() => {
    if (!isLoading && ch.name) {
      const statusText = locStatus ? locStatus.text : 'Offline 💀'
      // Si el estado anterior existía y es diferente del actual
      if (prevLocStatusRef.current !== null && prevLocStatusRef.current !== statusText) {
        // Disparar callback visual (Toast)
        if (onLocationStatusChange) {
          onLocationStatusChange(locStatus || { text: '💀 Desconectado', color: 'text-red-400', bg: 'rgba(239,68,68,.15)', border: '#ef4444' })
        }
        // Disparar notificación nativa de sistema
        triggerSystemNotification(ch.name, statusText)
      }
      prevLocStatusRef.current = statusText
    }
  }, [ch.name, locStatus, isLoading, onLocationStatusChange])

  // Guardar EXP base inicial al cargar el personaje por primera vez
  useEffect(() => {
    if (me && ch.name) {
      saveExpOnLoad(ch.name, me.MasterExperience)
    }
  }, [ch.name, me, saveExpOnLoad])

  if (isLoading) {
    return (
      <div className="bg-[#11131e] border border-[#1f2937] rounded-3xl p-6 card-glow space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="skeleton w-14 h-14 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="skeleton h-5 w-32 rounded"></div>
              <div className="skeleton h-3.5 w-20 rounded"></div>
            </div>
          </div>
          <div className="skeleton h-8 w-24 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-16 rounded-2xl"></div>
          ))}
        </div>
        <div className="skeleton h-20 rounded-2xl"></div>
      </div>
    )
  }

  // Cálculos de Master Level
  const rank = me ? '#' + me.RankingPos : '—'
  const mlVal = me ? me.MasterLevel : 0
  const expVal = me ? parseInt(me.MasterExperience) || 0 : 0
  const delta = ch.name ? getExpDelta(ch.name, expVal) : null
  const deltaStr = delta ? ` (+${formatNum(delta)})` : ''

  // Círculo SVG de progreso
  const mlNum = me ? parseInt(me.MasterLevel) : 0
  const expForNext = expForML(mlNum + 1)
  const expForCurr = expForML(mlNum)
  const pct = me ? Math.min(100, Math.max(0, ((expVal - expForCurr) / (expForNext - expForCurr)) * 100)) : 0
  const missing = me ? Math.max(0, expForNext - expVal) : 0

  // SVG Config
  const radius = 38
  const stroke = 4.5
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (pct / 100) * circumference

  return (
    <div className="bg-[#11131e] border border-[#1f2937] rounded-3xl p-6 card-glow flex flex-col gap-6 relative overflow-hidden">
      
      {/* Glow ambiental de fondo */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#c084fc]/5 blur-3xl pointer-events-none rounded-full"></div>

      {/* Header Info Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div className="flex items-center gap-4">
          {/* Clasificación (Rank Badge) */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center shrink-0 min-w-16">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Rank</span>
            <span className="cinzel text-xl font-black text-[#c084fc] leading-none mt-0.5 block">{rank}</span>
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="cinzel text-xl font-bold text-slate-200">{ch.name}</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 font-medium px-2 py-0.5 rounded-full">{info.name}</span>
            </div>
            
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span>Guild: <span className="font-semibold text-slate-400">{guildName || 'Sin guild'}</span></span>
              <span>•</span>
              {locStatus ? (
                <span className={`${locStatus.color} font-bold`}>{locStatus.text}</span>
              ) : (
                <span className="text-red-500 font-bold">Offline 💀</span>
              )}
            </div>
          </div>
        </div>

        {/* GS y Botón de Navegación */}
        <div className="flex items-center gap-4 sm:self-center w-full sm:w-auto justify-between sm:justify-end border-t border-white/5 pt-4 sm:border-0 sm:pt-0">
          <div className="text-right">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">GearScore</span>
            <span className="cinzel text-2xl font-black text-[#f97316] leading-none mt-0.5 block">{ch.gearScore || '—'}</span>
            {topGs > 0 && (
              <span className="text-[9px] text-slate-600 block mt-0.5">
                {ch.gearScore >= topGs ? '🏆 Top GS' : `Top: ${topGs}`}
              </span>
            )}
          </div>
          <Link
            to={`/equip?name=${encodeURIComponent(ch.name || '')}`}
            className="bg-[#c084fc]/15 hover:bg-[#c084fc]/25 border border-[#c084fc]/35 text-[#c084fc] text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cinzel tracking-widest uppercase focus:outline-none"
          >
            ⚔ Ver Equipamiento
          </Link>
        </div>
      </div>

      {/* Grid de Stats Generales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5">
          <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Nivel General</div>
          <div className="text-lg font-bold text-slate-200 mt-1">{ch.level !== undefined ? ch.level : '—'}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5">
          <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Resets</div>
          <div className="text-lg font-bold text-slate-200 mt-1">{ch.resets !== undefined ? ch.resets : '—'}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5">
          <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Kills (Asesinatos)</div>
          <div className="text-lg font-bold text-[#34d399] mt-1">{ch.kills !== undefined ? ch.kills.toLocaleString() : '—'}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5">
          <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Deaths (Muertes)</div>
          <div className="text-lg font-bold text-[#f87171] mt-1">{ch.deads !== undefined ? ch.deads.toLocaleString() : '—'}</div>
        </div>
      </div>

      {/* Gráficos de Progreso: Master Level Ring y Stats de Combate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* ML Progress circular ring widget */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 flex items-center justify-between gap-5">
          <div className="flex-1 space-y-1.5">
            <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nivel Maestro</h4>
            <div className="text-sm font-semibold text-slate-200">
              Master Level <span className="text-[#c084fc] font-bold">{mlNum}</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Faltan: <span className="text-slate-400 font-bold">{formatNum(missing)} EXP</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Total: <span className="text-[#fbbf24] font-bold">{formatNum(expVal)}</span>
              {deltaStr && <span className="text-[#34d399] font-bold">{deltaStr}</span>}
            </div>
          </div>

          {/* SVG Progress Circle */}
          <div className="shrink-0 flex flex-col items-center gap-1.5">
            <svg
              width="96"
              height="96"
              viewBox={`0 0 ${radius * 2} ${radius * 2}`}
              className="block"
            >
              {/* Círculo de fondo */}
              <circle
                stroke="rgba(255,255,255,0.04)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              {/* Círculo de progreso — empieza arriba (-90°) con transform */}
              <circle
                stroke="#c084fc"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.7s ease' }}
              />
              {/* Texto del porcentaje centrado perfectamente en cx/cy */}
              <text
                x={radius}
                y={radius}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="13"
                fontWeight="800"
                fontFamily="Outfit, sans-serif"
              >
                {pct.toFixed(0)}%
              </text>
            </svg>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Progreso ML</span>
          </div>
        </div>

        {/* Stats de combate resumidos */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 space-y-3.5">
          <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Combate y Puntos</h4>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between bg-black/20 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-500 font-semibold uppercase text-[9px]">Vida</span>
              <span className="text-slate-200 font-bold text-[#34d399]">{combat.maxLife !== undefined ? formatNum(combat.maxLife) : 0}</span>
            </div>
            <div className="flex items-center justify-between bg-black/20 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-500 font-semibold uppercase text-[9px]">Mana</span>
              <span className="text-slate-200 font-bold text-[#60a5fa]">{combat.maxMana !== undefined ? formatNum(combat.maxMana) : 0}</span>
            </div>
            <div className="flex items-center justify-between bg-black/20 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-500 font-semibold uppercase text-[9px]">BP</span>
              <span className="text-slate-200 font-bold text-[#fbbf24]">{combat.maxBP !== undefined ? formatNum(combat.maxBP) : 0}</span>
            </div>
            <div className="flex items-center justify-between bg-black/20 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-500 font-semibold uppercase text-[9px]">Escudo</span>
              <span className="text-slate-200 font-bold text-[#94a3b8]">{combat.shield !== undefined ? formatNum(combat.shield) : 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Stats Base (Colapsable o pequeña al final) */}
      <div className="border-t border-white/5 pt-4">
        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold block mb-3">Estadísticas Base</span>
        <div className="grid grid-cols-5 gap-2">
          <div className="bg-black/20 border border-white/5 rounded-xl p-2 text-center">
            <div className="text-[8px] text-slate-500 uppercase">Fuerza (STR)</div>
            <div className="text-xs font-bold text-slate-300 mt-0.5">{base.strength || 0}</div>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-xl p-2 text-center">
            <div className="text-[8px] text-slate-500 uppercase">Agilidad (AGI)</div>
            <div className="text-xs font-bold text-slate-300 mt-0.5">{base.dexterity || 0}</div>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-xl p-2 text-center">
            <div className="text-[8px] text-slate-500 uppercase">Vitalidad (VIT)</div>
            <div className="text-xs font-bold text-slate-300 mt-0.5">{base.vitality || 0}</div>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-xl p-2 text-center">
            <div className="text-[8px] text-slate-500 uppercase">Energía (ENE)</div>
            <div className="text-xs font-bold text-slate-300 mt-0.5">{base.energy || 0}</div>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-xl p-2 text-center">
            <div className="text-[8px] text-slate-500 uppercase">Comando (CMD)</div>
            <div className="text-xs font-bold text-slate-300 mt-0.5">{base.leadership || 0}</div>
          </div>
        </div>
      </div>
      
    </div>
  )
}
