import { useState, useEffect } from 'react'
import { Search, Filter, Play, Image as ImageIcon, FileText, Music } from 'lucide-react'
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent } from "../components/ui/Card"
import api from "../lib/api"
import { useNavigate } from "react-router-dom"

const Marketplace = () => {
    const navigate = useNavigate()
    const [assets, setAssets] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState("all") // all, video, audio, image

    useEffect(() => {
        fetchAssets()
    }, [filterType]) // Refetch when filter changes

    const fetchAssets = async () => {
        setLoading(true)
        try {
            // Construct query
            let query = '/assets?limit=50'
            if (filterType !== 'all') query += `&contentType=${filterType}`
            // Search is client side for now or could be server side if triggered
            
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
        // Implement server search if needed, or filter local
        // For MVP, simple re-fetch with search param
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

    const filteredAssets = assets // Assets are already filtered by API

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Marketplace</h2>
                    <p className="text-gray-400">Discover, license, and stream verified digital content.</p>
                </div>
                
                <div className="flex items-center gap-2 bg-brand-surface p-1 rounded-lg border border-gray-700">
                    <Button 
                        variant={filterType === 'all' ? 'default' : 'ghost'} 
                        size="sm" 
                        onClick={() => setFilterType('all')}
                        className={filterType === 'all' ? 'bg-brand-primary' : ''}
                    >All</Button>
                    <Button 
                        variant={filterType === 'video' ? 'default' : 'ghost'} 
                        size="sm" 
                        onClick={() => setFilterType('video')}
                        className={filterType === 'video' ? 'bg-brand-primary' : ''}
                    >Video</Button>
                    <Button 
                        variant={filterType === 'audio' ? 'default' : 'ghost'} 
                        size="sm" 
                        onClick={() => setFilterType('audio')}
                        className={filterType === 'audio' ? 'bg-brand-primary' : ''}
                    >Audio</Button>
                     <Button 
                        variant={filterType === 'image' ? 'default' : 'ghost'} 
                        size="sm" 
                        onClick={() => setFilterType('image')}
                        className={filterType === 'image' ? 'bg-brand-primary' : ''}
                    >Image</Button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <form onSubmit={handleSearch}>
                    <Input 
                        placeholder="Search for content..." 
                        className="pl-10 h-12 bg-brand-surface border-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAssets.map(asset => (
                        <Card key={asset._id} className="bg-brand-surface border-gray-700 hover:border-brand-primary/50 transition-all cursor-pointer group" onClick={() => navigate(`/dashboard/assets/${asset._id}`)}>
                            <div className="aspect-video bg-black/40 relative overflow-hidden rounded-t-xl flex items-center justify-center">
                                {asset.contentType === 'video' && <Play className="h-12 w-12 text-white/50 group-hover:text-brand-primary transition-colors" />}
                                {asset.contentType === 'audio' && <Music className="h-12 w-12 text-white/50 group-hover:text-brand-primary transition-colors" />}
                                {asset.contentType === 'image' && <ImageIcon className="h-12 w-12 text-white/50 group-hover:text-brand-primary transition-colors" />}
                                {asset.contentType === 'text' && <FileText className="h-12 w-12 text-white/50 group-hover:text-brand-primary transition-colors" />}
                                
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white capitalize">
                                    {asset.contentType}
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-white truncate">{asset.title}</h3>
                                <p className="text-sm text-gray-400 truncate mt-1">
                                    by <span className="text-brand-primary">{asset.owner?.username || 'Unknown'}</span>
                                </p>
                                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                    <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                                    {asset.originalityVerified && (
                                        <span className="text-green-500 flex items-center gap-1">
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    
                    {filteredAssets.length === 0 && (
                         <div className="col-span-full py-20 text-center text-gray-500">
                             <p>No assets found.</p>
                         </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Marketplace
