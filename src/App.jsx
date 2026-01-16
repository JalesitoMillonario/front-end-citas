import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Appointments from './pages/Appointments';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Settings from './pages/Settings';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  // TODO: Reemplazar con tu GOOGLE_CLIENT_ID real
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <TenantProvider>
          <Router>
            <Routes>
              {/* Ruta pública */}
              <Route path="/login" element={<Login />} />

              {/* Rutas protegidas */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendario"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Calendar />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citas"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Appointments />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clientes"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Clients />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/servicios"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Services />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/configuracion"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Ruta por defecto */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </TenantProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
