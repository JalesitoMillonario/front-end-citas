import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  Briefcase,
  Settings,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendario', path: '/calendario', icon: Calendar },
    { name: 'Citas', path: '/citas', icon: Clock },
    { name: 'Clientes', path: '/clientes', icon: Users },
    { name: 'Servicios', path: '/servicios', icon: Briefcase },
    { name: 'Configuración', path: '/configuracion', icon: Settings },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header del Sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">Citas App</h1>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menú de navegación */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-colors duration-200
                        ${
                          active
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer del Sidebar */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Sistema de Gestión de Citas
              <br />
              v1.0.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
