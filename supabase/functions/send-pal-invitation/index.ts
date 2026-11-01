import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://serhanjain.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return json(401, { error: "Sign in before inviting a guardian." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const emailFrom = Deno.env.get("EMAIL_FROM");

  if (!supabaseUrl || !anonKey || !resendKey || !emailFrom) {
    return json(500, { error: "Invitation email service is not configured." });
  }

  let guardianEmail: string;
  try {
    const body = await req.json();
    guardianEmail = String(body.guardian_email ?? "").trim().toLowerCase();
  } catch {
    return json(400, { error: "Invalid request body." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardianEmail) || guardianEmail.length > 254) {
    return json(400, { error: "Enter a valid email address." });
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userResult, error: userError } = await supabase.auth.getUser();
  if (userError || !userResult.user) {
    return json(401, { error: "Your session has expired. Please sign in again." });
  }

  const { data: token, error: inviteError } = await supabase.rpc(
    "create_pal_invitation",
    { guardian_email_input: guardianEmail },
  );

  if (inviteError || typeof token !== "string") {
    return json(400, { error: inviteError?.message ?? "Could not create invitation." });
  }

  const inviteUrl = `https://serhanjain.github.io/DEMENTIA-USER/family.html#invite=${encodeURIComponent(token)}`;
  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [guardianEmail],
      subject: "You're invited to connect on Pal",
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#24364b"><h2>You've been invited to connect on Pal</h2><p>A Pal user has invited you to become their family guardian.</p><p><a href="${inviteUrl}" style="display:inline-block;padding:13px 20px;background:#24445b;color:white;text-decoration:none;border-radius:8px">Review invitation</a></p><p>This invitation expires in 48 hours. If you weren't expecting it, you can ignore this email.</p></div>`,
    }),
  });

  if (!emailResponse.ok) {
    const detail = await emailResponse.text();
    console.error("Resend error:", detail);
    return json(502, { error: "The invitation was created, but the email could not be sent. Please contact support before trying again." });
  }

  return json(200, { message: "Invitation email sent." });
});
