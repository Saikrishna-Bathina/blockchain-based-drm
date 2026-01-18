import { useState } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff, FolderLock } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"

import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
    }
    try {
      await register(username, email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
         {/* Background Gradients */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-brand-secondary/10 rounded-full blur-2xl -z-10"></div>

      <Card className="w-full max-w-md border-brand-surface bg-brand-dark/50 backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
               <div className="p-3 bg-brand-primary/10 rounded-full">
                <FolderLock className="w-8 h-8 text-brand-primary" />
               </div>
          </div>
          <CardTitle className="text-center text-2xl font-bold">Create Your Secure Account</CardTitle>
          <p className="text-center text-sm text-gray-400">
            Join to manage your digital rights on the blockchain.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
             {error && <p className="text-red-500 text-sm text-center">{error}</p>}
             <div className="space-y-2">
              <label htmlFor="fullname" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300">
                Full Name / Username
              </label>
              <Input 
                id="fullname" 
                placeholder="Enter your username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300">
                Email Address
              </label>
              <Input 
                id="email" 
                placeholder="Enter your email address" 
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

             <div className="space-y-2">
               <label htmlFor="confirmPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <Input 
                    id="confirmPassword" 
                    placeholder="Confirm your password" 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                 <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="sr-only">Toggle password visibility</span>
                </Button>
              </div>
            </div>

             {/* Removed wallet input, can do later */}

            <Button className="w-full bg-brand-primary hover:bg-brand-primary/90 mt-2" type="submit">
              Create Account
            </Button>
          </form>
          
          <div className="text-center text-sm text-gray-400">
             Already have an account?{" "}
            <Link to="/login" className="text-brand-primary hover:underline font-medium">
                Log In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignupPage
