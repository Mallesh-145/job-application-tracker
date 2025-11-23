import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('https://job-application-tracker-3n97.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Account created! Please log in.")
        navigate('/login')
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-indigo-950">
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-900 via-indigo-900 to-slate-900 opacity-90"></div>
        <div className="relative z-10 p-12 text-white text-center">
          <h1 className="text-5xl font-extrabold mb-6">Start Your Journey</h1>
          <p className="text-xl text-indigo-200">"The best way to predict the future is to create it."</p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8 bg-white/5 backdrop-blur-lg p-10 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="mt-2 text-sm text-indigo-300">Join us and organize your career.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-indigo-200 block mb-1">Username</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="johndoe" />
            </div>
            <div>
              <label className="text-sm font-medium text-indigo-200 block mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="john@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-indigo-200 block mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
            </div>

            {error && <div className="text-rose-400 text-sm text-center">{error}</div>}

            <button type="submit" disabled={isLoading} className="w-full py-3 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-[1.02] transition-transform shadow-lg shadow-indigo-500/30">
              {isLoading ? 'Creating...' : 'Sign Up'}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-400 hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup