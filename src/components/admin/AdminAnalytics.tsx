import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Car, Bike, DollarSign, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  dailyRevenue: Array<{ date: string; revenue: number; sessions: number }>;
  vehicleTypeStats: Array<{ type: string; count: number; revenue: number }>;
  hourlyUsage: Array<{ hour: number; usage: number }>;
  monthlyStats: {
    currentMonth: number;
    previousMonth: number;
    growth: number;
  };
}

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    dailyRevenue: [],
    vehicleTypeStats: [],
    hourlyUsage: [],
    monthlyStats: { currentMonth: 0, previousMonth: 0, growth: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch all parking sessions
      const { data: sessions, error } = await supabase
        .from('parking_sessions')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      if (!sessions) return;

      // Process daily revenue data (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const dailyRevenue = last7Days.map(date => {
        const dayStart = new Date(date);
        const dayEnd = new Date(date);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const daySessions = sessions.filter(session => {
          const sessionDate = new Date(session.created_at);
          return sessionDate >= dayStart && sessionDate < dayEnd;
        });

        const revenue = daySessions.reduce((sum, session) => sum + (session.cost || 0), 0);

        return {
          date: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
          revenue: Number(revenue.toFixed(2)),
          sessions: daySessions.length
        };
      });

      // Process vehicle type statistics
      const vehicleStats = sessions.reduce((acc, session) => {
        const type = session.vehicle_type;
        if (!acc[type]) {
          acc[type] = { count: 0, revenue: 0 };
        }
        acc[type].count++;
        acc[type].revenue += session.cost || 0;
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>);

      const vehicleTypeStats = Object.entries(vehicleStats).map(([type, stats]) => ({
        type: type === 'car' ? 'Carros' : 'Motos',
        count: stats.count,
        revenue: Number(stats.revenue.toFixed(2))
      }));

      // Process hourly usage (average usage by hour of day)
      const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        const hourSessions = sessions.filter(session => {
          const sessionHour = new Date(session.created_at).getHours();
          return sessionHour === hour;
        });
        return {
          hour,
          usage: hourSessions.length
        };
      });

      // Calculate monthly stats
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const currentMonthSessions = sessions.filter(session => {
        const sessionDate = new Date(session.created_at);
        return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
      });

      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      const previousMonthSessions = sessions.filter(session => {
        const sessionDate = new Date(session.created_at);
        return sessionDate.getMonth() === previousMonth && sessionDate.getFullYear() === previousYear;
      });

      const currentMonthRevenue = currentMonthSessions.reduce((sum, session) => sum + (session.cost || 0), 0);
      const previousMonthRevenue = previousMonthSessions.reduce((sum, session) => sum + (session.cost || 0), 0);
      
      const growth = previousMonthRevenue > 0 
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
        : 0;

      setAnalytics({
        dailyRevenue,
        vehicleTypeStats,
        hourlyUsage: hourlyData,
        monthlyStats: {
          currentMonth: Number(currentMonthRevenue.toFixed(2)),
          previousMonth: Number(previousMonthRevenue.toFixed(2)),
          growth: Number(growth.toFixed(1))
        }
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Carregando analytics...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Monthly Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {analytics.monthlyStats.currentMonth}</div>
            <div className="flex items-center gap-2 text-xs">
              {analytics.monthlyStats.growth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={analytics.monthlyStats.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(analytics.monthlyStats.growth)}% vs mês anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mês Anterior</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {analytics.monthlyStats.previousMonth}</div>
            <p className="text-xs text-muted-foreground">Para comparação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            {analytics.monthlyStats.growth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analytics.monthlyStats.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.monthlyStats.growth >= 0 ? '+' : ''}{analytics.monthlyStats.growth}%
            </div>
            <p className="text-xs text-muted-foreground">Comparado ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Receita Diária (Últimos 7 dias)</CardTitle>
            <CardDescription>Receita e número de sessões por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `R$ ${value}` : value,
                    name === 'revenue' ? 'Receita' : 'Sessões'
                  ]}
                />
                <Legend />
                <Bar yAxisId="right" dataKey="sessions" fill="#3b82f6" name="Sessões" />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Receita" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vehicle Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo de Veículo</CardTitle>
            <CardDescription>Total de sessões e receita por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {analytics.vehicleTypeStats.map((item, index) => (
                <div key={item.type} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {item.type === 'Carros' ? <Car className="h-5 w-5 text-blue-500" /> : <Bike className="h-5 w-5 text-green-500" />}
                    <span className="font-medium">{item.type}</span>
                  </div>
                  <div className="text-lg font-bold">{item.count} sessões</div>
                  <div className="text-sm text-muted-foreground">R$ {item.revenue}</div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.vehicleTypeStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }) => `${type}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.vehicleTypeStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} sessões`, 'Total']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Uso por Hora do Dia</CardTitle>
          <CardDescription>Padrão de uso do estacionamento ao longo do dia</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.hourlyUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(value) => `${value}:00`}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => `${value}:00`}
                formatter={(value) => [`${value} sessões`, 'Uso']}
              />
              <Bar dataKey="usage" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;