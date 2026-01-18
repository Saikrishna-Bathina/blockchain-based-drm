import { Link, Outlet } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { ShieldCheck } from "lucide-react"

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-brand-surface bg-brand-dark/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <ShieldCheck className="h-8 w-8 text-brand-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            BlockDRM
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            About
          </Link>
          <Link to="/features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Features
          </Link>
        </div>

        <div className="flex items-center space-x-4">
            <Link to="/login">
                <Button variant="ghost" className="text-gray-300">Login</Button>
            </Link>
            <Link to="/signup">
                <Button>Get Started</Button>
            </Link>
        </div>
      </div>
    </nav>
  )
}

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
