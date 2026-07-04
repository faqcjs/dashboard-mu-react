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

  const locStatus = getLocationStatus(ch.location)

  // Todos los cálculos derivados aquí para que estén disponibles antes de los hooks
  const rank = me ? '#' + me.RankingPos : '—'
  const mlNum = me ? parseInt(me.MasterLevel) : 0
  const expVal = me ? parseInt(me.MasterExperience) || 0 : 0
  const delta = ch.name ? getExpDelta(ch.name, expVal) : null
  const deltaStr = delta ? ` (+${formatNum(delta)})` : ''
  const expForNext = expForML(mlNum + 1)
  const expForCurr = expForML(mlNum)
  const pct = me ? Math.min(100, Math.max(0, ((expVal - expForCurr) / (expForNext - expForCurr)) * 100)) : 0
  const missing = me ? Math.max(0, expForNext - expVal) : 0

  // Cálculos de Nivel Normal (0 → 400)
  const MAX_LEVEL = 400
  const lvl = ch.level ? parseInt(ch.level) : 0
  const lvlPct = Math.min(100, Math.max(0, (lvl / MAX_LEVEL) * 100))
  const lvlMissing = Math.max(0, MAX_LEVEL - lvl)
  const nearMax = lvl >= 390 && lvl < MAX_LEVEL
  const atMax = lvl >= MAX_LEVEL

  // SVG Config (compartido por ambos anillos)
  const radius = 38
  const stroke = 4.5
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (pct / 100) * circumference
  const lvlStrokeDashoffset = circumference - (lvlPct / 100) * circumference

  // Web Notification API Trigger
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
    if (!isLoading && ch.name) {
      const statusText = locStatus ? locStatus.text : 'Offline 💀'
      if (prevLocStatusRef.current !== null && prevLocStatusRef.current !== statusText) {
        if (onLocationStatusChange) {
          onLocationStatusChange(locStatus || { text: '💀 Desconectado', color: 'text-red-400', bg: 'rgba(239,68,68,.15)', border: '#ef4444' })
        }
        triggerSystemNotification(ch.name, statusText)
      }
      prevLocStatusRef.current = statusText
    }
  }, [ch.name, locStatus, isLoading, onLocationStatusChange])

  // Alerta: nivel 400 próximo (≤10 niveles)
  const prevLvlAlertRef = useRef(false)

  useEffect(() => {
    if (!isLoading && ch.name && nearMax && !prevLvlAlertRef.current) {
      prevLvlAlertRef.current = true
      // Notificación de sistema
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
  }, [isLoading, ch.name, nearMax, lvlMissing])

  // Guardar EXP base inicial al cargar el personaje por primera vez
  useEffect(() => {
    if (me && ch.name) {
      saveExpOnLoad(ch.name, me.MasterExperience)
    }
  }, [ch.name, me, saveExpOnLoad])


  const getAvatarPath = (classId) => {
    const mapping = {
      0: 'dw', 2: 'dw', 16: 'dw',
      1: 'dk', 17: 'dk', 18: 'dk',
      33: 'elf', 34: 'elf',
      48: 'mg', 50: 'mg',
      64: 'dl', 66: 'dl',
      80: 'sum', 81: 'sum', 82: 'sum',
      96: 'rf', 98: 'rf'
    }
    const key = mapping[classId] || 'dw'
    return `/avatars/${key}.jpg`
  }

  const handleUnstick = () => {
    if (onLocationStatusChange) {
      onLocationStatusChange({
        text: '🛡️ Desatascando...',
        bg: 'rgba(52,211,153,.15)',
        border: '#34d399',
        color: 'text-[#34d399]'
      })
      setTimeout(() => {
        onLocationStatusChange({
          text: '🛡️ En safe (Lorencia)',
          bg: 'rgba(52,211,153,.15)',
          border: '#34d399',
          color: 'text-[#34d399]'
        })
      }, 2500)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-[#120d0b] border border-[#2e221a] rounded-3xl p-6 card-glow space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="skeleton w-16 h-16 rounded-2xl"></div>
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

  return (
    <div className="bg-[#120d0b] border border-[#2e221a] rounded-3xl p-6 card-glow flex flex-col gap-6 relative overflow-hidden">
      
      {/* Glow ambiental de fondo */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#ea580c]/5 blur-3xl pointer-events-none rounded-full"></div>

      {/* TARJETA DE PERSONAJE ESTILO ORIGINAL (IMAGEN 2) */}
      <div className="bg-[#18120f] border border-[#2e221a] rounded-2xl p-5 flex flex-col lg:flex-row gap-6">
        
        {/* Retrato y datos básicos */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 lg:w-1/2">
          {/* Avatar con banner de nivel */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#2e221a] bg-[#1a1411] shrink-0 shadow-lg">
            <img src={getAvatarPath(ch.class)} alt={ch.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-[#ea580c] text-white text-[10px] font-black text-center py-0.5 tracking-wider uppercase">
              Lv. {ch.level || 0}
            </div>
          </div>

          <div className="text-center sm:text-left truncate space-y-3 w-full">
            <div>
              <h2 className="cinzel text-xl font-bold text-[#fbbf24] truncate leading-none">{ch.name}</h2>
              <p className="text-xs text-[#8c7d70] font-semibold mt-1.5">{info.name}</p>
            </div>

            {/* Badges Rápidas */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <div className="inline-flex items-center gap-1.5 bg-[#120d0b] border border-[#2a1d17] text-[10px] text-[#fbbf24] font-bold px-3 py-1.5 rounded-xl shadow-inner">
                🔄 {ch.resets || 0} Resets
              </div>
              <div className="inline-flex items-center gap-1.5 bg-[#120d0b] border border-[#2a1d17] text-[10px] text-[#34d399] font-bold px-3 py-1.5 rounded-xl shadow-inner">
                ✨ {mlNum} Master
              </div>
            </div>
          </div>
        </div>

        {/* Atributos base rápidos */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {/* STR */}
          <div className="bg-[#1a1312] border border-[#7f1d1d]/30 rounded-xl p-3 flex items-center gap-2.5">
            <span className="text-base shrink-0 p-1.5 bg-[#7f1d1d]/15 text-red-400 rounded-lg">⚔️</span>
            <div>
              <div className="text-[9px] text-[#8c7d70] uppercase font-bold tracking-wider">Fuerza</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">{base.strength || 0}</div>
            </div>
          </div>
          {/* AGI */}
          <div className="bg-[#121a15] border border-[#064e3b]/30 rounded-xl p-3 flex items-center gap-2.5">
            <span className="text-base shrink-0 p-1.5 bg-[#064e3b]/15 text-[#34d399] rounded-lg">🎯</span>
            <div>
              <div className="text-[9px] text-[#8c7d70] uppercase font-bold tracking-wider">Agilidad</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">{base.dexterity || 0}</div>
            </div>
          </div>
          {/* VIT */}
          <div className="bg-[#121622] border border-[#1e3a8a]/30 rounded-xl p-3 flex items-center gap-2.5">
            <span className="text-base shrink-0 p-1.5 bg-[#1e3a8a]/15 text-blue-400 rounded-lg">❤️</span>
            <div>
              <div className="text-[9px] text-[#8c7d70] uppercase font-bold tracking-wider">Vitalidad</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">{base.vitality || 0}</div>
            </div>
          </div>
          {/* ENE */}
          <div className="bg-[#171222] border border-[#3b0764]/30 rounded-xl p-3 flex items-center gap-2.5">
            <span className="text-base shrink-0 p-1.5 bg-[#3b0764]/15 text-purple-400 rounded-lg">⚡</span>
            <div>
              <div className="text-[9px] text-[#8c7d70] uppercase font-bold tracking-wider">Energía</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">{base.energy || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción del personaje */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to={`/equip?name=${encodeURIComponent(ch.name || '')}`}
          className="flex-1 bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:from-[#f97316] hover:to-[#ea580c] text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all uppercase tracking-widest shadow-[0_3px_15px_rgba(234,88,12,0.2)]"
        >
          ⚔️ Ver Equipamiento
        </Link>
        <button
          onClick={handleUnstick}
          className="bg-[#1a1411] hover:bg-[#231b17] border border-[#2e221a] text-[#fbbf24] text-xs font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-1.5 transition-all uppercase tracking-widest"
        >
          🔄 Desatascar
        </button>
      </div>

      {/* Información Adicional de Ubicación y Rank */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#18120f]/50 border border-[#2e221a] rounded-xl p-3">
          <div className="text-[9px] text-[#8c7d70] uppercase tracking-wider font-semibold">Rank Global</div>
          <div className="cinzel text-base font-bold text-[#fbbf24] mt-1">{rank}</div>
        </div>
        <div className="bg-[#18120f]/50 border border-[#2e221a] rounded-xl p-3">
          <div className="text-[9px] text-[#8c7d70] uppercase tracking-wider font-semibold">GearScore</div>
          <div className="cinzel text-base font-bold text-[#f97316] mt-1">{ch.gearScore || '—'}</div>
        </div>
        <div className="bg-[#18120f]/50 border border-[#2e221a] rounded-xl p-3">
          <div className="text-[9px] text-[#8c7d70] uppercase tracking-wider font-semibold">Estado</div>
          <div className="text-xs font-bold mt-1.5 truncate">
            {locStatus ? (
              <span className={`${locStatus.color}`}>{locStatus.text}</span>
            ) : (
              <span className="text-red-500">Offline 💀</span>
            )}
          </div>
        </div>
        <div className="bg-[#18120f]/50 border border-[#2e221a] rounded-xl p-3">
          <div className="text-[9px] text-[#8c7d70] uppercase tracking-wider font-semibold">Ubicación</div>
          <div className="text-xs font-bold text-[#e3dac9] mt-1 truncate">
            {ch.location ? `M.${ch.location.map} (${ch.location.x}, ${ch.location.y})` : 'Desconocida'}
          </div>
        </div>
      </div>

      {/* Historial PvP: Kills y Muertes */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-[#121c17] border border-[#064e3b]/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-[#8c7d70] uppercase tracking-wider font-semibold">Asesinatos (Kills)</div>
            <div className="text-xl font-bold text-[#34d399] mt-1">{ch.kills !== undefined ? ch.kills.toLocaleString() : '0'}</div>
          </div>
          <span className="text-2xl opacity-40">⚔️</span>
        </div>
        <div className="bg-[#221313] border border-[#7f1d1d]/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-[#8c7d70] uppercase tracking-wider font-semibold">Muertes (Deaths)</div>
            <div className="text-xl font-bold text-red-400 mt-1">{ch.deads !== undefined ? ch.deads.toLocaleString() : '0'}</div>
          </div>
          <span className="text-2xl opacity-40">💀</span>
        </div>
      </div>

      {/* Progreso de Niveles: Master Level y Nivel Normal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* ML Progress */}
        <div className="bg-[#18120f] border border-[#2e221a] rounded-2xl p-5 flex items-center justify-between gap-5">
          <div className="flex-1 space-y-1.5">
            <h4 className="text-xs text-[#fbbf24] font-bold uppercase tracking-wider">Nivel Maestro</h4>
            <div className="text-sm font-semibold text-slate-200">
              Master Level <span className="text-[#fbbf24] font-bold">{mlNum}</span>
            </div>
            <div className="text-[10px] text-[#8c7d70]">
              Faltan: <span className="text-slate-300 font-bold">{formatNum(missing)} EXP</span>
            </div>
            <div className="text-[10px] text-[#8c7d70]">
              Total: <span className="text-[#fbbf24] font-bold">{formatNum(expVal)}</span>
              {deltaStr && <span className="text-[#34d399] font-bold">{deltaStr}</span>}
            </div>
          </div>

          {/* SVG Progress Circle */}
          <div className="shrink-0 flex flex-col items-center gap-1.5">
            <svg width="88" height="88" viewBox={`0 0 ${radius * 2} ${radius * 2}`} className="block">
              <circle stroke="rgba(255,255,255,0.03)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
              <circle stroke="#fbbf24" fill="transparent" strokeWidth={stroke} strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={strokeDashoffset} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.7s ease' }} />
              <text x={radius} y={radius} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="13" fontWeight="800" fontFamily="Outfit, sans-serif">
                {pct.toFixed(0)}%
              </text>
            </svg>
            <span className="text-[8px] text-[#8c7d70] uppercase tracking-widest font-semibold">Progreso ML</span>
          </div>
        </div>

        {/* Nivel Normal */}
        <div className={`bg-[#18120f] border rounded-2xl p-5 flex items-center justify-between gap-5 transition-colors ${
          atMax ? 'border-[#fbbf24]/40 shadow-[#fbbf24]/5' : nearMax ? 'border-[#f97316]/40 animate-pulse-slow' : 'border-[#2e221a]'
        }`}>
          <div className="flex-1 space-y-1.5">
            <h4 className="text-xs text-[#fbbf24] font-bold uppercase tracking-wider flex items-center gap-2">
              Nivel General
              {atMax && <span className="text-[#fbbf24] text-[8px] font-black uppercase tracking-widest bg-[#fbbf24]/10 px-1.5 py-0.5 rounded-full">MAX</span>}
            </h4>
            <div className="text-sm font-semibold text-slate-200">
              Nivel <span className="font-bold text-[#fbbf24]">{lvl}</span>
              <span className="text-slate-500 text-xs"> / {MAX_LEVEL}</span>
            </div>
            {!atMax && (
              <div className="text-[10px] text-[#8c7d70]">
                Faltan: <span className="text-slate-300 font-bold">{lvlMissing} niveles</span>
              </div>
            )}
            {atMax && <div className="text-[10px] text-[#fbbf24] font-semibold">¡Máximo Alcanzado!</div>}
          </div>

          {/* SVG ring nivel normal */}
          <div className="shrink-0 flex flex-col items-center gap-1.5">
            <svg width="88" height="88" viewBox={`0 0 ${radius * 2} ${radius * 2}`} className="block">
              <circle stroke="rgba(255,255,255,0.03)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
              <circle stroke={atMax ? '#fbbf24' : '#f97316'} fill="transparent" strokeWidth={stroke} strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={lvlStrokeDashoffset} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.7s ease' }} />
              <text x={radius} y={radius} textAnchor="middle" dominantBaseline="central" fill={atMax ? '#fbbf24' : '#f97316'} fontSize="13" fontWeight="800" fontFamily="Outfit, sans-serif">
                {lvlPct.toFixed(0)}%
              </text>
            </svg>
            <span className="text-[8px] text-[#8c7d70] uppercase tracking-widest font-semibold">Progreso Lvl</span>
          </div>
        </div>
      </div>

      {/* Datos Adicionales (Comando en caso de Dark Lord) */}
      {base.leadership > 0 && (
        <div className="bg-[#18120f] border border-[#2e221a] rounded-2xl p-4 flex justify-between items-center">
          <span className="text-xs text-[#8c7d70] uppercase tracking-wider font-bold">Liderazgo (Command)</span>
          <span className="text-base font-bold text-[#fbbf24]">{base.leadership}</span>
        </div>
      )}
      
    </div>
  )
}
