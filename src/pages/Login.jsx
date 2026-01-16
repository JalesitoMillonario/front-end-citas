import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { Calendar } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await login(credentialResponse.credential);

    if (result.success) {
      // Si es la primera vez, redirigir a onboarding
      // Por ahora, redirigir directamente al dashboard
      navigate('/dashboard');
    } else {
      alert(result.error || 'Error al iniciar sesión');
    }
  };

  const handleGoogleError = () => {
    alert('Error al iniciar sesión con Google');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sistema de Citas
            </h1>
            <p className="text-gray-600">
              Gestiona tu negocio de forma simple y eficiente
            </p>
          </div>

          {/* Botón de Google Login */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              text="signin_with"
              shape="rectangular"
              theme="outline"
              size="large"
            />
          </div>

          {/* Información adicional */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Gestión completa de citas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Control de clientes y servicios
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Integración con WhatsApp
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad
        </p>
      </div>
    </div>
  );
};

export default Login;
