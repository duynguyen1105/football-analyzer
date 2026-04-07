import { getCached, setCached } from "@/lib/cache";
import { subscribeSchema, parseBody } from "@/lib/api-validation";

const SUBSCRIBERS_KEY = "newsletter:subscribers";
const TTL_FOREVER = 365 * 24 * 60 * 60; // 1 year

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = parseBody(subscribeSchema, body);
    if (result.error) return result.error;
    const { email } = result.data;

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
