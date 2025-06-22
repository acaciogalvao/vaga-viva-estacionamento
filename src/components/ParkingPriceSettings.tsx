
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useParkingSettings } from '@/hooks/useParkingSettings';
import { Car, Bike, Save, Settings } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface PriceFormData {
  carRate: number;
  motorcycleRate: number;
}

const ParkingPriceSettings: React.FC = () => {
  const { settings, loading, updateSettings } = useParkingSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PriceFormData>({
    defaultValues: {
      carRate: settings.car_hourly_rate,
      motorcycleRate: settings.motorcycle_hourly_rate
    }
  });

  // Update form when settings change
  React.useEffect(() => {
    if (!loading) {
      form.reset({
        carRate: settings.car_hourly_rate,
        motorcycleRate: settings.motorcycle_hourly_rate
      });
    }
  }, [settings, loading, form]);

  const onSubmit = async (data: PriceFormData) => {
    setIsSubmitting(true);
    await updateSettings({
      car_hourly_rate: data.carRate,
      motorcycle_hourly_rate: data.motorcycleRate
    });
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Preços</CardTitle>
          <CardDescription>Carregando configurações...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações de Preços
        </CardTitle>
        <CardDescription>
          Configure os valores por hora para diferentes tipos de veículos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="carRate"
                rules={{
                  required: 'O valor para carros é obrigatório',
                  min: { value: 0.01, message: 'O valor deve ser maior que zero' },
                  max: { value: 100, message: 'O valor deve ser menor que R$ 100' }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-blue-500" />
                      Valor por Hora - Carros
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          R$
                        </span>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="100"
                          className="pl-10"
                          placeholder="3.00"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motorcycleRate"
                rules={{
                  required: 'O valor para motos é obrigatório',
                  min: { value: 0.01, message: 'O valor deve ser maior que zero' },
                  max: { value: 100, message: 'O valor deve ser menor que R$ 100' }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Bike className="h-4 w-4 text-green-500" />
                      Valor por Hora - Motos
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          R$
                        </span>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="100"
                          className="pl-10"
                          placeholder="2.00"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Visualização dos Preços</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-blue-500" />
                  <span>Carros: R$ {form.watch('carRate')?.toFixed(2) || '0.00'}/hora</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bike className="h-4 w-4 text-green-500" />
                  <span>Motos: R$ {form.watch('motorcycleRate')?.toFixed(2) || '0.00'}/hora</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ParkingPriceSettings;
