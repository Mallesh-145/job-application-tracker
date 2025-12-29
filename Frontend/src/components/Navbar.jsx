import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🚀</span>
          <span className="font-bold text-white tracking-tight">Job Tracker</span>
        </Link>

        <div className="flex items-center gap-6">
          {isAdmin && (
            <Link 
              to="/admin" 
              className="text-indigo-400 hover:text-indigo-300 text-sm font-bold border border-indigo-400/30 px-3 py-1.5 rounded-xl bg-indigo-400/5 transition-all"
            >
              🛡️ Admin Panel
            </Link>
          )}

          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm hidden md:block">
              Welcome, <span className="text-white font-medium">{user?.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              Log Out 
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;