
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Sistema Online',
        description: 'Conexão restabelecida. Sistema funcionando normalmente.',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Sistema Offline',
        description: 'Sem conexão com a internet. Algumas funcionalidades podem não funcionar.',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return isOnline;
};
