import { Link, Outlet, useLocation } from "react-router-dom"
import { cn } from "../lib/utils"
import { 
  LayoutDashboard, 
  UploadCloud, 
  ShieldCheck, 
  FolderOpen, 
  FileText, 
  LogOut,
  Menu,
  Bell,
  User,
  ChevronRight,
  Wallet
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const SidebarItem = ({ icon: Icon, label, to, onClick }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link to={to} onClick={onClick}>
      <div
        className={cn(
          "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
          isActive
            ? "bg-white/10 text-white"
            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
        )}
      >
        <div className="flex items-center gap-3">
            <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")} />
            <span>{label}</span>
        </div>
      </div>
    </Link>
  )
}

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth()
  
  return (
    <>
        {/* Mobile Backdrop */}
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                />
            )}
        </AnimatePresence>

        {/* Sidebar Panel */}
        <aside className={cn(
            "fixed left-0 top-0 z-50 h-screen w-64 flex-col border-r border-zinc-800 bg-brand-dark transition-transform duration-300 ease-in-out md:translate-x-0 md:flex",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <div className="flex h-14 items-center px-6 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-white" />
                    <span className="text-base font-semibold text-white tracking-tight">BlockDRM</span>
                </div>
            </div>
          
            <div className="flex flex-1 flex-col px-3 py-4 gap-6 overflow-y-auto">
                <div className="px-1">
                    <Link to="/dashboard/upload">
                        <button className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 transition-colors rounded-md py-2 text-sm font-medium">
                            <UploadCloud className="h-4 w-4" />
                            <span>Mint Asset</span>
                        </button>
                    </Link>
                </div>

                <div className="space-y-0.5">
                    <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 mt-2">Menu</p>
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" onClick={() => setIsOpen(false)} />
                    <SidebarItem icon={FolderOpen} label="My Assets" to="/dashboard/assets" onClick={() => setIsOpen(false)} />
                    <SidebarItem icon={LayoutDashboard} label="Marketplace" to="/dashboard/marketplace" onClick={() => setIsOpen(false)} />
                </div>

                <div className="space-y-0.5 mt-4">
                    <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Tools</p>
                    <SidebarItem icon={ShieldCheck} label="Verify Originality" to="/dashboard/verify" onClick={() => setIsOpen(false)} />
                    <SidebarItem icon={FileText} label="Analytics & Reports" to="/dashboard/reports" onClick={() => setIsOpen(false)} />
                </div>
            </div>

            <div className="p-3 border-t border-white/5 m-3 mt-0 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-green-400 font-medium uppercase tracking-wider">Network Operational</span>
                </div>
                <Button 
                    variant="ghost" 
                    className="w-full justify-start space-x-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg h-9"
                    onClick={logout}
                >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Disconnect</span>
                </Button>
            </div>
        </aside>
    </>
  )
}

const DashboardHeader = ({ setSidebarOpen }) => {
    const { user, connectWallet } = useAuth()
    
    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-brand-dark/80 px-4 backdrop-blur-xl md:px-6">
            <div className="flex items-center md:hidden">
                 <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                    <Menu className="h-5 w-5 text-gray-300" />
                 </Button>
            </div>
            
            <div className="hidden md:flex flex-col">
                <h2 className="text-white font-bold text-sm">Dashboard Overview</h2>
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span>Home</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                    <span className="text-gray-300">Dashboard</span>
                </div>
            </div>
            
            <div className="ml-auto flex items-center space-x-3">
                {user?.walletAddress ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-surface border border-white/5 hover:border-brand-primary/50 transition-colors cursor-pointer group">
                        <div className="p-0.5 rounded-full bg-green-500/20">
                            <Wallet className="w-2.5 h-2.5 text-green-500" />
                        </div>
                        <span className="text-gray-300 text-xs font-mono group-hover:text-white transition-colors">
                            {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(user.walletAddress.length - 4)}
                        </span>
                    </div>
                ) : (
                     <Button variant="outline" size="sm" onClick={connectWallet} className="active:scale-95 h-8 text-xs border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white">
                        Connect Wallet
                    </Button>
                )}

                <div className="h-6 w-[1px] bg-white/10 mx-1" />

                <Link to="/dashboard/notifications">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white relative">
                        <Bell className="h-4 w-4" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-brand-dark" />
                    </Button>
                </Link>
                
                <Link to="/dashboard/profile">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-primary to-purple-600 p-[2px] cursor-pointer hover:shadow-lg hover:shadow-brand-primary/20 transition-all">
                        <div className="w-full h-full rounded-full bg-brand-surface flex items-center justify-center">
                             <User className="h-4 w-4 text-gray-300" />
                        </div>
                    </div>
                </Link>
            </div>
        </header>
    )
}

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-brand-dark">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-1 flex-col md:pl-64 transition-all duration-300">
        <DashboardHeader setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-brand-surface scrollbar-track-transparent">
            <div className="max-w-7xl mx-auto w-full">
                <Outlet />
            </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
