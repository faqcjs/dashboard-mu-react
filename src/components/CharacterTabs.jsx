import React from 'react'
import { useCharacterStore } from '../store/useCharacterStore'
import { fetchProfile } from '../services/muApi'

export default function CharacterTabs() {
  const {
    characterNames,
    selectedCharacterName,
    setSelectedCharacterName,
    removeCharacterName,
    addCharacterName
  } = useCharacterStore()

  const handlePromptAdd = async () => {
    const name = prompt('Nombre del nuevo personaje:')
    if (!name?.trim()) return

    try {
      // Verificar si ya existe en la lista local antes de hacer fetch
      if (characterNames.some(n => n.toLowerCase() === name.trim().toLowerCase())) {
        alert('El personaje ya está agregado.')
        return
      }

      const profile = await fetchProfile(name.trim())
      addCharacterName(profile.character.name)
    } catch (e) {
      if (e.message.includes('no encontrado') || e.message.includes('404')) {
        alert('No se encontró el personaje. Revisá el nombre.')
      } else {
        alert('Error de conexión o personaje inexistente.')
      }
    }
  }

  return (
    <div id="char-tabs" className="border-b border-[#1e1e2e] px-4 flex gap-1 overflow-x-auto items-center" style={{ background: '#0a0a0f' }}>
      {characterNames.map((name) => {
        const isActive = selectedCharacterName?.toLowerCase() === name.toLowerCase()
        return (
          <button
            key={name}
            onClick={() => setSelectedCharacterName(name)}
            className={`${isActive ? 'tab-active' : 'tab-inactive'
              } cinzel text-xs tracking-widest py-3 px-1 whitespace-nowrap transition-colors flex items-center gap-1.5 focus:outline-none`}
          >
            {name}
            <span
              onClick={(e) => {
                e.stopPropagation()
                removeCharacterName(name)
              }}
              className="text-slate-600 hover:text-red-400 transition-colors text-base leading-none ml-1 cursor-pointer"
              title="Quitar"
            >
              ×
            </span>
          </button>
        )
      })}
      <button
        onClick={handlePromptAdd}
        className="ml-2 text-slate-600 hover:text-[#c084fc] transition-colors text-lg leading-none py-3 shrink-0 focus:outline-none"
        title="Agregar personaje"
      >
        +
      </button>
    </div>
  )
}
