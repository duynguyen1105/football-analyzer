import { getCached } from "@/lib/cache";

const SUBSCRIBERS_KEY = "newsletter:subscribers";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const preview = searchParams.get("preview") === "true";

  try {
    // Generate the digest HTML by calling our own digest endpoint
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      `${new URL(request.url).protocol}//${new URL(request.url).host}`;
    const digestRes = await fetch(`${baseUrl}/api/digest`);

    if (!digestRes.ok) {
      return Response.json(
        { error: "Không thể tạo bản tin" },
        { status: 500 }
      );
    }

    const html = await digestRes.text();

    // Preview mode — return HTML directly for testing
    if (preview) {
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Load subscriber list
    const raw = await getCached(SUBSCRIBERS_KEY);
    const subscribers: string[] = raw
      ? typeof raw === "string"
        ? JSON.parse(raw)
        : (raw as string[])
      : [];

    // TODO: Integrate with an email service (Resend, SendGrid, etc.)
    // For now, return the digest info and subscriber count
    //
    // Example with Resend:
    //   import { Resend } from "resend";
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   for (const email of subscribers) {
    //     await resend.emails.send({
    //       from: "Nhận Định Bóng Đá VN <noreply@nhandinhbongdavn.com>",
    //       to: email,
    //       subject: "⚽ Nhận Định Bóng Đá Cuối Tuần",
    //       html: html.replace("{{UNSUBSCRIBE_URL}}", `${baseUrl}/unsubscribe?email=${email}`),
    //     });
    //   }

    return Response.json({
      success: true,
      message: "Bản tin đã được tạo thành công",
      subscriberCount: subscribers.length,
      note: "Email chưa được gửi — cần tích hợp dịch vụ email (Resend/SendGrid)",
      previewUrl: `${baseUrl}/api/digest/send?preview=true`,
    });
  } catch (error) {
    console.error("Digest send error:", error);
    return Response.json(
      { error: "Không thể gửi bản tin" },
      { status: 500 }
    );
  }
}
