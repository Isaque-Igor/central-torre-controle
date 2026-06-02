import { NextResponse } from "next/server";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch("http://127.0.0.1:18789/v1/models", {
      headers: {
        "Authorization": "Bearer 1168e39051eddb789ea7eae417ec75c7427f9dd3a097be33",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    return NextResponse.json({ status: res.ok ? "online" : "offline" });
  } catch (err: any) {
    return NextResponse.json({ status: "offline", reason: err.message });
  }
}