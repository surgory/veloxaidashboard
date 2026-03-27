/**
 * Send a Discord webhook notification.
 * Returns true if sent successfully, false otherwise.
 */
export async function sendDiscordNotification(
  title: string,
  description: string,
  color: number = 0xffffff
): Promise<boolean> {
  try {
    const settings = localStorage.getItem("velox_settings");
    if (!settings) return false;

    const parsed = JSON.parse(settings);
    const webhookUrl = parsed.discordWebhook;

    if (!webhookUrl || !webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
      return false;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title,
            description,
            color,
            timestamp: new Date().toISOString(),
            footer: { text: "VeloxAI License Manager" },
          },
        ],
      }),
    });

    return response.ok;
  } catch (err) {
    console.error("Discord webhook failed:", err);
    return false;
  }
}
