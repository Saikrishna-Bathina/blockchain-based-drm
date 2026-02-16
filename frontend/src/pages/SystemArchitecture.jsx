import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Binary, Brain, Lock, Globe, FileCode, CheckCircle2, 
  Fingerprint, FileText, Database, Share2, ShieldCheck, 
  ArrowRight, Key, Layers, Box, FileAudio, Image as ImageIcon,
  Cpu, Hash, Network, Server, PenTool, Video, Type, UploadCloud,
  FileKey, Play, Eye
} from "lucide-react"
import { cn } from "../lib/utils"

// --- SHARED: SIMULATION STEPPER ---
const SimulationStep = ({ active, label, icon: Icon, color = "blue" }) => (
    <motion.div 
        animate={{ 
            opacity: active ? 1 : 0.4,
            scale: active ? 1.1 : 1,
            y: active ? -5 : 0
        }}
        className={cn(
            "flex flex-col items-center gap-2 transition-all duration-500",
            active ? `text-${color}-400` : "text-gray-600"
        )}
    >
        <div className={cn(
            "w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 flex items-center justify-center bg-brand-surface",
            active ? `border-${color}-500 shadow-[0_0_15px_rgba(var(--tw-${color}-500),0.3)]` : "border-gray-700"
        )}>
            <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        <span className="text-[8px] md:text-[10px] font-mono uppercase tracking-wider text-center">{label}</span>
    </motion.div>
)

