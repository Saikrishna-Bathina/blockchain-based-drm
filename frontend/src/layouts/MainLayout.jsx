import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"



const Footer = () => {
  return (
    <footer className="border-t border-brand-surface bg-brand-dark py-12">
      <div className="container mx-auto px-4 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} BlockDRM. All rights reserved.</p>
      </div>
    </footer>
  )
}

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-brand-dark font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
