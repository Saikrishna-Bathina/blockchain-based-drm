import { useState, useEffect } from 'react'
import { 
  FileText, 
  ShieldCheck, 
  Files, 
  Database, 
  Globe 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { cn } from "../lib/utils"
import api from "../lib/api"
import { useAuth } from "../context/AuthContext"

const StatsCard = ({ title, value, icon: Icon, className }) => (
  <Card className={cn("bg-brand-surface border-brand-surface", className)}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-400">
        {title}
      </CardTitle>
      {Icon && <Icon className="h-4 w-4 text-gray-500" />}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value}</div>
    </CardContent>
  </Card>
)

const StatusBadge = ({ status }) => {
  const styles = {
    Verified: "bg-green-500/10 text-green-500 border-green-500/20",
    Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    Duplicate: "bg-red-500/10 text-red-500 border-red-500/20",
  }
  
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", styles[status] || styles.Pending)}>
      {status}
    </span>
  )
}

const RecentActivityTable = () => {
    const activities = [
        { id: 1, name: "Project_Alpha_Art.jpg", date: "2023-10-26", status: "Verified" },
        { id: 2, name: "Soundtrack_Final_Mix.wav", date: "2023-10-25", status: "Verified" },
        { id: 3, name: "Manuscript_v3.pdf", date: "2023-10-24", status: "Pending" },
        { id: 4, name: "Icon_Set_Design.svg", date: "2023-10-23", status: "Rejected" },
        { id: 5, name: "Corporate_Branding.ai", date: "2023-10-22", status: "Verified" },
    ]

    return (
        <div className="rounded-lg border border-brand-surface bg-brand-surface/50 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-brand-surface border-b border-brand-surface">
                        <tr>
                            <th className="px-6 py-3">Asset Name/ID</th>
                            <th className="px-6 py-3">Upload Date</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((item) => (
                            <tr key={item.id} className="border-b border-brand-surface/50 hover:bg-brand-surface/30">
                                <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                                <td className="px-6 py-4 text-gray-400">{item.date}</td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={item.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

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
            // In a real app, we'd have a specific /dashboard/stats endpoint.
            // Here we can just fetch all assets for the user and calculate client-side for MVP
            const { data } = await api.get(`/assets?limit=100&showAll=true`)
            const allAssets = data.data
            
            const myAssets = allAssets // Assuming backend filters or we assume user sees all for now (Marketplace style)
            // Ideally: const { data } = await api.get(`/assets?owner=${user._id}`) if searching user specific.
            
            // Let's just use the recent uploads globally for "Activity" and maybe user stats if possible.
            // For this Dashboard, let's show Global Stats or Personal? Usually Personal.
            // Let's filter by owner if possible.
            
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
        <p className="text-gray-400">Welcome back, {user?.username}. Here's a summary of the ecosystem.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <StatsCard title="Total Assets" value={stats.total} icon={FileText} />
         <StatsCard title="Verified Original" value={stats.original} icon={ShieldCheck} />
         <StatsCard title="Minted on Blockchain" value={stats.minted} icon={Database} />
         <StatsCard title="Pending Mint" value={stats.pending} icon={Globe} />
      </div>

      <div className="space-y-4">
         <h3 className="text-xl font-semibold text-white">Recent Uploads</h3>
         <div className="rounded-lg border border-brand-surface bg-brand-surface/50 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-brand-surface border-b border-brand-surface">
                        <tr>
                            <th className="px-6 py-3">Asset Name</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Originality</th>
                            <th className="px-6 py-3">Blockchain</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentActivity.map((item) => (
                            <tr key={item._id} className="border-b border-brand-surface/50 hover:bg-brand-surface/30">
                                <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                                <td className="px-6 py-4 text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={item.originalityVerified ? "Verified" : "Pending"} />
                                </td>
                                <td className="px-6 py-4">
                                     {item.blockchainId ? (
                                         <span className="text-green-500 font-mono text-xs">#{item.blockchainId}</span>
                                     ) : (
                                         <span className="text-yellow-500 text-xs">Pending</span>
                                     )}
                                </td>
                            </tr>
                        ))}
                         {recentActivity.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No activity yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
