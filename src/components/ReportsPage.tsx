import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Car, Bike, Clock, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParkingSession {
  id: string;
  spot_id: number;
  license_plate: string;
  phone_number: string;
  vehicle_type: 'car' | 'motorcycle';
  entry_time: string;
  exit_time: string | null;
  cost: number;
  is_active: boolean;
  created_at: string;
}

interface ReportsPageProps {
  onBack: () => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user, dateFilter]);

  const loadSessions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('parking_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Aplicar filtro de data
      const now = new Date();
      let startDate: Date;

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0); // All time
      }

      if (dateFilter !== 'all') {
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading sessions:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados dos relatórios',
          variant: 'destructive',
        });
      } else {
        // Type assertion to ensure vehicle_type is the correct union type
        const typedSessions: ParkingSession[] = (data || []).map(session => ({
          ...session,
          vehicle_type: session.vehicle_type as 'car' | 'motorcycle'
        }));
        setSessions(typedSessions);
      }
    } catch (error) {
      console.error('Error in loadSessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalSessions = sessions.length;
    const activeSessions = sessions.filter(s => s.is_active).length;
    const completedSessions = sessions.filter(s => !s.is_active).length;
    const totalRevenue = sessions.reduce((sum, s) => sum + (s.cost || 0), 0);
    const carSessions = sessions.filter(s => s.vehicle_type === 'car').length;
    const motorcycleSessions = sessions.filter(s => s.vehicle_type === 'motorcycle').length;

    return {
      totalSessions,
      activeSessions,
      completedSessions,
      totalRevenue,
      carSessions,
      motorcycleSessions,
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatDuration = (entryTime: string, exitTime: string | null) => {
    const entry = new Date(entryTime);
    const exit = exitTime ? new Date(exitTime) : new Date();
    const minutes = Math.floor((exit.getTime() - entry.getTime()) / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const stats = calculateStats();

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
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Relatórios do Sistema
            </h1>
          </div>
          
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'all'] as const).map((filter) => (
              <Button
                key={filter}
                variant={dateFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter(filter)}
              >
                {filter === 'today' ? 'Hoje' : 
                 filter === 'week' ? 'Semana' :
                 filter === 'month' ? 'Mês' : 'Todos'}
              </Button>
            ))}
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp size={16} />
                Total de Sessões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock size={16} />
                Sessões Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar size={16} />
                Finalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.completedSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign size={16} />
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Car size={16} />
                Carros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.carSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bike size={16} />
                Motos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.motorcycleSessions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Sessões */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Estacionamento</CardTitle>
            <CardDescription>
              Histórico completo das sessões de estacionamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma sessão encontrada para o período selecionado.
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-white"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {session.vehicle_type === 'car' ? (
                          <Car size={20} className="text-blue-500" />
                        ) : (
                          <Bike size={20} className="text-green-500" />
                        )}
                        <div>
                          <p className="font-semibold">{session.license_plate}</p>
                          <p className="text-sm text-gray-500">Vaga #{session.spot_id}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm">
                          <strong>Entrada:</strong> {formatDate(session.entry_time)}
                        </p>
                        {session.exit_time && (
                          <p className="text-sm">
                            <strong>Saída:</strong> {formatDate(session.exit_time)}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          Duração: {formatDuration(session.entry_time, session.exit_time)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant={session.is_active ? 'default' : 'secondary'}>
                        {session.is_active ? 'Ativo' : 'Finalizado'}
                      </Badge>
                      
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          R$ {session.cost.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {session.vehicle_type === 'car' ? 'Carro' : 'Moto'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
