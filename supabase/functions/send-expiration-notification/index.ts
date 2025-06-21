
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ExpirationNotificationRequest {
  email: string;
  subscriptionEnd: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, subscriptionEnd }: ExpirationNotificationRequest = await req.json();

    const endDate = new Date(subscriptionEnd);
    const now = new Date();
    const daysUntilExpiration = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let subject: string;
    let htmlContent: string;

    if (daysUntilExpiration <= 0) {
      subject = "Sua assinatura do Sistema de Estacionamento expirou";
      htmlContent = `
        <h1>Assinatura Expirada</h1>
        <p>Olá,</p>
        <p>Sua assinatura do Sistema de Estacionamento <strong>expirou</strong>.</p>
        <p>Para continuar usando o sistema, renove sua assinatura agora mesmo.</p>
        <p>Acesse o sistema e escolha um novo plano para reativar sua conta.</p>
        <p>Atenciosamente,<br>Equipe do Sistema de Estacionamento</p>
      `;
    } else {
      subject = `Sua assinatura expira em ${daysUntilExpiration} dias`;
      htmlContent = `
        <h1>Assinatura Expirando em Breve</h1>
        <p>Olá,</p>
        <p>Sua assinatura do Sistema de Estacionamento expira em <strong>${daysUntilExpiration} dias</strong>.</p>
        <p>Data de expiração: <strong>${endDate.toLocaleDateString('pt-BR')}</strong></p>
        <p>Para evitar a interrupção do serviço, renove sua assinatura antes do vencimento.</p>
        <p>Acesse o sistema para renovar seu plano.</p>
        <p>Atenciosamente,<br>Equipe do Sistema de Estacionamento</p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Sistema de Estacionamento <onboarding@resend.dev>",
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Expiration notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-expiration-notification function:", error);
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
