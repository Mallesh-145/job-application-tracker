import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast' // 🛡️ Cleaned up duplicate import
import { AuthProvider, useAuth } from './context/AuthContext' 
import Home from './pages/Home'
import CompanyPage from './pages/CompanyPage'
import Login from './pages/Login'
import Signup from './pages/Signup'

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* 🛡️ Upgraded Toaster for the Professional Dark Glass Theme */}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0f172a', // Slate-900 to match your dashboard
              color: '#e0e7ff',     // Indigo-100 for better readability
              border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle glass border
              borderRadius: '16px', // Matches your card/modal corners
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
            },
            success: {
              iconTheme: { 
                primary: '#10b981', // Emerald-500
                secondary: 'white' 
              },
            },
            error: {
              iconTheme: { 
                primary: '#e11d48', // Rose-600
                secondary: 'white' 
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          
          <Route path="/company/:id" element={
            <ProtectedRoute>
              <CompanyPage />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App