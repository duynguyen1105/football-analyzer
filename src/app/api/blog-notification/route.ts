import { getCached } from "@/lib/cache";

export async function GET() {
  const raw = await getCached("blog:latest-notification");
  if (!raw) return Response.json(null);

  try {
    return Response.json(JSON.parse(raw));
  } catch {
    return Response.json(null);
  }
}
