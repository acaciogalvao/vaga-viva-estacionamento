
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Crown, User, Calendar, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
interface UserDashboardProps {
  onSubscribe: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onSubscribe }) => {
  const { user, signOut } = useAuth();
  const { subscription, isSubscribed, subscriptionTier } = useSubscription();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer logout.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getSubscriptionStatus = () => {
    if (!isSubscribed) return { text: 'Inativo', variant: 'secondary' as const };
    if (subscriptionTier === 'premium') return { text: 'Premium', variant: 'default' as const };
    return { text: 'Básico', variant: 'outline' as const };
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                Painel do Usuário
              </h1>
              <p className="text-gray-600">Gerencie sua conta e configurações</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut size={16} />
              Sair
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Cadastro</label>
                  <p className="text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {user?.created_at ? formatDate(user.created_at) : 'Não disponível'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Status da Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={subscriptionStatus.variant} className="flex items-center gap-1">
                    {subscriptionTier === 'premium' && <Crown className="h-3 w-3" />}
                    {subscriptionStatus.text}
                  </Badge>
                </div>
                
                {isSubscribed && subscription ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Plano Atual</label>
                      <p className="text-lg capitalize">{subscriptionTier || 'Básico'}</p>
                    </div>
                    {subscription.subscription_end && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Válido até</label>
                        <p className="text-lg">{formatDate(subscription.subscription_end)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      Você não possui uma assinatura ativa. Assine um plano para acessar todas as funcionalidades.
                    </p>
                    <Button onClick={onSubscribe} className="w-full">
                      Ver Planos de Assinatura
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Note about configuration */}
          {isSubscribed && (
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  As configurações de preços são gerenciadas pelo administrador do sistema.
                  Entre em contato com o suporte se precisar de ajustes nos valores.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
