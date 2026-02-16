import { useState, useEffect } from 'react'
import { 
  FileText, 
  ShieldCheck, 
  Database, 
  Globe, 
  TrendingUp,
  Clock,
  ExternalLink,
  MoreHorizontal
} from "lucide-react"
import { Card, CardContent } from "../components/ui/Card"
import { cn } from "../lib/utils"
import api from "../lib/api"
import { useAuth } from "../context/AuthContext"
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

const ActivityCard = ({ item }) => (
    <div className="group flex items-center justify-between p-3 bg-brand-surface/40 hover:bg-brand-surface/60 border border-white/5 rounded-xl transition-all duration-200">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-white/5">
                <FileText className="w-5 h-5 text-gray-400 group-hover:text-brand-primary transition-colors" />
            </div>
            <div>
                <h4 className="text-white font-bold text-xs truncate max-w-[150px] sm:max-w-xs">{item.title}</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-4">
             <div className="hidden sm:block text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Status</p>
                <StatusBadge status={item.originalityVerified ? "Verified" : "Pending"} />
             </div>
             
             <div className="hidden md:block text-right min-w-[80px]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Blockchain</p>
                 {item.blockchainId ? (
                     <div className="flex items-center justify-end gap-1 text-green-400 text-[10px] font-mono bg-green-900/20 px-1.5 py-0.5 rounded border border-green-500/20">
                         <Database className="w-2.5 h-2.5" />
                         #{item.blockchainId}
                     </div>
                 ) : (
                     <span className="text-gray-600 text-[10px] italic">Not minted</span>
                 )}
             </div>

             <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                <MoreHorizontal className="w-4 h-4" />
             </button>
        </div>
    </div>
)

// --- Main Page ---

const Dashboard = () => {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        total: 0,
        original: 0,
        pending: 0,
        minted: 0
    })
    const [recentActivity, setRecentActivity] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const { data } = await api.get(`/assets?limit=100&showAll=true`)
            const allAssets = data.data
            const myAssets = allAssets 
            
            const total = myAssets.length
            const original = myAssets.filter(a => a.originalityVerified).length
            const minted = myAssets.filter(a => a.blockchainId).length
            const pending = total - minted

            setStats({ total, original, minted, pending })
            setRecentActivity(myAssets.slice(0, 5))
            
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
             <button className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary/90 rounded-lg text-xs font-bold text-white shadow-lg shadow-brand-primary/20 transition-all">
                Generate Report
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <StatsCard 
            title="Total Assets" 
            value={stats.total} 
            icon={FileText} 
            color="blue"
            trend="+12%"
         />
         <StatsCard 
            title="Verified Original" 
            value={stats.original} 
            icon={ShieldCheck} 
            color="green"
            trend="98% Safe"
         />
         <StatsCard 
            title="On-Chain Assets" 
            value={stats.minted} 
            icon={Database} 
            color="purple"
         />
         <StatsCard 
            title="Pending Actions" 
            value={stats.pending} 
            icon={Globe} 
            color="amber"
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center justify-between">
                 <h3 className="text-xl font-bold text-white">Recent Uploads</h3>
                 <button className="text-sm text-brand-primary hover:text-brand-accent font-medium">View All</button>
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
                <button className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between group transition-all">
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
