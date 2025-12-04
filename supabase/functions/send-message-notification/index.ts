import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MessageNotificationRequest {
  conversationId: string;
  senderId: string;
  recipientId: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { conversationId, senderId, recipientId }: MessageNotificationRequest = await req.json();

    console.log("Sending message notification:", { conversationId, senderId, recipientId });

    // Get sender's profile for the email
    const { data: senderProfile, error: senderError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", senderId)
      .single();

    if (senderError) {
      console.error("Error fetching sender profile:", senderError);
      throw new Error("Failed to fetch sender profile");
    }

    // Get recipient's email from auth.users table
    const { data: recipientAuth, error: recipientAuthError } = await supabase
      .auth.admin.getUserById(recipientId);

    if (recipientAuthError || !recipientAuth.user?.email) {
      console.error("Error fetching recipient email:", recipientAuthError);
      throw new Error("Failed to fetch recipient email");
    }

    const recipientEmail = recipientAuth.user.email;
    const senderName = senderProfile?.full_name || "Someone";

    console.log(`Sending notification email to ${recipientEmail} from ${senderName}`);

    // Send the notification email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "TMU's CampusTrades <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: "You have a new message on TMU's CampusTrades!",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <h1 style="color: #0066cc; margin: 0 0 24px 0; font-size: 24px;">Hello There! 👋</h1>
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                    <strong>${senderName}</strong> sent you a message on TMU's CampusTrades.
                  </p>
                  <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                    Visit the website to check your message and continue the conversation!
                  </p>
                  <a href="https://tmu-campustrades.lovable.app/chats" 
                     style="display: inline-block; background-color: #0066cc; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    View Messages
                  </a>
                  <p style="color: #999; font-size: 14px; margin: 32px 0 0 0; padding-top: 24px; border-top: 1px solid #eee;">
                    This email was sent from TMU's CampusTrades marketplace.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-message-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
