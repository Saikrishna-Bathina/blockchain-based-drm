import { useState, useRef } from "react"
import { Upload, X, FileText, Image as ImageIcon, Video, Music, AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import axios from "axios"

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
        if (type.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-brand-primary" />
        if (type.startsWith('video/')) return <Video className="h-8 w-8 text-brand-primary" />
        if (type.startsWith('audio/')) return <Music className="h-8 w-8 text-brand-primary" />
        return <FileText className="h-8 w-8 text-brand-primary" />
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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Verify Asset Originality
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                    Check if your content is unique before registering it on the blockchain. 
                    Upload your asset for an instant analysis against our database.
                </p>
            </div>

            <Card className="bg-brand-surface border-brand-border/50">
                <CardContent className="p-8">
                    {!file ? (
                        <div 
                            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
                                ${dragActive ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-600 hover:border-gray-500 hover:bg-white/5'}`}
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
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-brand-surface flex items-center justify-center border border-gray-700 shadow-xl">
                                    <Upload className="h-8 w-8 text-brand-primary" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-white">Click or drag file to upload</p>
                                    <p className="text-sm text-gray-400 mt-1">Supports Images, Video, Audio, & Text</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* File Preview */}
                            <div className="relative rounded-xl overflow-hidden bg-brand-dark/50 border border-gray-700/50 p-4 flex items-center gap-4">
                                <button 
                                    onClick={removeFile}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                
                                {preview ? (
                                    <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                                ) : (
                                    <div className="h-20 w-20 bg-brand-surface rounded-lg flex items-center justify-center border border-gray-700">
                                        {getFileIcon(file.type)}
                                    </div>
                                )}
                                
                                <div>
                                    <p className="text-white font-medium truncate max-w-xs">{file.name}</p>
                                    <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>

                                {!analyzing && !result && (
                                    <Button onClick={checkOriginality} className="ml-auto bg-brand-primary hover:bg-brand-primary/90">
                                        Check Originality
                                    </Button>
                                )}
                            </div>

                            {/* Analysis Progress */}
                            {analyzing && (
                                <div className="space-y-4 py-8 text-center animate-in fade-in">
                                    <div className="relative h-32 w-32 mx-auto">
                                        <div className="absolute inset-0 rounded-full border-4 border-brand-surface opacity-30"></div>
                                        <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <ShieldCheck className="h-10 w-10 text-brand-primary animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="text-lg font-medium text-white">Analyzing content...</p>
                                    <p className="text-sm text-gray-400">Comparing against global registry</p>
                                </div>
                            )}

                            {/* Results */}
                            {result && (
                                <div className="animate-in slide-in-from-bottom-4 space-y-6">
                                    <div className={`p-6 rounded-xl border flex items-center gap-4 ${
                                        result.is_original 
                                        ? 'bg-green-500/10 border-green-500/30' 
                                        : 'bg-red-500/10 border-red-500/30'
                                    }`}>
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                            result.is_original ? 'bg-green-500' : 'bg-red-500'
                                        }`}>
                                            {result.is_original 
                                                ? <CheckCircle2 className="h-6 w-6 text-white" /> 
                                                : <ShieldAlert className="h-6 w-6 text-white" />
                                            }
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">
                                                {result.is_original ? "Asset is Original" : "Duplicate Detected"}
                                            </h3>
                                            <p className={`text-sm ${result.is_original ? 'text-green-200' : 'text-red-200'}`}>
                                                {result.is_original 
                                                    ? "No significant matches found in our database." 
                                                    : "This content appears to closely match existing registered assets."}
                                            </p>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <p className="text-sm text-gray-400 uppercase tracking-wider">Originality Score</p>
                                            <span className={`text-4xl font-bold ${
                                                result.is_original ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {result.score}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {result.is_original && (
                                        <div className="flex justify-end pt-4">
                                            <Button 
                                                onClick={() => window.location.href = '/dashboard/register'} // Simple navigation
                                                className="bg-brand-primary hover:bg-brand-primary/90 px-8"
                                            >
                                                Proceed to Register
                                            </Button>
                                        </div>
                                    )}
                                    
                                    {!result.is_original && (
                                        <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 flex gap-3">
                                            <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                                            <p className="text-sm text-orange-200">
                                                Note: You cannot register assets that are flagged as duplicates. 
                                                If you believe this is an error, please ensure you own the rights to this content.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {error && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
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
