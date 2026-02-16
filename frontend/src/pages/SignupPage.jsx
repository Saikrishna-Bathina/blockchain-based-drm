import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { 
  Eye, EyeOff, ShieldCheck, Zap, Globe, CheckCircle2, 
  ArrowRight, Lock, Sparkles 
} from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/Button"
import { cn } from "../lib/utils"

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return
    }
    
    setIsLoading(true)
    setError("")

    try {
      await register({ 
        username: formData.username, 
        email: formData.email, 
        password: formData.password 
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.")
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-brand-dark flex font-sans selection:bg-brand-primary/30">
      
      {/* LEFT COLUMN: Visuals (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-brand-dark items-center justify-center p-12">
        {/* Realistic Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670&auto=format&fit=crop" 
                alt="Studio Background" 
                className="w-full h-full object-cover opacity-40 grayscale-[20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-brand-primary/20 mix-blend-multiply" />
        </div>

        <div className="relative z-20 max-w-lg w-full">
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col h-full justify-between min-h-[600px]"
             >
                 <div>
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/20 backdrop-blur-md">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-[1.1]">
                        Join the <span className="text-brand-primary">Resistance</span> against Piracy.
                    </h1>
                    
                    <p className="text-gray-300 text-lg mb-8 leading-relaxed font-medium">
                        "Finally, a platform that treats my stems and drafts like actual assets. 
                        If you create for a living, you need this."
                    </p>
                 </div>

                 {/* Real Testimonial Card */}
                 <div className="bg-brand-surface/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl mt-auto relative">
                     <div className="absolute -top-4 -right-4 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                         VERIFIED ARTIST
                     </div>
                     <div className="flex items-center gap-4">
                         <img 
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces" 
                            alt="User" 
                            className="w-12 h-12 rounded-full border-2 border-white/20"
                         />
                         <div>
                             <p className="text-white font-bold">Marcus K.</p>
                             <p className="text-gray-400 text-sm">Producer, 2 Platinum Records</p>
                         </div>
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
                  <h2 className="text-3xl font-bold text-white tracking-tight">Claim your handle</h2>
                  <p className="mt-2 text-sm text-gray-400">
                    Already a member?{' '}
                    <Link to="/login" className="font-medium text-brand-primary hover:text-brand-accent transition-colors">
                      Log in here
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
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Artist Name / Username</label>
                          <input
                            id="username"
                            type="text"
                            required
                            className="w-full bg-brand-surface border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                            placeholder="e.g. TheWeekend_Official"
                            value={formData.username}
                            onChange={handleChange}
                          />
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Work Email</label>
                          <input
                            id="email"
                            type="email"
                            required
                            className="w-full bg-brand-surface border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                            placeholder="you@studio.com"
                            value={formData.email}
                            onChange={handleChange}
                          />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                              <div className="relative">
                                  <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-brand-surface border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all pr-10"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
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

                          <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm</label>
                               <div className="relative">
                                  <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-brand-surface border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all pr-10"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                  >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                  </button>
                              </div>
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
                            "Setting up..."
                        ) : (
                            <>
                                Start Creating <ArrowRight size={16} />
                            </>
                        )}
                      </div>
                  </button>

                  <p className="text-center text-xs text-gray-500">
                      Join 10,000+ creators protecting their work today.
                  </p>
              </motion.form>
          </div>
      </div>
    </div>
  )
}

export default SignupPage

