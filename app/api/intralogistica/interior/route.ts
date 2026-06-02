// app/api/intralogistica/interior/route.ts
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabase";

// Apenas fornecedores que são do Interior
const FORNECEDORES_INTERIOR = [
  "Marjom - Interior",
  "Rampap - Interior",
  "Mercado",
  "Farma - BOL",
  "Transferência de Loja - BOL",
  "Marketplace"
  // adicione outros aqui
];

const FILTRO_INTERIOR = `(${FORNECEDORES_INTERIOR.map(f => `"${f}"`).join(",")})`;

export async function GET(req: NextRequest) {
  const dataParam  = req.nextUrl.searchParams.get("data") ?? new Date().toISOString().split("T")[0];
  const inicioHoje = `${dataParam}T00:00:00.000Z`;
  const fimHoje    = `${dataParam}T23:59:59.999Z`;

  // Total recebido (apenas do Interior)
  const { count: totalRecebido } = await supabase
    .from("notas_fiscais_cd")
    .select("*", { count: "exact", head: true })
    .in("fornecedor", FORNECEDORES_INTERIOR)
    .gte("criado_em", inicioHoje)
    .lt("criado_em", fimHoje);

  // Por fornecedor
  const { data: porFornecedor } = await supabase
    .from("notas_fiscais_cd")
    .select("fornecedor")
    .in("fornecedor", FORNECEDORES_INTERIOR)
    .gte("criado_em", inicioHoje)
    .lt("criado_em", fimHoje)
    .range(0, 4999);

  const fornecedorCount: Record<string, number> = {};
  porFornecedor?.forEach((n: any) => {
    const f = n.fornecedor ?? "Sem fornecedor";
    fornecedorCount[f] = (fornecedorCount[f] ?? 0) + 1;
  });

  const fornecedores = Object.entries(fornecedorCount)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total);

  // Exportação
  const { data: notasCompletas } = await supabase
    .from("notas_fiscais_cd")
    .select(`criado_em, numero_nota, chave, fornecedor, cargas_cd(area)`)
    .in("fornecedor", FORNECEDORES_INTERIOR)
    .gte("criado_em", inicioHoje)
    .lt("criado_em", fimHoje)
    .order("criado_em", { ascending: false })
    .range(0, 4999);

  const exportacao = notasCompletas?.map((n: any) => ({
    criado_em: new Date(n.criado_em).toLocaleDateString("pt-BR"),
    numero_nota: n.numero_nota ?? "",
    chave: n.chave ?? "",
    area: n.cargas_cd?.area ?? "Sem área",
    fornecedor: n.fornecedor ?? "Sem fornecedor",
  })) ?? [];

  return NextResponse.json({
    ok: true,
    totalRecebido: totalRecebido ?? 0,
    fornecedores,
    exportacao,
  });
}