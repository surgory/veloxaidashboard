/**
 * Send a Discord webhook embed with fields.
 */
export async function sendDiscordNotification(
  title: string,
  description: string,
  color: number = 0xffffff,
  fields?: { name: string; value: string; inline?: boolean }[]
): Promise<boolean> {
  try {
    const settings = localStorage.getItem("velox_settings");
    if (!settings) return false;

    const parsed = JSON.parse(settings);
    const webhookUrl = parsed.discordWebhook;

    if (!webhookUrl || !webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
      return false;
    }

    const embed: Record<string, unknown> = {
      title,
      description,
      color,
      timestamp: new Date().toISOString(),
      footer: { text: "VeloxAI License Manager" },
    };

    if (fields && fields.length > 0) {
      embed.fields = fields;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });

    return response.ok;
  } catch (err) {
    console.error("Discord webhook failed:", err);
    return false;
  }
}

/**
 * Send activation alert to Discord
 */
export async function sendActivationAlert(log: {
  license_key: string;
  type?: string;
  hwid?: string | null;
  ip?: string | null;
  pc_name?: string | null;
}): Promise<boolean> {
  return sendDiscordNotification(
    "🔐 NEW ACTIVATION",
    "",
    0x00ff88,
    [
      { name: "Key", value: `\`${log.license_key}\``, inline: false },
      { name: "Type", value: log.type || "unknown", inline: true },
      { name: "HWID", value: log.hwid || "N/A", inline: false },
      { name: "IP", value: log.ip || "N/A", inline: true },
      { name: "PC", value: log.pc_name || "N/A", inline: true },
    ]
  );
}
