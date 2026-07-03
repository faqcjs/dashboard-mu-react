import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useCharacterStore } from '../store/useCharacterStore'
import UIProvider from './UIProvider'

// Iconos SVG de alta fidelidad y estilizados
const SwordIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="21" y2="19" />
    <polyline points="14.5 14.5 18 11 21 14 17 18 14.5 14.5" />
  </svg>
)

const LayoutIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
)

const TrophyIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
    <path d="M12 2a7.7 7.7 0 0 1 7.54 8H4.46A7.7 7.7 0 0 1 12 2z" />
  </svg>
)

const BellIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
)

const BellOffIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    <path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
    <path d="M18 8a6 6 0 0 0-9.33-5" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const ChevronDownIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const UserIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

export default function Layout({ children }) {
  const location = useLocation()
  const queryClient = useQueryClient()
  const { characterNames, selectedCharacterName, setSelectedCharacterName } = useCharacterStore()
  const [notifPermission, setNotifPermission] = useState('default')
  const [countdown, setCountdown] = useState(120)
  
  // Estados para el selector personalizado de personajes (Dropdown)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Resetear la cuenta regresiva al cambiar de personaje
  useEffect(() => {
    setCountdown(120)
  }, [selectedCharacterName])

  // Temporizador en segundo plano para refrescar TanStack Query
  useEffect(() => {
    if (!selectedCharacterName) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          queryClient.invalidateQueries({ queryKey: ['character', selectedCharacterName.toLowerCase()] })
          queryClient.invalidateQueries({ queryKey: ['ranking'] })
          return 120
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [selectedCharacterName, queryClient])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission)
    }
  }, [])

  // Detectar clics fuera del selector de personaje para cerrarlo
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const requestNotifPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission()
      setNotifPermission(res)
    }
  }

  const isActive = (path) => location.pathname === path

  const navItems = [
    { label: 'General', path: '/', iconType: 'dashboard' },
    { label: 'Equipamiento', path: '/equip', iconType: 'equip' },
    { label: 'Rankings', path: '/ranking', iconType: 'ranking' },
  ]

  const renderNavIcon = (iconType, className) => {
    switch (iconType) {
      case 'dashboard':
        return <LayoutIcon className={className} />
      case 'equip':
        return <SwordIcon className={className} />
      case 'ranking':
        return <TrophyIcon className={className} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0a0b10] text-slate-100 font-sans">
      
      {/* SIDEBAR - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-[#0c0d16] to-[#11131f] border-r border-white/[0.05] p-5 shrink-0 shadow-[5px_0_25px_rgba(0,0,0,0.3)]">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="cinzel text-lg font-bold tracking-widest">
              <span className="bg-gradient-to-r from-[#c084fc] via-[#e9d5ff] to-[#a855f7] bg-clip-text text-transparent">
                MU Dashboard
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 tracking-[3px] mt-1.5 uppercase font-medium">Companion & Monitor</p>
          </div>
          {selectedCharacterName && (
            <div className="flex items-center gap-1.5 text-[10px] text-[#c084fc] bg-[#c084fc]/5 border border-[#c084fc]/20 rounded-full px-2.5 py-1 font-mono shadow-[0_0_10px_rgba(192,132,252,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] dot-pulse"></span>
              <span>{countdown}s</span>
            </div>
          )}
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 space-y-2 relative">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path === '/equip' && selectedCharacterName ? `/equip?name=${encodeURIComponent(selectedCharacterName)}` : item.path}
                className={`group relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden ${
                  active
                    ? 'bg-gradient-to-r from-[#c084fc]/12 to-[#c084fc]/0 text-white shadow-[0_0_15px_rgba(192,132,252,0.05)]'
                    : 'text-slate-400 hover:bg-[#c084fc]/5 hover:text-slate-200 hover:translate-x-1'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 bg-[#c084fc] rounded-r-md"></span>
                )}
                <span className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'text-[#c084fc]' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {renderNavIcon(item.iconType, 'w-4.5 h-4.5')}
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer del Sidebar con Controles */}
        <div className="pt-4 border-t border-white/[0.05] space-y-4">
          {/* Selector de personaje personalizado */}
          {characterNames.length > 0 && (
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Personaje Activo</label>
              
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-[#c084fc]/30 rounded-xl px-3 py-2.5 text-xs text-slate-300 flex items-center justify-between cursor-pointer transition-all duration-300 select-none shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
              >
                <div className="flex items-center gap-2 truncate">
                  <UserIcon className="w-3.5 h-3.5 text-[#c084fc] shrink-0" />
                  <span className="truncate font-semibold">{selectedCharacterName || 'Seleccionar...'}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] dot-pulse"></span>
                  <ChevronDownIcon className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute z-50 bottom-full left-0 right-0 mb-2 bg-[#121422] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in py-1 max-h-48 overflow-y-auto">
                  {characterNames.map((name) => {
                    const isSel = selectedCharacterName?.toLowerCase() === name.toLowerCase()
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setSelectedCharacterName(name)
                          setIsDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                          isSel
                            ? 'bg-[#c084fc]/15 text-[#c084fc] font-semibold'
                            : 'text-slate-300 hover:bg-white/[0.03] hover:text-white'
                        }`}
                      >
                        <span className="truncate">{name}</span>
                        {isSel && <span className="text-[10px] text-[#c084fc] uppercase font-bold tracking-wider">Activo</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Notificaciones */}
          {typeof window !== 'undefined' && 'Notification' in window && (
            <button
              onClick={requestNotifPermission}
              disabled={notifPermission === 'granted' || notifPermission === 'denied'}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 border transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${
                notifPermission === 'granted'
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 cursor-default'
                  : notifPermission === 'denied'
                  ? 'bg-red-500/5 border-red-500/20 text-red-400 cursor-default'
                  : 'bg-[#c084fc]/5 border-[#c084fc]/20 text-[#c084fc] hover:bg-[#c084fc]/15 hover:border-[#c084fc]/40 cursor-pointer'
              }`}
            >
              {notifPermission === 'granted' ? (
                <>
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <BellIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Alertas Activas</span>
                </>
              ) : notifPermission === 'denied' ? (
                <>
                  <BellOffIcon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>Alertas Bloqueadas</span>
                </>
              ) : (
                <>
                  <BellIcon className="w-3.5 h-3.5 text-[#c084fc] shrink-0 animate-bounce" style={{ animationDuration: '2s' }} />
                  <span>Activar Alertas</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>

      {/* TOPBAR - Móvil */}
      <header className="md:hidden flex items-center justify-between bg-[#0e0f17] border-b border-white/[0.05] px-4 py-3 sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <h1 className="cinzel text-xs font-bold tracking-wider bg-gradient-to-r from-[#c084fc] to-[#e9d5ff] bg-clip-text text-transparent">
              MU Monitor
            </h1>
          </div>
          {selectedCharacterName && (
            <div className="flex items-center gap-1 text-[9px] text-[#c084fc] bg-[#c084fc]/5 border border-[#c084fc]/20 rounded-full px-2 py-0.5 font-mono shadow-[0_0_8px_rgba(192,132,252,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] dot-pulse"></span>
              <span>{countdown}s</span>
            </div>
          )}
        </div>

        {/* Controles rápidos móviles */}
        <div className="flex items-center gap-2">
          {/* Selector de personaje móvil */}
          {characterNames.length > 0 && (
            <select
              value={selectedCharacterName || ''}
              onChange={(e) => setSelectedCharacterName(e.target.value)}
              className="bg-white/5 border border-white/10 hover:border-[#c084fc]/30 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#c084fc]/60 transition-all select-none"
            >
              {characterNames.map((name) => (
                <option key={name} value={name} className="bg-[#11131e] text-slate-300">
                  {name}
                </option>
              ))}
            </select>
          )}

          {/* Botón de alertas móvil */}
          {typeof window !== 'undefined' && 'Notification' in window && notifPermission !== 'granted' && (
            <button
              onClick={requestNotifPermission}
              className="bg-[#c084fc]/10 hover:bg-[#c084fc]/25 border border-[#c084fc]/25 hover:border-[#c084fc]/40 text-[#c084fc] text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all shadow-[0_2px_8px_rgba(192,132,252,0.1)]"
            >
              🔔 Activar
            </button>
          )}
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 overflow-y-auto">
        <div className="flex-1">
          {children}
        </div>
      </main>

      {/* BOTTOMBAR - Móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0e0f17]/95 backdrop-blur-md border-t border-white/[0.05] flex justify-around py-2 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path === '/equip' && selectedCharacterName ? `/equip?name=${encodeURIComponent(selectedCharacterName)}` : item.path}
              className={`flex flex-col items-center gap-1.5 py-1 px-4 rounded-xl transition-all duration-300 ${
                active ? 'text-[#c084fc] scale-105' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className={`transition-transform duration-300 ${active ? 'text-[#c084fc]' : 'text-slate-500'}`}>
                {renderNavIcon(item.iconType, 'w-5 h-5')}
              </span>
              <span className="text-[10px] font-semibold tracking-wider">{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <UIProvider />
    </div>
  )
}

