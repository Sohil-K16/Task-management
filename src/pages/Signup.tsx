import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { blink } from '../lib/blink'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { toast } from 'sonner'
import { Layout } from 'lucide-react'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await blink.auth.signUp({ 
        email, 
        password,
        displayName 
      })
      toast.success('Account created successfully!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md border-zinc-200 shadow-xl dark:border-zinc-800">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-zinc-900 p-3 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Layout size={24} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>
            Join TaskFlow Manager to start organizing your work
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="border-zinc-200 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-zinc-200 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-zinc-200 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-100"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
            <div className="text-center text-sm text-zinc-500">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-zinc-900 hover:underline dark:text-zinc-100">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
