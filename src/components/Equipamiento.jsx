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
  return { legendary: 'border-[#fbbf24]', epic: 'border-[#c084fc]', rare: 'border-[#60a5fa]', uncommon: 'border-[#34d399]', common: 'border-white/10' }[rarity] || 'border-white/10'
}

function rarityGlow(rarity) {
  return { legendary: '0 0 14px rgba(251,191,36,0.4)', epic: '0 0 14px rgba(192,132,252,0.4)', rare: '0 0 12px rgba(96,165,250,0.3)', uncommon: '0 0 8px rgba(52,211,153,0.2)', common: '' }[rarity] || ''
}

function rarityColor(rarity) {
  return { legendary: 'text-[#fbbf24]', epic: 'text-[#c084fc]', rare: 'text-[#60a5fa]', uncommon: 'text-[#34d399]', common: 'text-slate-400' }[rarity] || 'text-slate-400'
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
      <div className="min-h-screen">
        <header className="border-b border-[#1f2937] px-4 py-3 flex items-center justify-between bg-[#11131e] sticky top-0 z-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-[#c084fc] transition-colors text-sm focus:outline-none">
            <span className="text-lg">←</span> Volver
          </button>
          <div className="cinzel text-sm font-bold text-[#c084fc]">Cargando Inventario...</div>
          <div className="w-10"></div>
        </header>
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
      <div className="min-h-screen">
        <header className="border-b border-[#1f2937] px-4 py-3 flex items-center bg-[#11131e] sticky top-0 z-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-[#c084fc] transition-colors text-sm focus:outline-none">
            <span className="text-lg">←</span> Volver
          </button>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-red-400">
          <div className="text-4xl mb-3">⚠️</div>
          <div className="text-sm">No se pudo cargar el equipamiento de {name}.</div>
          <button onClick={() => navigate(-1)} className="mt-4 text-xs text-[#c084fc] hover:underline focus:outline-none">
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
          className="w-20 h-20 sm:w-24 sm:h-24 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-700 border-dashed transition-all"
          title={`Slot vacío: ${placeholderName}`}
        >
          <span className="text-xl opacity-20">{iconText}</span>
          <span className="text-[8px] uppercase tracking-widest mt-1 font-bold opacity-20">{placeholderName}</span>
        </div>
      )
    }

    const excOpts = getExcellentOpts(item.excellent)
    const border = rarityBorder(item.rarity)
    const glow = rarityGlow(item.rarity)
    const color = rarityColor(item.rarity)

    return (
      <div
        className={`item-box relative bg-slate-950/80 border-2 ${border} rounded-2xl flex items-center justify-center cursor-default hover:bg-white/5 transition-all p-2 w-20 h-20 sm:w-24 sm:h-24`}
        style={{ boxShadow: glow }}
      >
        <img
          src={`${IMG_BASE}${item.imagePath}`}
          alt={item.name}
          className="object-contain pixelated w-14 h-14 sm:w-16 sm:h-16"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />

        {item.level > 0 && (
          <div className="absolute -top-1.5 -right-1.5 bg-[#f97316] text-white text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center leading-none" style={{ width: '18px', height: '18px' }}>
            +{item.level}
          </div>
        )}

        {item.luck && (
          <div className="absolute bottom-1 left-1 bg-yellow-500/90 text-white text-[8px] sm:text-[9px] font-bold rounded px-1.5 py-0.5 leading-tight select-none">
            L
          </div>
        )}

        {item.ancient && (
          <div className="absolute bottom-1 right-1 bg-amber-500/90 text-white text-[8px] sm:text-[9px] font-bold rounded px-1.5 py-0.5 leading-tight select-none">
            A
          </div>
        )}

        {/* Tooltip flotante interactivo */}
        <div className="item-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-30 bg-[#0d0d1a] border border-[#c084fc]/30 rounded-xl p-3.5 text-xs text-slate-300 space-y-1.5 pointer-events-none w-48 shadow-2xl">
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
            <div key={o} className="text-[#c084fc] text-[10px]">✦ {o}</div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12">
      
      {/* Cabecera */}
      <header className="border-b border-[#1f2937] px-4 py-3 flex items-center justify-between bg-[#11131e] sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-[#c084fc] transition-colors text-sm focus:outline-none">
          <span className="text-lg">←</span> Volver
        </button>
        <div className="text-center">
          <div className="cinzel text-xs font-bold text-[#c084fc] tracking-widest">⚔ Equipamiento</div>
          <div className="text-[10px] text-slate-400 font-semibold">{name}</div>
        </div>
        <div className="w-10"></div>
      </header>

      {/* Grid Paperdoll del Personaje */}
      <div className="max-w-md mx-auto px-4 py-8">
        
        <h3 className="cinzel text-xs text-slate-500 text-center uppercase tracking-[4px] mb-8">
          Inventario Equipado
        </h3>

        <div className="grid grid-cols-3 gap-y-4 gap-x-2.5 justify-items-center items-center relative">
          
          {/* Fila 1: Wings en el centro */}
          <div className="col-start-2 justify-self-center">
            {renderSlot(8, 'Alas', '🕊️')}
          </div>

          {/* Fila 2: Casco, Silueta/Avatar central, y Collar */}
          <div className="col-start-1 row-start-2">
            {renderSlot(2, 'Casco', '🪖')}
          </div>
          
          {/* Avatar del centro */}
          <div className="col-start-2 row-start-2 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-slate-800 opacity-25 select-none relative">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            <div className="absolute text-[8px] uppercase tracking-widest text-slate-500 font-bold bottom-1">Cuerpo</div>
          </div>
          
          <div className="col-start-3 row-start-2">
            {renderSlot(9, 'Collar', '📿')}
          </div>

          {/* Fila 3: Pechera, Arma Principal, Escudo/Arma Secundaria */}
          <div className="col-start-1 row-start-3">
            {renderSlot(3, 'Pechera', '🛡️')}
          </div>
          <div className="col-start-2 row-start-3">
            {renderSlot(0, 'Arma Der', '🗡️')}
          </div>
          <div className="col-start-3 row-start-3">
            {renderSlot(1, 'Arma Izq', '🛡️')}
          </div>

          {/* Fila 4: Guantes, Pantalón, Mascota */}
          <div className="col-start-1 row-start-4">
            {renderSlot(5, 'Guantes', '🧤')}
          </div>
          <div className="col-start-2 row-start-4">
            {renderSlot(4, 'Pantalón', '👖')}
          </div>
          <div className="col-start-3 row-start-4">
            {renderSlot(12, 'Mascota', '🦄')}
          </div>

          {/* Fila 5: Botas, Anillo 1, Anillo 2 */}
          <div className="col-start-1 row-start-5">
            {renderSlot(6, 'Botas', '🥾')}
          </div>
          <div className="col-start-2 row-start-5">
            {renderSlot(10, 'Anillo R', '💍')}
          </div>
          <div className="col-start-3 row-start-5">
            {renderSlot(11, 'Anillo L', '💍')}
          </div>

        </div>

      </div>

    </div>
  )
}
