
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useNotifications } from '@/hooks/useNotifications';
import AuthForm from '@/components/AuthForm';
import ParkingSystemWithAuth from '@/components/ParkingSystemWithAuth';
import UserDashboard from '@/components/UserDashboard';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import ReportsPage from '@/components/ReportsPage';

type ViewState = 'parking' | 'dashboard' | 'plans' | 'reports';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { updateSubscription } = useSubscription();
  const [currentView, setCurrentView] = useState<ViewState>('parking');
  
  // Initialize notifications hook
  useNotifications();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const handleSelectPlan = async (planId: string) => {
    await updateSubscription(planId);
    setCurrentView('parking');
  };

  const handleShowDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleShowPlans = () => {
    setCurrentView('plans');
  };

  const handleShowReports = () => {
    setCurrentView('reports');
  };

  const handleBackToParking = () => {
    setCurrentView('parking');
  };

  switch (currentView) {
    case 'dashboard':
      return (
        <div>
          <UserDashboard onSubscribe={handleShowPlans} />
          <div className="fixed bottom-4 left-4">
            <button
              onClick={handleBackToParking}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
            >
              ← Voltar ao Sistema
            </button>
          </div>
        </div>
      );
    case 'plans':
      return (
        <div>
          <SubscriptionPlans onSelectPlan={handleSelectPlan} />
          <div className="fixed bottom-4 left-4">
            <button
              onClick={handleBackToParking}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
            >
              ← Voltar ao Sistema
            </button>
          </div>
        </div>
      );
    case 'reports':
      return <ReportsPage onBack={handleBackToParking} />;
    default:
      return (
        <ParkingSystemWithAuth 
          onShowDashboard={handleShowDashboard} 
          onShowReports={handleShowReports}
        />
      );
  }
};

export default Index;
