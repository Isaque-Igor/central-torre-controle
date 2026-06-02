import { NextResponse, NextRequest } from "next/server";

const OPENCLAW_URL   = "http://127.0.0.1:18789/v1/chat/completions";
const OPENCLAW_TOKEN = "1168e39051eddb789ea7eae417ec75c7427f9dd3a097be33";

export async function POST(req: NextRequest) {
  const { messages, sessionId } = await req.json();

  const res = await fetch(OPENCLAW_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENCLAW_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openclaw",
      messages,
      user: sessionId ?? "portal-anonimo",
    }),
  });

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? "Sem resposta.";
  return NextResponse.json({ reply });
}
