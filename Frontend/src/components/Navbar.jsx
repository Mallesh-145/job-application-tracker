import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-lg bg-slate-900/80 border-b border-white/10 shadow-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left Side: Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🚀</span>
            <span className="text-xl font-extrabold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
              Job Tracker
            </span>
          </Link>

          {/* Right Side: Logout Button */}
          <div className="flex space-x-4">
            {token && (
              <button 
                onClick={handleLogout}
                className="text-indigo-200 hover:text-white font-medium transition-colors text-sm flex items-center gap-2"
              >
                <span>Log Out</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;