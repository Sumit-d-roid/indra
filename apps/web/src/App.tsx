import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { LoadingMessage } from './components/LoadingMessage'
import { loadingMessages } from './data/mockIndra'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { AutopilotPage } from './pages/AutopilotPage'
import { CheckInPage } from './pages/CheckInPage'
import { DashboardPage } from './pages/DashboardPage'
import { GraphPage } from './pages/GraphPage'
import { NarrativePage } from './pages/NarrativePage'
import { SettingsPage } from './pages/SettingsPage'
import { WeeklyReviewPage } from './pages/WeeklyReviewPage'

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
          <Route path="/autopilot" element={<AutopilotPage />} />
          <Route path="/autopilott" element={<Navigate to="/autopilot" replace />} />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/curiosity-graph" element={<GraphPage />} />
          <Route path="/weekly-review" element={<WeeklyReviewPage />} />
          <Route path="/narrative" element={<NarrativePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/challenges" element={<Navigate to="/autopilot" replace />} />
          <Route path="/shadow" element={<Navigate to="/autopilot" replace />} />
          <Route path="/labyrinth" element={<Navigate to="/weekly-review" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
