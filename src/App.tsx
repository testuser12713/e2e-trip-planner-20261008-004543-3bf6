import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import TripListPage from './pages/TripListPage'
import TripDetailPage from './pages/TripDetailPage'
import BudgetPage from './pages/BudgetPage'
import PackingPage from './pages/PackingPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<TripListPage />} />
        <Route path="/trips/:tripId" element={<TripDetailPage />} />
        <Route path="/trips/:tripId/budget" element={<BudgetPage />} />
        <Route path="/trips/:tripId/packing" element={<PackingPage />} />
      </Route>
    </Routes>
  )
}
