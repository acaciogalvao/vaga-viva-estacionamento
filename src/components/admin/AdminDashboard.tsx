import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Car, Bike, DollarSign, Clock, TrendingUp, Settings, BarChart3 } from 'lucide-react';
import AdminParkingSettings from './AdminParkingSettings';
import AdminAnalytics from './AdminAnalytics';
import AdminUserManagement from './AdminUserManagement';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  activeSessions: number;
  totalRevenue: number;
  averageSessionTime: number;
  carSpots: number;
  motorcycleSpots: number;
}

type AdminView = 'dashboard' | 'analytics' | 'settings' | 'users';

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalSessions: 0,
    activeSessions: 0,
    totalRevenue: 0,
    averageSessionTime: 0,
    carSpots: 0,
    motorcycleSpots: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user statistics
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, created_at');

      // Fetch parking sessions statistics
      const { data: sessionsData } = await supabase
        .from('parking_sessions')
        .select('*');

      // Calculate statistics
      const totalUsers = usersData?.length || 0;
      const activeUsers = usersData?.filter(u => 
        new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length || 0;

      const totalSessions = sessionsData?.length || 0;
      const activeSessions = sessionsData?.filter(s => s.is_active).length || 0;
      
      const totalRevenue = sessionsData?.reduce((sum, session) => 
        sum + (session.cost || 0), 0
      ) || 0;

      const completedSessions = sessionsData?.filter(s => !s.is_active && s.exit_time) || [];
      const averageSessionTime = completedSessions.length > 0 
        ? completedSessions.reduce((sum, session) => {
            const entry = new Date(session.entry_time);
            const exit = new Date(session.exit_time!);
            return sum + (exit.getTime() - entry.getTime());
          }, 0) / completedSessions.length / (1000 * 60) // Convert to minutes
        : 0;

      const carSpots = sessionsData?.filter(s => s.vehicle_type === 'car' && s.is_active).length || 0;
      const motorcycleSpots = sessionsData?.filter(s => s.vehicle_type === 'motorcycle' && s.is_active).length || 0;

      setStats({
        totalUsers,
        activeUsers,
        totalSessions,
        activeSessions,
        totalRevenue,
        averageSessionTime,
        carSpots,
        motorcycleSpots
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'analytics':
        return <AdminAnalytics />;
      case 'settings':
        return <AdminParkingSettings />;
      case 'users':
        return <AdminUserManagement />;
      default:
        return renderDashboardContent();
    }
  };

  const renderDashboardContent = () => (
    <div className="grid gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <Badge variant="outline" className="text-xs">
              {stats.activeUsers} ativos este mês
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
            <Badge variant="outline" className="text-xs">
              {stats.totalSessions} total
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
            <Badge variant="outline" className="text-xs">
              Tempo médio: {Math.round(stats.averageSessionTime)}min
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vagas Ocupadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Car className="h-4 w-4 text-blue-500" />
                <span className="text-lg font-bold">{stats.carSpots}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bike className="h-4 w-4 text-green-500" />
                <span className="text-lg font-bold">{stats.motorcycleSpots}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Gerencie o sistema de estacionamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setCurrentView('analytics')} className="flex items-center gap-2">
              <BarChart3 size={16} />
              Ver Relatórios
            </Button>
            <Button onClick={() => setCurrentView('settings')} variant="outline" className="flex items-center gap-2">
              <Settings size={16} />
              Configurações
            </Button>
            <Button onClick={() => setCurrentView('users')} variant="outline" className="flex items-center gap-2">
              <Users size={16} />
              Gerenciar Usuários
            </Button>
            <Button onClick={fetchDashboardStats} variant="outline">
              Atualizar Dados
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Painel Administrativo
            </h1>
            <p className="text-gray-600">Sistema de gestão do estacionamento</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={signOut}>
              Sair
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant={currentView === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </Button>
          <Button 
            variant={currentView === 'analytics' ? 'default' : 'outline'}
            onClick={() => setCurrentView('analytics')}
          >
            Relatórios
          </Button>
          <Button 
            variant={currentView === 'settings' ? 'default' : 'outline'}
            onClick={() => setCurrentView('settings')}
          >
            Configurações
          </Button>
          <Button 
            variant={currentView === 'users' ? 'default' : 'outline'}
            onClick={() => setCurrentView('users')}
          >
            Usuários
          </Button>
        </div>

        {/* Content */}
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default AdminDashboard;