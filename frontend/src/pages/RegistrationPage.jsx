import { Link } from "react-router-dom"
import { Check, Copy, ExternalLink, ArrowRight } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import { cn } from "../lib/utils"

const Step = ({ title, description, status, isLast }) => {
  // status: pending, current, completed
  return (
      <div className="relative flex flex-col items-center flex-1">
         <div className={cn(
             "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors duration-500",
             status === "completed" ? "bg-brand-primary text-white" : 
             status === "current" ? "bg-brand-primary/50 text-white animate-pulse" : "bg-brand-surface text-gray-500"
         )}>
            {status === "completed" ? <Check className="h-5 w-5" /> : ""}
         </div>
         <div className="mt-2 text-center">
             <h4 className={cn("text-sm font-semibold", status === "pending" ? "text-gray-500" : "text-white")}>{title}</h4>
             <p className="text-xs text-gray-500 max-w-[120px] mx-auto mt-1">{description}</p>
         </div>
         
         {!isLast && (
             <div className="absolute top-4 left-1/2 w-full h-[2px] bg-brand-surface -z-0">
                 <div className={cn("h-full bg-brand-primary transition-all duration-1000", status === "completed" ? "w-full" : "w-0")}></div>
             </div>
         )}
      </div>
  )
}

const RegistrationPage = () => {
    // Static data for demo
    const transaction = {
        id: "0x1a2b3c4d5e6f7g8h9i0j1a2b3c4d5e6f7g8h9i0j",
        owner: "0x9876543210fedcba9876543210fedcba98765432",
        timestamp: "2023-10-27 10:30:00 UTC",
        ipfsCid: "QmXoW8s...aBcDeFgHiJkLmNoPqRsTuVwXyZ"
    }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in">
      <div>
         <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Asset Registration on Polygon</h2>
         <p className="text-gray-400">Live transaction details for your digital asset.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Asset Preview */}
         <div className="lg:col-span-1">
             <div className="aspect-square rounded-2xl overflow-hidden border border-brand-surface bg-brand-surface/20 flex items-center justify-center p-4">
                 <img 
                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop" 
                    alt="Asset Preview" 
                    className="w-full h-full object-cover rounded-xl shadow-[0_0_50px_rgba(37,99,235,0.2)]"
                />
             </div>
         </div>

         {/* Transaction Details */}
         <div className="lg:col-span-2">
            <Card className="bg-brand-surface/10 border-brand-surface h-full">
                <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-brand-surface pb-6">
                        <h3 className="text-xl font-semibold text-white">Registration Details</h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></div>
                            Confirmed
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <span className="text-gray-400 text-sm">Asset ID</span>
                            <div className="sm:col-span-2 flex items-center justify-between bg-brand-dark/50 p-3 rounded-lg border border-brand-surface">
                                <span className="font-mono text-sm text-gray-300 truncate mr-2">{transaction.id}</span>
                                <Copy className="h-4 w-4 text-gray-500 cursor-pointer hover:text-white" />
                            </div>
                        </div>

                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <span className="text-gray-400 text-sm">Owner Wallet</span>
                            <div className="sm:col-span-2 flex items-center justify-between bg-brand-dark/50 p-3 rounded-lg border border-brand-surface">
                                <span className="font-mono text-sm text-gray-300 truncate mr-2">{transaction.owner}</span>
                                <Copy className="h-4 w-4 text-gray-500 cursor-pointer hover:text-white" />
                            </div>
                        </div>

                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <span className="text-gray-400 text-sm">Timestamp</span>
                            <div className="sm:col-span-2 p-3 text-sm text-gray-300 border-b border-brand-surface/20">
                                {transaction.timestamp}
                            </div>
                        </div>

                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <span className="text-gray-400 text-sm">IPFS CID</span>
                            <div className="sm:col-span-2 flex items-center justify-between p-3 text-sm text-gray-300 border-b border-brand-surface/20">
                                <span className="font-mono truncate mr-2">{transaction.ipfsCid}</span>
                                <Copy className="h-4 w-4 text-gray-500 cursor-pointer hover:text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button className="w-full h-12 bg-brand-primary hover:bg-brand-primary/90 text-base">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View on Polygon Explorer
                        </Button>
                    </div>
                </CardContent>
            </Card>
         </div>
      </div>

      <div>
         <h3 className="text-xl font-semibold text-white mb-8">Transaction Progress</h3>
         <div className="flex justify-between max-w-4xl mx-auto">
             <Step 
                title="Initiated" 
                description="Transaction created" 
                status="completed" 
            />
             <Step 
                title="Broadcasting" 
                description="Sent to network" 
                status="completed" 
            />
             <Step 
                title="Confirmed" 
                description="Included in block" 
                status="completed" 
                isLast={true}
            />
         </div>
         <div className="flex justify-center mt-12">
            <Link to="/dashboard/assets/1">
                <Button variant="outline" className="gap-2">
                    View Asset Protected Stream <ArrowRight className="h-4 w-4" />
                </Button>
            </Link>
         </div>
      </div>
    </div>
  )
}

export default RegistrationPage
