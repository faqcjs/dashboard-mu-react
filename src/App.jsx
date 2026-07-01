import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Equipamiento from './components/Equipamiento'
import RankingsView from './components/RankingsView'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/equip" element={<Equipamiento />} />
          <Route path="/ranking" element={<RankingsView />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
