
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  subscriptionTier: string;
  subscriptionEnd: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, subscriptionTier, subscriptionEnd }: ConfirmationEmailRequest = await req.json();

    const endDate = new Date(subscriptionEnd).toLocaleDateString('pt-BR');
    const planName = subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1);

    const emailResponse = await resend.emails.send({
      from: "Sistema de Estacionamento <onboarding@resend.dev>",
      to: [email],
      subject: `Assinatura ${planName} ativada com sucesso!`,
      html: `
        <h1>Bem-vindo ao Sistema de Estacionamento!</h1>
        <p>Olá,</p>
        <p>Sua assinatura do plano <strong>${planName}</strong> foi ativada com sucesso!</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Detalhes da Assinatura:</h3>
          <ul>
            <li><strong>Plano:</strong> ${planName}</li>
            <li><strong>Válida até:</strong> ${endDate}</li>
            <li><strong>Status:</strong> Ativa</li>
          </ul>
        </div>
        
        <p>Agora você pode usar todas as funcionalidades do sistema de estacionamento:</p>
        <ul>
          <li>Estacionar veículos em vagas disponíveis</li>
          <li>Buscar veículos por placa</li>
          <li>Controlar tempo e custos</li>
          <li>Acessar relatórios detalhados</li>
        </ul>
        
        <p>Acesse o sistema agora e comece a usar!</p>
        
        <p>Se você tiver alguma dúvida, entre em contato conosco.</p>
        
        <p>Atenciosamente,<br>Equipe do Sistema de Estacionamento</p>
      `,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
