import React, { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchProfile } from '../services/muApi'

const IMG_BASE = 'https://www.baldunetamu.com'

const EXCELLENT_LABELS = {
  2: '+Life/kill',
  4: '+Mana/kill',
  8: '+DMG rate',
  16: '+Wizardry',
  32: '+Atk Speed',
  64: '+Dmg%',
}

function getExcellentOpts(excellent) {
  if (!excellent) return []
  return Object.entries(EXCELLENT_LABELS)
    .filter(([bit]) => (excellent & parseInt(bit)) !== 0)
    .map(([, label]) => label)
}

function rarityBorder(rarity) {
  return { legendary: 'border-[#fbbf24]', epic: 'border-[#c084fc]', rare: 'border-[#60a5fa]', uncommon: 'border-[#34d399]', common: 'border-[#2e221a]' }[rarity] || 'border-[#2e221a]'
}

function rarityGlow(rarity) {
  return { legendary: '0 0 14px rgba(251,191,36,0.4)', epic: '0 0 14px rgba(192,132,252,0.4)', rare: '0 0 12px rgba(96,165,250,0.3)', uncommon: '0 0 8px rgba(52,211,153,0.2)', common: '' }[rarity] || ''
}

function rarityColor(rarity) {
  return { legendary: 'text-[#fbbf24]', epic: 'text-[#c084fc]', rare: 'text-[#60a5fa]', uncommon: 'text-[#34d399]', common: 'text-[#8c7d70]' }[rarity] || 'text-[#8c7d70]'
}

