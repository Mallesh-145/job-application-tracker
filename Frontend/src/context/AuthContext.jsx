import { createContext, useState, useEffect, useContext } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('site_token'))

  useEffect(() => {
    // Check if we have a token saved on load
    if (token) {
      // In a real app, we might call an endpoint to validate the token here
      // For now, we just assume if the token exists, they are logged in
      setUser({ name: localStorage.getItem('site_username') }) 
    }
  }, [token])

  const login = (newToken, username) => {
    setToken(newToken)
    setUser({ name: username })
    localStorage.setItem('site_token', newToken)
    localStorage.setItem('site_username', username)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('site_token')
    localStorage.removeItem('site_username')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)