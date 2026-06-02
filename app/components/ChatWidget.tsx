// app/components/ChatWidget.tsx
"use client";
import { useState, useRef, useEffect } from "react";

interface Mensagem {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [aberto, setAberto]       = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const fimRef                    = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [statusOnline, setStatusOnline] = useState(true);

  useEffect(() => {
    let id = localStorage.getItem("chat-session-id");
    if (!id) {
      id = `portal-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem("chat-session-id", id);
    }
    setSessionId(id);
  }, []);

  useEffect(() => {
    const verificar = () => {
      fetch("/api/chat/status")
        .then(r => r.json())
        .then(d => setStatusOnline(d.status === "online"))
        .catch(() => setStatusOnline(false));
    };
    verificar();
    const interval = setInterval(verificar, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, aberto]);

  const enviar = async () => {
    if (!input.trim() || loading) return;

    const novas: Mensagem[] = [...mensagens, { role: "user", content: input }];
    setMensagens(novas);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: novas, sessionId }),
      });
      const data = await res.json();
      setMensagens([...novas, { role: "assistant", content: data.reply }]);
    } catch {
      setMensagens([...novas, { 
        role: "assistant", 
        content: "🔄 O agente está reconectando agora. Tente novamente em alguns segundos — nosso sistema vai restaurá-lo automaticamente." 
      }]);
      setStatusOnline(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BOTÃO FLUTUANTE */}
      <button
        onClick={() => setAberto(!aberto)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 1000,
          width: 52, height: 52, borderRadius: "50%",
          background: "var(--accent)", border: "none", cursor: "pointer",
          fontSize: 22, boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          transition: "transform 0.2s",
        }}
        title="Chat com IA"
      >
        🦞
      </button>

      {/* JANELA DO CHAT */}
      {aberto && (
        <div style={{
          position: "fixed", bottom: 88, right: 24, zIndex: 1000,
          width: 360, height: 500,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 12, display: "flex", flexDirection: "column",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}>

          {/* HEADER */}
          <div style={{
            padding: "12px 16px",
            background: "var(--bg-surface)", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontFamily: "var(--font-condensed)", fontSize: 14, fontWeight: 700, textTransform: "uppercase", color: "var(--text-primary)" }}>
                🦞 NEMOCLAW
              </div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: statusOnline ? "var(--green)" : "var(--amber)" }}>
                {statusOnline ? "● Online · qwen3.6:latest" : "● Reconectando..."}
              </div>
            </div>
            <button onClick={() => setAberto(false)} style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--text-muted)", fontSize: 16,
            }}>✕</button>
          </div>

          {/* MENSAGENS */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "12px 16px",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            {mensagens.length === 0 && (
              <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)", marginTop: 40 }}>
                Olá! Como posso ajudar?
              </div>
            )}
            {mensagens.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
              }}>
                <div style={{
                  padding: "8px 12px", borderRadius: 8, fontSize: 12,
                  fontFamily: "var(--font-mono)", lineHeight: 1.5,
                  background: m.role === "user" ? "rgba(240,165,0,0.15)" : "var(--bg-surface)",
                  color: m.role === "user" ? "var(--accent)" : "var(--text-secondary)",
                  border: `1px solid ${m.role === "user" ? "rgba(240,165,0,0.3)" : "var(--border)"}`,
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start" }}>
                <div style={{
                  padding: "8px 12px", borderRadius: 8, fontSize: 12,
                  fontFamily: "var(--font-mono)", color: "var(--text-muted)",
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                }}>
                  ●●● pensando...
                </div>
              </div>
            )}
            <div ref={fimRef} />
          </div>

          {/* INPUT */}
          <div style={{
            padding: "10px 12px", borderTop: "1px solid var(--border)",
            display: "flex", gap: 8,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && enviar()}
              placeholder="Digite uma mensagem..."
              style={{
                flex: 1, background: "var(--bg-base)", border: "1px solid var(--border)",
                borderRadius: 6, padding: "6px 10px", fontSize: 12,
                fontFamily: "var(--font-mono)", color: "var(--text-primary)", outline: "none",
              }}
            />
            <button onClick={enviar} disabled={loading} style={{
              background: "var(--accent)", border: "none", borderRadius: 6,
              padding: "6px 12px", cursor: loading ? "not-allowed" : "pointer",
              color: "#000", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
              opacity: loading ? 0.5 : 1,
            }}>
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}