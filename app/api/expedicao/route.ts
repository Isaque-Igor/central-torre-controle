import { NextResponse } from "next/server";

const HOST  = process.env.DATABRICKS_HOST;
const TOKEN = process.env.DATABRICKS_TOKEN;
const PATH  = process.env.DATABRICKS_SQL_HTTP_PATH;

export async function GET() {
  try {
    // 1 — submete a query
    const stmtRes = await fetch(`${HOST}/api/2.0/sql/statements`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        warehouse_id: PATH?.split("/").pop(), // pega o ID do warehouse
        statement: `
          SELECT
            COUNT(*)                                      AS planilhados,
            SUM(CASE WHEN status = 'CONCLUIDO'  THEN 1 ELSE 0 END) AS concluidos,
            SUM(CASE WHEN status = 'INSUCESSO'  THEN 1 ELSE 0 END) AS insucesso,
            SUM(CASE WHEN status = 'PENDENTE'   THEN 1 ELSE 0 END) AS pendentes,
            ROUND(AVG(qtd_nf_viagem), 1)                 AS media_nf_viagem
          FROM seu_schema.sua_tabela_expedicao
          WHERE DATE(data_entrega) = CURRENT_DATE()
        `,
        wait_timeout: "30s",
        on_wait_timeout: "CONTINUE",
      }),
    });

    const stmt = await stmtRes.json();

    // 2 — se ainda processando, faz polling
    let result = stmt;
    while (result.status?.state === "PENDING" || result.status?.state === "RUNNING") {
      await new Promise(r => setTimeout(r, 1000));
      const poll = await fetch(`${HOST}/api/2.0/sql/statements/${result.statement_id}`, {
        headers: { "Authorization": `Bearer ${TOKEN}` },
      });
      result = await poll.json();
    }

    if (result.status?.state !== "SUCCEEDED") {
      return NextResponse.json({ error: "Query falhou", detail: result }, { status: 500 });
    }

    // 3 — mapeia as colunas para objeto
    const cols = result.manifest.schema.columns.map((c: any) => c.name);
    const row  = result.result.data_array?.[0] ?? [];
    const data = Object.fromEntries(cols.map((col: string, i: number) => [col, row[i]]));

    return NextResponse.json(data);

  } catch (err) {
    return NextResponse.json({ error: "Erro interno", detail: String(err) }, { status: 500 });
  }
}