import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchProfile, fetchRanking, classInfo, getLocationStatus, formatNum } from '../services/muApi'

export default function CharacterDrawer({ name, onClose }) {
  // Query 1: Obtener el perfil del personaje
  const { data: profileData, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
    queryKey: ['character', name?.toLowerCase()],
    queryFn: () => fetchProfile(name),
    enabled: !!name,
    retry: 1
  })

  const classId = profileData?.character?.class

  // Query 2: Obtener el ranking de su clase (dependiente del perfil)
  const { data: rankingData, isLoading: isRankingLoading } = useQuery({
    queryKey: ['ranking', classId],
    queryFn: () => fetchRanking(classId),
    enabled: classId !== undefined,
    retry: 1
  })

  const isLoading = isProfileLoading || (classId !== undefined && isRankingLoading)

  if (!name) return null

  const ch = profileData?.character || {}
  const stats = profileData?.stats || {}
  const base = stats.base || {}
  const combat = stats.combat || {}
  const info = classInfo(ch.class)
  // La API puede devolver guild como objeto {name, mark, score, master} o como string
  const guildName = ch.guild && typeof ch.guild === 'object' ? ch.guild.name : ch.guild
  const ranking = rankingData || []
  
  const meRank = ranking.find(r => r.Name.toLowerCase() === ch.name?.toLowerCase())
  const rank = meRank ? '#' + meRank.RankingPos : '—'
  const mlVal = meRank ? meRank.MasterLevel : '—'
  const mLoc = getLocationStatus(ch.location)

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full max-w-md bg-gradient-to-br from-[#110a1f] to-[#0d0e15] border border-[#1f2937] rounded-3xl shadow-2xl flex flex-col animate-fade-in relative max-h-[85vh]"
      >
        {/* Cabecera del Drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
          <div>
            <div className="cinzel text-base font-bold text-[#34d399]">{isLoading ? 'Cargando...' : ch.name || name}</div>
            {!isLoading && <div className="text-xs text-[#c084fc]/70 mt-0.5">{info.name}</div>}
          </div>
          <div className="flex items-center gap-3">
            {!isLoading && !isProfileError && ch.name && (
              <Link
                to={`/equip?name=${encodeURIComponent(ch.name)}`}
                className="cinzel text-xs font-semibold tracking-wider text-[#c084fc] hover:text-white bg-[#c084fc]/10 hover:bg-[#c084fc]/20 border border-[#c084fc]/45 rounded-lg px-3 py-1.5 transition-all"
                onClick={onClose}
              >
                ⚔ Ver Items
              </Link>
            )}
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white text-2xl leading-none p-1 focus:outline-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Cuerpo del Drawer (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Skeleton de Carga */}
          {isLoading && (
            <div className="space-y-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="skeleton w-12 h-12 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-24 rounded"></div>
                    <div className="skeleton h-3 w-16 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <div className="skeleton h-7 w-16 rounded ml-auto"></div>
                  <div className="skeleton h-3 w-14 rounded ml-auto"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="skeleton h-12 rounded-lg"></div>
                <div className="skeleton h-12 rounded-lg"></div>
                <div className="skeleton h-12 rounded-lg"></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="skeleton h-14 rounded-xl"></div>
                <div className="skeleton h-14 rounded-xl"></div>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                <div className="skeleton h-12 rounded-lg"></div>
                <div className="skeleton h-12 rounded-lg"></div>
                <div className="skeleton h-12 rounded-lg"></div>
                <div className="skeleton h-12 rounded-lg"></div>
                <div className="skeleton h-12 rounded-lg"></div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="skeleton h-10 rounded-lg"></div>
                <div className="skeleton h-10 rounded-lg"></div>
                <div className="skeleton h-10 rounded-lg"></div>
                <div className="skeleton h-10 rounded-lg"></div>
              </div>
            </div>
          )}

          {/* Error en carga */}
          {!isLoading && isProfileError && (
            <div className="text-center py-16 space-y-3">
              <div className="text-red-400 text-xs py-2">No se pudo cargar el perfil del personaje.</div>
              <button onClick={onClose} className="text-xs text-[#c084fc] hover:underline focus:outline-none">Cerrar</button>
            </div>
          )}

          {/* Contenido Completo */}
          {!isLoading && !isProfileError && (
            <>
              {/* Sección Top Info */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="text-center bg-white/5 border border-white/5 rounded-xl px-3 py-2">
                    <div className="cinzel text-2xl font-black text-[#c084fc]">{rank}</div>
                    <div className="text-[8px] text-slate-500 tracking-[1.5px] uppercase">Rank</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-300">{guildName || 'Sin guild'}</div>
                    <div className="text-xs mt-1 flex items-center gap-1.5 flex-wrap">
                      {mLoc ? (
                        <span className={`${mLoc.color} font-medium`}>{mLoc.text}</span>
                      ) : (
                        <span className="text-slate-500 font-medium">Offline</span>
                      )}
                      {ch.location && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          ({ch.location.map}:{ch.location.x},{ch.location.y})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="cinzel text-xl font-bold text-[#f97316]">{ch.gearScore || '—'}</div>
                  <div className="text-[8px] text-slate-500 tracking-wider uppercase">GearScore</div>
                </div>
              </div>

              {/* Grid General */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">ML</div>
                  <div className="text-sm font-bold text-[#c084fc]">{mlVal}</div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Resets</div>
                  <div className="text-sm font-bold text-slate-200">{ch.resets !== undefined ? ch.resets : '—'}</div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Nivel</div>
                  <div className="text-sm font-bold text-slate-200">{ch.level !== undefined ? ch.level : '—'}</div>
                </div>
              </div>

              {/* Asesinatos y muertes */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#34d399]/5 border border-[#34d399]/15 rounded-xl p-3 flex items-center gap-2">
                  <span className="text-xl">⚔️</span>
                  <div>
                    <div className="text-[8px] text-slate-500 uppercase tracking-wider">Kills</div>
                    <div className="text-sm font-bold text-[#34d399]">{ch.kills !== undefined ? ch.kills.toLocaleString() : '—'}</div>
                  </div>
                </div>
                <div className="bg-[#f87171]/5 border border-[#f87171]/15 rounded-xl p-3 flex items-center gap-2">
                  <span className="text-xl">💀</span>
                  <div>
                    <div className="text-[8px] text-slate-500 uppercase tracking-wider">Muertes</div>
                    <div className="text-sm font-bold text-[#f87171]">{ch.deads !== undefined ? ch.deads.toLocaleString() : '—'}</div>
                  </div>
                </div>
              </div>

              {/* Stats base */}
              <div className="space-y-2">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Stats Base</div>
                <div className="grid grid-cols-5 gap-1">
                  <div className="bg-white/5 border border-white/5 rounded-lg p-2 text-center">
                    <div className="text-[8px] text-slate-500 mb-0.5">STR</div>
                    <div className="text-xs font-bold text-slate-200">{base.strength || 0}</div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-lg p-2 text-center">
                    <div className="text-[8px] text-slate-500 mb-0.5">AGI</div>
                    <div className="text-xs font-bold text-slate-200">{base.dexterity || 0}</div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-lg p-2 text-center">
                    <div className="text-[8px] text-slate-500 mb-0.5">VIT</div>
                    <div className="text-xs font-bold text-slate-200">{base.vitality || 0}</div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-lg p-2 text-center">
                    <div className="text-[8px] text-slate-500 mb-0.5">ENE</div>
                    <div className="text-xs font-bold text-slate-200">{base.energy || 0}</div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-lg p-2 text-center">
                    <div className="text-[8px] text-slate-500 mb-0.5">CMD</div>
                    <div className="text-xs font-bold text-slate-200">{base.leadership || 0}</div>
                  </div>
                </div>
              </div>

              {/* Combat stats */}
              <div className="space-y-2">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Combate</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 border border-white/5 rounded-lg p-2 flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 uppercase">Vida</span>
                    <span className="text-xs font-bold text-[#34d399]">{combat.maxLife !== undefined ? formatNum(combat.maxLife) : 0}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-lg p-2 flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 uppercase">Mana</span>
                    <span className="text-xs font-bold text-[#60a5fa]">{combat.maxMana !== undefined ? formatNum(combat.maxMana) : 0}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-lg p-2 flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 uppercase">BP</span>
                    <span className="text-xs font-bold text-[#fbbf24]">{combat.maxBP !== undefined ? formatNum(combat.maxBP) : 0}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-lg p-2 flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 uppercase">Escudo</span>
                    <span className="text-xs font-bold text-[#94a3b8]">{combat.shield !== undefined ? formatNum(combat.shield) : 0}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
