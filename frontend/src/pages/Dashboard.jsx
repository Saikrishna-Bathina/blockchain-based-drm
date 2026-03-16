import { useState, useEffect } from 'react'
import { 
  FileText, 
  ShieldCheck, 
  Database, 
  Globe, 
  TrendingUp,
  Clock,
  ExternalLink,
  MoreHorizontal,
  Bell,
  LogIn,
  ShoppingBag,
  Coins,
  ShieldCheck as VerifiedIcon
} from "lucide-react"
import { Card, CardContent } from "../components/ui/Card"
import { cn } from "../lib/utils"
import api from "../lib/api"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

// --- Components ---

const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
  const colors = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    green: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  }

  const activeColor = colors[color] || colors.blue

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="relative overflow-hidden rounded-2xl p-5 border border-white/5 bg-white/[0.02] backdrop-blur-sm group hover:border-white/10 transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
          <div className={cn("p-3 rounded-xl", activeColor)}>
              <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-400">{trend}</span>
            </div>
          )}
      </div>
      
      <div>
          <h3 className="text-2xl font-bold text-white tracking-tight mb-1">{value}</h3>
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">{title}</p>
      </div>

       {/* Subtle Mesh Gradient Background Effect */}
       <div className={cn("absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none", color === 'blue' ? 'bg-blue-500' : color === 'green' ? 'bg-emerald-500' : color === 'purple' ? 'bg-purple-500' : 'bg-amber-500')} />
    </motion.div>
  )
}

const StatusBadge = ({ status }) => {
  const styles = {
    Verified: "bg-green-500/20 text-green-400 border-green-500/30",
    Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    Duplicate: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  }
  
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold shadow-sm backdrop-blur-sm", styles[status] || styles.Pending)}>
      <span className={cn("w-1 h-1 rounded-full", status === "Verified" ? "bg-green-400 animate-pulse" : "bg-current")} />
      {status}
    </span>
  )
}

const ActivityCard = ({ item }) => {
    const typeConfigs = {
        login: { icon: LogIn, color: "text-blue-400 bg-blue-500/10", label: "Login" },
        upload: { icon: FileText, color: "text-purple-400 bg-purple-500/10", label: "Upload" },
        mint: { icon: Coins, color: "text-yellow-400 bg-yellow-500/10", label: "Mint" },
        purchase: { icon: ShoppingBag, color: "text-emerald-400 bg-emerald-500/10", label: "Purchase" },
        security_alert: { icon: VerifiedIcon, color: "text-red-400 bg-red-500/10", label: "Alert" }
    }

    const config = typeConfigs[item.type] || typeConfigs.upload
    const Icon = config.icon

    return (
        <div className="group flex items-center justify-between p-3 bg-brand-surface/40 hover:bg-brand-surface/60 border border-white/5 rounded-xl transition-all duration-200">
            <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border border-white/5", config.color)}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-white font-bold text-xs">{item.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">{item.message}</p>
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-600 mt-1 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                 <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border border-white/5 bg-white/5", config.color)}>
                    {config.label}
                 </span>
            </div>
        </div>
    )
}

// --- Main Page ---

const Dashboard = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        total: 0,
        original: 0,
        pending: 0,
        minted: 0,
        totalSold: 0,
        totalRevenue: 0
    })
    const [recentActivity, setRecentActivity] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const { data } = await api.get('/dashboard/stats')
            const dashboardData = data.data

            setStats({
                total: dashboardData.totalAssets,
                minted: dashboardData.mintedAssets,
                totalSold: dashboardData.totalLicenses,
                totalRevenue: dashboardData.totalRevenue
            })
            
            setRecentActivity(dashboardData.recentActivity)
            
        } catch (error) {
            console.error("Dashboard fetch error", error)
        } finally {
            setLoading(false)
        }
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return "Good Morning"
        if (hour < 18) return "Good Afternoon"
        return "Good Evening"
    }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
            <h1 className="text-2xl font-bold text-white mb-1">{getGreeting()}, {user?.username}</h1>
            <p className="text-sm text-gray-400">Here's what's happening in your creative ecosystem today.</p>
        </div>
        <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-medium text-white transition-colors">
                Last 30 Days
            </button>
             <button 
                onClick={() => navigate('/dashboard/analytics')}
                className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary/90 rounded-lg text-xs font-bold text-white shadow-lg shadow-brand-primary/20 transition-all"
             >
                Generate Report
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <StatsCard 
            title="Registry Assets" 
            value={stats.total} 
            icon={FileText} 
            color="blue"
            trend="+12%"
         />
         <StatsCard 
            title="Blockchain Minted" 
            value={stats.minted || 0} 
            icon={Database} 
            color="green"
            trend="Live"
         />
         <StatsCard 
            title="Licenses Sold" 
            value={stats.totalSold || 0} 
            icon={Globe} 
            color="purple"
            trend="Live"
         />
         <StatsCard 
            title="Estimated Revenue (ETH)" 
            value={stats.totalRevenue || "0.00"} 
            icon={TrendingUp} 
            color="amber"
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center justify-between">
                 <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                 <button className="text-sm text-brand-primary hover:text-brand-accent font-medium flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5" /> View Notifications
                 </button>
             </div>
             
             <div className="space-y-3">
                {recentActivity.length > 0 ? (
                    recentActivity.map((item) => (
                        <ActivityCard key={item._id} item={item} />
                    ))
                ) : (
                    <div className="p-8 text-center border dashed border-white/10 rounded-2xl bg-white/5">
                        <p className="text-gray-500">No assets uploaded yet.</p>
                    </div>
                )}
             </div>
          </div>

          {/* Quick Actions / Mini Widget */}
          <div className="space-y-6">
             <h3 className="text-xl font-bold text-white">Quick Actions</h3>
             <div className="bg-brand-surface/30 border border-white/5 rounded-3xl p-6 space-y-4">
                <button 
                    onClick={() => navigate('/dashboard/analytics')}
                    className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between group transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                             <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-white font-bold text-sm">View Analytics</p>
                            <p className="text-gray-500 text-xs">Check verify rates</p>
                        </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white" />
                </button>

                 <button className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between group transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                             <Database className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-white font-bold text-sm">Validations</p>
                            <p className="text-gray-500 text-xs">Check pending requests</p>
                        </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white" />
                </button>
             </div>
          </div>
      </div>
    </div>
  )
}

export default Dashboard
