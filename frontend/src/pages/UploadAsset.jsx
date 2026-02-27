import { useState, useRef } from "react"
import { UploadCloud, FileImage, FileVideo, Music, FileText, X, CheckCircle2, AlertCircle, Loader2, Coins, ShieldCheck, Lock, Upload } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { cn } from "../lib/utils"
import api from "../lib/api"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { ethers } from "ethers"
import { DRMRegistryABI } from "../abi/DRMRegistry"
import { DRMLicensingABI } from "../abi/DRMLicensing"
import { getLicensesForType } from "../lib/licenseConfig"
import { motion, AnimatePresence } from "framer-motion"

// Placeholder address - Replace with deployed address
const DRM_REGISTRY_ADDRESS = "0xA9A86c2D0C46BFB5f9daABFc8364D044E6A20512";
const DRM_LICENSING_ADDRESS = "0x9f0ec638885dEb4973386554439AD81B9ec40fC8"; 

const UploadAsset = () => {
  const navigate = useNavigate()
  const { user, provider: authProvider } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)
  
  // Form State
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [contentType, setContentType] = useState("image") // Auto-detected
  
  // License State
  const [prices, setPrices] = useState({
      license1: { price: '', enabled: true },
      license2: { price: '', enabled: false },
      license3: { price: '', enabled: false },
      license4: { price: '', enabled: false }
  })

  // Status: idle -> uploading -> uploaded (waiting for mint) -> minting -> complete -> error
  const [status, setStatus] = useState("idle") 
  const [errorMessage, setErrorMessage] = useState("")
  const [uploadedAsset, setUploadedAsset] = useState(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }
  
  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        handleFileSelection(e.target.files[0])
    }
  }

  const handleFileSelection = (selectedFile) => {
      setFile(selectedFile)
      setStatus("idle")
      setErrorMessage("")
      
      // Auto-detect type
      let type = 'text';
      if (selectedFile.type.startsWith('image')) type = 'image';
      else if (selectedFile.type.startsWith('video')) type = 'video';
      else if (selectedFile.type.startsWith('audio')) type = 'audio';
      else if (selectedFile.type === 'application/pdf') type = 'text';
      
      setContentType(type)

      // Create preview
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreviewUrl(objectUrl)
  }

  const handleUpload = async () => {
      if (!file || !title || !description) {
          setErrorMessage("Please fill in all required fields and select a file.")
          return
      }

      setErrorMessage("")

      // Sanitize prices
      const cleanedPrices = {};
      Object.keys(prices).forEach(key => {
          cleanedPrices[key] = {
              enabled: prices[key].enabled,
              price: parseFloat(prices[key].price) || 0
          };
      });

      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('contentType', contentType)
      formData.append('licenseTerms', JSON.stringify(cleanedPrices))

      try {
          // 1. Upload
          setStatus("uploading")
          const upRes = await api.post('/assets/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          })
          const assetId = upRes.data.data._id
          
          // 2. Verify
          setStatus("verifying")
          const verifyRes = await api.put(`/assets/${assetId}/verify`);
          const verifiedAsset = verifyRes.data.data;
          setUploadedAsset(verifiedAsset);

          if (!verifiedAsset.originalityVerified) {
               setStatus("duplicate");
               return; // Stop here
          }

          // 3. Secure
          setStatus("securing")
          const secureRes = await api.put(`/assets/${assetId}/secure`);
          setUploadedAsset(secureRes.data.data);
          
          setStatus("uploaded") // Ready to mint

      } catch (error) {
          console.error("Flow failed", error)
          setStatus("error")
          setErrorMessage(error.response?.data?.error || "Process failed. Please try again.")
      }
  }

  const handleMint = async () => {
      if (!uploadedAsset || !uploadedAsset.cid) {
          setErrorMessage("Asset data missing. Please upload again.")
          return
      }

      try {
          setStatus("minting")
          
          if (!authProvider) throw new Error("No wallet provider found. Please login.");
          
          const provider = new ethers.BrowserProvider(authProvider)
          const signer = await provider.getSigner()
          
          if (!DRM_REGISTRY_ADDRESS) throw new Error("Contract Address is missing");

          const contract = new ethers.Contract(DRM_REGISTRY_ADDRESS, DRMRegistryABI, signer)
          
          const signerAddress = await signer.getAddress();
          
          if (!signerAddress) throw new Error("Wallet address missing.");

          const tx = await contract.registerAsset(
              signerAddress, 
              uploadedAsset.cid, 
              `ipfs://${uploadedAsset.cid}`,
              { gasLimit: 500000 }
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

          // 2. Set License Terms on DRMLicensing Contract
          if (tokenId) {
              const licensingContract = new ethers.Contract(DRM_LICENSING_ADDRESS, DRMLicensingABI, signer)
              
              const p1 = prices.license1.enabled ? ethers.parseEther(prices.license1.price.toString() || '0') : 0n;
              const p2 = prices.license2.enabled ? ethers.parseEther(prices.license2.price.toString() || '0') : 0n;
              const p3 = prices.license3.enabled ? ethers.parseEther(prices.license3.price.toString() || '0') : 0n;
              const p4 = prices.license4.enabled ? ethers.parseEther(prices.license4.price.toString() || '0') : 0n;
              
              const tx2 = await licensingContract.setLicenseTerms(tokenId, p1, p2, p3, p4);
              await tx2.wait();
          }

          // Update Backend
          await api.put(`/assets/${uploadedAsset._id}/mint`, {
              blockchainId: tokenId || "PENDING", 
              transactionHash: tx.hash
          })
          
          setStatus("complete")

      } catch (error) {
          console.error("Minting failed", error)
          setStatus("error")
          setErrorMessage(error.message || "Minting failed on blockchain.")
      }
  }

  const getTypeIcon = (type) => {
      switch(type) {
          case 'image': return <FileImage className="w-8 h-8 text-blue-400" />;
          case 'video': return <FileVideo className="w-8 h-8 text-purple-400" />;
          case 'audio': return <Music className="w-8 h-8 text-pink-400" />;
          default: return <FileText className="w-8 h-8 text-gray-400" />;
      }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
        {/* Left Column: Upload Area */}
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Create Asset</h1>
                <p className="text-gray-400 mt-2">Secure your digital property on the blockchain.</p>
            </div>

            <div 
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 min-h-[400px] flex flex-col items-center justify-center group overflow-hidden bg-zinc-900/30 backdrop-blur-sm",
                    dragActive ? "border-brand-primary bg-brand-primary/10 scale-[1.01]" : "border-zinc-700 hover:border-brand-primary/50 hover:bg-zinc-800/50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => status === 'idle' && !file && fileInputRef.current?.click()}
            >
                {file ? (
                    <div className="w-full h-full flex flex-col items-center relative z-10">
                         {/* Preview Area */}
                        <div className="relative w-full aspect-video bg-black/50 rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center mb-6">
                            {contentType === 'image' && <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />}
                            {contentType === 'video' && <video src={previewUrl} className="w-full h-full object-contain" controls />}
                            {contentType === 'audio' && (
                                <div className="text-center">
                                    <Music className="w-16 h-16 text-zinc-600 mb-4 mx-auto" />
                                    <audio src={previewUrl} controls className="w-full" />
                                </div>
                            )}
                            {contentType === 'text' && (
                                <div className="text-center p-8">
                                    <FileText className="w-16 h-16 text-zinc-600 mb-2 mx-auto" />
                                    <p className="text-zinc-400 truncate max-w-[200px]">{file.name}</p>
                                </div>
                            )}
                            
                            {status === 'idle' && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setFile(null)
                                        setPreviewUrl(null)
                                        setContentType('image') // reset
                                    }}
                                    className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-500/80 rounded-full text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* File Info */}
                        <div className="flex items-center gap-3 bg-zinc-900/80 px-4 py-3 rounded-full border border-zinc-800">
                             {getTypeIcon(contentType)}
                             <div className="text-left">
                                 <p className="text-sm font-medium text-white truncate max-w-[150px]">{file.name}</p>
                                 <p className="text-xs text-brand-primary font-mono uppercase">{contentType}</p>
                             </div>
                        </div>

                        {/* Status Overlay */}
                        {status !== 'idle' && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 rounded-2xl">
                                {status === 'uploading' && <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />}
                                {status === 'verifying' && <ShieldCheck className="w-12 h-12 text-yellow-500 animate-pulse mb-4" />}
                                {status === 'securing' && <Lock className="w-12 h-12 text-purple-500 animate-pulse mb-4" />}
                                {status === 'minting' && <Coins className="w-12 h-12 text-brand-primary animate-bounce mb-4" />}
                                {status === 'complete' && <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />}
                                {status === 'duplicate' && <AlertCircle className="w-12 h-12 text-red-500 mb-4" />}
                                {status === 'error' && <X className="w-12 h-12 text-red-500 mb-4" />}
                                
                                <p className="text-xl font-bold text-white capitalize">{status}...</p>
                                {status === 'duplicate' && <p className="text-red-400 text-sm mt-2">Asset already exists!</p>}
                                {status === 'error' && <p className="text-red-400 text-sm mt-2 max-w-xs text-center">{errorMessage}</p>}
                                {status === 'complete' && <p className="text-green-400 text-sm mt-2">NFT Minted Successfully!</p>}
                                
                                {status === 'error' && (
                                     <Button variant="outline" className="mt-4 border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => setStatus('idle')}>Try Again</Button>
                                )}
                                {status === 'complete' && (
                                     <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate('/dashboard')}>View Dashboard</Button>
                                )}
                            </div>
                        )}
                        
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="p-5 bg-brand-primary/10 rounded-full text-brand-primary inline-flex mb-2 group-hover:scale-110 transition-transform duration-300">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-white">Drag & drop your file</p>
                            <p className="text-sm text-zinc-500 mt-2">Supports JPG, MP4, MP3, PDF</p>
                        </div>
                        <div className="flex items-center gap-3 w-full justify-center pt-2">
                             <span className="h-px w-12 bg-zinc-800"></span>
                             <span className="text-xs text-zinc-600 uppercase">OR</span>
                             <span className="h-px w-12 bg-zinc-800"></span>
                        </div>
                        <Button variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700">Browse Files</Button>
                    </div>
                )}
                
                <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    onChange={handleChange}
                    disabled={status !== 'idle'}
                />
            </div>
            
             {/* Progress Steps (Vertical) */}
             <div className="flex justify-between px-4 opacity-50 text-xs">
                 <div className={cn("flex items-center gap-2", ['uploading', 'verifying', 'securing', 'uploaded', 'minting', 'complete'].includes(status) ? "text-brand-primary opacity-100" : "")}>1. Upload</div>
                 <div className={cn("flex items-center gap-2", ['verifying', 'securing', 'uploaded', 'minting', 'complete'].includes(status) ? "text-brand-primary opacity-100" : "")}>2. Verify</div>
                 <div className={cn("flex items-center gap-2", ['securing', 'uploaded', 'minting', 'complete'].includes(status) ? "text-brand-primary opacity-100" : "")}>3. Secure</div>
                 <div className={cn("flex items-center gap-2", ['minting', 'complete'].includes(status) ? "text-brand-primary opacity-100" : "")}>4. Mint</div>
             </div>
        </div>

        {/* Right Column: Details Form */}
        <div className="space-y-6">
             <Card className="bg-black border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="bg-zinc-900/50 px-6 py-4 border-b border-zinc-800">
                      <h3 className="text-lg font-semibold text-white">Metadata & Licensing</h3>
                  </div>
                  <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Title</label>
                          <Input 
                              placeholder="Name your asset..." 
                              value={title} 
                              onChange={(e) => setTitle(e.target.value)} 
                              disabled={status !== 'idle'}
                              className="bg-zinc-900/50 border-zinc-800 focus:border-brand-primary text-white"
                          />
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Description</label>
                          <textarea 
                              className="w-full h-24 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-none"
                              placeholder="What is this content about?"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              disabled={status !== 'idle'}
                          />
                      </div>

                      <div className="space-y-3 pt-4 border-t border-zinc-800">
                          <div className="flex items-center justify-between">
                             <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">License Options</label>
                             <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-400">Auto-detected: <span className="text-white font-bold uppercase">{contentType}</span></span>
                          </div>
                          
                          <div className="space-y-3">
                              {getLicensesForType(contentType).map((license) => (
                                  <div 
                                    key={license.id} 
                                    className={cn(
                                        "p-3 rounded-xl border transition-all duration-200",
                                        prices[license.id]?.enabled 
                                            ? "bg-brand-primary/5 border-brand-primary/30" 
                                            : "bg-zinc-900/20 border-zinc-800 opacity-60 hover:opacity-100"
                                    )}
                                  >
                                      <div className="flex items-center gap-3">
                                          <input 
                                              type="checkbox"
                                              checked={prices[license.id]?.enabled}
                                              onChange={(e) => setPrices({
                                                  ...prices, 
                                                  [license.id]: { ...prices[license.id], enabled: e.target.checked }
                                              })}
                                              disabled={status !== 'idle'}
                                              className="rounded border-zinc-600 bg-zinc-700 text-brand-primary focus:ring-brand-primary w-4 h-4"
                                          />
                                          <div className="flex-1">
                                              <p className="text-sm font-medium text-white">{license.name}</p>
                                              <p className="text-[10px] text-zinc-400">{license.description}</p>
                                          </div>
                                      </div>
                                      
                                      {prices[license.id]?.enabled && (
                                           <div className="mt-3 pl-7 flex items-center gap-2">
                                              <span className="text-xs text-zinc-500">Price (ETH)</span>
                                              <Input 
                                                  type="number" step="0.0001" 
                                                  placeholder="0.00"
                                                  value={prices[license.id]?.price}
                                                  onChange={(e) => setPrices({
                                                      ...prices, 
                                                      [license.id]: { ...prices[license.id], price: e.target.value } 
                                                  })}
                                                  disabled={status !== 'idle'}
                                                  className="h-7 w-24 bg-black border-zinc-700 text-xs"
                                              />
                                          </div>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>
                  </CardContent>
             </Card>

             {/* Action Button */}
             <div className="pt-2">
                  {(status === 'idle' || status === 'uploaded') && (
                      <Button 
                        size="lg"
                        className={cn(
                            "w-full h-14 text-lg font-bold shadow-xl transition-all",
                            status === 'uploaded' 
                                ? "bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black" 
                                : "bg-white text-black hover:bg-zinc-200"
                        )}
                        onClick={status === 'uploaded' ? handleMint : handleUpload}
                        disabled={status === 'uploaded' && !uploadedAsset?.originalityVerified}
                      >
                          {status === 'uploaded' ? (
                              <><Coins className="w-5 h-5 mr-2" /> Mint Ownership NFT</>
                          ) : (
                              <><Upload className="w-5 h-5 mr-2" /> Upload & Verify</>
                          )}
                      </Button>
                  )}
                  {status === 'uploaded' && !uploadedAsset?.originalityVerified && (
                      <p className="text-center text-red-500 text-sm mt-2 font-medium">Cannot mint duplicate asset.</p>
                  )}
             </div>
        </div>
      </div>
    </div>
  )
}

export default UploadAsset
