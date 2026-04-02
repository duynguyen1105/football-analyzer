import { getCached, setCached } from "@/lib/cache";

const SUBSCRIBERS_KEY = "newsletter:subscribers";
const TTL_FOREVER = 365 * 24 * 60 * 60; // 1 year

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@") || email.length > 200) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    // Load existing subscribers
    const raw = await getCached(SUBSCRIBERS_KEY);
    const subscribers: string[] = raw
      ? typeof raw === "string" ? JSON.parse(raw) : raw
      : [];

    // Check duplicate
    if (subscribers.includes(email.toLowerCase())) {
      return Response.json({ message: "Already subscribed" });
    }

    // Add and save
    subscribers.push(email.toLowerCase());
    await setCached(SUBSCRIBERS_KEY, JSON.stringify(subscribers), TTL_FOREVER);

    return Response.json({ message: "Subscribed successfully" });
  } catch {
    return Response.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
