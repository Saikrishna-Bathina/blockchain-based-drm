import { useState } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff, Wallet } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"

import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || "Login failed")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-3xl -z-10"></div>

      <Card className="w-full max-w-md border-brand-surface bg-brand-dark/50 backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">Secure Access</CardTitle>
          <p className="text-center text-sm text-gray-400">
            Enter your credentials to access your DRM dashboard
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300">
                Email Address
              </label>
              <Input 
                id="email" 
                placeholder="Enter your email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
               <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300">
                Password
              </label>
              <div className="relative">
                <Input 
                    id="password" 
                    placeholder="Enter your password" 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="sr-only">Toggle password visibility</span>
                </Button>
              </div>
            </div>

            {/* Wallet input removed as it is usually done after login or via connect button */}

            <Button className="w-full" type="submit">
              Log In
            </Button>
          </form>
          
          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" class="text-brand-primary hover:underline">
                Forgot Password?
            </Link>
            <div className="text-gray-400">
                Don't have an account?{" "}
                <Link to="/signup" className="text-white hover:underline font-medium">
                    Sign Up
                </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
