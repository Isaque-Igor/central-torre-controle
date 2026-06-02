// app/api/intralogistica/interior/cargas/route.ts
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabase";

const FORNECEDORES_INTERIOR = [
  "Marjom - Interior",
  "Rampap - Interior",
  "Farma - BOL",
  "Mercado",
  "Transferência de Loja - BOL",
  "Marketplace",
  // adicione os outros
];

interface ContagemPorStatus {
  EM_MONTAGEM: number;
  FECHADO: number;
  EM_TRANSITO: number;
  DISPONIVEL_CONFERENCIA: number;
  CONFERENCIA_PARCIAL: number;
  CONFERIDA: number;
  DESTINACAO_PARCIAL: number;
  DESTINADO: number;
}

export async function GET(req: NextRequest) {
  const dataParam  = req.nextUrl.searchParams.get("data") ?? new Date().toISOString().split("T")[0];
  const inicioDia  = `${dataParam}T00:00:00.000Z`;
  const fimDia     = `${dataParam}T23:59:59.999Z`;

  const contagem: ContagemPorStatus = {
    EM_MONTAGEM: 0,
    FECHADO: 0,
    EM_TRANSITO: 0,
    DISPONIVEL_CONFERENCIA: 0,
    CONFERENCIA_PARCIAL: 0,
    CONFERIDA: 0,
    DESTINACAO_PARCIAL: 0,
    DESTINADO: 0,
  };

  // Busca todas as notas do dia + fornecedor Interior, com status atual da carga
  const { data: notas, error } = await supabase
  .from("notas_fiscais_cd")
  .select("carga_id, fornecedor, cargas_cd!carga_id(status)")
  .in("fornecedor", FORNECEDORES_INTERIOR)
  .gte("criado_em", inicioDia)
  .lt("criado_em", fimDia)
  .not("carga_id", "is", null)
  .range(0, 9999);

  console.log("[DEBUG] FORNECEDORES_INTERIOR:", FORNECEDORES_INTERIOR);
  console.log("[DEBUG] inicioDia/fimDia:", inicioDia, fimDia);
  console.log("[DEBUG] Erro Supabase:", error);
  console.log("[DEBUG] Total notas retornadas:", notas?.length);
  console.log("[DEBUG] Primeira nota:", notas?.[0]);

  // Reduz para cargas distintas (uma carga tem várias notas)
  const cargasUnicas = new Map<string, string>();
  notas?.forEach((n: any) => {
    if (n.carga_id && n.cargas_cd?.status) {
      cargasUnicas.set(n.carga_id, n.cargas_cd.status);
    }
  });

  // Conta cargas em cada status atual
  cargasUnicas.forEach(status => {
    if (status in contagem) {
      contagem[status as keyof ContagemPorStatus]++;
    }
  });

  // Mapas por fornecedor
  const cargasPorFornecedor     = new Map<string, Set<string>>();
  const conferidasPorFornecedor = new Map<string, Set<string>>();
  const destinadasPorFornecedor = new Map<string, Set<string>>();

  notas?.forEach((n: any) => {
    if (!n.carga_id || !n.fornecedor) return;
    const status = n.cargas_cd?.status;

    // Total de cargas por fornecedor
    if (!cargasPorFornecedor.has(n.fornecedor)) {
      cargasPorFornecedor.set(n.fornecedor, new Set());
    }
    cargasPorFornecedor.get(n.fornecedor)!.add(n.carga_id);

    if (!status) return;

    // Conferidas (CONFERIDA + DESTINACAO_PARCIAL + DESTINADO)
    if (["CONFERIDA", "DESTINACAO_PARCIAL", "DESTINADO"].includes(status)) {
      if (!conferidasPorFornecedor.has(n.fornecedor)) {
        conferidasPorFornecedor.set(n.fornecedor, new Set());
      }
      conferidasPorFornecedor.get(n.fornecedor)!.add(n.carga_id);
    }

    // Destinadas (apenas DESTINADO)
    if (status === "DESTINADO") {
      if (!destinadasPorFornecedor.has(n.fornecedor)) {
        destinadasPorFornecedor.set(n.fornecedor, new Set());
      }
      destinadasPorFornecedor.get(n.fornecedor)!.add(n.carga_id);
    }
  });

  // Lista simples (gráfico cargas por fornecedor)
  const fornecedores = Array.from(cargasPorFornecedor.entries())
    .map(([nome, cargas]) => ({ nome, total: cargas.size }))
    .sort((a, b) => b.total - a.total);

  // Progresso de Conferência (pior % primeiro)
  const progressoConferencia = Array.from(cargasPorFornecedor.entries())
    .map(([nome, todas]) => {
      const total = todas.size;
      const concluidas = conferidasPorFornecedor.get(nome)?.size ?? 0;
      return { nome, total, concluidas, percentual: total ? (concluidas / total) * 100 : 0 };
    })
    .sort((a, b) => a.percentual - b.percentual);

  // Progresso de Destinação (pior % primeiro)
  const progressoDestinacao = Array.from(cargasPorFornecedor.entries())
    .map(([nome, todas]) => {
      const total = todas.size;
      const concluidas = destinadasPorFornecedor.get(nome)?.size ?? 0;
      return { nome, total, concluidas, percentual: total ? (concluidas / total) * 100 : 0 };
    })
    .sort((a, b) => a.percentual - b.percentual);

  return NextResponse.json({
    ok: true,
    total: cargasUnicas.size,
    contagem,
    fornecedores,
    progressoConferencia,
    progressoDestinacao,
  });
}