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
    
    // Player State
    const videoRef = useRef(null)

    useEffect(() => {
        fetchAsset()
    }, [id])

    // Check license when asset/user loads
    useEffect(() => {
        if (asset && user) {
            checkUserLicense()
        }
    }, [asset, user])

    const fetchAsset = async () => {
        try {
            const { data } = await api.get(`/assets/${id}`)
            setAsset(data.data)
        } catch (error) {
            console.error("Fetch failed", error)
        } finally {
            setLoading(false)
        }
    }

    const checkUserLicense = async () => {
        // First check locally? Backend doesn't store licenses yet (blockchain only for now)
        // Check Blockchain
        if (window.ethereum && asset.blockchainId) {
             try {
                 const provider = new ethers.BrowserProvider(window.ethereum)
                 // Read-only check doesn't need signer, but let's use it if available
                 const contract = new ethers.Contract(DRM_LICENSING_ADDRESS, DRMLicensingABI, provider)
                 
                 // checkLicense(user, tokenId)
                 const hasAccess = await contract.checkLicense(user.walletAddress, asset.blockchainId)
                 setHasLicense(hasAccess)
                 
                 // If the user is the owner/creator, they also have access
                 if (asset.owner._id === user._id) setHasLicense(true)
                 
             } catch (err) {
                 console.error("License check error:", err)
                 // Fallback: If owner
                 if (asset.owner._id === user._id) setHasLicense(true)
             }
        } else {
             // Fallback if no wallet or not minted yet
             if (asset.owner._id === user._id) setHasLicense(true)
        }
    }

    const handlePurchase = async (type) => {
        if (!window.ethereum) return alert("Please install MetaMask")
        
        setLicenseLoading(true)
        try {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            const contract = new ethers.Contract(DRM_LICENSING_ADDRESS, DRMLicensingABI, signer)
            
            // Get Price based on type (license1, license2...)
            // licenseTerms in asset model: { license1: { price: .. }, ... }
            const licenseKey = type; // Expecting 'license1', 'license2' etc. as type arg
            
            let price = '0';
            if (asset.licenseTerms && asset.licenseTerms[licenseKey]) {
                price = asset.licenseTerms[licenseKey].price.toString();
            } else {
                 throw new Error("Invalid license type selected")
            }
            
            console.log(`Purchasing ${licenseKey} for ${price} ETH`);

            const tx = await contract.purchaseLicense(asset.blockchainId, licenseKey, {
                value: ethers.parseEther(price)
            })
            
            console.log("Purchase Tx:", tx.hash)
            await tx.wait()
            
            setHasLicense(true)
            alert("License Purchased Successfully!")
            
        } catch (error) {
            console.error("Purchase failed", error)
            alert("Purchase failed: " + error.message)
        } finally {
            setLicenseLoading(false)
        }
    }

    const handleMint = async () => {
        if (!asset) return

        if (!window.ethereum) return alert("Please install MetaMask")
          
        try {
            // Check Originality Again just in case
            if (!asset.originalityVerified) {
                alert("Cannot mint duplicate content.")
                return
            }

            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            
            const contract = new ethers.Contract(DRM_REGISTRY_ADDRESS, DRMRegistryABI, signer)
            
            console.log("Minting Args:", {
                to: user?.walletAddress,
                cid: asset.cid,
                uri: `ipfs://${asset.cid}`
            });
            
            if (!user?.walletAddress) throw new Error("User wallet address is missing. Connect wallet.");

            const tx = await contract.registerAsset(
                user.walletAddress, 
                asset.cid, 
                `ipfs://${asset.cid}`
            )
            
            console.log("Mint Transaction Sent:", tx.hash)
            alert("Minting Transaction Sent! Waiting for confirmation...")
            
            const receipt = await tx.wait()
            console.log("Mint Confirmed:", receipt)
            
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

            // Update Backend
            await api.put(`/assets/${asset._id}/mint`, {
                blockchainId: tokenId || "PENDING", 
                transactionHash: tx.hash
            })
            
            // Update local state
            setAsset(prev => ({...prev, blockchainId: tokenId || "Confirmed"}))
            alert("Asset Successfully Minted on Blockchain!")

        } catch (error) {
            console.error("Minting failed", error)
            alert("Minting failed: " + (error.message || error))
        }
    }

    if (loading) return <div className="p-20 text-center text-white">Loading Asset...</div>
    if (!asset) return <div className="p-20 text-center text-white">Asset Not Found</div>

    // Construct stream URL with token
    const token = localStorage.getItem('token')
    const streamUrl = hasLicense 
        ? `http://localhost:5000/api/v1/assets/${asset._id}/stream?token=${token}`
        : null

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Player Section */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 relative">
                {hasLicense ? (
                    asset.contentType === 'video' ? (
                        <video 
                            ref={videoRef}
                            src={streamUrl} 
                            controls 
                            controlsList="nodownload" // Basic prevention
                            className="w-full h-full"
                            onContextMenu={(e) => e.preventDefault()}
                        />
                    ) : asset.contentType === 'audio' ? (
                         <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                             <div className="animate-pulse bg-brand-primary/20 p-8 rounded-full mb-8">
                                 <Play className="h-20 w-20 text-brand-primary" />
                             </div>
                             <audio src={streamUrl} controls className="w-1/2" />
                         </div>
                    ) : (
                         <div className="w-full h-full flex items-center justify-center">
                             <img src={streamUrl || "placeholder.png"} alt="Content" className="max-h-full" />
                         </div>
                    )
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
                        <Lock className="h-16 w-16 text-gray-500 mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Content Locked</h3>
                        <p className="text-gray-400 mb-6">You need to purchase a license to access this secure content.</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
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
                    
                    <Card className="bg-brand-surface border-gray-700">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                {asset.description}
                            </p>
                        </CardContent>
                    </Card>
                    
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
                                    // Check if enabled or has price > 0 (assuming enabled flag exists in object or price check)
                                    // Backend model: licenseTerms.licenseX = { price: 0, enabled: false }
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
