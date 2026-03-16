import { BrowserRouter, Routes, Route } from "react-router-dom"

import MainLayout from "./layouts/MainLayout"

// Pages
import HomePage from "./pages/HomePage"
import DashboardPage from "./pages/DashboardPage"
import LawsPage from "./pages/LawsPage"
import DocumentsPage from "./pages/DocumentsPage"
import LegalMeterPage from "./pages/LegalMeterPage"
import HistoryPage from "./pages/HistoryPage"
import SettingsPage from "./pages/SettingsPage"
import PricingPage from "./pages/PricingPage"
import TeamPage from "./pages/TeamPage"
import UsageAnalyticsPage from "./pages/UsageAnalyticsPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Main Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Tools */}
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/legal-meter" element={<LegalMeterPage />} />
          <Route path="/laws" element={<LawsPage />} />
          <Route path="/history" element={<HistoryPage />} />

          {/* SaaS Features */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/usage" element={<UsageAnalyticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}