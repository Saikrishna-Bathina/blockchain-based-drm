import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, ShieldCheck, ArrowRight, Lock } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.")
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-brand-dark flex font-sans selection:bg-brand-primary/30">
      
      {/* LEFT COLUMN: Visuals */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-brand-dark items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670&auto=format&fit=crop" 
                alt="Studio Background" 
                className="w-full h-full object-cover opacity-30 grayscale-[40%] scale-x-[-1]" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark/60 to-brand-primary/10 mix-blend-multiply" />
        </div>

        <div className="relative z-20 max-w-lg w-full flex flex-col h-full justify-between min-h-[600px]">
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
             >
                 <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/20 backdrop-blur-md">
                    <Lock className="w-8 h-8 text-white" />
                 </div>
                 
                 <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-[1.1]">
                    Welcome back to the <br /> 
                    <span className="text-brand-primary">Sanctuary.</span>
                 </h1>
                 
                 <p className="text-gray-300 text-lg mb-8 leading-relaxed font-medium">
                    "I used to worry about leaks every time I sent a demo. 
                    Now I just drag, drop, and sleep soundly."
                 </p>
             </motion.div>

             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="bg-brand-surface/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl relative"
             >
                 <div className="absolute -top-4 -right-4 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                     VERIFIED USER
                 </div>
                 <div className="flex items-center gap-4">
                     <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces" 
                        alt="User" 
                        className="w-12 h-12 rounded-full border-2 border-white/20"
                     />
                     <div>
                         <p className="text-white font-bold">Sarah J.</p>
                         <p className="text-gray-400 text-sm">Visual Artist, 5M+ Impressions</p>
                     </div>
                 </div>
             </motion.div>
        </div>
      </div>

      {/* RIGHT COLUMN: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 relative bg-brand-dark">
          <Link to="/" className="absolute top-8 right-8 text-sm text-gray-500 hover:text-white transition-colors">
              Back to Home
          </Link>

          <div className="w-full max-w-md space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center lg:text-left"
              >
                  <h2 className="text-3xl font-bold text-white tracking-tight">Access Dashboard</h2>
                  <p className="mt-2 text-sm text-gray-400">
                    New here?{' '}
                    <Link to="/signup" className="font-medium text-brand-primary hover:text-brand-accent transition-colors">
                      Create an artist account
                    </Link>
                  </p>
              </motion.div>

              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-6" 
                onSubmit={handleSubmit}
              >
                  {error && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                          {error}
                      </div>
                  )}

                  <div className="space-y-5">
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                          <input
                            id="email"
                            type="email"
                            required
                            className="w-full bg-brand-surface border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                            placeholder="you@studio.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                      </div>

                      <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                            <Link to="/forgot-password" class="text-xs text-brand-primary hover:text-brand-accent transition-colors">
                                Forgot?
                            </Link>
                          </div>
                          <div className="relative">
                              <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full bg-brand-surface border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all pr-10"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                          </div>
                      </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-white text-brand-dark px-4 py-4 text-sm font-black uppercase tracking-wide hover:bg-gray-200 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <div className="flex items-center justify-center gap-2">
                        {isLoading ? (
                            "Authenticating..."
                        ) : (
                            <>
                                Return to Studio <ArrowRight size={16} />
                            </>
                        )}
                      </div>
                  </button>
              </motion.form>
          </div>
      </div>
    </div>
  )
}

export default LoginPage