export default function Equipamiento() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const name = searchParams.get('name')

  // Redirigir si no hay personaje activo
  useEffect(() => {
    if (!name) {
      navigate('/')
    }
  }, [name, navigate])

  const { data: profileData, isLoading, isError } = useQuery({
    queryKey: ['character', name?.toLowerCase()],
    queryFn: () => fetchProfile(name),
    enabled: !!name,
    retry: 1
  })

  useEffect(() => {
    if (name) {
      document.title = `Equipamiento · ${name}`
    }
    return () => {
      document.title = 'MU Personajes'
    }
  }, [name])

  if (isLoading) {
    return (
      <div className="min-h-screen pt-8">
        <div className="max-w-md mx-auto px-4 py-16 flex flex-col items-center justify-center gap-6">
          <div className="grid grid-cols-3 gap-4 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="skeleton rounded-2xl w-24 h-24 mx-auto"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !profileData) {
    return (
      <div className="min-h-screen pt-8">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-red-400">
          <div className="text-4xl mb-3">⚠️</div>
          <div className="text-sm">No se pudo cargar el equipamiento de {name}.</div>
          <button onClick={() => navigate(-1)} className="mt-4 text-xs text-[#fbbf24] hover:underline focus:outline-none">
            ← Volver
          </button>
        </div>
      </div>
    )
  }

  const inv = (profileData.inventory || []).filter(i => !i.isEmpty)

  // Organizar items en mapa por SlotIndex
  const equippedBySlot = {}
  inv.forEach(item => {
    equippedBySlot[item.slotIndex] = item
  })

  const renderSlot = (slotIndex, placeholderName, iconText) => {
    const item = equippedBySlot[slotIndex]

    if (!item) {
      return (
        <div 
          className="w-24 h-24 sm:w-32 sm:h-32 bg-[#18120f]/50 border border-[#2e221a]/85 rounded-3xl flex flex-col items-center justify-center text-[#8c7d70]/80 border-dashed transition-all"
          title={`Slot vacío: ${placeholderName}`}
        >
          <span className="text-3xl opacity-20">{iconText}</span>
          <span className="text-[10px] uppercase tracking-widest mt-1.5 font-bold opacity-30">{placeholderName}</span>
        </div>
      )
    }

    const excOpts = getExcellentOpts(item.excellent)
    const border = rarityBorder(item.rarity)
    const glow = rarityGlow(item.rarity)
    const color = rarityColor(item.rarity)

    return (
      <div
        className={`item-box relative bg-slate-950/80 border-2 ${border} rounded-3xl flex items-center justify-center cursor-default hover:bg-white/5 transition-all p-4 w-24 h-24 sm:w-32 sm:h-32`}
        style={{ boxShadow: glow }}
      >
        <img
          src={`${IMG_BASE}${item.imagePath}`}
          alt={item.name}
          className="object-contain pixelated w-16 h-16 sm:w-24 sm:h-24"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />

        {item.level > 0 && (
          <div className="absolute -top-2 -right-2 bg-[#f97316] text-white text-xs sm:text-sm font-black rounded-full flex items-center justify-center leading-none shadow-md shadow-black/50" style={{ width: '24px', height: '24px' }}>
            +{item.level}
          </div>
        )}

        {item.luck && (
          <div className="absolute bottom-2 left-2 bg-yellow-500/90 text-white text-[10px] sm:text-xs font-bold rounded px-2 py-0.5 leading-tight select-none">
            L
          </div>
        )}

        {item.ancient && (
          <div className="absolute bottom-2 right-2 bg-amber-500/90 text-white text-[10px] sm:text-xs font-bold rounded px-2 py-0.5 leading-tight select-none">
            A
          </div>
        )}

        {/* Tooltip flotante interactivo */}
        <div className="item-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-30 bg-[#120d0b] border border-[#ea580c]/35 rounded-xl p-3.5 text-xs text-slate-300 space-y-1.5 pointer-events-none w-48 shadow-2xl">
          <div className={`font-black uppercase text-[10px] tracking-wider ${color}`}>
            [{item.rarity}] +{item.level}
          </div>
          <div className="text-[11px] text-slate-200 font-semibold border-b border-white/5 pb-1">
            {item.name}
          </div>
          {item.ancient && <div className="text-amber-400 font-medium">✦ Ancient</div>}
          {item.skill && <div className="text-blue-400 font-medium">✦ Skill</div>}
          {item.luck && <div className="text-yellow-400 font-medium">✦ Luck</div>}
          {excOpts.map((o) => (
            <div key={o} className="text-[#fbbf24] text-[10px]">✦ {o}</div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16">
      
      {/* Contenedor principal de categorías de Equipamiento */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        
        <h3 className="cinzel text-base sm:text-lg text-[#fbbf24] text-center uppercase tracking-[5px] mb-12">
          Equipamiento • <span className="text-slate-200">{name}</span>
        </h3>

        {/* 1. SECCIÓN WEAPONS */}
        <div className="bg-[#120d0b]/80 border border-[#2e221a] rounded-3xl p-8">
          <h4 className="cinzel text-sm sm:text-base font-bold text-[#fbbf24] uppercase tracking-[4px] border-b border-[#2e221a]/60 pb-3 mb-6">
            Weapons
          </h4>
          <div className="flex flex-wrap gap-6">
            {renderSlot(0, 'Arma Der', '🗡️')}
            {renderSlot(1, 'Arma Izq', '🛡️')}
          </div>
        </div>

        {/* 2. SECCIÓN ARMOR */}
        <div className="bg-[#120d0b]/80 border border-[#2e221a] rounded-3xl p-8">
          <h4 className="cinzel text-sm sm:text-base font-bold text-[#fbbf24] uppercase tracking-[4px] border-b border-[#2e221a]/60 pb-3 mb-6">
            Armor
          </h4>
          <div className="flex flex-wrap gap-6">
            {renderSlot(2, 'Casco', '🪖')}
            {renderSlot(3, 'Pechera', '🛡️')}
            {renderSlot(4, 'Pantalón', '👖')}
            {renderSlot(5, 'Guantes', '🧤')}
            {renderSlot(6, 'Botas', '🥾')}
          </div>
        </div>

        {/* 3. SECCIÓN WINGS */}
        <div className="bg-[#120d0b]/80 border border-[#2e221a] rounded-3xl p-8">
          <h4 className="cinzel text-sm sm:text-base font-bold text-[#fbbf24] uppercase tracking-[4px] border-b border-[#2e221a]/60 pb-3 mb-6">
            Wings
          </h4>
          <div className="flex flex-wrap gap-6">
            {renderSlot(7, 'Alas', '🕊️')}
          </div>
        </div>

        {/* 4. SECCIÓN ACCESSORIES */}
        <div className="bg-[#120d0b]/80 border border-[#2e221a] rounded-3xl p-8">
          <h4 className="cinzel text-sm sm:text-base font-bold text-[#fbbf24] uppercase tracking-[4px] border-b border-[#2e221a]/60 pb-3 mb-6">
            Accessories
          </h4>
          <div className="flex flex-wrap gap-6">
            {renderSlot(10, 'Anillo R', '💍')}
            {renderSlot(9, 'Pendant', '📿')}
            {renderSlot(8, 'Mascota', '🦄')}
            {renderSlot(11, 'Anillo L', '💍')}
          </div>
        </div>

      </div>

    </div>
  )
}
