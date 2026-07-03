import React from 'react'
import { useCharacterStore } from '../store/useCharacterStore'
import { useUIStore } from '../store/useUIStore'

export default function CharacterTabs() {
  const {
    characterNames,
    selectedCharacterName,
    setSelectedCharacterName,
    removeCharacterName
  } = useCharacterStore()

  const { openAddCharacterModal, showConfirm } = useUIStore()

  const handleRemove = (name) => {
    showConfirm({
      title: 'Quitar personaje',
      message: `¿Quitar a ${name} del monitoreo?`,
      onConfirm: () => removeCharacterName(name)
    })
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
                handleRemove(name)
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
        onClick={openAddCharacterModal}
        className="ml-2 text-slate-600 hover:text-[#c084fc] transition-colors text-lg leading-none py-3 shrink-0 focus:outline-none"
        title="Agregar personaje"
      >
        +
      </button>
    </div>
  )
}
