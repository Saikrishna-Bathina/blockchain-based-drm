import { useState } from "react"
import { UploadCloud, FileImage, FileVideo, CheckCircle2, AlertCircle, Loader2, Coins, ShieldCheck, Lock } from "lucide-react"
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

// Placeholder address - Replace with deployed address
const DRM_REGISTRY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const DRM_LICENSING_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; 

const UploadAsset = () => {
  const navigate = useNavigate()
  const { user, provider: authProvider, switchNetwork } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  
  // Form State
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [contentType, setContentType] = useState("image") // default
  
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
      if (selectedFile.type.startsWith('image')) setContentType('image')
      else if (selectedFile.type.startsWith('video')) setContentType('video')
      else if (selectedFile.type.startsWith('audio')) setContentType('audio')
      else if (selectedFile.type === 'application/pdf') setContentType('text')
      else setContentType('text') // fallback

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
          
          console.log("Debug Minting:", {
              address: DRM_REGISTRY_ADDRESS,
              abi: DRMRegistryABI,
              signer: signer
          });

          if (!DRM_REGISTRY_ADDRESS) throw new Error("Contract Address is missing");

          const contract = new ethers.Contract(DRM_REGISTRY_ADDRESS, DRMRegistryABI, signer)
          
          // Metadata URI could be the IPFS CID directly or a JSON metadata file
          // For simplicity, using CID as URI
          // registerAsset(to, contentHash, metadataURI)
          console.log("Minting Args:", {
              to: user?.walletAddress,
              cid: uploadedAsset?.cid,
              uri: `ipfs://${uploadedAsset?.cid}`
          });
          
          const signerAddress = await signer.getAddress();
          
          if (!signerAddress) throw new Error("Wallet address missing.");

          const tx = await contract.registerAsset(
              signerAddress, 
              uploadedAsset.cid, 
              `ipfs://${uploadedAsset.cid}`
          )
          
          console.log("Mint Transaction Sent:", tx.hash)
          const receipt = await tx.wait()
          console.log("Mint Confirmed:", receipt)
          
          // Extract Token ID from events if easier, or assume sequential if single user
          // But receipt logs are best. 
          // For now, let's just send the txHash to backend and let backend figure it out or just store hash
          // Ideally we get the tokenId. ERC721 emits Transfer(from, to, tokenId)
          
          // We can parse logs
          // For this MVP, we update with txHash.
          
          let tokenId = null;
          // Simple log parsing (very fragile without full ABI of Transfer)
          // Using the event AssetRegistered(tokenId, creator, contentHash)
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
              console.log("Setting License Terms for Token:", tokenId)
              const licensingContract = new ethers.Contract(DRM_LICENSING_ADDRESS, DRMLicensingABI, signer) // Need imports
              
              // Helper to parse price
              const p1 = prices.license1.enabled ? ethers.parseEther(prices.license1.price.toString() || '0') : 0n;
              const p2 = prices.license2.enabled ? ethers.parseEther(prices.license2.price.toString() || '0') : 0n;
              const p3 = prices.license3.enabled ? ethers.parseEther(prices.license3.price.toString() || '0') : 0n;
              const p4 = prices.license4.enabled ? ethers.parseEther(prices.license4.price.toString() || '0') : 0n;
              
              const tx2 = await licensingContract.setLicenseTerms(tokenId, p1, p2, p3, p4);
              await tx2.wait();
              console.log("License Terms Set:", tx2.hash);
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Upload & Register New Asset</h2>
        <p className="text-gray-400">Upload your file, verify originality, and mint an NFT for ownership.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: File Upload */}
          <div className="space-y-6">
              <div 
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer min-h-[300px] flex flex-col items-center justify-center",
                    dragActive ? "border-brand-primary bg-brand-primary/5" : "border-gray-700 hover:border-brand-primary/50 bg-brand-surface/20"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => status === 'idle' && document.getElementById("file-upload").click()}
              >
                {previewUrl ? (
                    <div className="w-full h-full flex flex-col items-center">
                        {contentType === 'image' && <img src={previewUrl} alt="Preview" className="max-h-60 rounded-lg object-contain" />}
                        {contentType === 'video' && <video src={previewUrl} className="max-h-60 rounded-lg" controls />}
                        {contentType === 'audio' && <audio src={previewUrl} controls className="w-full mt-10" />}
                         {status === 'idle' && (
                             <Button variant="ghost" className="mt-2 text-red-400 hover:text-red-300" onClick={(e) => {
                                e.stopPropagation()
                                setFile(null)
                                setPreviewUrl(null)
                            }}>Remove</Button>
                         )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-brand-primary/20 rounded-full text-brand-primary">
                            <UploadCloud className="h-10 w-10" />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-white">Drag & Drop File</p>
                            <p className="text-sm text-gray-400 mt-1">Video, Audio, Image, Text</p>
                        </div>
                        <Button variant="outline" className="mt-4">Browse Files</Button>
                    </div>
                )}
                 <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    onChange={handleChange}
                    disabled={status !== 'idle'}
                 />
              </div>

              {/* Status Display */}
                {/* Dynamic Status Cards */}
               {/* REAL-TIME VISUAL FLOW */}
               {status !== 'idle' && (
                 <div className="mb-8 mt-4 relative">
                     {/* Progress Bar Background */}
                     <div className="absolute left-0 top-4 w-full h-1 bg-gray-700 -z-10 rounded"></div>
                     
                     <div className="flex justify-between w-full">
                         {/* Step 1: Upload */}
                         <div className="flex flex-col items-center gap-2 bg-brand-background px-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${
                                  ['uploading'].includes(status) ? "bg-yellow-500 animate-pulse text-black" : "bg-green-500 text-black"
                              }`}>
                                 <UploadCloud className="w-4 h-4" />
                             </div>
                             <span className="text-xs text-green-400">Uploaded</span>
                         </div>
 
                         {/* Step 2: Originality */}
                         <div className="flex flex-col items-center gap-2 bg-brand-background px-2">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${
                                 ['verifying'].includes(status) ? "bg-yellow-500 animate-pulse text-black" :
                                 (status === 'uploading' ? "bg-gray-700 text-gray-500" : 
                                 (status === 'duplicate' || (uploadedAsset && !uploadedAsset.originalityVerified) ? "bg-red-500 text-white" : "bg-green-500 text-black"))
                             }`}>
                                 <ShieldCheck className="w-4 h-4" />
                             </div>
                             <span className={`text-xs ${
                                 ['verifying'].includes(status) ? "text-yellow-400" :
                                 (status === 'duplicate' || (uploadedAsset && !uploadedAsset.originalityVerified) ? "text-red-400" : 
                                 (status === 'uploading' ? "text-gray-500" : "text-green-400"))
                             }`}>
                                 {status === 'verifying' ? "Verifying & Registering..." : (status === 'duplicate' || (uploadedAsset && !uploadedAsset.originalityVerified) ? "Duplicate" : "Verified & Registered")}
                             </span>
                         </div>
 
                         {/* Step 3: IPFS */}
                         <div className="flex flex-col items-center gap-2 bg-brand-background px-2">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${
                                 ['securing'].includes(status) ? "bg-yellow-500 animate-pulse text-black" :
                                 (['uploading', 'verifying', 'duplicate'].includes(status) ? "bg-gray-700 text-gray-500" : "bg-green-500 text-black")
                             }`}>
                                 <Lock className="w-4 h-4" />
                             </div>
                             <span className={`text-xs ${['securing'].includes(status) ? "text-yellow-400" : (['uploaded', 'minting', 'complete'].includes(status) ? "text-green-400" : "text-gray-500")}`}>
                                 {status === 'securing' ? "Securing..." : "Encrypted & IPFS"}
                             </span>
                         </div>
 
                         {/* Step 4: Minting */}
                         <div className="flex flex-col items-center gap-2 bg-brand-background px-2">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${
                                 status === 'minting' ? "bg-yellow-500 animate-pulse text-black" :
                                 (status === 'complete' || (uploadedAsset && uploadedAsset.blockchainId) ? "bg-green-500 text-black" : "bg-gray-700 text-gray-500")
                             }`}>
                                 <Coins className="w-4 h-4" />
                             </div>
                             <span className={`text-xs ${status === 'complete' ? "text-green-400" : (status === 'minting' ? "text-yellow-400" : "text-gray-500")}`}>
                                 {status === 'complete' ? "Minted" : "Mint NFT"}
                             </span>
                         </div>
                     </div>
                 </div>
               )}

                {/* ERROR CARD */}
                {status === "error" && (
                   <Card className="bg-red-900/10 border-red-500/20 mb-6">
                       <CardContent className="p-4 flex items-center space-x-4">
                           <AlertCircle className="h-6 w-6 text-red-500" />
                           <div>
                               <p className="text-red-400 font-medium">Error</p>
                               <p className="text-sm text-gray-400">{errorMessage}</p>
                               <Button variant="link" onClick={() => setStatus("idle")} className="text-red-400 p-0 h-auto">Try Again</Button>
                           </div>
                       </CardContent>
                   </Card>
               )}
 
               {/* RESULT CARD: Uploaded/Complete/Duplicate */}
               {(status === "uploaded" || status === "complete" || status === "duplicate") && uploadedAsset && (
                   <Card className={`bg-${uploadedAsset.originalityVerified ? 'green' : 'red'}-900/10 border-${uploadedAsset.originalityVerified ? 'green' : 'red'}-500/20`}>
                       <CardContent className="p-4">
                            <div className="flex items-center space-x-4 mb-2">
                                {uploadedAsset.originalityVerified ? (
                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 text-red-500" />
                                )}
                                <div>
                                    <p className={`${uploadedAsset.originalityVerified ? 'text-green-400' : 'text-red-400'} font-medium`}>
                                        {uploadedAsset.originalityVerified ? "Asset Secured!" : "Upload Rejected (Duplicate)"}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {uploadedAsset.originalityVerified ? "Files encrypted and stored on IPFS." : "This content was flagged as a duplicate. It was NOT uploaded to IPFS."}
                                    </p>
                                </div>
                            </div>
 
                            <div className="mt-2 p-3 bg-black/20 rounded text-sm space-y-1">
                                <p className="text-gray-300">
                                    Status: <span className={uploadedAsset.originalityVerified ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                                        {uploadedAsset.originalityVerified ? "ORIGINAL" : "DUPLICATE"}
                                    </span>
                                </p>
                                <p className="text-gray-300">
                                    Originality Score: <span className={uploadedAsset.originalityVerified ? "text-green-400" : "text-yellow-400"}>
                                        {uploadedAsset.originalityScore}/100
                                    </span>
                                </p>
                                <p className="text-gray-300">IPFS CID: <span className="font-mono text-xs text-blue-400">{uploadedAsset.cid?.substring(0,12) || "N/A"}</span></p>
                            </div>
                           
                           {status === "uploaded" && (
                               <Button 
                                   className={`w-full mt-4 text-white ${uploadedAsset.originalityVerified ? "bg-yellow-600 hover:bg-yellow-700" : "bg-gray-600 cursor-not-allowed"}`}
                                   onClick={uploadedAsset.originalityVerified ? handleMint : null}
                                   disabled={!uploadedAsset.originalityVerified}
                               >
                                   <Coins className="w-4 h-4 mr-2" />
                                   {uploadedAsset.originalityVerified ? "Mint Ownership NFT" : "Minting Disabled (Duplicate Asset)"}
                               </Button>
                           )}
                           
                           {status === "complete" && (
                               <div className="mt-4">
                                   <p className="text-center text-green-400 font-bold mb-2">NFT Minted Successfully!</p>
                                   <Button className="w-full" onClick={() => navigate('/dashboard')}>
                                        Go to Dashboard
                                   </Button>
                               </div>
                           )}
                       </CardContent>
                   </Card>
               )}
          </div>

          {/* Right Column: Metadata Form */}
          <div className="space-y-6">
              <Card className="bg-brand-surface/50 border-brand-surface backdrop-blur-sm">
                  <CardContent className="p-6 space-y-4">
                      <h3 className="text-xl font-semibold text-white mb-4">Asset Details</h3>
                      
                      <div className="space-y-2">
                          <label className="text-sm text-gray-300">Title</label>
                          <Input 
                              placeholder="e.g. My Amazing Song" 
                              value={title} 
                              onChange={(e) => setTitle(e.target.value)} 
                              disabled={status !== 'idle'}
                          />
                      </div>

                      <div className="space-y-2">
                          <label className="text-sm text-gray-300">Description</label>
                          <textarea 
                              className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Describe your content..."
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              disabled={status !== 'idle'}
                          />
                      </div>

                       <div className="space-y-2">
                          <label className="text-sm text-gray-300">Content Type</label>
                          <select 
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-white"
                            value={contentType}
                            onChange={(e) => setContentType(e.target.value)}
                            disabled={status !== 'idle'}
                          >
                              <option value="video">Video</option>
                              <option value="audio">Audio</option>
                              <option value="image">Image</option>
                              <option value="text">Text</option>
                          </select>
                      </div>
                  </CardContent>
              </Card>

              <Card className="bg-brand-surface/50 border-brand-surface backdrop-blur-sm">
                  <CardContent className="p-6 space-y-4">
                      <h3 className="text-xl font-semibold text-white mb-4">License Pricing (ETH)</h3>
                      
                      <div className="space-y-4">
                          {getLicensesForType(contentType).map((license) => (
                              <div key={license.id} className="p-3 rounded-lg border border-gray-700 bg-black/20">
                                  <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                          <input 
                                              type="checkbox"
                                              checked={prices[license.id]?.enabled}
                                              onChange={(e) => setPrices({
                                                  ...prices, 
                                                  [license.id]: { ...prices[license.id], enabled: e.target.checked }
                                              })}
                                              disabled={status !== 'idle'}
                                              className="rounded border-gray-600 bg-gray-700 text-brand-primary focus:ring-brand-primary"
                                          />
                                          <label className="text-sm font-medium text-gray-200">{license.name}</label>
                                      </div>
                                  </div>
                                  
                                  <div className="pl-6 space-y-2">
                                      <p className="text-xs text-gray-400">{license.description}</p>
                                      {prices[license.id]?.enabled && (
                                          <div className="flex items-center gap-2">
                                              <span className="text-xs text-gray-400">Price (ETH):</span>
                                              <Input 
                                                  type="number" step="0.0001" 
                                                  placeholder="0.00"
                                                  value={prices[license.id]?.price}
                                                  onChange={(e) => setPrices({
                                                      ...prices, 
                                                      [license.id]: { ...prices[license.id], price: e.target.value } // keep as string/value until submit
                                                  })}
                                                  disabled={status !== 'idle'}
                                                  className="h-8 w-32"
                                              />
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </CardContent>
              </Card>

              {status === 'idle' && (
                  <Button 
                    className="w-full h-12 text-lg bg-brand-primary hover:bg-brand-primary/90"
                    onClick={handleUpload}
                  >
                      Upload & Secure Asset
                  </Button>
              )}
          </div>
      </div>
    </div>
  )
}

export default UploadAsset
