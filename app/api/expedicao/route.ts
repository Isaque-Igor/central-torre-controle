// app/api/expedicao/route.ts
import { NextResponse, NextRequest } from "next/server";

const HOST         = process.env.DATABRICKS_HOST;
const TOKEN        = process.env.DATABRICKS_TOKEN;
const PATH         = process.env.DATABRICKS_SQL_HTTP_PATH;
const WAREHOUSE_ID = PATH?.split("/").pop();

async function runQuery(statement: string) {
  const res = await fetch(`${HOST}/api/2.0/sql/statements`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      warehouse_id: WAREHOUSE_ID,
      statement,
      wait_timeout: "30s",
      on_wait_timeout: "CONTINUE",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Databricks HTTP ${res.status}: ${text}`);
  }

  let result = await res.json();
  let attempts = 0;

  while (
    (result.status?.state === "PENDING" || result.status?.state === "RUNNING") &&
    attempts < 30
  ) {
    await new Promise(r => setTimeout(r, 1000));
    attempts++;
    const poll = await fetch(
      `${HOST}/api/2.0/sql/statements/${result.statement_id}`,
      { headers: { "Authorization": `Bearer ${TOKEN}` } }
    );
    result = await poll.json();
  }

  if (result.status?.state !== "SUCCEEDED") {
    throw new Error(`Query falhou: ${JSON.stringify(result.status)}`);
  }

  const cols: string[] = result.manifest.schema.columns.map((c: any) => c.name);
  const rows: any[][]  = result.result.data_array ?? [];
  return rows.map(row => Object.fromEntries(cols.map((col, i) => [col, row[i]])));
}

const SETOR_ITINERARIOS: Record<string, string[]> = {
  "Expedição Manaus": [
    '000001','000002','000003','000004','000005','000006','000007','000008','000009','000010',
    '000011','000012','000013','000014','000015','000016','000017','000018','000019','000020',
    '000021','000022','000023','000024','000025','000026','000027','000028','000029','000030','000031',
  ],
  "Expedição Interior Fluvial": [
    '000834','102023','000858','000811','000846','000839','000851','000814','000838','000859',
    '000815','000819','000857','000823','000824','000812','000910','000830','000841','000863',
    '000831','000842','000821','000833','000822','000816','102017','000820','000862','000860',
    '000806','000853','000852','000837','000827','000840','000845','000810','000861','000835',
    '000832','000825','000826',
  ],
  "Expedição Interior Terrestre": [
    '000805','000849','000817','000803','000813','102019','102012','000829','102013','000804',
    '000850','000847','102014','102015','000802','000807','000809','000808','000828','000848',
  ],
  "Expedição Interestadual": [
    '102022','102010','000865','000856','102021','000818',
  ],
  "Transportadora": [
    '000836','102006','102001','102003','000102','102002','102004','102005','102007','102008','102009',
  ],
};

function buildCaseSetor() {
  return `
    CASE
      WHEN ITINERARIO IN (${SETOR_ITINERARIOS["Expedição Manaus"].map(i => `'${i}'`).join(",")})
        THEN 'Expedição Manaus'
      WHEN ITINERARIO IN (${SETOR_ITINERARIOS["Expedição Interior Fluvial"].map(i => `'${i}'`).join(",")})
        THEN 'Expedição Interior Fluvial'
      WHEN ITINERARIO IN (${SETOR_ITINERARIOS["Expedição Interior Terrestre"].map(i => `'${i}'`).join(",")})
        THEN 'Expedição Interior Terrestre'
      WHEN ITINERARIO IN (${SETOR_ITINERARIOS["Expedição Interestadual"].map(i => `'${i}'`).join(",")})
        THEN 'Expedição Interestadual'
      WHEN ITINERARIO IN (${SETOR_ITINERARIOS["Transportadora"].map(i => `'${i}'`).join(",")})
        THEN 'Transportadora'
      ELSE 'Outros'
    END
  `;
}

function buildBase(inicio: string, fim: string, extraWhere = "") {
  return `
    WITH notas_do_periodo AS (
      SELECT DISTINCT NUMERO_DO_TRANSPORTE, NUMERO_NOTA_FISCAL, SERIES
      FROM cd_bemol.streaming.historico_entregas
      WHERE DATE(DATA_CRIACAO) BETWEEN '${inicio}' AND '${fim}'
        AND TIPO_DO_PROCESSO = 'ENT'
        AND STATUS_DA_ENTREGA = 'PLA'
    ),
    ultimo_status AS (
      SELECT
        n.NUMERO_DO_TRANSPORTE,
        h.NUMERO_NOTA_FISCAL,
        h.SERIES,
        h.STATUS_DA_ENTREGA,
        h.TIPO_HISTORICO,
        h.FORNECIMENTO,
        ROW_NUMBER() OVER (
          PARTITION BY n.NUMERO_DO_TRANSPORTE, h.NUMERO_NOTA_FISCAL, h.SERIES
          ORDER BY h.CHAVE DESC
        ) AS rn
      FROM cd_bemol.streaming.historico_entregas h
      INNER JOIN notas_do_periodo n
        ON h.NUMERO_NOTA_FISCAL = n.NUMERO_NOTA_FISCAL
        AND h.SERIES = n.SERIES
      WHERE h.TIPO_DO_PROCESSO = 'ENT'
    ),
    base AS (
      SELECT
        CONCAT(
          CAST(u.NUMERO_DO_TRANSPORTE AS STRING), '-',
          CAST(u.NUMERO_NOTA_FISCAL AS STRING), '-',
          CAST(u.SERIES AS STRING)
        ) AS NOTA_FISCAL_VBRK,
        u.NUMERO_DO_TRANSPORTE,
        u.STATUS_DA_ENTREGA,
        u.TIPO_HISTORICO,
        LPAD(CAST(f.ITINERARIO AS STRING), 6, '0') AS ITINERARIO
      FROM ultimo_status u
      LEFT JOIN cd_bemol.silver.SD_FORNECIMENTO_CABECALHO f
        ON u.FORNECIMENTO = f.DOCUMENTO_FATURAMENTO
      WHERE u.rn = 1
      ${extraWhere}
    )
  `;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dataInicio = searchParams.get("inicio");
  const dataFim    = searchParams.get("fim");
  const setor      = searchParams.get("setor");

  const hoje  = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  const fmtISO = (d: Date) => d.toISOString().split("T")[0];

  const inicio = dataInicio ?? fmtISO(ontem);
  const fim    = dataFim    ?? fmtISO(ontem);

  const setorFiltro        = setor ?? "Expedição Manaus";
  const itinerariosDoSetor = SETOR_ITINERARIOS[setorFiltro];
  const inClause           = itinerariosDoSetor
    ? itinerariosDoSetor.map(i => `'${i}'`).join(",")
    : "'NENHUM'";

  try {
    // Query 1 — KPIs por setor
    const rowsSetor = await runQuery(`
      ${buildBase(inicio, fim)},
      com_setor AS (
        SELECT *, ${buildCaseSetor()} AS SETOR FROM base
      ),
      planilhados AS (SELECT SETOR, COUNT(DISTINCT NOTA_FISCAL_VBRK) AS qtd FROM com_setor GROUP BY SETOR),
      concluidos  AS (SELECT SETOR, COUNT(DISTINCT NOTA_FISCAL_VBRK) AS qtd FROM com_setor WHERE STATUS_DA_ENTREGA = 'CON' GROUP BY SETOR),
      insucesso   AS (SELECT SETOR, COUNT(DISTINCT NOTA_FISCAL_VBRK) AS qtd FROM com_setor WHERE TIPO_HISTORICO = 'INS' GROUP BY SETOR),
      finalizadas AS (SELECT SETOR, COUNT(DISTINCT NOTA_FISCAL_VBRK) AS qtd FROM com_setor WHERE STATUS_DA_ENTREGA IN ('CON','INS') GROUP BY SETOR),
      transportes AS (SELECT SETOR, COUNT(DISTINCT NUMERO_DO_TRANSPORTE) AS qtd FROM com_setor GROUP BY SETOR)
      SELECT
        p.SETOR,
        p.qtd                                                    AS planilhados,
        COALESCE(c.qtd, 0)                                       AS concluidos,
        COALESCE(i.qtd, 0)                                       AS insucesso,
        GREATEST(p.qtd - COALESCE(f.qtd, 0), 0)                 AS pendentes,
        t.qtd                                                    AS total_transportes,
        ROUND(p.qtd * 1.0 / NULLIF(t.qtd, 0), 1)                AS media_nf_viagem,
        ROUND(COALESCE(c.qtd, 0) * 100.0 / NULLIF(p.qtd, 0), 2) AS eficiencia_pct
      FROM planilhados p
      LEFT JOIN concluidos  c ON p.SETOR = c.SETOR
      LEFT JOIN insucesso   i ON p.SETOR = i.SETOR
      LEFT JOIN finalizadas f ON p.SETOR = f.SETOR
      LEFT JOIN transportes t ON p.SETOR = t.SETOR
      ORDER BY p.SETOR
    `);

    // Query 2 — por itinerário do setor selecionado
    const rowsItn = await runQuery(`
      ${buildBase(inicio, fim, `AND LPAD(CAST(f.ITINERARIO AS STRING), 6, '0') IN (${inClause})`)},
      planilhados AS (SELECT ITINERARIO, COUNT(DISTINCT NOTA_FISCAL_VBRK) AS qtd FROM base GROUP BY ITINERARIO),
      concluidos  AS (SELECT ITINERARIO, COUNT(DISTINCT NOTA_FISCAL_VBRK) AS qtd FROM base WHERE STATUS_DA_ENTREGA = 'CON' GROUP BY ITINERARIO),
      insucesso   AS (SELECT ITINERARIO, COUNT(DISTINCT NOTA_FISCAL_VBRK) AS qtd FROM base WHERE TIPO_HISTORICO = 'INS' GROUP BY ITINERARIO),
      finalizadas AS (SELECT ITINERARIO, COUNT(DISTINCT NOTA_FISCAL_VBRK) AS qtd FROM base WHERE STATUS_DA_ENTREGA IN ('CON','INS') GROUP BY ITINERARIO)
      SELECT
        p.ITINERARIO,
        p.qtd                                                    AS planilhados,
        COALESCE(c.qtd, 0)                                       AS concluidos,
        COALESCE(i.qtd, 0)                                       AS insucesso,
        GREATEST(p.qtd - COALESCE(f.qtd, 0), 0)                 AS pendentes,
        ROUND(COALESCE(c.qtd, 0) * 100.0 / NULLIF(p.qtd, 0), 2) AS eficiencia_pct
      FROM planilhados p
      LEFT JOIN concluidos  c ON p.ITINERARIO = c.ITINERARIO
      LEFT JOIN insucesso   i ON p.ITINERARIO = i.ITINERARIO
      LEFT JOIN finalizadas f ON p.ITINERARIO = f.ITINERARIO
      ORDER BY p.qtd DESC
    `);

    // Query 3 — por transporte do setor selecionado
    const rowsTrp = await runQuery(`
      ${buildBase(inicio, fim, `AND LPAD(CAST(f.ITINERARIO AS STRING), 6, '0') IN (${inClause})`)},
      planilhados AS (SELECT NUMERO_DO_TRANSPORTE, COUNT(DISTINCT NOTA_FISCAL_VBRK) AS qtd FROM base GROUP BY NUMERO_DO_TRANSPORTE),
      concluidos  AS (SELECT NUMERO_DO_TRANSPORTE, COUNT(DISTINCT NOTA_FISCAL_VBRK) AS qtd FROM base WHERE STATUS_DA_ENTREGA = 'CON' GROUP BY NUMERO_DO_TRANSPORTE),
      insucesso   AS (SELECT NUMERO_DO_TRANSPORTE, COUNT(DISTINCT NOTA_FISCAL_VBRK) AS qtd FROM base WHERE TIPO_HISTORICO = 'INS' GROUP BY NUMERO_DO_TRANSPORTE),
      finalizadas AS (SELECT NUMERO_DO_TRANSPORTE, COUNT(DISTINCT NOTA_FISCAL_VBRK) AS qtd FROM base WHERE STATUS_DA_ENTREGA IN ('CON','INS') GROUP BY NUMERO_DO_TRANSPORTE)
      SELECT
        p.NUMERO_DO_TRANSPORTE,
        p.qtd                                                    AS planilhados,
        COALESCE(c.qtd, 0)                                       AS concluidos,
        COALESCE(i.qtd, 0)                                       AS insucesso,
        GREATEST(p.qtd - COALESCE(f.qtd, 0), 0)                 AS pendentes,
        ROUND(COALESCE(c.qtd, 0) * 100.0 / NULLIF(p.qtd, 0), 2) AS eficiencia_pct
      FROM planilhados p
      LEFT JOIN concluidos  c ON p.NUMERO_DO_TRANSPORTE = c.NUMERO_DO_TRANSPORTE
      LEFT JOIN insucesso   i ON p.NUMERO_DO_TRANSPORTE = i.NUMERO_DO_TRANSPORTE
      LEFT JOIN finalizadas f ON p.NUMERO_DO_TRANSPORTE = f.NUMERO_DO_TRANSPORTE
      ORDER BY p.qtd DESC
    `);

    return NextResponse.json({
      ok: true, inicio, fim,
      data:            rowsSetor,
      itinerarios:     rowsItn,
      transportadores: rowsTrp,
    });

  } catch (err: any) {
    console.error("[Databricks] Erro:", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}