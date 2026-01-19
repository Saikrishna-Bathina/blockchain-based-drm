import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { 
  ShieldCheck, 
  FileCheck, 
  Database, 
  Cpu, 
  Lock,
  Globe,
  Zap,
  Layers
} from "lucide-react"
import { motion } from "framer-motion"

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.3)" }}
    className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-brand-primary/50"
  >
    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-primary group-hover:scale-110 transition-transform duration-300">
      <Icon className="h-7 w-7" />
    </div>
    <h3 className="mb-3 text-xl font-bold text-white group-hover:text-brand-primary transition-colors">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
    
    {/* Hover Glow Effect */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
  </motion.div>
)

const StepItem = ({ number, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="flex gap-6 relative"
  >
    <div className="flex flex-col items-center">
      <motion.div 
         initial={{ scale: 0 }}
         whileInView={{ scale: 1 }}
         transition={{ type: "spring", stiffness: 200, delay: delay + 0.2 }}
         className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-primary bg-brand-dark text-brand-primary font-bold z-10 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
      >
        {number}
      </motion.div>
      <div className="h-full w-0.5 bg-gradient-to-b from-brand-primary/50 to-transparent my-2 absolute top-12 bottom-0 left-[23px]"></div>
    </div>
    <div className="pb-12 pt-2">
      <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
      <p className="text-gray-400 text-lg">{description}</p>
    </div>
  </motion.div>
)

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-brand-dark overflow-hidden relative selection:bg-brand-primary/30">
      
      {/* Background Animated Blobs */}
      <motion.div 
        animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 0],
            opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-primary rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen"
      />
      <motion.div 
        animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 100, 0],
            opacity: [0.05, 0.15, 0.05]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-secondary rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen"
      />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-24 lg:pt-48 lg:pb-32">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
             <span className="inline-block py-1 px-3 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-sm font-semibold mb-6 animate-pulse">
                Next-Gen DRM Protection
             </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-400 sm:text-7xl mb-8 leading-tight"
          >
            Protect Your Digital Assets with <br className="hidden sm:block" />
            <span className="text-brand-primary drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">AI</span> & <span className="text-brand-secondary drop-shadow-[0_0_30px_rgba(147,51,234,0.3)]">Blockchain</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-xl text-gray-400 mb-12 leading-relaxed"
          >
            Secure, Traceable, and Decentralized. The ultimate rights management system for creators, reducing piracy and ensuring immutable ownership.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
             <Link to="/dashboard/upload">
                <Button size="xl" className="h-14 px-10 text-lg rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] transition-all transform hover:scale-105">
                   Get Started Free
                </Button>
             </Link>
             <Link to="/marketplace">
                <Button size="xl" variant="outline" className="h-14 px-10 text-lg rounded-full border-white/20 hover:bg-white/10 text-white backdrop-blur-sm">
                   Explore Marketplace
                </Button>
             </Link>
          </motion.div>
        </div>
        
        {/* Floating Shield Animation */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-20 relative px-4"
        >
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-primary/20 rounded-full blur-[60px] animate-pulse"></div>
             <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 flex justify-center"
             >
                 <ShieldCheck className="w-48 h-48 text-white drop-shadow-[0_0_50px_rgba(59,130,246,0.8)]" />
                 {/* Floating Orbitals */}
                 <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -ml-[120px] -mt-[120px] w-[240px] h-[240px] border border-brand-primary/30 rounded-full border-dashed"
                 />
                 <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -ml-[160px] -mt-[160px] w-[320px] h-[320px] border border-brand-secondary/20 rounded-full border-dotted"
                 />
             </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-white/5 backdrop-blur-sm py-12 relative z-10">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { label: "Assets Protected", value: "10,000+" },
                { label: "Blockchain Txns", value: "50k+" },
                { label: "Creators", value: "2,500+" },
                { label: "Piracy Prevented", value: "99.9%" }
              ].map((stat, i) => (
                  <div key={i}>
                      <div className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-brand-primary uppercase text-sm font-semibold tracking-wider">{stat.label}</div>
                  </div>
              ))}
          </div>
      </section>

      {/* Key Technologies */}
      <section className="py-32 relative z-10">
         <div className="container mx-auto px-4">
             <div className="text-center mb-20">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl lg:text-5xl font-bold text-white mb-6"
                >
                    Key <span className="text-brand-primary">Technologies</span>
                </motion.h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    We combine the best of Web3 and Artificial Intelligence to build the ultimate fortress for your content.
                </p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard 
                    icon={Cpu} 
                    title="AI Analysis" 
                    description="Advanced algorithms scan content for unique fingerprints and detect unauthorized modifications instantly." 
                    delay={0.1}
                />
                 <FeatureCard 
                    icon={Database} 
                    title="Blockchain Ledger" 
                    description="Ethereum smart contracts provide indisputable, immutable proof of ownership and transaction history." 
                    delay={0.2}
                />
                 <FeatureCard 
                    icon={Globe} 
                    title="Decentralized IPFS" 
                    description="Assets are distributed across a global network, ensuring 100% uptime and censorship resistance." 
                    delay={0.3}
                />
                 <FeatureCard 
                    icon={Zap} 
                    title="Smart Licensing" 
                    description="Automate royalty payments and usage rights with self-executing smart contracts." 
                    delay={0.4}
                />
             </div>
         </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-black/30 relative z-10">
        <div className="absolute inset-0 bg-grid-white/5 mask-image-gradient"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div>
                <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl font-bold text-white mb-6"
                >
                    How It <span className="text-brand-secondary">Works</span>
                </motion.h2>
                <p className="text-gray-400 text-lg mb-12">
                    A seamless workflow designed for ease of use without compromising security.
                </p>

                <div className="space-y-2">
                   <StepItem 
                       number="1" 
                       title="Upload Asset" 
                       description="Upload any digital file. Our system immediately encrypts it." 
                       delay={0.1}
                   />
                   <StepItem 
                       number="2" 
                       title="AI Fingerprinting" 
                       description="We generate a unique hash to prevent duplicate registrations." 
                       delay={0.2}
                   />
                   <StepItem 
                       number="3" 
                       title="Mint NFT License" 
                       description="Ownership is tokenized on the blockchain as an NFT." 
                       delay={0.3}
                   />
                   <StepItem 
                       number="4" 
                       title="Secure Streaming" 
                       description="Authorized users can stream content with dynamic watermarking." 
                       delay={0.4}
                   />
                </div>
             </div>
             
             {/* Visual Side */}
             <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative h-[600px] rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md flex items-center justify-center group"
             >
                 {/* Internal glowing orb */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-brand-secondary/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                 
                 <div className="relative z-10 grid grid-cols-2 gap-8 p-8">
                     <motion.div 
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                        className="bg-black/50 p-6 rounded-2xl border border-brand-primary/30 backdrop-blur-xl"
                     >
                         <Lock className="w-12 h-12 text-brand-primary mb-4" />
                         <div className="h-2 w-20 bg-gray-700 rounded mb-2"></div>
                         <div className="h-2 w-12 bg-gray-700 rounded"></div>
                     </motion.div>
                     <motion.div 
                        animate={{ y: [0, 15, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="bg-black/50 p-6 rounded-2xl border border-brand-secondary/30 backdrop-blur-xl mt-12"
                     >
                         <Layers className="w-12 h-12 text-brand-secondary mb-4" />
                         <div className="h-2 w-20 bg-gray-700 rounded mb-2"></div>
                         <div className="h-2 w-12 bg-gray-700 rounded"></div>
                     </motion.div>
                 </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="container mx-auto px-4 max-w-4xl bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-3xl p-12 border border-white/10 backdrop-blur-lg"
          >
              <h2 className="text-4xl font-bold text-white mb-6">Ready to Secure Your Future?</h2>
              <p className="text-xl text-gray-300 mb-10">Join thousands of creators who trust us with their digital legacy.</p>
              <Link to="/signup">
                  <Button size="xl" className="h-16 px-12 text-xl rounded-full bg-white text-brand-dark hover:bg-gray-100 shadow-xl shadow-white/10 hover:shadow-white/20">
                      Start Protecting Now
                  </Button>
              </Link>
          </motion.div>
      </section>

    </div>
  )
}

export default LandingPage
