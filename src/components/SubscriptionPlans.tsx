
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, Zap } from 'lucide-react';

interface SubscriptionPlansProps {
  onSelectPlan: (planId: string) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSelectPlan }) => {
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 29.90,
      description: 'Ideal para uso pessoal',
      features: [
        'Até 50 usos por mês',
        'Suporte por email',
        'Relatórios básicos',
        'Acesso ao app móvel'
      ],
      icon: <Check className="w-5 h-5" />,
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 49.90,
      description: 'Para usuários frequentes',
      features: [
        'Uso ilimitado',
        'Suporte prioritário',
        'Relatórios avançados',
        'Acesso ao app móvel',
        'Reserva de vagas',
        'Histórico completo'
      ],
      icon: <Star className="w-5 h-5" />,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99.90,
      description: 'Para empresas e frotas',
      features: [
        'Usuários ilimitados',
        'Suporte 24/7',
        'Dashboard gerencial',
        'API personalizada',
        'Relatórios customizados',
        'Integração com sistemas'
      ],
      icon: <Zap className="w-5 h-5" />,
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Escolha seu Plano
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Selecione o plano que melhor se adapta às suas necessidades de estacionamento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-3xl font-bold mt-4">
                  R$ {plan.price.toFixed(2)}
                  <span className="text-sm font-normal text-gray-500">/mês</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => onSelectPlan(plan.id)}
                >
                  Escolher {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
