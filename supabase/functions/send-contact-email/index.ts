import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not configured. Please set it in Supabase secrets." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Parse request body
    let requestData: ContactEmailRequest;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid request body. Expected JSON." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, subject, message } = requestData;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, subject, message" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Processing contact form submission from:", email);

    // Escape HTML in user input to prevent XSS
    const escapeHtml = (text: string) => {
      const map: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };
      return text.replace(/[&<>"']/g, (m) => map[m]);
    };

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    // Send email to contact.campustrades@gmail.com with the form submission
    const contactEmailPayload = {
      from: "CampusTrades <onboarding@resend.dev>",
      to: ["contact.campustrades@gmail.com"],
      reply_to: [email],
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <hr />
        <h3>Message:</h3>
        <p>${safeMessage.replace(/\n/g, '<br />')}</p>
        <hr />
        <p><small>This email was sent from the CampusTrades contact form.</small></p>
      `,
      text: `
New Contact Form Submission

From: ${name} (${email})
Subject: ${subject}

Message:
${message}

---
This email was sent from the CampusTrades contact form.
      `,
    };

    console.log("Sending email to contact.campustrades@gmail.com");

    const contactEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(contactEmailPayload),
    });

    let contactEmailData: any;
    const responseText = await contactEmailResponse.text();
    
    try {
      contactEmailData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Resend API response:", responseText);
      return new Response(
        JSON.stringify({ error: "Failed to parse email service response" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!contactEmailResponse.ok) {
      console.error("Resend API error:", contactEmailData);
      const errorMessage = contactEmailData?.message || contactEmailData?.error?.message || "Failed to send contact email";
      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: contactEmailResponse.status,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Contact email sent successfully. Email ID:", contactEmailData?.id);

    // Send confirmation email to the user (optional, but good UX)
    try {
      const confirmationPayload = {
        from: "CampusTrades <onboarding@resend.dev>",
        to: [email],
        subject: "We received your message!",
        html: `
          <h2>Thank you for contacting CampusTrades!</h2>
          <p>Hi ${safeName},</p>
          <p>We've received your message and will get back to you soon.</p>
          <br />
          <p><strong>Your message:</strong></p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <p>${safeMessage.replace(/\n/g, '<br />')}</p>
          <br />
          <p>Best regards,<br />The CampusTrades Team</p>
        `,
      };

      const confirmationResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify(confirmationPayload),
      });

      if (confirmationResponse.ok) {
        console.log("Confirmation email sent successfully to user");
      } else {
        const confText = await confirmationResponse.text();
        console.warn("Failed to send confirmation email:", confText);
      }
    } catch (confirmationError) {
      // Don't fail the whole request if confirmation email fails
      console.warn("Error sending confirmation email:", confirmationError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Contact form submitted successfully",
        contactEmailId: contactEmailData?.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Unexpected error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({
        error: error?.message || "An unexpected error occurred",
        details: error?.toString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
