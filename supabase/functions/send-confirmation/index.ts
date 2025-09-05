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
  userType: "doctor" | "receptionist";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userType }: ConfirmationEmailRequest = await req.json();

    console.log(`Sending confirmation email to ${email} for ${userType}`);

    const userTypeTitle = userType === "doctor" ? "Doctor" : "Receptionist";
    const dashboardUrl = userType === "doctor" ? "/doctor-dashboard" : "/receptionist-dashboard";

    const emailResponse = await resend.emails.send({
      from: "Clinic Management <onboarding@resend.dev>",
      to: [email],
      subject: `Welcome to Clinic Management - ${userTypeTitle} Account Created`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #2563eb; text-align: center;">Welcome to Clinic Management!</h1>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e293b; margin-top: 0;">Account Successfully Created</h2>
            <p>Your <strong>${userTypeTitle}</strong> account has been successfully created for:</p>
            <p style="font-size: 16px; color: #1e40af;"><strong>${email}</strong></p>
          </div>

          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #065f46; margin-top: 0;">Next Steps:</h3>
            <ol style="color: #047857;">
              <li>Check your email for the verification link from Supabase</li>
              <li>Click the verification link to confirm your email address</li>
              <li>Return to the app and log in with your credentials</li>
              <li>Access your ${userType} dashboard to get started</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('https://gxedijowsntlsynhkobi.supabase.co', 'https://gxedijowsntlsynhkobi.supabase.co') || 'https://your-app.com'}${dashboardUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to ${userTypeTitle} Dashboard
            </a>
          </div>

          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">
              <strong>Need Help?</strong> If you have any questions or need assistance, please contact our support team.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="text-align: center; color: #64748b; font-size: 12px;">
            This email was sent automatically. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      throw emailResponse.error;
    }

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Confirmation email sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Failed to send confirmation email"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);