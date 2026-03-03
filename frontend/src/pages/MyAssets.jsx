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
  MoreVertical,
  Database,
  ArrowUpDown
} from 'lucide-react'
import { Button } from "../components/ui/Button"
import api from "../lib/api"
import { useAuth } from "../context/AuthContext"
import { cn } from "../lib/utils"

const AssetRow = ({ asset }) => {
    const getIcon = (type) => {
        switch(type) {
            case 'image': return <Image className="h-4 w-4 text-purple-400" />
            case 'video': return <Film className="h-4 w-4 text-blue-400" />
            case 'audio': return <Music className="h-4 w-4 text-pink-400" />
            default: return <FileText className="h-4 w-4 text-gray-400" />
        }
    }

    return (
        <div className="group grid grid-cols-12 gap-4 items-center p-3 hover:bg-white/5 transition-colors border-b border-zinc-800 last:border-0">
            <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    {getIcon(asset.contentType)}
                </div>
                <div>
                    <h4 className="text-sm font-medium text-white truncate max-w-[200px]">{asset.title}</h4>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{asset.contentType}</p>
                </div>
            </div>

            <div className="col-span-2">
                 <span className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border", 
                    asset.originalityVerified 
                        ? "bg-green-500/10 text-green-400 border-green-500/20" 
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                    {asset.originalityVerified ? "Verified" : "Pending"}
                 </span>
            </div>

            <div className="col-span-3">
                 {asset.blockchainId ? (
                     <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-mono">
                         <Database className="w-3 h-3 text-zinc-600" />
                         <span>{asset.blockchainId.substring(0, 10)}...</span>
                     </div>
                 ) : (
                     <span className="text-xs text-zinc-600 italic">Not minted</span>
                 )}
            </div>

            <div className="col-span-2 text-xs text-zinc-500">
                {new Date(asset.createdAt).toLocaleDateString()}
            </div>

            <div className="col-span-1 text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

const MyAssets = () => {
    const { user, loading: authLoading } = useAuth()
    const [assets, setAssets] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all'
    })

    useEffect(() => {
        if (user) fetchMyAssets()
        else if (!user && !authLoading) {
            // If we've finished checking and there's no user, stop loading state
            setLoading(false)
        }
    }, [user, authLoading])

    const fetchMyAssets = async () => {
        try {
            const { data } = await api.get(`/assets?owner=${user._id}&limit=100&showAll=true`)
            setAssets(Array.isArray(data.data) ? data.data : [])
        } catch (error) {
            console.error("Failed to fetch assets", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredAssets = assets.filter(asset => {
        if (!asset) return false;
        const title = (asset.title || "").toLowerCase();
        const description = (asset.description || "").toLowerCase();
        const bid = (asset.blockchainId || "").toLowerCase();
        const search = searchTerm.toLowerCase();

        const matchesSearch = title.includes(search) ||
                            description.includes(search) ||
                            bid.includes(search)
        
        const matchesType = filters.type === 'all' || asset.contentType === filters.type
        
        const matchesStatus = filters.status === 'all' || 
                            (filters.status === 'verified' && asset.originalityVerified) ||
                            (filters.status === 'pending' && !asset.originalityVerified)

        return matchesSearch && matchesType && matchesStatus
    })

    const clearFilters = () => {
        setFilters({ type: 'all', status: 'all' })
        setSearchTerm('')
        setShowFilters(false)
    }

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <Loader2 className="animate-spin h-6 w-6 text-zinc-600" />
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                    <h2 className="text-xl font-semibold text-white">Asset Library</h2>
                    <p className="text-sm text-zinc-500 mt-1">Manage and track your digital property rights.</p>
                </div>
                <div className="flex gap-2 relative">
                    <Button 
                        variant="outline" 
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn("text-sm h-9 border-zinc-700 text-white hover:bg-zinc-800", (filters.type !== 'all' || filters.status !== 'all') && "bg-zinc-800 border-zinc-600")}
                    >
                        <Filter className="w-3.5 h-3.5 mr-2 text-zinc-500" />
                        Filter
                        {(filters.type !== 'all' || filters.status !== 'all') && (
                            <span className="ml-2 w-1.5 h-1.5 rounded-full bg-brand-primary" />
                        )}
                    </Button>
                    
                    {/* Filter Dropdown */}
                    {showFilters && (
                        <div className="absolute top-10 right-0 w-64 p-4 bg-black border border-zinc-800 rounded-lg shadow-2xl shadow-black z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">Content Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['all', 'image', 'video', 'audio', 'text'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFilters(prev => ({ ...prev, type }))}
                                                className={cn(
                                                    "px-3 py-2 rounded-md text-xs capitalize transition-all text-left border",
                                                    filters.type === type 
                                                        ? "bg-white text-black border-white font-medium" 
                                                        : "bg-zinc-900/50 text-zinc-400 border-transparent hover:border-zinc-700 hover:text-zinc-200"
                                                )}
                                            >
                                                {filters.type === type && <CheckCircle className="w-3 h-3 inline-block mr-1.5 -mt-0.5" />}
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">Verification Status</label>
                                    <div className="flex flex-col gap-1">
                                        {['all', 'verified', 'pending'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => setFilters(prev => ({ ...prev, status }))}
                                                className={cn(
                                                    "flex items-center justify-between px-3 py-2 rounded-md text-xs capitalize transition-colors",
                                                    filters.status === status 
                                                        ? "text-white bg-zinc-900" 
                                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                                                )}
                                            >
                                                <span>{status}</span>
                                                {filters.status === status && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-zinc-900 flex justify-between items-center">
                                    <button onClick={clearFilters} className="text-[10px] uppercase tracking-wider text-zinc-600 hover:text-white transition-colors">Reset</button>
                                    <button onClick={() => setShowFilters(false)} className="px-3 py-1 bg-white text-black text-xs font-bold rounded hover:bg-zinc-200 transition-colors">Apply</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <Link to="/dashboard/upload">
                        <Button className="h-9 bg-white text-black hover:bg-zinc-200">
                             Upload New
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Toolbar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Search assets by name or ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
                />
            </div>

            {/* Data Grid */}
            <div className="rounded-lg border border-zinc-800 bg-brand-dark overflow-hidden min-h-[400px]">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-3 py-2 bg-zinc-900/50 border-b border-zinc-800 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                    <div className="col-span-4 flex items-center gap-1 cursor-pointer hover:text-zinc-300">
                        Asset Name <ArrowUpDown className="w-3 h-3" />
                    </div>
                    <div className="col-span-2">Verification</div>
                    <div className="col-span-3">Blockchain ID</div>
                    <div className="col-span-2">Date Created</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-zinc-800">
                    {filteredAssets.length > 0 ? (
                        filteredAssets.map(asset => (
                            <Link key={asset._id} to={`/dashboard/assets/${asset._id}`} className="block">
                                <AssetRow asset={asset} />
                            </Link>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                                <FileText className="w-5 h-5 text-zinc-600" />
                            </div>
                            <h3 className="text-white font-medium">No assets found</h3>
                            <p className="text-zinc-500 text-sm mt-1 max-w-xs">
                                {searchTerm ? "Try adjusting your search terms." : "Get started by uploading your first digital asset."}
                            </p>
                            {!searchTerm && (
                                <Link to="/dashboard/upload" className="mt-4">
                                     <Button variant="outline" size="sm" className="border-zinc-700 text-white hover:bg-zinc-800">
                                        Upload Asset
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

export default MyAssets
