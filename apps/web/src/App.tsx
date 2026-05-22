import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { LoadingMessage } from './components/LoadingMessage'
import { loadingMessages, futureModules } from './data/mockIndra'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { AuthPage } from './pages/AuthPage'
import { ChallengesPage } from './pages/ChallengesPage'
import { CheckInPage } from './pages/CheckInPage'
import { DashboardPage } from './pages/DashboardPage'
import { FutureModulePage } from './pages/FutureModulePage'
import { GraphPage } from './pages/GraphPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 1100)
    return () => window.clearTimeout(timer)
  }, [])

  if (booting) {
    return <LoadingMessage messages={loadingMessages} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/curiosity-graph" element={<GraphPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/shadow" element={<FutureModulePage module={futureModules.shadow} />} />
          <Route path="/labyrinth" element={<FutureModulePage module={futureModules.labyrinth} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
