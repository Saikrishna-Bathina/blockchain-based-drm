import { ShieldCheck, Flag } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"

const AssetDetailsPage = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in">
        
        {/* Main Content - Player */}
        <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Protected Stream - Watermarked & Traceable</h2>
            </div>

            <div 
                className="relative aspect-video bg-black rounded-xl overflow-hidden group border border-brand-surface shadow-2xl"
                onContextMenu={(e) => e.preventDefault()}
            >
                {/* Video Placeholder */}
                <video 
                    className="w-full h-full object-cover opacity-80"
                    poster="https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=2874&auto=format&fit=crop"
                    controlsList="nodownload"
                >
                    <source src="#" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-16 w-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                        <div className="h-0 w-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                    </div>
                </div>

                {/* Simulated Watermark */}
                <div className="absolute top-4 left-4 text-white/30 text-xs font-mono pointer-events-none select-none">
                    User ID: usr_a7b3c9d1e5f6<br/>
                    License ID: lic_f8e7d6c5b4a3
                </div>
            </div>

            <div className="bg-brand-surface/10 border border-brand-surface p-4 rounded-lg text-center text-sm text-gray-400 select-none">
                Right-click, download, and screenshot functionality are disabled for this protected asset.
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-brand-primary text-sm">
                <ShieldCheck className="h-4 w-4" />
                <span>Secure Connection via Blockchain & IPFS</span>
            </div>
        </div>

        {/* Sidebar - Details */}
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Asset Details</h3>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b border-brand-surface/30 pb-3">
                        <span className="text-gray-400">Asset Name</span>
                        <span className="text-white font-medium">Q4 Financial Projections Draft</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-surface/30 pb-3">
                        <span className="text-gray-400">Owner Address</span>
                        <span className="font-mono text-gray-300">0xAb...cdef</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-surface/30 pb-3">
                        <span className="text-gray-400">License Validity</span>
                        <span className="text-brand-primary font-medium">Expires in: 2d 4h 15m</span>
                    </div>
                </div>
            </div>

            <div className="pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Technical Information</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase">Blockchain Transaction Hash</label>
                        <div className="bg-brand-surface/20 p-3 rounded border border-brand-surface flex justify-between items-center">
                             <span className="text-xs font-mono text-gray-300">0x1234abcd...5678efgh</span>
                             <div className="h-3 w-3 bg-gray-600 rounded-sm"></div>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase">IPFS CID</label>
                        <div className="bg-brand-surface/20 p-3 rounded border border-brand-surface flex justify-between items-center">
                             <span className="text-xs font-mono text-gray-300">QmXyZ...aBcD</span>
                             <div className="h-3 w-3 bg-gray-600 rounded-sm"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 mt-auto">
                 <Button variant="outline" className="w-full bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20 hover:text-yellow-400 h-10">
                    <Flag className="mr-2 h-4 w-4" /> Report Misuse
                </Button>
            </div>
        </div>
    </div>
  )
}

export default AssetDetailsPage
