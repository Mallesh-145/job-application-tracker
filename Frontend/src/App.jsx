import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import Home from './pages/Home';
import CompanyPage from './pages/CompanyPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar'; 

// --- Standard Protected Route ---
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// --- Admin Only Route ---
const AdminRoute = ({ children }) => {
  const { token, isAdmin } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return isAdmin ? children : <Navigate to="/" replace />;
};

function AppContent() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900">
      {token && <Navbar />}

      {/* 🛠️ Added a wrapper with pt-24 (top padding) to prevent Navbar overlap */}
      <div className={`${token ? 'pt-24' : ''} transition-all duration-300`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* User Protected Routes */}
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

          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0f172a', 
              color: '#e0e7ff',     
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '16px', 
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: 'white' },
            },
            error: {
              iconTheme: { primary: '#e11d48', secondary: 'white' },
            },
          }}
        />
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;