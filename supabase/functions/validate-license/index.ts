import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ValidateRequest {
  action: "validate" | "heartbeat";
  key: string;
  hwid: string;
  pc_name?: string;
  ip?: string;
}

interface ValidateResponse {
  success: boolean;
  message: string;
  license?: {
    type: string;
    expires_at: string | null;
    status: string;
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, message: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body: ValidateRequest = await req.json();
    const { action, key, hwid, pc_name, ip } = body;

    if (!key || !hwid) {
      return jsonResponse({ success: false, message: "Missing required fields: key, hwid" }, 400);
    }

    if (action === "heartbeat") {
      return await handleHeartbeat(supabase, key, hwid);
    }

    // Default action: validate
    return await handleValidate(supabase, key, hwid, pc_name || "Unknown", ip || "Unknown");
  } catch (err) {
    console.error("Error processing request:", err);
    return jsonResponse({ success: false, message: "Invalid request body" }, 400);
  }
});

async function handleValidate(
  supabase: ReturnType<typeof createClient>,
  key: string,
  hwid: string,
  pcName: string,
  ip: string
): Promise<Response> {
  // 1. Check if HWID is banned
  const { data: bannedEntry } = await supabase
    .from("banned_hwids")
    .select("*")
    .eq("hwid", hwid)
    .maybeSingle();

  if (bannedEntry) {
    // Check if ban has expired
    if (!bannedEntry.expires_at || new Date(bannedEntry.expires_at) > new Date()) {
      await logActivation(supabase, key, hwid, ip, "blocked_banned_hwid", pcName);
      return jsonResponse({
        success: false,
        message: "This hardware ID has been banned",
      });
    }
  }

  // 2. Look up the license
  const { data: license, error: licenseError } = await supabase
    .from("licenses")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (licenseError || !license) {
    await logActivation(supabase, key, hwid, ip, "invalid_key", pcName);
    return jsonResponse({ success: false, message: "Invalid license key" });
  }

  // 3. Check license status
  if (license.status === "revoked") {
    await logActivation(supabase, key, hwid, ip, "revoked", pcName);
    return jsonResponse({ success: false, message: "This license has been revoked" });
  }

  // 4. Check expiration
  if (license.expires_at && new Date(license.expires_at) < new Date()) {
    // Auto-update status to expired
    await supabase.from("licenses").update({ status: "expired" }).eq("key", key);
    await logActivation(supabase, key, hwid, ip, "expired", pcName);
    return jsonResponse({ success: false, message: "This license has expired" });
  }

  // 5. Check HWID binding
  if (license.hwid && license.hwid !== hwid) {
    await logActivation(supabase, key, hwid, ip, "hwid_mismatch", pcName);
    return jsonResponse({
      success: false,
      message: "This license is bound to a different hardware ID",
    });
  }

  // 6. Bind HWID if first activation
  if (!license.hwid) {
    const { error: updateError } = await supabase
      .from("licenses")
      .update({ hwid, uses: (license.uses || 0) + 1, last_used: new Date().toISOString() })
      .eq("key", key);

    if (updateError) {
      console.error("Failed to bind HWID:", updateError);
      return jsonResponse({ success: false, message: "Failed to activate license" }, 500);
    }
  } else {
    // Update last_used and uses
    await supabase
      .from("licenses")
      .update({ uses: (license.uses || 0) + 1, last_used: new Date().toISOString() })
      .eq("key", key);
  }

  // 7. Log successful activation
  await logActivation(supabase, key, hwid, ip, "activation", pcName);

  return jsonResponse({
    success: true,
    message: "License validated successfully",
    license: {
      type: license.type,
      expires_at: license.expires_at,
      status: "active",
    },
  });
}

async function handleHeartbeat(
  supabase: ReturnType<typeof createClient>,
  key: string,
  hwid: string
): Promise<Response> {
  const { data: license } = await supabase
    .from("licenses")
    .select("status, hwid, expires_at, type")
    .eq("key", key)
    .maybeSingle();

  if (!license) {
    return jsonResponse({ success: false, message: "Invalid license key" });
  }

  if (license.status !== "active") {
    return jsonResponse({ success: false, message: `License is ${license.status}` });
  }

  if (license.hwid && license.hwid !== hwid) {
    return jsonResponse({ success: false, message: "HWID mismatch" });
  }

  if (license.expires_at && new Date(license.expires_at) < new Date()) {
    await supabase.from("licenses").update({ status: "expired" }).eq("key", key);
    return jsonResponse({ success: false, message: "License has expired" });
  }

  // Check if HWID is banned
  const { data: banned } = await supabase
    .from("banned_hwids")
    .select("id")
    .eq("hwid", hwid)
    .maybeSingle();

  if (banned) {
    return jsonResponse({ success: false, message: "Hardware ID is banned" });
  }

  // Update last_used timestamp
  await supabase
    .from("licenses")
    .update({ last_used: new Date().toISOString() })
    .eq("key", key);

  return jsonResponse({
    success: true,
    message: "License is valid",
    license: {
      type: license.type,
      expires_at: license.expires_at,
      status: "active",
    },
  });
}

async function logActivation(
  supabase: ReturnType<typeof createClient>,
  licenseKey: string,
  hwid: string,
  ip: string,
  action: string,
  pcName: string
): Promise<void> {
  try {
    await supabase.from("activation_logs").insert({
      license_key: licenseKey,
      hwid,
      ip,
      action,
      pc_name: pcName,
    });
  } catch (err) {
    console.error("Failed to log activation:", err);
  }
}

function jsonResponse(data: ValidateResponse, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
