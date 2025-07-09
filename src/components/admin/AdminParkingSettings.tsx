import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, Bike, Save, Settings } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GlobalPriceSettings {
  carRate: number;
  motorcycleRate: number;
}

const AdminParkingSettings: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<GlobalPriceSettings>({
    defaultValues: {
      carRate: 3.0,
      motorcycleRate: 2.0
    }
  });

  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  const fetchGlobalSettings = async () => {
    try {
      // Fetch global settings from any user's profile as a reference
      const { data, error } = await supabase
        .from('profiles')
        .select('car_hourly_rate, motorcycle_hourly_rate')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching global settings:', error);
        return;
      }

      if (data) {
        form.reset({
          carRate: data.car_hourly_rate || 3.0,
          motorcycleRate: data.motorcycle_hourly_rate || 2.0
        });
      }
    } catch (error) {
      console.error('Error in fetchGlobalSettings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: GlobalPriceSettings) => {
    setIsSubmitting(true);
    
    try {
      // Update rates for all users
      const { error } = await supabase
        .from('profiles')
        .update({
          car_hourly_rate: data.carRate,
          motorcycle_hourly_rate: data.motorcycleRate
        })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all profiles

      if (error) {
        console.error('Error updating global settings:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar as configurações globais.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Configurações atualizadas!',
          description: 'Os valores foram aplicados para todos os usuários do sistema.',
        });
      }
    } catch (error) {
      console.error('Error in onSubmit:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado ao salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações Globais de Preços</CardTitle>
          <CardDescription>Carregando configurações...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Globais de Preços
          </CardTitle>
          <CardDescription>
            Configure os valores por hora para todos os usuários do sistema
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
                <h4 className="font-medium mb-2">Visualização dos Preços Globais</h4>
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
                <p className="text-xs text-gray-500 mt-2">
                  Estas configurações serão aplicadas para todos os usuários do sistema.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Salvando...' : 'Salvar Configurações Globais'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Total de Vagas:</span>
              <span>60 (30 carros + 30 motos)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Sistema de Cobrança:</span>
              <span>Por minuto acumulado</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Última Atualização:</span>
              <span>{new Date().toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminParkingSettings;