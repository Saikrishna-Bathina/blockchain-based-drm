import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Loader2, 
  Film, 
  Music, 
  Image, 
  FileText, 
  CheckCircle, 
  Clock, 
  Search,
  Filter,
  ShoppingBag,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { Button } from "../components/ui/Button"
import api from "../lib/api"
import { useAuth } from "../context/AuthContext"
import { cn } from "../lib/utils"

const LicenseRow = ({ license }) => {
    const asset = license.asset;
    if (!asset) return null;

    const getIcon = (type) => {
        switch(type) {
            case 'image': return <Image className="h-4 w-4 text-purple-400" />
            case 'video': return <Film className="h-4 w-4 text-blue-400" />
            case 'audio': return <Music className="h-4 w-4 text-pink-400" />
            default: return <FileText className="h-4 w-4 text-gray-400" />
        }
    }

    const isExpired = license.expiryTime && new Date() > new Date(license.expiryTime);

    return (
        <div className="group grid grid-cols-12 gap-4 items-center p-4 hover:bg-white/5 transition-colors border-b border-zinc-800 last:border-0">
            <div className="col-span-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    {getIcon(asset.contentType)}
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{asset.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{asset.contentType}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700" />
                        <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">{license.licenseType}</span>
                    </div>
                </div>
            </div>

            <div className="col-span-3">
                 <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Status</span>
                    <span className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border w-fit", 
                        isExpired 
                            ? "bg-red-500/10 text-red-400 border-red-500/20" 
                            : "bg-green-500/10 text-green-400 border-green-500/20"
                    )}>
                        {isExpired ? "Expired" : "Active"}
                    </span>
                 </div>
            </div>

            <div className="col-span-3">
                <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Purchased On</span>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                        <Clock className="w-3 h-3 text-zinc-600" />
                        <span>{new Date(license.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="col-span-1 text-right">
                <Link to={`/dashboard/assets/${asset._id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/10">
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}

const MyLicenses = () => {
    const { user, loading: authLoading } = useAuth()
    const [licenses, setLicenses] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (user) fetchMyLicenses()
        else if (!user && !authLoading) {
            setLoading(false)
        }
    }, [user, authLoading])

    const fetchMyLicenses = async () => {
        try {
            const { data } = await api.get('/licenses/me')
            setLicenses(Array.isArray(data.data) ? data.data : [])
        } catch (error) {
            console.error("Failed to fetch licenses", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredLicenses = licenses.filter(license => {
        if (!license || !license.asset) return false;
        const title = (license.asset.title || "").toLowerCase();
        const type = (license.licenseType || "").toLowerCase();
        const search = searchTerm.toLowerCase();

        return title.includes(search) || type.includes(search)
    })

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <Loader2 className="animate-spin h-6 w-6 text-zinc-600" />
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest">
                <span>Dashboard</span>
                <ChevronRight className="w-2.5 h-2.5" />
                <span className="text-gray-300">My Licenses</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                    <h2 className="text-2xl font-bold text-white">My Licenses</h2>
                    <p className="text-sm text-zinc-500 mt-1">Manage all your purchased digital property licenses.</p>
                </div>
                <Link to="/dashboard/marketplace">
                    <Button className="h-9 bg-white text-black hover:bg-zinc-200 font-bold">
                        Browse Marketplace
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Licenses</p>
                    <p className="text-2xl font-bold text-white">{licenses.length}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Active Now</p>
                    <p className="text-2xl font-bold text-green-400">
                        {licenses.filter(l => !l.expiryTime || new Date() < new Date(l.expiryTime)).length}
                    </p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Expired</p>
                    <p className="text-2xl font-bold text-red-400">
                        {licenses.filter(l => l.expiryTime && new Date() > new Date(l.expiryTime)).length}
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Search your licenses..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                />
            </div>

            {/* Data Grid */}
            <div className="rounded-2xl border border-zinc-800 bg-brand-dark/50 overflow-hidden min-h-[400px]">
                {/* Table Body */}
                <div className="divide-y divide-zinc-800">
                    {filteredLicenses.length > 0 ? (
                        filteredLicenses.map(license => (
                            <LicenseRow key={license._id} license={license} />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mb-4">
                                <ShoppingBag className="w-8 h-8 text-zinc-700" />
                            </div>
                            <h3 className="text-white font-bold text-lg">No licenses found</h3>
                            <p className="text-zinc-500 text-sm mt-1 max-w-xs">
                                {searchTerm ? "Try searching for something else." : "You haven't purchased any licenses yet. Visit the marketplace to explore assets."}
                            </p>
                            {!searchTerm && (
                                <Link to="/dashboard/marketplace" className="mt-6">
                                     <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 font-bold px-6">
                                        Explore Marketplace
                                     </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MyLicenses
