// app/api/intralogistica/marketplace/route.ts
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET(req: NextRequest) {
  const dataParam  = req.nextUrl.searchParams.get("data") ?? new Date().toISOString().split("T")[0];
  const inicioHoje = `${dataParam}T00:00:00.000Z`;
  const fimHoje    = `${dataParam}T23:59:59.999Z`;

  // Total recebido
  const { count: totalRecebido } = await supabase
    .from("notas_fiscais_cd")
    .select("*", { count: "exact", head: true })
    .gte("criado_em", inicioHoje)
    .lt("criado_em", fimHoje);

  // Por área
  const { data: porArea } = await supabase
    .from("notas_fiscais_cd")
    .select("cargas_cd(area)")
    .gte("criado_em", inicioHoje)
    .lt("criado_em", fimHoje)
    .not("carga_id", "is", null);

  const areaCount: Record<string, number> = { Manaus: 0, Interior: 0, Interestadual: 0 };
  porArea?.forEach((n: any) => {
    const area = n.cargas_cd?.area;
    if (area && areaCount[area] !== undefined) areaCount[area]++;
  });

  // Por fornecedor
  const { data: porFornecedor } = await supabase
    .from("notas_fiscais_cd")
    .select("fornecedor")
    .gte("criado_em", inicioHoje)
    .lt("criado_em", fimHoje);

  const fornecedorCount: Record<string, number> = {};
  porFornecedor?.forEach((n: any) => {
    const f = n.fornecedor ?? "Sem fornecedor";
    fornecedorCount[f] = (fornecedorCount[f] ?? 0) + 1;
  });

  const fornecedores = Object.entries(fornecedorCount)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 15);

  // Exportação
  const { data: notasCompletas } = await supabase
    .from("notas_fiscais_cd")
    .select(`criado_em, numero_nota, chave, fornecedor, cargas_cd(area)`)
    .gte("criado_em", inicioHoje)
    .lt("criado_em", fimHoje)
    .order("criado_em", { ascending: false });

  const exportacao = notasCompletas?.map((n: any) => ({
    criado_em: new Date(n.criado_em).toLocaleString("pt-BR"),
    numero_nota: n.numero_nota ?? "",
    chave: n.chave ?? "",
    area: n.cargas_cd?.area ?? "Sem área",
    fornecedor: n.fornecedor ?? "Sem fornecedor",
  })) ?? [];

  return NextResponse.json({
    ok: true,
    totalRecebido: totalRecebido ?? 0,
    porArea: areaCount,
    fornecedores,
    exportacao,
  });
}