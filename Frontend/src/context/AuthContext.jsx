import { createContext, useState, useEffect, useContext } from 'react'
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('site_token'))
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('site_isAdmin') === 'true')

  useEffect(() => {
    if (token) {
      setUser({ name: localStorage.getItem('site_username') });
      setIsAdmin(localStorage.getItem('site_isAdmin') === 'true');
    }
  }, [token])

  const login = (newToken, username, adminStatus) => {
    console.log("DEBUG: AuthContext received adminStatus:", adminStatus);
    setToken(newToken)
    setUser({ name: username })
    setIsAdmin(adminStatus)
    localStorage.setItem('site_token', newToken)
    localStorage.setItem('site_username', username)
    localStorage.setItem('site_isAdmin', adminStatus) 
  }

  const logout = async () => {
    try {
      if (token) {
        await fetch('https://job-application-tracker-3n97.onrender.com', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error("Logout logging failed, but proceeding with local logout", error);
    } finally {
      setToken(null);
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('site_token');
      localStorage.removeItem('site_username');
      localStorage.removeItem('site_isAdmin'); 
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)