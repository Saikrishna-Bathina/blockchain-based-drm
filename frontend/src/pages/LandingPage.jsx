import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { 
  ArrowRight, CheckCircle2, TrendingUp, FileText, FileAudio, Box, Link as LinkIcon,
  Settings2, BarChart4, Brain, FileKey, Share2, PenTool, FileCode, AlertTriangle, 
  EyeOff, Scissors, Banknote, Cpu, Database, Globe, Zap, Lock, ShieldCheck,
  Music, Palette, Film, BookOpen
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../lib/utils"

// --- SYSTEM FLOW ANIMATION COMPONENT (Kept simplified) ---
// ... (Keeping the logic but stripping color) ...

const MicroFlow = ({ step }) => {
    const flows = {
        0: [ { icon: FileText, label: "Raw File" }, { icon: ArrowRight, label: "" }, { icon: FileKey, label: "AES-256" }, { icon: ArrowRight, label: "" }, { icon: Box, label: "Chunking" } ],
        1: [ { icon: FileAudio, label: "MP3/WAV" }, { icon: ArrowRight, label: "" }, { icon: Settings2, label: "Resampling" }, { icon: ArrowRight, label: "" }, { icon: BarChart4, label: "Spectrogram" }, { icon: ArrowRight, label: "" }, { icon: Brain, label: "CNN Model" } ],
        2: [ { icon: Box, label: "File Shards" }, { icon: ArrowRight, label: "" }, { icon: FileCode, label: "CID Hash" }, { icon: ArrowRight, label: "" }, { icon: Share2, label: "DHT Net" }, { icon: ArrowRight, label: "" }, { icon: Globe, label: "Public Gateway" } ],
        3: [ { icon: PenTool, label: "Sign Tx" }, { icon: ArrowRight, label: "" }, { icon: FileCode, label: "Smart Contract" }, { icon: ArrowRight, label: "" }, { icon: Database, label: "State Update" }, { icon: ArrowRight, label: "" }, { icon: LinkIcon, label: "TokenID" } ]
    }
    const currentFlow = flows[step] || []

    return (
        <div className="flex items-center gap-2">
            {currentFlow.map((item, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col items-center gap-1"
                >
                    <div className={cn("text-white", item.icon === ArrowRight ? "text-gray-600" : "")}>
                         <item.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", item.icon === ArrowRight ? "w-3 h-3" : "")} />
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

const SystemDeepDiveVisual = () => {
    const [activeStep, setActiveStep] = useState(0) 
    const [hoveredStep, setHoveredStep] = useState(null) 

    useEffect(() => {
        if (hoveredStep !== null) return 
        const timer = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 4)
        }, 3000)
        return () => clearInterval(timer)
    }, [hoveredStep])

    const displayStep = hoveredStep !== null ? hoveredStep : activeStep

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-black rounded-xl overflow-hidden border border-zinc-800 p-4 group">
            
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#33333312_1px,transparent_1px),linear-gradient(to_bottom,#33333312_1px,transparent_1px)] bg-[size:20px_20px]" />

            <div className="relative z-10 flex gap-4 sm:gap-8 mb-8">
                {[
                    { id: 0, icon: FileText, label: "In" },
                    { id: 1, icon: Cpu, label: "AI" },
                    { id: 2, icon: Box, label: "IPFS" },
                    { id: 3, icon: LinkIcon, label: "Chain" }
                ].map((node) => {
                    const isActive = displayStep === node.id
                    
                    return (
                        <div 
                            key={node.id}
                            className="flex flex-col items-center gap-2 cursor-pointer relative"
                            onMouseEnter={() => setHoveredStep(node.id)}
                            onMouseLeave={() => setHoveredStep(null)}
                        >
                            <div 
                                className={cn(
                                    `w-12 h-12 sm:w-14 sm:h-14 rounded-lg border flex items-center justify-center transition-all duration-300`,
                                    isActive ? "bg-white text-black border-white" : "text-gray-500 border-zinc-800 bg-zinc-900"
                                )}
                            >
                                <node.icon className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "text-[10px] font-mono uppercase tracking-wider transition-colors",
                                isActive ? "text-white" : "text-gray-600"
                            )}>
                                {node.label}
                            </span>
                        </div>
                    )
                })}
            </div>

            <div className="relative z-10 h-24 w-full flex flex-col items-center justify-center bg-zinc-900/30 rounded-lg border border-zinc-800 px-4">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={displayStep}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="w-full flex flex-col items-center"
                    >
                         <p className="text-[10px] text-gray-400 mb-2 font-mono uppercase tracking-[0.2em] w-full text-center border-b border-zinc-800 pb-1">
                            {displayStep === 0 && "Secure Ingestion"}
                            {displayStep === 1 && "Neural Assessment"}
                            {displayStep === 2 && "Decentralized Storage"}
                            {displayStep === 3 && "Smart Execution"}
                         </p>
                         <MicroFlow step={displayStep} />
                    </motion.div>
                 </AnimatePresence>
            </div>
        </div>
    )
}

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button 
        onClick={onClick}
        className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors",
            active 
                ? "bg-white text-black border border-white" 
                : "border border-transparent text-gray-500 hover:text-white hover:bg-white/5"
        )}
    >
        <Icon className="w-3.5 h-3.5" />
        {label}
    </button>
)

const InfoCard = ({ title, desc, icon: Icon }) => (
    <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 hover:border-zinc-600 transition-colors">
        <div className="w-8 h-8 rounded border border-zinc-700 bg-black flex items-center justify-center mb-3">
            <Icon className="w-4 h-4 text-white" />
        </div>
        <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
        <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
)

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('features')

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-black text-white p-4 lg:p-6 flex flex-col font-sans selection:bg-white/20">
        
        {/* --- GRID LAYOUT --- */}
        <div className="w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 grid-rows-[auto_auto_1fr] lg:grid-rows-12 gap-3 max-w-[1400px] lg:min-h-[700px] self-center">
            
            {/* 1. HERO MAIN */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-7 lg:row-span-7 bg-zinc-950 rounded-lg p-6 lg:p-10 flex flex-col justify-center border border-zinc-800 relative overflow-hidden"
            >
                <div className="mb-6">
                     <span className="px-2 py-1 rounded bg-white text-black text-[10px] font-bold uppercase tracking-wider">
                        v2.0 Beta
                     </span>
                </div>

                <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter mb-4 leading-none">
                    Secure Your <br className="hidden lg:block"/>
                    <span className="text-zinc-500">Digital Rights</span>
                </h1>
                
                <p className="text-sm lg:text-base text-gray-400 max-w-lg mb-8 leading-relaxed">
                    AI-Powered Blockchain DRM. Detect duplicates, encrypt assets, and mint proof of ownership in one seamless flow.
                </p>

                <div className="flex flex-wrap gap-3">
                    <Link to="/dashboard/upload">
                        <Button size="lg" className="h-10 px-6 rounded bg-white text-black hover:bg-gray-200 transition-colors font-medium border border-transparent">
                            Start Protecting <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                    <Link to="/marketplace">
                         <div className="h-10 px-6 flex items-center justify-center rounded border border-zinc-700 hover:bg-zinc-900 transition-colors cursor-pointer" >
                            <span className="font-medium text-sm text-gray-300">Explore Market</span>
                         </div>
                    </Link>
                </div>
            </motion.div>

            {/* 2. SYSTEM VISUAL */}
            <div className="lg:col-span-5 lg:row-span-5 bg-black rounded-lg border border-zinc-800 relative overflow-hidden flex items-center justify-center">
                 <div className="w-full h-full p-2">
                    <SystemDeepDiveVisual />
                 </div>
            </div>

            {/* 3. STATS STRIP (Simplified) */}
            <div className="lg:col-span-5 lg:row-span-2 bg-zinc-950/50 rounded-lg border border-zinc-800 flex items-center px-4 overflow-hidden">
                <div className="flex gap-8 items-center text-xs text-gray-500 font-mono">
                    <span className="text-white">AES-256</span> Encryption
                    <span className="w-px h-3 bg-zinc-800" />
                    <span className="text-white">IPFS</span> Storage
                    <span className="w-px h-3 bg-zinc-800" />
                    <span className="text-white">Polygon</span> Network
                </div>
            </div>

            {/* 4. INFO HUB */}
            <div className="lg:col-span-12 lg:row-span-5 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                <div className="lg:col-span-8 bg-zinc-950 rounded-lg border border-zinc-800 p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-2">
                            <TabButton active={activeTab === 'features'} onClick={() => setActiveTab('features')} icon={Cpu} label="Core Tech" />
                            <TabButton active={activeTab === 'workflow'} onClick={() => setActiveTab('workflow')} icon={Zap} label="How It Works" />
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-[10px] text-green-500 font-mono">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                            </span>
                            System Operational
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {activeTab === 'features' ? (
                            <>
                                <InfoCard title="Semantic AI" desc="Scans for deep fakes." icon={Cpu} />
                                <InfoCard title="Smart License" desc="Auto-royalty payments." icon={Database} />
                                <InfoCard title="IPFS Storage" desc="Decentralized hosting." icon={Globe} />
                                <InfoCard title="Watermarking" desc="Invisible tracing." icon={Lock} />
                            </>
                        ) : (
                            <>
                                <InfoCard title="1. Upload" desc="Private Encryption." icon={ArrowRight} />
                                <InfoCard title="2. Verify" desc="AI Checking." icon={ShieldCheck} />
                                <InfoCard title="3. Mint" desc="NFT Ownership." icon={LinkIcon} />
                                <InfoCard title="4. Earn" desc="Secure Licensing." icon={TrendingUp} />
                            </>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 bg-zinc-950 rounded-lg border border-zinc-800 p-6 flex flex-col justify-between group">
                     <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                <span className="text-[10px] font-mono text-white uppercase tracking-widest">Community</span>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Creator Economy</h3>
                        <p className="text-gray-400 text-xs">Join 2,500+ artists protecting their work.</p>
                     </div>

                     <div className="mt-6">
                        <Link to="/signup" className="block">
                            <Button className="w-full h-9 text-sm bg-white text-black hover:bg-gray-200 border-none">
                                 Join Network
                            </Button>
                        </Link>
                     </div>
                </div>
            </div>
        </div>
        
        {/* 5. PROBLEM SECTION (Simplified) */}
        <div className="py-24 text-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-6">
                The Crisis
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">
                The Industry is <span className="text-zinc-500">Bleeding Out.</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-10">
                Real-world data exposes the catastrophic revenue loss facing creators.
            </p>
             <Link to="/signup">
                <button className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors">
                    Start Protecting Now
                </button>
            </Link>
        </div>
    </div>
  )
}

export default LandingPage
