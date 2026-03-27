import { supabase } from "@/lib/supabase";

export async function logAuditAction(
  adminDiscordId: string,
  adminDiscordName: string,
  action: string,
  target: string,
  details?: string
): Promise<void> {
  try {
    await supabase.from("admin_audit_logs").insert({
      admin_discord_id: adminDiscordId,
      admin_discord_name: adminDiscordName,
      action,
      target,
      details: details || null,
    });
  } catch (err) {
    console.error("Failed to log audit action:", err);
  }
}
