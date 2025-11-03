import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { HomePage } from './pages/HomePage'
import { UpcomingMatchesPage } from './pages/UpcomingMatchesPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg-near-black">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upcoming-matches" element={<UpcomingMatchesPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App