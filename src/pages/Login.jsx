import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { Calendar, CheckCircle, Users, Clock, MessageSquare, Sparkles, Globe } from 'lucide-react';

const Login = () => {
  const { t, i18n } = useTranslation();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  const features = [
    {
      icon: <Calendar className="w-5 h-5" />,
      title: i18n.language === 'es' ? 'Gestión completa de citas' : 'Complete appointment management',
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: i18n.language === 'es' ? 'Control de clientes y servicios' : 'Client and service control',
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: i18n.language === 'es' ? 'Integración con WhatsApp' : 'WhatsApp integration',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: i18n.language === 'es' ? 'Recordatorios automáticos' : 'Automatic reminders',
    },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Language toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-6 right-6 z-10 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white rounded-lg transition-all border border-white/20"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{i18n.language === 'es' ? 'English' : 'Español'}</span>
      </button>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Hero content (hidden on mobile) */}
          <div className="hidden lg:block text-white space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                {i18n.language === 'es' ? 'Sistema Profesional' : 'Professional System'}
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              {t('app.name')}
              <span className="block text-blue-200 mt-2">
                {i18n.language === 'es' ? 'para tu Negocio' : 'for your Business'}
              </span>
            </h1>

            <p className="text-xl text-blue-100 leading-relaxed">
              {t('app.description')}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                >
                  <div className="p-2 bg-white/10 rounded-lg text-white">
                    {feature.icon}
                  </div>
                  <p className="text-sm text-blue-100 leading-snug">
                    {feature.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Login card */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 space-y-8">
              {/* Logo and title */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-2">
                  <Calendar className="w-10 h-10 text-white" />
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
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
                      <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600 font-medium">
                        {t('common.loading')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features list */}
              <div className="pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center mb-4 uppercase tracking-wider font-medium">
                  {i18n.language === 'es' ? 'Incluye' : 'Includes'}
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 text-sm text-gray-700"
                    >
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <span>{feature.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security badge */}
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-xs text-blue-700 font-medium">
                  {i18n.language === 'es'
                    ? 'Conexión segura con Google OAuth'
                    : 'Secure connection with Google OAuth'}
                </p>
              </div>
            </div>

            {/* Footer text */}
            <p className="text-center text-sm text-white/80 mt-6 px-4">
              {i18n.language === 'es'
                ? 'Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad'
                : 'By signing in, you agree to our terms of service and privacy policy'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
