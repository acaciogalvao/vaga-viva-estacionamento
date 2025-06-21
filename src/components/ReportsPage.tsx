
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Car, Clock, DollarSign, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParkingSession {
  id: string;
  spot_id: number;
  license_plate: string;
  vehicle_type: string;
  entry_time: string;
  exit_time: string | null;
  cost: number;
  is_active: boolean;
}

interface ReportsPageProps {
  onBack: () => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    totalRevenue: 0,
    averageTime: 0,
  });

  useEffect(() => {
    if (user) {
      fetchParkingSessions();
    }
  }, [user]);

  const fetchParkingSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('parking_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_time', { ascending: false });

      if (error) {
        console.error('Error fetching parking sessions:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os relatórios',
          variant: 'destructive',
        });
        return;
      }

      setSessions(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error in fetchParkingSessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (sessionsData: ParkingSession[]) => {
    const totalSessions = sessionsData.length;
    const activeSessions = sessionsData.filter(s => s.is_active).length;
    const totalRevenue = sessionsData.reduce((sum, s) => sum + (s.cost || 0), 0);
    
    const completedSessions = sessionsData.filter(s => !s.is_active && s.exit_time);
    const totalMinutes = completedSessions.reduce((sum, s) => {
      if (!s.exit_time) return sum;
      const entry = new Date(s.entry_time);
      const exit = new Date(s.exit_time);
      return sum + Math.floor((exit.getTime() - entry.getTime()) / (1000 * 60));
    }, 0);
    
    const averageTime = completedSessions.length > 0 ? Math.floor(totalMinutes / completedSessions.length) : 0;

    setStats({
      totalSessions,
      activeSessions,
      totalRevenue,
      averageTime,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatDuration = (entryTime: string, exitTime: string | null) => {
    if (!exitTime) return 'Em andamento';
    
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const minutes = Math.floor((exit.getTime() - entry.getTime()) / (1000 * 60));
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${remainingMinutes}min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Relatórios
          </h1>
          <Button onClick={onBack} variant="outline">
            ← Voltar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageTime}min</div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Sessões</CardTitle>
            <CardDescription>
              Últimas {sessions.length} sessões de estacionamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma sessão encontrada
                </p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span className="font-medium">{session.license_plate}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Vaga {session.spot_id} • {session.vehicle_type === 'car' ? 'Carro' : 'Moto'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">Entrada</div>
                        <div className="text-gray-500">{formatDate(session.entry_time)}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-medium">Duração</div>
                        <div className="text-gray-500">
                          {formatDuration(session.entry_time, session.exit_time)}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-medium">Valor</div>
                        <div className="text-gray-500">R$ {session.cost.toFixed(2)}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          session.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {session.is_active ? 'Ativo' : 'Finalizado'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
