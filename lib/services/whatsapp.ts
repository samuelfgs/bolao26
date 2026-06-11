/**
 * WhatsApp Notification Service - Evolution API Implementation
 * 
 * This service handles sending WhatsApp messages using Evolution API (self-hosted).
 * It allows for unlimited messages without the 1000-message limit of Meta Cloud API.
 * 
 * Required environment variables:
 * 1. EVOLUTION_API_URL (e.g., https://api.yourdomain.com)
 * 2. EVOLUTION_API_KEY (Your API security key)
 * 3. EVOLUTION_INSTANCE (The instance name you created)
 */

export async function sendWhatsAppMessage(to: string, message: string) {
  const apiUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;

  if (!apiUrl || !apiKey || !instance) {
    console.warn("Evolution API credentials not found. Skipping notification.");
    console.log(`[DEBUG] WhatsApp to ${to}: ${message}`);
    return null;
  }

  // Evolution API expects numbers in format: 5513996983289 (no +, no spaces)
  const cleanTo = to.replace(/\D/g, "");

  try {
    const response = await fetch(
      `${apiUrl}/message/sendText/${instance}`,
      {
        method: "POST",
        headers: {
          "apikey": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: cleanTo,
          text: message,
          options: {
            delay: 1200,
            presence: "composing",
            linkPreview: true
          }
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Evolution API Error:", data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send WhatsApp message via Evolution API:", error);
    return { success: false, error };
  }
}

export function formatApprovalMessage(userName: string, poolName: string) {
  return `⚽ *Novo Palpiteiro na Área!*\n\nO craque *${userName}* acabou de solicitar entrada no bolão *${poolName}*.\n\nAcesse o painel para aprovar: ${process.env.NEXT_PUBLIC_APP_URL || 'https://bolao26.com'}/admin/approvals`;
}
