import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, TrendingUp } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import TodayAppointments from '../components/dashboard/TodayAppointments';
import useAppointments from '../hooks/useAppointments';
import { format } from 'date-fns';

const Dashboard = () => {
  const { appointments, fetchAppointments, loading } = useAppointments();
  const [stats, setStats] = useState({
    today: 0,
    tomorrow: 0,
    thisWeek: 0,
    pending: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

    // Cargar citas de hoy
    const todayData = await fetchAppointments({
      fecha_inicio: today,
      fecha_fin: today,
    });

    setTodayAppointments(todayData || []);

    // Calcular estadísticas (esto se puede mejorar con endpoints específicos)
    const pending = (todayData || []).filter(
      (apt) => apt.estado === 'pendiente' || apt.estado === 'confirmada'
    ).length;

    setStats({
      today: todayData?.length || 0,
      tomorrow: 0, // Esto requeriría otra llamada
      thisWeek: 0, // Esto requeriría otra llamada
      pending,
    });
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Vista general de tu negocio - {format(new Date(), 'dd/MM/yyyy')}
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Citas Hoy"
          value={stats.today}
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="Citas Mañana"
          value={stats.tomorrow}
          icon={Clock}
          color="green"
        />
        <StatsCard
          title="Esta Semana"
          value={stats.thisWeek}
          icon={TrendingUp}
          color="purple"
        />
        <StatsCard
          title="Pendientes"
          value={stats.pending}
          icon={Users}
          color="yellow"
        />
      </div>

      {/* Lista de citas de hoy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TodayAppointments appointments={todayAppointments} />
        </div>

        {/* Panel lateral con información adicional */}
        <div className="space-y-4">
          {/* Notificaciones recientes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Notificaciones
            </h3>
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">
                No hay notificaciones nuevas
              </p>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Acciones Rápidas
            </h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Nueva Cita
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Nuevo Cliente
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Ver Calendario
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
