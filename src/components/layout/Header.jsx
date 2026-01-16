import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTenant } from '../../context/TenantContext';
import { getInitials } from '../../utils/formatters';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { tenantConfig } = useTenant();

  const handleLogout = async () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      await logout();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Botón de menú móvil */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Nombre del negocio */}
        <div className="flex-1 lg:ml-0 ml-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {tenantConfig?.nombre_negocio || 'Mi Negocio'}
          </h2>
          <p className="text-xs text-gray-500">
            {tenantConfig?.tipo_negocio || 'Gestión de citas'}
          </p>
        </div>

        {/* Perfil de usuario */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex items-center gap-2">
            {user?.foto ? (
              <img
                src={user.foto}
                alt={user.nombre}
                className="w-9 h-9 rounded-full border-2 border-gray-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                {getInitials(user?.nombre || 'Usuario')}
              </div>
            )}
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-700">
                {user?.nombre || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Botón de logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
