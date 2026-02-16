import { useState, useEffect } from 'react'
import { Search, Filter, Play, Image as ImageIcon, FileText, Music, LayoutGrid, List } from 'lucide-react'
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent } from "../components/ui/Card"
import api from "../lib/api"
import { useNavigate } from "react-router-dom"
import { cn } from "../lib/utils"

const Marketplace = () => {
    const navigate = useNavigate()
    const [assets, setAssets] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState("all") // all, video, audio, image

    useEffect(() => {
        fetchAssets()
    }, [filterType])

    const fetchAssets = async () => {
        setLoading(true)
        try {
            let query = '/assets?limit=50'
            if (filterType !== 'all') query += `&contentType=${filterType}`
            const { data } = await api.get(query)
            setAssets(data.data)
        } catch (error) {
            console.error("Failed to fetch assets", error)
        } finally {
            setLoading(false)
        }
    }
    
    const handleSearch = (e) => {
        e.preventDefault()
        const search = async () => {
             setLoading(true)
             try {
                let query = `/assets?search=${searchTerm}`
                if (filterType !== 'all') query += `&contentType=${filterType}`
                const { data } = await api.get(query)
                setAssets(data.data)
             } catch (error) {
                 console.error("Search failed", error)
             } finally {
                 setLoading(false)
             }
        }
        search()
    }

    const filteredAssets = assets

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Marketplace</h2>
                    <p className="text-sm text-zinc-500">Discover and license verified digital assets directly from creators.</p>
                </div>
                
                <div className="flex items-center gap-1 bg-black p-1 rounded-lg border border-zinc-800">
                    {['all', 'video', 'audio', 'image'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={cn(
                                "px-3 py-1.5 rounded text-xs font-medium capitalize transition-all",
                                filterType === type 
                                    ? "bg-white text-black shadow-sm" 
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                            )}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <form onSubmit={handleSearch}>
                    <Input 
                        placeholder="Search for content..." 
                        className="pl-10 h-10 bg-black border-zinc-800 text-sm focus:ring-0 focus:border-zinc-700 placeholder:text-zinc-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
            </div>

            {loading ? (
                <div className="flex justify-center py-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAssets.map(asset => (
                        <Card key={asset._id} className="bg-black border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer group rounded-lg overflow-hidden" onClick={() => navigate(`/dashboard/assets/${asset._id}`)}>
                            <div className="aspect-video bg-zinc-900/50 relative flex items-center justify-center border-b border-zinc-800/50">
                                {asset.contentType === 'video' && <Play className="h-10 w-10 text-zinc-700 group-hover:text-white transition-colors" />}
                                {asset.contentType === 'audio' && <Music className="h-10 w-10 text-zinc-700 group-hover:text-white transition-colors" />}
                                {asset.contentType === 'image' && <ImageIcon className="h-10 w-10 text-zinc-700 group-hover:text-white transition-colors" />}
                                {asset.contentType === 'text' && <FileText className="h-10 w-10 text-zinc-700 group-hover:text-white transition-colors" />}
                                
                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded border border-white/5 text-[10px] text-zinc-300 uppercase tracking-wider font-medium">
                                    {asset.contentType}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-white text-sm truncate mb-1">{asset.title}</h3>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-500">by <span className="text-zinc-300">{asset.owner?.username || 'Unknown'}</span></span>
                                    <span className="text-zinc-600">{new Date(asset.createdAt).toLocaleDateString()}</span>
                                </div>
                                {asset.originalityVerified && (
                                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-zinc-400 border-t border-zinc-900 pt-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                        Verified Original
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                    
                    {filteredAssets.length === 0 && (
                         <div className="col-span-full py-32 text-center">
                             <p className="text-zinc-500 text-sm">No assets found matching your criteria.</p>
                         </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Marketplace
