import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { Calendar, CheckCircle, Users, Clock, MessageSquare, Shield, Globe, ArrowRight } from 'lucide-react';

const Login = () => {
  const { t, i18n } = useTranslation();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Obtener idioma actual normalizado
  const currentLang = i18n.language.split('-')[0];

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    const result = await login(credentialResponse.credential);

    if (result.success) {
      navigate('/dashboard');
    } else {
      alert(result.error || t('auth.loginError'));
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    alert(t('auth.loginError'));
    setIsLoading(false);
  };

  const toggleLanguage = () => {
    const newLang = currentLang === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  const features = [
    {
      icon: <Calendar className="w-5 h-5" />,
      title: t('appointments.title'),
      desc: currentLang === 'es' ? 'Gestión completa de citas' : 'Complete appointment management',
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: t('clients.title'),
      desc: currentLang === 'es' ? 'Control de clientes y servicios' : 'Client and service control',
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: currentLang === 'es' ? 'WhatsApp' : 'WhatsApp',
      desc: currentLang === 'es' ? 'Integración con WhatsApp' : 'WhatsApp integration',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: currentLang === 'es' ? 'Recordatorios' : 'Reminders',
      desc: currentLang === 'es' ? 'Recordatorios automáticos' : 'Automatic reminders',
    },
  ];

  return (
    <div className="min-h-screen flex bg-white">
      {/* Language toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-6 right-6 z-10 flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all border border-gray-200 shadow-sm"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLang === 'es' ? 'EN' : 'ES'}</span>
      </button>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Hero content */}
          <div className="hidden lg:flex flex-col space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 bg-black text-white text-xs font-semibold rounded-full uppercase tracking-wider">
                {currentLang === 'es' ? 'Plataforma Profesional' : 'Professional Platform'}
              </div>

              <h1 className="text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                {t('app.name')}
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                {t('app.description')}
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col p-5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
                >
                  <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">{currentLang === 'es' ? 'Disponibilidad' : 'Availability'}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600">{currentLang === 'es' ? 'Seguro' : 'Secure'}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">∞</div>
                <div className="text-sm text-gray-600">{currentLang === 'es' ? 'Citas' : 'Appointments'}</div>
              </div>
            </div>
          </div>

          {/* Right side - Login card */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 sm:p-10 space-y-8">
              {/* Logo and title */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-xl mb-2">
                  <Calendar className="w-8 h-8 text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('auth.welcome')}
                  </h2>
                  <p className="text-gray-600">
                    {t('auth.loginDescription')}
                  </p>
                </div>
              </div>

              {/* Google Login Button */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  {!isLoading ? (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap
                      text="signin_with"
                      shape="rectangular"
                      theme="outline"
                      size="large"
                      width="320"
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-3 px-8 py-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <div className="w-5 h-5 border-3 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-700 font-medium">
                        {t('common.loading')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features list */}
              <div className="pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 text-sm text-gray-700"
                    >
                      <div className="flex-shrink-0 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <span>{feature.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security badge */}
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <Shield className="w-4 h-4 text-gray-700" />
                <p className="text-xs text-gray-700 font-medium">
                  {currentLang === 'es'
                    ? 'Conexión segura con Google OAuth 2.0'
                    : 'Secure connection with Google OAuth 2.0'}
                </p>
              </div>
            </div>

            {/* Footer text */}
            <p className="text-center text-sm text-gray-500 mt-6 px-4">
              {currentLang === 'es'
                ? 'Al iniciar sesión, aceptas nuestros términos y política de privacidad'
                : 'By signing in, you agree to our terms and privacy policy'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
