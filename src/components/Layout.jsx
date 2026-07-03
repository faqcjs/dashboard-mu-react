import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useCharacterStore } from '../store/useCharacterStore'
import UIProvider from './UIProvider'

export default function Layout({ children }) {
  const location = useLocation()
  const queryClient = useQueryClient()
  const { characterNames, selectedCharacterName, setSelectedCharacterName } = useCharacterStore()
  const [notifPermission, setNotifPermission] = useState('default')
  const [countdown, setCountdown] = useState(120)

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

  const requestNotifPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission()
      setNotifPermission(res)
    }
  }

  const isActive = (path) => location.pathname === path

  const navItems = [
    { label: 'General', path: '/', icon: '📊' },
    { label: 'Equipamiento', path: '/equip', icon: '⚔️' },
    { label: 'Rankings', path: '/ranking', icon: '🏆' },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0a0b10] text-slate-100 font-sans">
      
      {/* SIDEBAR - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#11131e] border-r border-[#1f2937] p-5 shrink-0">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="cinzel text-lg font-bold text-[#c084fc] tracking-widest flex items-center gap-2">
              ⚔️ MU Dashboard
            </h1>
            <p className="text-[10px] text-slate-500 tracking-wider mt-1 uppercase">Companion & Monitor</p>
          </div>
          {selectedCharacterName && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-white/5 border border-[#1f2937] rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] dot-pulse"></span>
              <span>{countdown}s</span>
            </div>
          )}
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path === '/equip' && selectedCharacterName ? `/equip?name=${encodeURIComponent(selectedCharacterName)}` : item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#c084fc]/15 text-[#c084fc] border-l-4 border-[#c084fc]'
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer del Sidebar con Controles */}
        <div className="pt-4 border-t border-[#1f2937] space-y-3">
          {/* Selector de personaje */}
          {characterNames.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Personaje Activo</label>
              <select
                value={selectedCharacterName || ''}
                onChange={(e) => setSelectedCharacterName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#c084fc]/60 transition-colors"
              >
                {characterNames.map((name) => (
                  <option key={name} value={name} className="bg-[#11131e] text-slate-300">
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notificaciones */}
          {typeof window !== 'undefined' && 'Notification' in window && (
            <button
              onClick={requestNotifPermission}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                notifPermission === 'granted'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-default'
                  : notifPermission === 'denied'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400 cursor-default'
                  : 'bg-[#c084fc]/10 border-[#c084fc]/20 text-[#c084fc] hover:bg-[#c084fc]/20'
              }`}
            >
              <span>{notifPermission === 'granted' ? '🔔' : '🔕'}</span>
              <span>
                {notifPermission === 'granted'
                  ? 'Alertas Activas'
                  : notifPermission === 'denied'
                  ? 'Alertas Bloqueadas'
                  : 'Activar Alertas'}
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* TOPBAR - Móvil */}
      <header className="md:hidden flex items-center justify-between bg-[#11131e] border-b border-[#1f2937] px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <h1 className="cinzel text-sm font-bold text-[#c084fc] tracking-wider flex items-center gap-1.5">
            ⚔️ MU Monitor
          </h1>
          {selectedCharacterName && (
            <div className="flex items-center gap-1 text-[9px] text-slate-500 bg-white/5 border border-white/5 rounded-full px-1.5 py-0.5">
              <span className="w-1 h-1 rounded-full bg-[#34d399] dot-pulse"></span>
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
              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#c084fc]/60"
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
              className="bg-[#c084fc]/15 border border-[#c084fc]/20 text-[#c084fc] text-xs px-2.5 py-1.5 rounded-lg font-medium"
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#11131e]/90 backdrop-blur-md border-t border-[#1f2937] flex justify-around py-1.5 z-40">
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path === '/equip' && selectedCharacterName ? `/equip?name=${encodeURIComponent(selectedCharacterName)}` : item.path}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all ${
                active ? 'text-[#c084fc]' : 'text-slate-500'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <UIProvider />
    </div>
  )
}
