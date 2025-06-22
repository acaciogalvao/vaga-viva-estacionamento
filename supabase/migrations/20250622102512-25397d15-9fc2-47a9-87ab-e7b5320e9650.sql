
-- Adicionar colunas para armazenar as configurações de preços na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN car_hourly_rate DECIMAL(10,2) DEFAULT 3.00,
ADD COLUMN motorcycle_hourly_rate DECIMAL(10,2) DEFAULT 2.00;

-- Adicionar comentários para documentar as colunas
COMMENT ON COLUMN public.profiles.car_hourly_rate IS 'Valor por hora para estacionamento de carros em reais';
COMMENT ON COLUMN public.profiles.motorcycle_hourly_rate IS 'Valor por hora para estacionamento de motos em reais';
