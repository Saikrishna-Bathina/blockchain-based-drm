import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { CheckCircle2, Copy } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"

const VerificationPage = () => {
  const [analyzing, setAnalyzing] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (analyzing) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setAnalyzing(false)
            return 100
          }
          return prev + 1
        })
      }, 30) // Simulate 3 seconds analysis
      return () => clearInterval(interval)
    }
  }, [analyzing])

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-in fade-in">
      
      {/* Analysis Circle */}
      <div className="relative flex items-center justify-center w-64 h-64">
         {/* Background Circle */}
         <div className="absolute inset-0 rounded-full border-4 border-brand-surface opacity-30"></div>
         
         {/* Spinner/Progress */}
         {analyzing && (
            <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
         )}
         
         {!analyzing && (
             <div className="absolute inset-0 rounded-full border-4 border-brand-primary opacity-50 animate-pulse"></div>
         )}

         <div className="z-10 text-center">
            {analyzing ? (
                <>
                    <h2 className="text-2xl font-bold text-white mb-2">AI analyzing your asset...</h2>
                    <span className="text-brand-primary font-mono text-xl">{progress}%</span>
                </>
            ) : (
                <divWrapper />
            )}
         </div>
      </div>

      {!analyzing && (
        <div className="w-full max-w-2xl space-y-6 animate-in slide-in-from-bottom-8 duration-700">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-brand-surface/30 border-brand-surface">
                   <CardContent className="p-6">
                      <p className="text-sm text-gray-400 mb-1">Asset Fingerprint</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-mono text-white font-semibold">0x7A2c...fE3d</span>
                        <Copy className="h-4 w-4 text-gray-500 cursor-pointer hover:text-white" />
                      </div>
                   </CardContent>
                </Card>
                <Card className="bg-brand-surface/30 border-brand-surface">
                   <CardContent className="p-6">
                      <p className="text-sm text-gray-400 mb-1">Similarity Score</p>
                      <span className="text-3xl font-bold text-white">0.2%</span>
                   </CardContent>
                </Card>
             </div>

             <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                    <span>Comparison Bar</span>
                </div>
                <div className="h-2 w-full bg-brand-surface rounded-full overflow-hidden">
                    <div className="h-full bg-brand-primary w-[0.2%]"></div>
                </div>
             </div>

             <div className="p-6 rounded-xl border border-green-500/30 bg-green-500/10 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-brand-dark">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Asset is Original</h3>
                    <p className="text-sm text-gray-300">Congratulations! No significant matches were found in our extensive database. This asset appears to be unique.</p>
                </div>
             </div>

             <div className="flex justify-center pt-4">
                <Link to="/dashboard/register">
                    <Button size="lg" className="h-12 px-8 text-base bg-brand-primary hover:bg-brand-primary/90 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                        Register on Blockchain
                    </Button>
                </Link>
             </div>
        </div>
      )}
    </div>
  )
}
// Helper to keep the conditional rendering clean
const divWrapper = () => <></> 

export default VerificationPage
