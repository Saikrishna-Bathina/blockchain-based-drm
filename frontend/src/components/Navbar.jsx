import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "./ui/Button"
import { ShieldCheck, Menu, X, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../lib/utils"

const NavLink = ({ to, children, mobile = false, onClick }) => {
    const location = useLocation()
    const isActive = location.pathname === to

    return (
        <Link 
            to={to} 
            onClick={onClick}
            className={cn(
                "relative group flex items-center transition-colors",
                mobile ? "w-full p-4 text-lg border-b border-white/5" : "text-sm font-medium"
            )}
        >
            <span className={cn(
                "relative z-10 transition-colors duration-300",
                isActive ? "text-white" : "text-gray-400 group-hover:text-white"
            )}>
                {children}
            </span>
            
            {!mobile && (
                <span className={cn(
                    "absolute -bottom-1 left-0 w-full h-0.5 bg-brand-primary origin-left transition-transform duration-300",
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )} />
            )}
            
            {mobile && isActive && (
                <ChevronRight className="ml-auto w-5 h-5 text-brand-primary" />
            )}
        </Link>
    )
}

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Handle Scroll Effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <>
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                    scrolled 
                        ? "bg-brand-dark/80 backdrop-blur-xl border-white/5 h-16 shadow-lg shadow-black/20" 
                        : "bg-transparent border-transparent h-20"
                )}
            >
                <div className="container mx-auto h-full flex items-center justify-between px-4 lg:px-6">
                    
                    {/* LOGO */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-brand-primary/50 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <ShieldCheck className="relative h-8 w-8 text-brand-primary transition-transform group-hover:scale-110 duration-300" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent group-hover:to-white transition-all">
                            BlockDRM
                        </span>
                    </Link>

                    {/* DESKTOP LINKS */}
                    <div className="hidden md:flex items-center space-x-8">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/how-it-works">How It Works</NavLink>
                        <NavLink to="/marketplace">Marketplace</NavLink>
                        <NavLink to="/about">About</NavLink>
                    </div>

                    {/* DESKTOP AUTH */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/login">
                            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5">
                                Login
                            </Button>
                        </Link>
                        <Link to="/signup">
                            <Button className="bg-brand-primary hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 transition-all hover:scale-105">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    {/* MOBILE TOGGLE */}
                    <button 
                        className="md:hidden text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </motion.nav>

            {/* MOBILE MENU OVERLAY */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 top-16 z-40 bg-brand-dark/95 backdrop-blur-2xl md:hidden border-t border-white/10 flex flex-col p-6"
                    >
                        <div className="flex flex-col space-y-2">
                            <NavLink mobile to="/" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
                            <NavLink mobile to="/marketplace" onClick={() => setMobileMenuOpen(false)}>Marketplace</NavLink>
                            <NavLink mobile to="/about" onClick={() => setMobileMenuOpen(false)}>About</NavLink>
                        </div>
                        
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="w-full bg-brand-primary">
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default Navbar
