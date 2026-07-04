import React from 'react'
import { formatNum, posColor } from '../services/muApi'

export default function RankingTable({ rankingData, selectedName, onRowClick, isLoading }) {
  const myName = selectedName?.toLowerCase()

  if (isLoading) {
    return (
      <div className="overflow-x-auto rounded-xl border border-[#2e221a] bg-[#120d0b]">
        <div className="p-4 space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="flex gap-4 items-center px-2 py-2">
              <div className="skeleton h-4 w-8 rounded"></div>
              <div className="skeleton h-4 w-28 rounded"></div>
              <div className="skeleton h-4 w-20 rounded hidden sm:block"></div>
              <div className="skeleton h-4 w-10 rounded"></div>
              <div className="skeleton h-4 w-16 rounded"></div>
              <div className="skeleton h-4 w-10 rounded hidden sm:block"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!rankingData || rankingData.length === 0) {
    return (
      <div className="overflow-x-auto rounded-xl border border-[#2e221a] bg-[#120d0b]">
        <div className="text-center py-12 text-[#8c7d70] text-sm">
          No hay datos de ranking para esta clase.
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#2e221a] bg-[#120d0b]">
      <table className="w-full text-sm min-w-[380px]">
        <thead>
          <tr className="border-b border-[#2e221a] text-left">
            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-[#8c7d70] font-bold">#</th>
            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-[#8c7d70] font-bold">Nombre</th>
            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-[#8c7d70] font-bold hidden sm:table-cell">Guild</th>
            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-[#8c7d70] font-bold">ML</th>
            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-[#8c7d70] font-bold">EXP</th>
            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-[#8c7d70] font-bold hidden sm:table-cell">GS</th>
            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-[#8c7d70] font-bold hidden md:table-cell">Info</th>
          </tr>
        </thead>
        <tbody>
          {rankingData.map((r, i) => {
            const isMe = r.Name.toLowerCase() === myName
            const pos = parseInt(r.RankingPos)
            return (
              <tr
                key={r.Name}
                onClick={() => onRowClick && onRowClick(r.Name)}
                className={`${
                  isMe ? 'bg-[#ea580c]/10 border-l-2 border-[#ea580c]' : ''
                } border-b border-[#2e221a]/40 hover:bg-[#1a1411]/50 transition-colors cursor-pointer`}
              >
                <td className={`px-4 py-3 cinzel font-bold text-sm ${posColor(pos)}`}>
                  #{r.RankingPos}
                </td>
                <td className={`px-4 py-3 text-sm ${isMe ? 'font-bold text-[#fbbf24]' : 'font-medium text-slate-200'}`}>
                  {r.Name}
                  {isMe && ' ←'}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  {r.Guild && r.Guild !== 'No Guild' ? (
                    <span className="text-xs text-slate-300 bg-[#1a1411] border border-[#2e221a] rounded px-2 py-0.5">{r.Guild}</span>
                  ) : (
                    <span className="text-[#6b5d50] text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-bold text-[#fbbf24] text-sm">{r.MasterLevel}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{formatNum(r.MasterExperience)}</td>
                <td className="px-4 py-3 text-[#f97316] font-bold text-sm hidden sm:table-cell">{r.GearScore}</td>
                <td className="px-4 py-3 text-[#8c7d70] text-xs hidden md:table-cell">
                  {r.ResetCount}r · lv{r.cLevel}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
