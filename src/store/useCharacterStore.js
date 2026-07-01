import { create } from 'zustand'

const STORAGE_KEY = 'mu_characters'

export const useCharacterStore = create((set, get) => ({
  characterNames: (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    } catch {
      return []
    }
  })(),
  
  selectedCharacterName: (() => {
    try {
      const names = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
      return names[0] || null
    } catch {
      return null
    }
  })(),
  
  expOnLoad: {},

  addCharacterName: (name) => {
    const currentNames = get().characterNames
    if (currentNames.some(n => n.toLowerCase() === name.toLowerCase())) {
      throw new Error('El personaje ya está agregado.')
    }
    const nextNames = [...currentNames, name]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextNames))
    set({
      characterNames: nextNames,
      selectedCharacterName: name
    })
  },

  removeCharacterName: (name) => {
    const currentNames = get().characterNames
    const nextNames = currentNames.filter(n => n.toLowerCase() !== name.toLowerCase())
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextNames))
    
    let nextSelected = get().selectedCharacterName
    if (nextSelected && nextSelected.toLowerCase() === name.toLowerCase()) {
      nextSelected = nextNames[0] || null
    }
    
    set({
      characterNames: nextNames,
      selectedCharacterName: nextSelected
    })
  },

  setSelectedCharacterName: (name) => set({ selectedCharacterName: name }),

  saveExpOnLoad: (name, exp) => {
    const key = name.toLowerCase()
    const currentExp = get().expOnLoad[key]
    if (currentExp !== undefined) return
    
    set(state => ({
      expOnLoad: {
        ...state.expOnLoad,
        [key]: parseInt(exp) || 0
      }
    }))
  },

  getExpDelta: (name, currentExp) => {
    const key = name.toLowerCase()
    const initial = get().expOnLoad[key]
    if (initial === undefined) return null
    const delta = (parseInt(currentExp) || 0) - initial
    return delta > 0 ? delta : null
  }
}))
