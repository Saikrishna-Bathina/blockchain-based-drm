import { useState, useRef } from "react"
import { Upload, X, FileText, Image as ImageIcon, Video, Music, ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import axios from "axios"
import { cn } from "../lib/utils"

const VerificationPage = () => {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef(null)

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
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const handleFile = (selectedFile) => {
        setFile(selectedFile)
        setResult(null)
        setError(null)

        // Create preview
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onloadend = () => setPreview(reader.result)
            reader.readAsDataURL(selectedFile)
        } else {
            setPreview(null)
        }
    }

    const removeFile = () => {
        setFile(null)
        setPreview(null)
        setResult(null)
        setError(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return <ImageIcon className="h-6 w-6 text-zinc-400" />
        if (type.startsWith('video/')) return <Video className="h-6 w-6 text-zinc-400" />
        if (type.startsWith('audio/')) return <Music className="h-6 w-6 text-zinc-400" />
        return <FileText className="h-6 w-6 text-zinc-400" />
    }

    const checkOriginality = async () => {
        if (!file) return

        setAnalyzing(true)
        setError(null)

        const formData = new FormData()
        formData.append('file', file)

        try {
            // Using the new /check endpoint we created
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
            
            const response = await axios.post('http://localhost:5000/api/v1/assets/check', formData, config)
            setResult(response.data.data)
        } catch (err) {
            console.error("Verification failed:", err)
            setError(err.response?.data?.error || "Failed to verify asset. Please try again.")
        } finally {
            setAnalyzing(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in pb-12">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    Verify Originality
                </h1>
                <p className="text-sm text-zinc-500 max-w-md mx-auto">
                    Upload your asset for an instant analysis against our global registry before registration.
                </p>
            </div>

            <Card className="bg-black border-zinc-800">
                <CardContent className="p-0">
                    {!file ? (
                        <div 
                            className={cn(
                                "border border-zinc-800 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer bg-zinc-950/50",
                                dragActive ? "border-white bg-zinc-900" : "hover:border-zinc-600 hover:bg-zinc-900/30"
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                className="hidden" 
                                onChange={handleChange}
                                accept="image/*,video/*,audio/*,text/*,application/pdf"
                            />
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-12 w-12 rounded bg-zinc-900 flex items-center justify-center border border-zinc-800">
                                    <Upload className="h-5 w-5 text-zinc-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-white">Click or drag file to upload</p>
                                    <p className="text-xs text-zinc-500">Supports Images, Video, Audio, & Text</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800">
                            {/* File Preview */}
                            <div className="p-6 flex items-center gap-4">
                                <div className="h-16 w-16 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                     {preview ? (
                                        <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        getFileIcon(file.type)
                                    )}
                                </div>
                                
                                <div className="min-w-0 flex-1">
                                    <p className="text-white font-medium text-sm truncate">{file.name}</p>
                                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                                    </p>
                                </div>

                                <button 
                                    onClick={removeFile}
                                    disabled={analyzing}
                                    className="p-2 rounded hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Actions / Analysis */}
                            {!result && !error && (
                                <div className="p-4 bg-zinc-900/30 flex justify-end">
                                    <Button 
                                        onClick={checkOriginality} 
                                        disabled={analyzing}
                                        className="bg-white text-black hover:bg-zinc-200 min-w-[140px]"
                                    >
                                        {analyzing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            "Check Originality"
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Results */}
                            {result && (
                                <div className="animate-in slide-in-from-top-2">
                                     <div className="p-6">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center border",
                                                    result.is_original ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                                                )}>
                                                    {result.is_original ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-medium">
                                                        {result.is_original ? "Asset is Original" : "Duplicate Detected"}
                                                    </h3>
                                                    <p className={cn("text-xs", result.is_original ? "text-green-500" : "text-red-500")}>
                                                        Result Confidence: {result.score}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                    {result.match && (
                                        <div className="bg-zinc-900 border border-zinc-700/50 rounded-lg p-5 mb-6 space-y-4 animate-in slide-in-from-bottom-2">
                                            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
                                                <ShieldAlert className="h-4 w-4 text-red-500" />
                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Original Registration Found</h4>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Asset Name</p>
                                                    <p className="text-sm text-zinc-200 font-medium truncate">{result.match.title}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Registered Owner</p>
                                                    <p className="text-sm text-zinc-200 font-medium truncate">{result.match.owner?.username || "Anonymous"}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Wallet Address</p>
                                                <p className="text-[11px] text-brand-primary font-mono truncate bg-brand-primary/5 px-2 py-1 rounded border border-brand-primary/10">
                                                    {result.match.owner?.walletAddress || "Unknown"}
                                                </p>
                                            </div>

                                            <div className="pt-2">
                                                <p className="text-[10px] text-zinc-500 italic">
                                                    Duplicate detected via {result.details?.status || "Fuzzy Match"}.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {result.is_original ? (
                                        <Button 
                                            onClick={() => window.location.href = '/dashboard/upload'}
                                            className="w-full bg-white text-black hover:bg-zinc-200 font-bold"
                                        >
                                            Proceed to Minting
                                        </Button>
                                    ) : (
                                        <div className="flex items-center gap-3 text-xs text-zinc-400 bg-red-500/5 p-4 rounded-lg border border-red-500/20 shadow-inner">
                                            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                                            <div>
                                                <p className="font-bold text-red-400 mb-0.5 uppercase tracking-wide">Verification Failed</p>
                                                <p>Upload a unique asset to proceed. Our system ensures only original creations are registered.</p>
                                            </div>
                                        </div>
                                    )}
                                     </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-500/10 text-red-400 text-sm flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default VerificationPage
