const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function GET(request: Request) {
  if (!BOT_TOKEN) {
    return Response.json(
      { error: "TELEGRAM_BOT_TOKEN is not configured" },
      { status: 500 }
    );
  }

  // Derive the base URL from the request or env
  const url = new URL(request.url);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    `${url.protocol}//${url.host}`;
  const webhookUrl = `${baseUrl}/api/telegram`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
    );
    const data = await res.json();

    if (data.ok) {
      return Response.json({
        success: true,
        message: `Webhook đã được đăng ký: ${webhookUrl}`,
        telegram: data,
      });
    }

    return Response.json(
      { success: false, message: "Đăng ký webhook thất bại", telegram: data },
      { status: 400 }
    );
  } catch (error) {
    console.error("Telegram webhook setup error:", error);
    return Response.json(
      { error: "Không thể kết nối Telegram API" },
      { status: 500 }
    );
  }
}
