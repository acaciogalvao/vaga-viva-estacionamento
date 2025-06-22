
import React from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();

  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-blue-100 rounded-full">
          <Smartphone className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Instalar App</h3>
          <p className="text-sm text-gray-600">Acesse offline e tenha uma experiência melhor</p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={installApp}
          className="flex-1 flex items-center gap-1"
          size="sm"
        >
          <Download size={14} />
          Instalar
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            // Hide the prompt temporarily
            const prompt = document.querySelector('[data-install-prompt]') as HTMLElement;
            if (prompt) prompt.style.display = 'none';
          }}
        >
          Mais tarde
        </Button>
      </div>
    </div>
  );
};

export default InstallPrompt;
