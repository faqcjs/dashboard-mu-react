export const PROFILE_API = 'https://www.baldunetamu.com/api/characters/public-profile'
export const RANKING_API = 'https://www.baldunetamu.com/api/ranking/level'
export const REALM = 'balduneta_v2'

export const CLASS_MAP = {
  0: { name: 'Dark Wizard', filter: 'dw' },
  2: { name: 'Dark Wizard', filter: 'dw' },
  16: { name: 'Dark Wizard', filter: 'dw' },
  1: { name: 'Dark Knight', filter: 'dk' },
  17: { name: 'Dark Knight', filter: 'dk' },
  18: { name: 'Dark Knight', filter: 'dk' },
  33: { name: 'Elf', filter: 'elf' },
  34: { name: 'Elf', filter: 'elf' },
  48: { name: 'Magic Gladiator', filter: 'mg' },
  50: { name: 'Magic Gladiator', filter: 'mg' },
  64: { name: 'Lord Emperor', filter: 'lord' },
  66: { name: 'Lord Emperor', filter: 'lord' },
  80: { name: 'Summoner', filter: 'sum' },
  81: { name: 'Summoner', filter: 'sum' },
  82: { name: 'Summoner', filter: 'sum' },
  96: { name: 'Rage Fighter', filter: 'rf' },
  98: { name: 'Rage Fighter', filter: 'rf' },
}

export const SAFE_ZONES = [
  { map: 38, x: 71, y: 106 },
  { map: 4, x: 94, y: 86 },
  { map: 4, x: 20, y: 217 },
]
export const SAFE_RADIUS = 5

export function formatNum(n) {
  n = parseInt(n)
  if (isNaN(n) || n <= 0) return '0'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K'
  return n.toLocaleString()
}

export function posColor(pos) {
  if (pos === 1) return 'text-[#fbbf24]'
  if (pos === 2) return 'text-slate-400'
  if (pos === 3) return 'text-[#cd7c3a]'
  return 'text-slate-500'
}

export function classInfo(id) {
  return CLASS_MAP[id] || { name: 'Clase ' + id, filter: 'sum' }
}

export function expForML(n) {
  return n * (35208100 + n * 240000)
}

export function getLocationStatus(location, isOnline) {
  if (!isOnline) return null // Si está offline no mostramos estado de ubicación o lo mostramos como desconectado
  if (!location) return { text: '⚔️ Farmeando', color: 'text-[#f97316]', bg: 'rgba(249,115,22,.15)', border: '#f97316' }
  const { map, x, y } = location
  const inSafe = SAFE_ZONES.some(z => z.map === map && Math.abs(z.x - x) <= SAFE_RADIUS && Math.abs(z.y - y) <= SAFE_RADIUS)
  return inSafe
    ? { text: '🛡️ En safe', color: 'text-[#34d399]', bg: 'rgba(52,211,153,.15)', border: '#34d399' }
    : { text: '⚔️ Farmeando', color: 'text-[#f97316]', bg: 'rgba(249,115,22,.15)', border: '#f97316' }
}

export async function fetchProfile(name) {
  const res = await fetch(`${PROFILE_API}?name=${encodeURIComponent(name)}&realm=${REALM}`)
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const json = await res.json()
  if (!json.success || !json.data) throw new Error('Personaje no encontrado')
  return json.data
}

export async function fetchRanking(classId) {
  const info = classInfo(classId)
  const res = await fetch(`${RANKING_API}?realm=${REALM}&classFilter=${info.filter}`)
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const json = await res.json()
  return json.ranking || []
}
