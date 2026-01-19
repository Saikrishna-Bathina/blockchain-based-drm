import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, ShieldCheck, Download, AlertTriangle, Loader2, Lock, Coins } from 'lucide-react'
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import api from "../lib/api"
import { useAuth } from "../context/AuthContext"
import { ethers } from "ethers"
import { DRMLicensingABI } from "../abi/DRMLicensing"
import { DRMRegistryABI } from "../abi/DRMRegistry"
import { getLicensesForType } from "../lib/licenseConfig"

// Placeholder - Replace with actual address
const DRM_LICENSING_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const DRM_REGISTRY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

const AssetDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [asset, setAsset] = useState(null)
    const [loading, setLoading] = useState(true)
    const [hasLicense, setHasLicense] = useState(false)
    const [licenseLoading, setLicenseLoading] = useState(false)
    
    const [secureMode, setSecureMode] = useState(false)
    const [isWindowBlurred, setIsWindowBlurred] = useState(false)

    // Player State
    const videoRef = useRef(null)

    useEffect(() => {
        fetchAsset()
    }, [id])

    // Anti-Rip: Blur on Window Focus Loss
    useEffect(() => {
        const handleVisibilityChange = () => {
             if (document.hidden) {
                 setIsWindowBlurred(true)
                 if (videoRef.current) videoRef.current.pause()
             } else {
                 setIsWindowBlurred(false)
             }
        }
        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
    }, [])

    const fetchAsset = async () => {
        setLoading(true)
        try {
            const { data } = await api.get(`/assets/${id}`)
            setAsset(data.data)
        } catch (error) {
            console.error("Error fetching asset:", error)
        } finally {
            setLoading(false)
        }
    }

    // ... (existing checkUserLicense code)
    
    // Updated checkUserLicense to also check Backend
    const checkUserLicense = async () => {
         // Check Backend License First (Fast)
         try {
             const { data } = await api.get('/licenses/me');
             const myLicense = data.data.find(l => l.asset._id === asset._id || l.asset === asset._id);
             if (myLicense) {
                 if (myLicense.expiryTime && new Date() > new Date(myLicense.expiryTime)) {
                     console.warn("Local license expired");
                     // Don't set true yet, check blockchain fallback?
                     // Actually if backend says expired, it's expired for stream api.
                 } else {
                     setHasLicense(true);
                     return;
                 }
             }
         } catch (e) { console.error("Backend license check failed", e); }

        // Fallback to Blockchain
        if (window.ethereum && asset.blockchainId) {
             try {
                 const provider = new ethers.BrowserProvider(window.ethereum)
                 const contract = new ethers.Contract(DRM_LICENSING_ADDRESS, DRMLicensingABI, provider)
                 const hasAccess = await contract.checkLicense(user.walletAddress, asset.blockchainId)
                 setHasLicense(hasAccess)
                 
                 if (asset.owner._id === user._id) setHasLicense(true)
             } catch (err) {
                 console.error("License check error:", err)
                 if (asset.owner._id === user._id) setHasLicense(true)
             }
        } else {
             if (asset.owner._id === user._id) setHasLicense(true)
        }
    }

    useEffect(() => {
        if (asset && user) {
            checkUserLicense()
        }
    }, [asset, user])

    const handlePurchase = async (type) => {
        if (!window.ethereum) return alert("Please install MetaMask")
        
        setLicenseLoading(true)
        try {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            const contract = new ethers.Contract(DRM_LICENSING_ADDRESS, DRMLicensingABI, signer)
            
            const licenseKey = type;
            let price = '0';
            if (asset.licenseTerms && asset.licenseTerms[licenseKey]) {
                price = asset.licenseTerms[licenseKey].price.toString();
            } else {
                 throw new Error("Invalid license type selected")
            }
            
            // 1. Blockchain Transaction
            const tx = await contract.purchaseLicense(asset.blockchainId, licenseKey, {
                value: ethers.parseEther(price)
            })
            await tx.wait()
            
            // 2. Sync to Backend (New)
            await api.post('/licenses/sync', {
                assetId: asset._id,
                transactionHash: tx.hash,
                licenseType: licenseKey
            });
            
            setHasLicense(true)
            alert("License Purchased & Synced Successfully!")
            
        } catch (error) {
            console.error("Purchase failed", error)
            alert("Purchase failed: " + error.message)
        } finally {
            setLicenseLoading(false)
        }
    }

    // ... (handleMint)
    const handleMint = async () => {
        if (!asset) return
        if (!window.ethereum) return alert("Please install MetaMask")
        try {
            if (!asset.originalityVerified) {
                alert("Cannot mint duplicate content.")
                return
            }
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            
            const contract = new ethers.Contract(DRM_REGISTRY_ADDRESS, DRMRegistryABI, signer)
            if (!user?.walletAddress) throw new Error("User wallet address is missing.");

            const tx = await contract.registerAsset(
                user.walletAddress, 
                asset.cid, 
                `ipfs://${asset.cid}`
            )
            const receipt = await tx.wait()
            
            let tokenId = null;
            const event = receipt.logs.find(log => {
                 try {
                    const parsed = contract.interface.parseLog(log)
                    return parsed.name === 'AssetRegistered'
                 } catch (e) { return false }
            })
            if (event) {
                 const parsed = contract.interface.parseLog(event)
                 tokenId = parsed.args[0].toString()
            }

            await api.put(`/assets/${asset._id}/mint`, {
                blockchainId: tokenId || "PENDING", 
                transactionHash: tx.hash
            })
            setAsset(prev => ({...prev, blockchainId: tokenId || "Confirmed"}))
            alert("Asset Successfully Minted on Blockchain!")

        } catch (error) {
            console.error("Minting failed", error)
            alert("Minting failed: " + (error.message || error))
        }
    }

    if (loading) return <div className="p-20 text-center text-white">Loading Asset...</div>
    if (!asset) return <div className="p-20 text-center text-white">Asset Not Found</div>

    // Construct stream URL with token & watermark
    const token = localStorage.getItem('token')
    let streamUrl = hasLicense 
        ? `http://localhost:5000/api/v1/assets/${asset._id}/stream?token=${token}`
        : null
    
    if (streamUrl && secureMode) {
        streamUrl += "&watermark=true"
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Player Section */}
            <div className={`aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 relative group transition-all duration-500 ${isWindowBlurred ? 'blur-xl grayscale' : ''}`}>
                
                {hasLicense ? (
                    asset.contentType === 'video' ? (
                        <>
                            <video 
                                ref={videoRef}
                                src={streamUrl} 
                                controls 
                                controlsList="nodownload" 
                                className="w-full h-full"
                                onContextMenu={(e) => e.preventDefault()} // Disable Right Click
                            />
                            {/* Anti-Rip Overlay */}
                            <div className="absolute inset-0 z-20 pointer-events-none bg-transparent" />
                        </>
                    ) : asset.contentType === 'audio' ? (
                         <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                             <div className="animate-pulse bg-brand-primary/20 p-8 rounded-full mb-8">
                                 <Play className="h-20 w-20 text-brand-primary" />
                             </div>
                             <audio src={streamUrl} controls className="w-1/2" />
                         </div>
                    ) : asset.contentType === 'text' ? (
                         <div className="w-full h-full bg-white relative">
                             <iframe 
                                src={streamUrl} 
                                className="w-full h-full" 
                                title="Secure Text Content"
                                sandbox="allow-scripts allow-same-origin" // Security
                             />
                             {/* Overlay to prevent direct interaction/copying if needed, though iframe makes this harder to block completely without more complex solutions */}
                             <div className="absolute inset-0 z-20 bg-transparent pointer-events-none" /> 
                         </div>
                    ) : (
                         <div className="w-full h-full flex items-center justify-center relative select-none" onContextMenu={(e) => e.preventDefault()}>
                             <img src={streamUrl || "placeholder.png"} alt="Content" className="max-h-full pointer-events-none" />
                             <div className="absolute inset-0 z-20 bg-transparent" />
                         </div>
                    )
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
                        <Lock className="h-16 w-16 text-gray-500 mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Content Locked</h3>
                        <p className="text-gray-400 mb-6">You need to purchase a license to access this secure content.</p>
                    </div>
                )}
                
                {/* Security Badge */}
                {hasLicense && (
                    <div className="absolute top-4 right-4 flex gap-2">
                        {secureMode && <span className="bg-red-500/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Secure Stream</span>}
                         {isWindowBlurred && <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded font-bold">FOCUS LOST - BLURRED</span>}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{asset.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="bg-brand-surface px-2 py-1 rounded border border-gray-700 uppercase text-xs">{asset.contentType}</span>
                                <span>By <span className="text-brand-primary font-medium">{asset.owner?.username}</span></span>
                                <span>•</span>
                                <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                                {asset.originalityVerified && (
                                    <span className="flex items-center text-green-500 gap-1">
                                        <ShieldCheck className="h-4 w-4" /> Verified Original
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Secure Toggle */}
                        {hasLicense && asset.contentType === 'video' && (
                            <div className="flex items-center gap-3 bg-brand-surface border border-gray-700 p-2 rounded-lg">
                                <span className="text-xs text-gray-400 font-medium">Secure Delivery</span>
                                <button 
                                    onClick={() => setSecureMode(!secureMode)}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${secureMode ? 'bg-brand-primary' : 'bg-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${secureMode ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <Card className="bg-brand-surface border-gray-700">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                {asset.description}
                            </p>
                        </CardContent>
                    </Card>
                    
                    {/* ... (Technical Details Card) */}
                     <Card className="bg-brand-surface border-gray-700">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Technical Details</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Blockchain ID:</span>{' '}
                                    <span className="text-gray-300 font-mono">
                                        {asset.blockchainId || (
                                            asset.owner._id === user?._id && asset.originalityVerified ? (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-6 text-xs border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black ml-2"
                                                    onClick={handleMint}
                                                >
                                                    <Coins className="w-3 h-3 mr-1" /> Mint Now
                                                </Button>
                                            ) : "Pending"
                                        )}
                                    </span>
                                </div>
                                <div><span className="text-gray-500">IPFS CID:</span> <span className="text-gray-300 font-mono">{asset.cid?.substring(0,10)}...</span></div>
                                <div><span className="text-gray-500">Originality Score:</span> <span className="text-gray-300">{asset.originalityScore}%</span></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-brand-surface/50 border-brand-primary/20 sticky top-4">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="text-xl font-bold text-white">Purchase License</h3>
                            <p className="text-sm text-gray-400">Select a license type to unlock this content via Blockchain.</p>
                            
                            <div className="space-y-3 pt-4">
                                {getLicensesForType(asset.contentType || 'image').map((license) => {
                                    const term = asset.licenseTerms?.[license.id];
                                    if (!term || !term.enabled) return null;

                                    return (
                                        <Button 
                                            key={license.id}
                                            variant={license.id === 'license1' ? 'default' : 'outline'}
                                            className={`w-full justify-between h-auto py-4 ${license.id !== 'license1' ? 'border-gray-700 hover:bg-white/5' : ''}`}
                                            onClick={() => handlePurchase(license.id)}
                                            disabled={hasLicense || licenseLoading}
                                        >
                                            <div className="text-left">
                                                <div className="font-semibold text-white">{license.name}</div>
                                                <div className="text-xs text-gray-400">{license.description}</div>
                                            </div>
                                            <div className="text-white font-bold">{term.price} ETH</div>
                                        </Button>
                                    )
                                })}
                            </div>
                            
                            {hasLicense && (
                                <div className="bg-green-500/10 border border-green-500/20 p-3 rounded text-center text-green-500 text-sm font-medium">
                                    You own this license.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default AssetDetails
