import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { 
  ShieldCheck, 
  FileCheck, 
  Database, 
  Cpu, 
  Lock,
  Globe
} from "lucide-react"

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="rounded-xl border border-brand-surface bg-brand-surface/50 p-6 transition-all hover:-translate-y-1 hover:border-brand-primary/50">
    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/20 text-brand-primary">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
    <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
  </div>
)

const StepItem = ({ number, title, description }) => (
  <div className="relative flex gap-6 pb-12 last:pb-0">
    <div className="flex flex-col items-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-primary bg-brand-primary/10 text-brand-primary font-bold">
        {number}
      </div>
      <div className="h-full w-px bg-brand-surface my-2"></div>
    </div>
    <div className="pt-2">
      <h3 className="mb-1 text-lg font-semibold text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  </div>
)

const LandingPage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-primary/20 via-brand-dark to-brand-dark"></div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
            Protect Your Digital Assets with <span className="text-brand-primary">AI</span> & <span className="text-brand-secondary">Blockchain</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400 mb-10">
            Secure your creative work and intellectual property with our cutting-edge digital rights management system. Immutable ownership, powered by Ethereum.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link to="/dashboard/upload">
                <Button size="lg" className="h-12 px-8 text-base">Upload Asset</Button>
             </Link>
             <Link to="/dashboard/verify">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">Verify Originality</Button>
             </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-brand-dark/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
             <p className="text-gray-400 max-w-xl mx-auto">Seamlessly protect your assets in four simple steps.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             <div className="space-y-4">
                <StepItem 
                    number="1" 
                    title="Upload & Analyze" 
                    description="Upload your digital assets. Our AI analyzes them to create a unique digital fingerprint." 
                />
                <StepItem 
                    number="2" 
                    title="Create Digital Fingerprint" 
                    description="A hash is generated representing your unique asset content." 
                />
                <StepItem 
                    number="3" 
                    title="Register on Blockchain" 
                    description="The fingerprint is immutably stored on the Ethereum blockchain." 
                />
                <StepItem 
                    number="4" 
                    title="Monitor & Enforce" 
                    description="Track usage and verify authenticity anywhere in the world." 
                />
             </div>
             {/* Abstract Visual Placeholder */}
             <div className="relative h-[400px] w-full rounded-2xl bg-gradient-to-br from-brand-surface to-brand-dark border border-brand-surface flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/5 bg-[size:30px_30px]"></div>
                <ShieldCheck className="w-32 h-32 text-brand-primary opacity-50 animate-pulse" />
             </div>
          </div>
        </div>
      </section>

      {/* Key Technologies */}
      <section className="py-24">
         <div className="container mx-auto px-4">
             <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-white mb-4">Key Technologies</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard 
                    icon={Cpu} 
                    title="Artificial Intelligence" 
                    description="Our AI analyzes digital assets to detect unique characteristics and potential infringements." 
                />
                 <FeatureCard 
                    icon={Database} 
                    title="Blockchain" 
                    description="We create an immutable, time-stamped record of ownership on a decentralized ledger." 
                />
                 <FeatureCard 
                    icon={Globe} 
                    title="IPFS" 
                    description="Assets are stored securely on the InterPlanetary File System for decentralized access." 
                />
                 <FeatureCard 
                    icon={FileCheck} 
                    title="Digital Watermarking" 
                    description="Invisible watermarks are embedded in assets to trace their origin." 
                />
             </div>
         </div>
      </section>

      {/* Benefits */}
       <section className="py-24 bg-brand-surface/10">
         <div className="container mx-auto px-4">
             <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-white mb-4">Benefits</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                         <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/20 text-brand-primary">
                             <ShieldCheck className="h-5 w-5" />
                         </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Immutable Proof of Ownership</h3>
                        <p className="text-gray-400">Blockchain provides an unchangeable record of who owns the digital asset and when it was created.</p>
                    </div>
                </div>
                 <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                         <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/20 text-brand-primary">
                             <Lock className="h-5 w-5" />
                         </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Automated Rights Enforcement</h3>
                        <p className="text-gray-400">Smart contracts automatically enforce licensing agreements, ensuring you get paid.</p>
                    </div>
                </div>
                 <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                         <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/20 text-brand-primary">
                             <Globe className="h-5 w-5" />
                         </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Global Accessibility</h3>
                        <p className="text-gray-400">Register and verify your digital assets from anywhere in the world, at any time.</p>
                    </div>
                </div>
                 <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                         <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/20 text-brand-primary">
                             <ShieldCheck className="h-5 w-5" />
                         </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Enhanced Security</h3>
                        <p className="text-gray-400">Cryptographic security and decentralization protect your assets from tampering and fraud.</p>
                    </div>
                </div>
             </div>
         </div>
      </section>
    </>
  )
}

export default LandingPage
