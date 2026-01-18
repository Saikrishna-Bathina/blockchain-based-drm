import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Film, Music, Image, FileText, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import api from "../lib/api"
import { useAuth } from "../context/AuthContext"

const MyAssets = () => {
    const { user } = useAuth()
    const [assets, setAssets] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchMyAssets()
        }
    }, [user])

    const fetchMyAssets = async () => {
        try {
            // Fetch assets owned by current user
            // We can filter by owner in query or use a specific endpoint
            // For now, let's use the general list with owner filter if supported, 
            // or client side filter if list is small. 
            // Better: Endpoint /assets?owner=ME ideally.
            // Let's rely on the fact that we can filter the response for now or assume backend filters.
            // Our backend getAssets supports finding by queryObj. 
            // But we need to pass owner ID. user._id.
            
            const { data } = await api.get(`/assets?owner=${user._id}&limit=100&showAll=true`)
            setAssets(data.data)
        } catch (error) {
            console.error("Failed to fetch assets", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-20 flex justify-center text-white"><Loader2 className="animate-spin h-8 w-8" /></div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <div>
                    <h2 className="text-3xl font-bold text-white">My Assets</h2>
                    <p className="text-gray-400">Manage your uploaded content and licenses.</p>
                </div>
                <Button asChild>
                    <Link to="/dashboard/upload">Upload New</Link>
                </Button>
            </div>

            {assets.length === 0 ? (
                <div className="text-center py-20 bg-brand-surface/20 rounded-xl border border-dashed border-gray-700">
                    <p className="text-gray-400 mb-4">You haven't uploaded any assets yet.</p>
                    <Button variant="outline" asChild>
                         <Link to="/dashboard/upload">Upload Your First Asset</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assets.map(asset => (
                        <Link key={asset._id} to={`/dashboard/assets/${asset._id}`}>
                            <Card className="bg-brand-surface border-gray-800 hover:border-brand-primary/50 transition-colors group cursor-pointer h-full">
                                <CardContent className="p-0">
                                    <div className="aspect-video w-full bg-black/50 relative flex items-center justify-center overflow-hidden rounded-t-xl group-hover:opacity-90 transition-opacity">
                                         {asset.contentType === 'image' && <Image className="h-12 w-12 text-gray-600 group-hover:text-brand-primary" />}
                                         {asset.contentType === 'video' && <Film className="h-12 w-12 text-gray-600 group-hover:text-brand-primary" />}
                                         {asset.contentType === 'audio' && <Music className="h-12 w-12 text-gray-600 group-hover:text-brand-primary" />}
                                         {asset.contentType === 'text' && <FileText className="h-12 w-12 text-gray-600 group-hover:text-brand-primary" />}
                                         
                                         <div className="absolute top-2 right-2">
                                             {asset.blockchainId ? (
                                                 <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded border border-green-500/20 flex items-center gap-1">
                                                     <CheckCircle className="h-3 w-3" /> Minted
                                                 </span>
                                             ) : (
                                                 <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-1 rounded border border-yellow-500/20 flex items-center gap-1">
                                                     <Clock className="h-3 w-3" /> Pending
                                                 </span>
                                             )}
                                         </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <h3 className="font-semibold text-white truncate">{asset.title}</h3>
                                        <p className="text-sm text-gray-400 line-clamp-2 h-10">{asset.description}</p>
                                        <div className="pt-2 flex justify-between items-center text-xs text-gray-500">
                                            <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                                            <span>Score: {asset.originalityScore}%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyAssets
