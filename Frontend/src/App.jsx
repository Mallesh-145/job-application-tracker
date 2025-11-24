import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
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
    <AuthProvider> {/* Wrap everything in AuthProvider */}
      <BrowserRouter>
        {/* This controls how the toasts look */}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e293b', 
              color: '#fff',        
              border: '1px solid #334155',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: 'white' },
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