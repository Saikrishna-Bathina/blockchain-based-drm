import Marketplace from "./pages/Marketplace"
import AssetDetails from "./pages/AssetDetails"

import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import DashboardLayout from "./layouts/DashboardLayout"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import Dashboard from "./pages/Dashboard"
import UploadAsset from "./pages/UploadAsset"
import VerificationPage from "./pages/VerificationPage"
import RegistrationPage from "./pages/RegistrationPage"
import ProfilePage from "./pages/ProfilePage"
import Placeholder from "./pages/Placeholder"
import MyAssets from "./pages/MyAssets"

function App() {
  return (
    <BrowserRouter>
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<Placeholder title="About Us" />} />
        <Route path="/features" element={<Placeholder title="Features" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="upload" element={<UploadAsset />} />
        <Route path="verify" element={<VerificationPage />} />
        <Route path="register" element={<RegistrationPage />} />
        <Route path="assets" element={<MyAssets />} />
        <Route path="assets/:id" element={<AssetDetails />} />
        <Route path="reports" element={<Placeholder title="Reports" />} />
      </Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App
