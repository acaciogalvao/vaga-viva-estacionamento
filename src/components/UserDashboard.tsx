
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Calendar, CreditCard } from 'lucide-react';

interface UserDashboardProps {
  onSubscribe: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onSubscribe }) => {
  const { user, signOut } = useAuth();
  const { isSubscribed, subscriptionTier, subscriptionEnd, loading } = useSubscription();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getSubscriptionStatus = () => {
    if (!isSubscribed) return 'Sem assinatura';
    if (subscriptionEnd && new Date(subscriptionEnd) < new Date()) return 'Expirada';
    return 'Ativa';
  };

  const getStatusColor = () => {
    const status = getSubscriptionStatus();
    if (status === 'Ativa') return 'bg-green-500';
    if (status === 'Expirada') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Minha Conta
          </h1>
          <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
            <LogOut size={16} />
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Membro desde:</strong> {user?.created_at ? formatDate(user.created_at) : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard size={20} />
                Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor()}>
                    {getSubscriptionStatus()}
                  </Badge>
                  {subscriptionTier && (
                    <Badge variant="outline">
                      {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
                    </Badge>
                  )}
                </div>
                
                {subscriptionEnd && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span className="text-sm">
                      Válida até: {formatDate(subscriptionEnd)}
                    </span>
                  </div>
                )}
                
                {!isSubscribed && (
                  <Button onClick={onSubscribe} className="w-full">
                    Assinar Agora
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Benefits */}
        {isSubscribed && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Benefícios da sua Assinatura</CardTitle>
              <CardDescription>
                Aproveite todos os recursos do seu plano {subscriptionTier}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Acesso completo ao sistema</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Suporte técnico</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Relatórios detalhados</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Sem taxas adicionais</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