const StepConnector = ({ progress, color = "blue" }) => (
     <div className="absolute top-4 md:top-5 left-0 right-0 h-0.5 bg-gray-800 -z-10">
        <motion.div 
            className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-300`}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
        />
    </div>
)

// --- 1. UPLOAD & PREP ENGINE ---
const UploadPrepEngine = () => {
    const [step, setStep] = useState(0)
    useEffect(() => {
        const interval = setInterval(() => setStep(p => (p + 1) % 4), 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-full h-80 bg-brand-dark/50 rounded-xl border border-brand-primary/20 relative overflow-hidden flex flex-col items-center justify-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
             <div className="flex justify-between w-full max-w-sm mb-8 relative z-10">
                <SimulationStep active={step===0} label="Select" icon={FileText} color="gray" />
                <SimulationStep active={step===1} label="KeyGen" icon={Key} color="amber" />
                <SimulationStep active={step===2} label="Encrypt" icon={Lock} color="red" />
                <SimulationStep active={step===3} label="Chunk" icon={Layers} color="blue" />
                <StepConnector progress={step * 33} color="gray" />
             </div>

             <div className="relative w-40 h-40 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div key="u0" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}>
                            <UploadCloud className="w-20 h-20 text-gray-400" />
                        </motion.div>
                    )}
                    {step === 1 && (
                         <motion.div key="u1" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="flex flex-col items-center">
                            <Key className="w-16 h-16 text-amber-500 animate-pulse" />
                            <span className="font-mono text-[10px] text-amber-400 mt-2">AES-256 GENERATED</span>
                        </motion.div>
                    )}
                    {step === 2 && (
                         <motion.div key="u2" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="relative">
                            <FileText className="w-20 h-20 text-gray-500" />
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-red-500/20 backdrop-blur-sm rounded-lg border-2 border-red-500 flex items-center justify-center"
                            >
                                <Lock className="w-10 h-10 text-red-500" />
                            </motion.div>
                        </motion.div>
                    )}
                    {step === 3 && (
                        <motion.div key="u3" className="grid grid-cols-2 gap-2">
                             {[1,2,3,4].map(i => (
                                 <motion.div 
                                    key={i}
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="w-10 h-10 bg-blue-500/20 border border-blue-500 rounded flex items-center justify-center"
                                 >
                                     <span className="text-[8px] font-mono text-blue-400">P_{i}</span>
                                 </motion.div>
                             ))}
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>
        </div>
    )
}

// --- 2. AI ORIGINALITY ENGINE (TABBED) ---
const AIEngine = () => {
    const [subTab, setSubTab] = useState('audio')
    const [step, setStep] = useState(0)

    useEffect(() => {
        setStep(0)
        const interval = setInterval(() => setStep(p => (p + 1) % 5), 2000)
        return () => clearInterval(interval)
    }, [subTab])

    const renderVisual = () => {
        if (subTab === 'audio') { // Audio: MP3 -> Wave -> Spec -> CNN -> Hash
            return (
                <div className="flex flex-col items-center">
                    <div className="flex justify-between w-full max-w-sm mb-8 relative z-10">
                        <SimulationStep active={step===0} label="MP3" icon={FileAudio} color="blue" />
                        <SimulationStep active={step===1} label="Wave" icon={ActivityVisualIcon} color="cyan" />
                        <SimulationStep active={step===2} label="Spec" icon={BarChartVisualIcon} color="purple" />
                        <SimulationStep active={step===3} label="CNN" icon={Brain} color="amber" />
                        <SimulationStep active={step===4} label="Hash" icon={Fingerprint} color="green" />
                        <StepConnector progress={step * 25} color="blue" />
                    </div>
                    {step === 2 && <div className="w-32 h-20 bg-gradient-to-br from-indigo-900 to-pink-900 animate-pulse rounded border border-white/20" />}
                    {step === 4 && <Fingerprint className="w-20 h-20 text-green-500" />}
                    {step !== 2 && step !== 4 && <div className="h-20 flex items-center justify-center text-gray-500 font-mono text-xs">PROCESSING...</div>}
                </div>
            )
        }
        if (subTab === 'image') { // Image: Img -> Grey -> Resize -> DCT -> Hash
            return (
                 <div className="flex flex-col items-center">
                    <div className="flex justify-between w-full max-w-sm mb-8 relative z-10">
                        <SimulationStep active={step===0} label="Raw" icon={ImageIcon} color="blue" />
                        <SimulationStep active={step===1} label="Grey" icon={Box} color="gray" />
                        <SimulationStep active={step===2} label="32px" icon={Box} color="purple" />
                        <SimulationStep active={step===3} label="DCT" icon={ActivityVisualIcon} color="cyan" />
                        <SimulationStep active={step===4} label="pHash" icon={Hash} color="green" />
                        <StepConnector progress={step * 25} color="purple" />
                    </div>
                    <div className="w-32 h-32 border border-white/10 rounded overflow-hidden flex items-center justify-center">
                        {step === 0 && <div className="w-full h-full bg-gradient-to-br from-blue-500 to-red-500" />}
                        {step === 1 && <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-800 grayscale" />}
                        {step === 2 && <div className="w-full h-full grid grid-cols-4 grid-rows-4">{[...Array(16)].map((_,i)=><div key={i} className="bg-gray-500/20 border border-black/50"/>)}</div>}
                        {step === 3 && <div className="flex items-end gap-1 h-20">{[...Array(8)].map((_,i)=><motion.div key={i} className="flex-1 bg-cyan-500" animate={{height:[10,40,10]}} transition={{repeat:Infinity, duration:0.5, delay:i*0.1}}/>)}</div>}
                        {step === 4 && <div className="text-green-400 font-mono font-bold">10110...</div>}
                    </div>
                </div>
            )
        }
         if (subTab === 'video') { // Video: File -> Frames -> Avg Hash -> Temporal
            return (
                 <div className="flex flex-col items-center">
                    <div className="flex justify-between w-full max-w-sm mb-8 relative z-10">
                        <SimulationStep active={step===0} label="MP4" icon={Video} color="blue" />
                        <SimulationStep active={step===1} label="Frames" icon={Layers} color="orange" />
                        <SimulationStep active={step===2} label="Select" icon={ImageIcon} color="purple" />
                        <SimulationStep active={step===3} label="Scan" icon={Eye} color="red" />
                        <SimulationStep active={step===4} label="Score" icon={CheckCircle2} color="green" />
                        <StepConnector progress={step * 25} color="orange" />
                    </div>
                    {step === 1 && (
                         <div className="flex -space-x-8">
                             {[1,2,3].map(i => <motion.div key={i} initial={{x:-20}} animate={{x:0}} className="w-16 h-24 bg-gray-800 border border-gray-600 rounded flex items-center justify-center text-xs text-gray-500">Fr_{i}</motion.div>)}
                         </div>
                    )}
                     {step === 3 && <Eye className="w-20 h-20 text-red-500 animate-pulse" />}
                     {step !== 1 && step !== 3 && <div className="h-24 flex items-center justify-center text-gray-500 font-mono text-xs">ANALYZING...</div>}
                </div>
            )
        }
        if (subTab === 'text') { // Text: String -> Tokens -> Embed -> Vector
             return (
                 <div className="flex flex-col items-center">
                    <div className="flex justify-between w-full max-w-sm mb-8 relative z-10">
                        <SimulationStep active={step===0} label="Text" icon={Type} color="blue" />
                        <SimulationStep active={step===1} label="Token" icon={Box} color="yellow" />
                        <SimulationStep active={step===2} label="Embed" icon={BarChartVisualIcon} color="purple" />
                        <SimulationStep active={step===3} label="SBERT" icon={Brain} color="amber" />
                        <SimulationStep active={step===4} label="Vector" icon={Network} color="green" />
                        <StepConnector progress={step * 25} color="green" />
                    </div>
                    {step === 1 && (
                         <div className="flex gap-1 flex-wrap w-40 justify-center">
                             {['Hello', 'World', 'AI'].map((t,i) => <span key={i} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500">{t}</span>)}
                         </div>
                    )}
                    {step === 4 && (
                         <div className="relative w-32 h-32 border-l border-b border-green-500/50">
                             <motion.div initial={{width:0, height:0}} animate={{width:'80%', height:'60%'}} className="absolute bottom-0 left-0 border-t border-r border-green-400 w-full h-full opacity-50" />
                             <div className="absolute top-[20%] right-[20%] w-2 h-2 bg-green-400 rounded-full" />
                         </div>
                    )}
                     {step !== 1 && step !== 4 && <div className="h-20 flex items-center justify-center text-gray-500 font-mono text-xs">TRANSFORMING...</div>}
                </div>
            )
        }
    }

    return (
        <div className="w-full h-[500px] bg-brand-dark/50 rounded-xl border border-brand-primary/20 relative overflow-hidden flex flex-col items-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
             {/* Tabs */}
             <div className="flex gap-2 mb-8 bg-black/20 p-1 rounded-full">
                 {['audio', 'image', 'video', 'text'].map(t => (
                     <button 
                        key={t}
                        onClick={() => setSubTab(t)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-mono uppercase transition-all",
                            subTab === t ? "bg-brand-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                     >
                         {t}
                     </button>
                 ))}
             </div>
             
             {renderVisual()}
        </div>
    )
}

// --- 3. IPFS ENGINE ---
const IPFSEngine = () => {
     const [step, setStep] = useState(0)
     useEffect(() => {
        const interval = setInterval(() => setStep(p => (p + 1) % 4), 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-full h-80 bg-brand-dark/50 rounded-xl border border-brand-primary/20 relative overflow-hidden flex flex-col items-center justify-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
             <div className="flex justify-between w-full max-w-sm mb-8 relative z-10">
                <SimulationStep active={step===0} label="In" icon={Box} color="blue" />
                <SimulationStep active={step===1} label="DAG" icon={Network} color="purple" />
                <SimulationStep active={step===2} label="CID" icon={Hash} color="amber" />
                <SimulationStep active={step===3} label="Net" icon={Globe} color="green" />
                <StepConnector progress={step * 33} color="purple" />
            </div>

            <div className="w-full h-32 flex items-center justify-center">
                 {step === 1 && (
                     <div className="flex flex-col items-center">
                         <div className="w-4 h-4 bg-purple-500 rounded-full mb-2" />
                         <div className="flex gap-8 border-t border-purple-500/50 pt-2">
                             <div className="w-3 h-3 bg-purple-500/50 rounded-full" />
                             <div className="w-3 h-3 bg-purple-500/50 rounded-full" />
                         </div>
                         <span className="text-[8px] mt-2 font-mono text-purple-400">MERKLE DAG</span>
                     </div>
                 )}
                 {step === 3 && <Globe className="w-24 h-24 text-green-500/20 animate-pulse" />}
            </div>
        </div>
    )
}

// --- 4. BLOCKCHAIN ENGINE ---
const BlockchainEngine = () => {
    const [step, setStep] = useState(0)
    useEffect(() => {
        const interval = setInterval(() => setStep(p => (p + 1) % 4), 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-full h-80 bg-brand-dark/50 rounded-xl border border-brand-primary/20 relative overflow-hidden flex flex-col items-center justify-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
             <div className="flex justify-between w-full max-w-sm mb-8 relative z-10">
                <SimulationStep active={step===0} label="Input" icon={FileCode} color="gray" />
                <SimulationStep active={step===1} label="Sign" icon={PenTool} color="blue" />
                <SimulationStep active={step===2} label="Mint" icon={Cpu} color="amber" />
                <SimulationStep active={step===3} label="NFT" icon={CheckCircle2} color="green" />
                <StepConnector progress={step * 33} color="amber" />
            </div>
            {step === 1 && <PenTool className="w-16 h-16 text-blue-500 animate-bounce" />}
            {step === 3 && (
                <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">Token #12</div>
                    <div className="text-xs text-gray-500">OWNED BY YOU</div>
                </div>
            )}
        </div>
    )
}

// --- 5. DELIVERY ENGINE ---
const DeliveryEngine = () => {
     const [step, setStep] = useState(0)
    useEffect(() => {
        const interval = setInterval(() => setStep(p => (p + 1) % 4), 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-full h-80 bg-brand-dark/50 rounded-xl border border-brand-primary/20 relative overflow-hidden flex flex-col items-center justify-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
             <div className="flex justify-between w-full max-w-sm mb-8 relative z-10">
                <SimulationStep active={step===0} label="Req" icon={Fingerprint} color="gray" />
                <SimulationStep active={step===1} label="Decrypt" icon={FileKey} color="blue" />
                <SimulationStep active={step===2} label="Mark" icon={ShieldCheck} color="purple" />
                <SimulationStep active={step===3} label="Stream" icon={Play} color="green" />
                <StepConnector progress={step * 33} color="green" />
            </div>
            {step === 2 && (
                <div className="relative w-40 h-24 bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-white font-bold">VIDEO</span>
                    <div className="absolute inset-0 bg-purple-500/20 animate-pulse flex items-end justify-end p-1">
                        <span className="text-[8px] text-purple-200">ID: User_123</span>
                    </div>
                </div>
            )}
        </div>
    )
}

// Icons
const ActivityVisualIcon = ({className}) => <div className={className}><Box className="w-full h-full" /></div>
const BarChartVisualIcon = ({className}) => <div className={className}><Box className="w-full h-full" /></div>

const SystemArchitecture = () => {
  return (
    <div className="min-h-screen bg-brand-dark text-white pt-24 pb-20 selection:bg-brand-primary/30 font-sans">
        
        <div className="container mx-auto px-4 mb-20 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-6">
                System <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Pipeline</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                The complete 5-stage lifecycle of a secure digital asset.
            </p>
        </div>

        <div className="container mx-auto px-4 max-w-5xl space-y-32 relative">
            
            {/* STAGE 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500 text-blue-400 text-xl font-bold">1</div>
                    <h2 className="text-3xl font-bold">Asset Prep & Encryption</h2>
                    <p className="text-gray-400 leading-relaxed">
                        The process starts locally. We generate a one-time <strong className="text-brand-primary">AES-256 Key</strong>.
                        Your file is encrypted immediately, then split into "chunks" for distributed storage. 
                        The original file never leaves your device unencrypted.
                    </p>
                </div>
                <div className="lg:col-span-7">
                    <UploadPrepEngine />
                </div>
            </div>

            {/* STAGE 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center lg:flex-row-reverse">
                <div className="lg:col-span-7 order-2 lg:order-1">
                    <AIEngine />
                </div>
                <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
                     <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500 text-amber-400 text-xl font-bold">2</div>
                    <h2 className="text-3xl font-bold">AI Originality Engine</h2>
                    <p className="text-gray-400 leading-relaxed">
                        Our multi-modal AI analyzes content deep below the surface.
                        <br/>- <strong>Audio:</strong> Spectrogram CNNs.
                        <br/>- <strong>Image:</strong> Perceptual Hashing (pHash).
                        <br/>- <strong>Video:</strong> Temporal Frame Analysis.
                        <br/>- <strong>Text:</strong> Semantic Transformer Embeddings (SBERT).
                    </p>
                </div>
            </div>

            {/* STAGE 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                     <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500 text-purple-400 text-xl font-bold">3</div>
                    <h2 className="text-3xl font-bold">IPFS Storage</h2>
                    <p className="text-gray-400 leading-relaxed">
                        Encrypted chunks are organized into a <strong className="text-purple-400">Merkle DAG</strong> structure.
                        This generates a unique Content Identifier (CID). The shards are then pinned to the global IPFS network, ensuring censorship resistance and redundancy.
                    </p>
                </div>
                <div className="lg:col-span-7">
                    <IPFSEngine />
                </div>
            </div>

            {/* STAGE 4 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center lg:flex-row-reverse">
                <div className="lg:col-span-7 order-2 lg:order-1">
                    <BlockchainEngine />
                </div>
                <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
                     <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500 text-green-400 text-xl font-bold">4</div>
                    <h2 className="text-3xl font-bold">Blockchain Registration</h2>
                    <p className="text-gray-400 leading-relaxed">
                        The AI result and IPFS CID are packaged into a transaction.
                        Your wallet signs it. The Smart Contract verifies the inputs and mints a 
                        <strong className="text-green-400"> Proof-of-Ownership NFT</strong>.
                        This is the immutable legal record of your asset.
                    </p>
                </div>
            </div>

             {/* STAGE 5 */}
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                     <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500 text-pink-400 text-xl font-bold">5</div>
                    <h2 className="text-3xl font-bold">Secure Delivery</h2>
                    <p className="text-gray-400 leading-relaxed">
                        When a buyer accesses the content, we decrypt it on-the-fly.
                        Crucially, we inject a <strong className="text-pink-400">Dynamic Watermark</strong> 
                        containing the viewer's identity. If they leak it, we know exactly who did it.
                    </p>
                </div>
                <div className="lg:col-span-7">
                    <DeliveryEngine />
                </div>
            </div>

        </div>
    </div>
  )
}

export default SystemArchitecture
