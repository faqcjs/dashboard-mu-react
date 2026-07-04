import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useCharacterStore } from '../store/useCharacterStore'
import UIProvider from './UIProvider'

// Iconos SVG de alta fidelidad y estilizados
const SwordIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Crossed Swords */}
    <path d="M18 6L6 18" />
    <path d="M4 20l2-2" />
    <path d="M17 4l3 3" />
    <path d="M6 6l12 12" />
    <path d="M20 20l-2-2" />
    <path d="M7 4L4 7" />
  </svg>
)

const LayoutIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Medieval Shield */}
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const TrophyIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Medieval Crown */}
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
    <path d="M3 20h18" />
    <path d="M5 16v4" />
    <path d="M19 16v4" />
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
    <div className="min-h-screen flex flex-col bg-[#0a0807] text-[#e3dac9] font-sans">
      
      {/* TOP HEADER DE MU BALDUNETA (Full Width) */}
      <header className="w-full bg-[#120d0b] border-b border-[#261c16] px-4 md:px-8 py-3 flex items-center justify-between z-50 sticky top-0 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        {/* Logo de Mu Balduneta */}
        <Link to="/" className="flex items-center gap-3">
          <span className="cinzel text-lg font-black tracking-widest bg-gradient-to-r from-[#ea580c] via-[#f59e0b] to-[#ea580c] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(234,88,12,0.3)]">
            MU BALDUNETA
          </span>
        </Link>

        {/* Botones de Control a la derecha */}
        <div className="flex items-center gap-2">
          {/* Selector de Balduneta V2 -> Enlace a página oficial */}
          <a
            href="https://www.baldunetamu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#ea580c]/15 hover:bg-[#ea580c]/25 border border-[#ea580c]/35 text-[#fbbf24] rounded-xl px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] dot-pulse"></span>
            <span>Balduneta V2</span>
          </a>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL: Sidebar + Contenido */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        
        {/* SIDEBAR - Desktop */}
        <aside className="hidden md:flex flex-col w-72 bg-gradient-to-b from-[#120d0b] to-[#18110e] border-r border-[#261c16] p-5 shrink-0 shadow-[5px_0_25px_rgba(0,0,0,0.4)]">
          {/* Links de Navegación de la App */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const active = isActive(item.path)
              // Mapeamos los textos para simular el menú detallado de Mu Balduneta
              let mainTitle = item.label
              let subtitle = ''
              if (item.path === '/') {
                mainTitle = 'Personajes'
                subtitle = 'Gestiona tus personajes y...'
              } else if (item.path === '/equip') {
                mainTitle = 'Equipamiento'
                subtitle = 'Visualiza tus items e inventario'
              } else if (item.path === '/ranking') {
                mainTitle = 'Rankings del Servidor'
                subtitle = 'Clasificaciones y competidores'
              }

              return (
                <Link
                  key={item.path}
                  to={item.path === '/equip' && selectedCharacterName ? `/equip?name=${encodeURIComponent(selectedCharacterName)}` : item.path}
                  className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all duration-300 select-none ${
                    active
                      ? 'bg-[#18120f] border-[#ea580c] text-[#fbbf24] shadow-md shadow-[#ea580c]/5'
                      : 'border-transparent hover:border-[#fbbf24]/20 text-[#8c7d70] hover:bg-[#120d0b] hover:text-[#fbbf24]'
                  }`}
                >
                  <span className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'text-[#ea580c]' : 'text-[#8c7d70] group-hover:text-[#fbbf24]'}`}>
                    {renderNavIcon(item.iconType, 'w-5 h-5')}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-bold uppercase tracking-wider ${active ? 'text-[#fbbf24]' : 'text-[#8c7d70] group-hover:text-[#e3dac9]'}`}>{mainTitle}</span>
                    <span className="text-[9px] text-[#6b5d50] truncate mt-0.5">{subtitle}</span>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Controles del Sidebar */}
          <div className="pt-4 border-t border-[#261c16] space-y-4">
            {/* Selector de personaje activo */}
            {characterNames.length > 0 && (
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="text-[9px] text-[#8c7d70] uppercase tracking-wider block font-semibold">Personaje Activo</label>
                
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-[#18120f] hover:bg-[#1e1713] border border-[#2e221a] hover:border-[#fbbf24]/30 rounded-xl px-3 py-2 text-xs text-slate-300 flex items-center justify-between cursor-pointer transition-all duration-300 select-none shadow-lg"
                >
                  <div className="flex items-center gap-2 truncate">
                    <UserIcon className="w-3.5 h-3.5 text-[#fbbf24] shrink-0" />
                    <span className="truncate font-semibold">{selectedCharacterName || 'Seleccionar...'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] dot-pulse"></span>
                    <ChevronDownIcon className={`w-3 h-3 text-[#8c7d70] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-50 bottom-full left-0 right-0 mb-2 bg-[#120d0b] border border-[#2e221a] rounded-xl shadow-2xl overflow-hidden py-1 max-h-48 overflow-y-auto">
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
                              ? 'bg-[#ea580c]/15 text-[#fbbf24] font-semibold border-l-2 border-[#ea580c]'
                              : 'text-slate-300 hover:bg-[#1a1411] hover:text-[#fbbf24]'
                          }`}
                        >
                          <span className="truncate">{name}</span>
                          {isSel && <span className="text-[9px] text-[#fbbf24] uppercase font-bold tracking-wider">Activo</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Alertas del Sistema */}
            {typeof window !== 'undefined' && 'Notification' in window && (
              <button
                onClick={requestNotifPermission}
                disabled={notifPermission === 'granted' || notifPermission === 'denied'}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all duration-300 ${
                  notifPermission === 'granted'
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 cursor-default'
                    : notifPermission === 'denied'
                    ? 'bg-red-500/5 border-red-500/20 text-red-400 cursor-default'
                    : 'bg-[#ea580c]/5 border-[#ea580c]/20 text-[#fbbf24] hover:bg-[#ea580c]/15 hover:border-[#ea580c]/40 cursor-pointer'
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
                    <BellIcon className="w-3.5 h-3.5 text-[#fbbf24] shrink-0 animate-bounce" style={{ animationDuration: '2s' }} />
                    <span>Activar Alertas</span>
                  </>
                )}
              </button>
            )}

          </div>
        </aside>

        {/* TOPBAR - Móvil */}
        <header className="md:hidden flex items-center justify-between bg-[#120d0b] border-b border-[#261c16] px-4 py-3 sticky top-12 z-40 shadow-md">
          <div className="flex items-center gap-2">
            <h1 className="cinzel text-xs font-bold tracking-wider text-[#fbbf24]">
              MU Monitor
            </h1>
            {selectedCharacterName && (
              <div className="flex items-center gap-1 text-[9px] text-[#fbbf24] bg-[#ea580c]/5 border border-[#ea580c]/20 rounded-full px-2 py-0.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] dot-pulse"></span>
                <span>{countdown}s</span>
              </div>
            )}
          </div>

          {/* Controles rápidos móviles */}
          <div className="flex items-center gap-2">
            {characterNames.length > 0 && (
              <select
                value={selectedCharacterName || ''}
                onChange={(e) => setSelectedCharacterName(e.target.value)}
                className="bg-[#18120f] border border-[#2e221a] rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-[#fbbf24]/50 transition-all select-none"
              >
                {characterNames.map((name) => (
                  <option key={name} value={name} className="bg-[#120d0b] text-slate-300">
                    {name}
                  </option>
                ))}
              </select>
            )}

            {typeof window !== 'undefined' && 'Notification' in window && notifPermission !== 'granted' && (
              <button
                onClick={requestNotifPermission}
                className="bg-[#ea580c]/10 hover:bg-[#ea580c]/25 border border-[#ea580c]/25 hover:border-[#ea580c]/40 text-[#fbbf24] text-xs px-2.5 py-1 rounded-lg font-semibold transition-all"
              >
                🔔 Activar
              </button>
            )}
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 overflow-y-auto">
          <div className="flex-1 px-4 py-6 md:p-8">
            {children}
          </div>
        </main>

        {/* BOTTOMBAR - Móvil */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#120d0b]/95 backdrop-blur-md border-t border-[#261c16] flex justify-around py-2 z-40 shadow-lg">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path === '/equip' && selectedCharacterName ? `/equip?name=${encodeURIComponent(selectedCharacterName)}` : item.path}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-300 ${
                  active ? 'text-[#fbbf24] scale-105' : 'text-[#8c7d70] hover:text-[#fbbf24]'
                }`}
              >
                <span className={`transition-transform duration-300 ${active ? 'text-[#fbbf24]' : 'text-[#8c7d70]'}`}>
                  {renderNavIcon(item.iconType, 'w-5 h-5')}
                </span>
                <span className="text-[9px] font-semibold tracking-wider">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>


      <UIProvider />
    </div>
  )
}

