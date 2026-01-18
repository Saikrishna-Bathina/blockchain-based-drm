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
  User 
} from "lucide-react"
import { Button } from "../components/ui/Button"

const SidebarItem = ({ icon: Icon, label, to }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link to={to}>
      <div
        className={cn(
          "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-brand-primary/10 text-brand-primary"
            : "text-gray-400 hover:bg-brand-surface hover:text-white"
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </div>
    </Link>
  )
}

import { useAuth } from "../context/AuthContext"

const Sidebar = () => {
  const { logout } = useAuth()
  
  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-brand-surface bg-brand-dark md:flex">
      <div className="flex h-16 items-center px-6 border-b border-brand-surface">
         <ShieldCheck className="h-6 w-6 text-brand-primary mr-2" />
        <span className="text-lg font-bold text-white">BlockDRM</span>
      </div>
      
      <div className="flex flex-1 flex-col space-y-1 px-3 py-4">
        <div className="mb-4 px-3">
          <Button className="w-full justify-start space-x-2">
            <UploadCloud className="h-4 w-4" />
            <span>Upload Asset</span>
          </Button>
        </div>

        <nav className="space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
            <SidebarItem icon={LayoutDashboard} label="Marketplace" to="/dashboard/marketplace" />
            <SidebarItem icon={UploadCloud} label="Upload" to="/dashboard/upload" />
            <SidebarItem icon={ShieldCheck} label="Verify" to="/dashboard/verify" />
            <SidebarItem icon={FolderOpen} label="My Assets" to="/dashboard/assets" />
            <SidebarItem icon={FileText} label="Reports" to="/dashboard/reports" />
        </nav>
      </div>

      <div className="border-t border-brand-surface p-4">
        <Button 
            variant="ghost" 
            className="w-full justify-start space-x-3 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  )
}

const DashboardHeader = () => {
    const { user, connectWallet } = useAuth()
    
    return (
        <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-brand-surface bg-brand-dark/80 px-4 backdrop-blur-md md:px-6">
            <div className="flex items-center md:hidden">
                 <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                 </Button>
            </div>
            
            <div className="ml-auto flex items-center space-x-4">
                {user?.walletAddress ? (
                    <div className="px-3 py-1 rounded-full bg-green-900/30 border border-green-500/50 text-green-400 text-sm font-mono">
                        {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(user.walletAddress.length - 4)}
                    </div>
                ) : (
                     <Button variant="outline" size="sm" onClick={connectWallet} className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white">
                        Connect Wallet / Social
                    </Button>
                )}

                <Button variant="ghost" size="icon" className="text-gray-400">
                    <Bell className="h-5 w-5" />
                </Button>
                <Link to="/dashboard/profile">
                    <div className="h-8 w-8 rounded-full bg-brand-surface flex items-center justify-center cursor-pointer hover:bg-brand-primary/20 transition-colors">
                        <User className="h-5 w-5 text-gray-400" />
                    </div>
                </Link>
            </div>
        </header>
    )
}

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-brand-dark">
      <Sidebar />
      <div className="md:pl-64">
        <DashboardHeader />
        <main className="p-4 md:p-8">
            <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
