// app/intralogistica/expedicao-interior/page.tsx
"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import KpiCard from "../../components/intralogistica/KpiCard";
import KpiHero from "../../components/intralogistica/KpiHero";
import BarraProgressoFornecedor from "../../components/intralogistica/BarraProgressoFornecedor";
import GraficoFornecedores from "../../components/intralogistica/GraficoFornecedores";
import FiltrosHeader from "../../components/intralogistica/FiltrosHeader";
import PageHeader from "../../components/intralogistica/PageHeader";
import * as XLSX from "xlsx";

interface ApiData {
  totalRecebido: number;
  fornecedores: { nome: string; total: number }[];
  exportacao: {
    criado_em: string; numero_nota: string; chave: string; area: string; fornecedor: string;
  }[];
}

interface CargasData {
  total: number;
  contagem: {
    EM_MONTAGEM: number; FECHADO: number; EM_TRANSITO: number;
    DISPONIVEL_CONFERENCIA: number; CONFERENCIA_PARCIAL: number; CONFERIDA: number;
    DESTINACAO_PARCIAL: number; DESTINADO: number;
  };
  fornecedores: { nome: string; total: number }[];
  progressoConferencia: { nome: string; total: number; concluidas: number; percentual: number }[];
  progressoDestinacao:  { nome: string; total: number; concluidas: number; percentual: number }[];
}

export default function ExpedicaoInterior() {
  const [isDark, setIsDark]       = useState(true);
  const [data, setData]           = useState<ApiData | null>(null);
  const [cargas, setCargas]       = useState<CargasData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState<string | null>(null);
  const [ultimaAtt, setUltimaAtt] = useState("");
  const [dataSel, setDataSel]     = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setIsDark(saved === "dark");
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const carregar = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/intralogistica/interior?data=${dataSel}`).then(r => r.json()),
      fetch(`/api/intralogistica/interior/cargas?data=${dataSel}`).then(r => r.json()),
    ])
      .then(([apiNotas, apiCargas]) => {
        if (apiNotas.ok)  setData(apiNotas);
        if (apiCargas.ok) setCargas(apiCargas);
      })
      .catch(e => setErro(e.message))
      .finally(() => {
        setLoading(false);
        setUltimaAtt(new Date().toLocaleTimeString("pt-BR"));
      });
  };

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, 5 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, [dataSel]);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  const exportarExcel = () => {
    if (!(data?.exportacao?.length ?? 0)) return;
    const linhas = [
      ["Data/Hora", "Nota Fiscal", "Chave", "Área", "Fornecedor"],
      ...data!.exportacao.map(n => [n.criado_em, n.numero_nota, n.chave, n.area, n.fornecedor]),
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(linhas), "Notas");
    XLSX.writeFile(wb, `interior-${dataSel}.xlsx`);
  };

  return (
    <div className="relative z-10">
      <Navbar isDark={isDark} onToggle={toggleTheme} ultimaAtualizacao={ultimaAtt} />

      <PageHeader
        breadcrumb="// intralogística · expedição interior"
        titulo={<>Expedição <span className="text-[var(--accent)]">Interior</span></>}
        subtitulo="Performance de Recebimento e Conferência do dia"
      >
        <FiltrosHeader
          dataSel={dataSel}
          onChangeData={setDataSel}
          onAtualizar={carregar}
          onExportar={exportarExcel}
          exportDisabled={!(data?.exportacao?.length ?? 0)}
        />
      </PageHeader>

      {erro && (
        <div className="mx-8 mt-4 px-4 py-3 rounded border border-[var(--red)] bg-[rgba(248,81,73,0.08)] text-[var(--red)] font-mono text-xs">
          ⚠ Erro: {erro}
        </div>
      )}

      <main className="main">

        {/* SEÇÃO CARGAS */}
        <div style={{ marginTop: 32, marginBottom: 12 }}>
          <div className="font-mono text-[10px] text-[var(--text-muted)] tracking-[2px] uppercase mb-3">
            // Cargas — Fluxo Operacional
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <KpiHero
            label="Total de Cargas"
            value={cargas?.total.toLocaleString("pt-BR") ?? "—"}
            unit="cargas no Interior"
            cor="purple"
            //largura={280}
            loading={loading}
          />
        </div>

        <div className="kpi-row" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
          <KpiCard label="Em Trânsito"        value={cargas?.contagem.EM_TRANSITO            ?? 0} unit="cargas a caminho"      cor="blue"   loading={loading} />
          <KpiCard label="Disp. Conferência"  value={cargas?.contagem.DISPONIVEL_CONFERENCIA ?? 0} unit="aguardando conferência" cor="purple" loading={loading} />
          <KpiCard label="⚠ Conf. Parcial"    value={cargas?.contagem.CONFERENCIA_PARCIAL    ?? 0} unit="conferência em curso"   cor="amber"  loading={loading} />
          <KpiCard label="Conferida"          value={cargas?.contagem.CONFERIDA              ?? 0} unit="conferidas hoje"        cor="green"  loading={loading} />
          <KpiCard label="⚠ Dest. Parcial"    value={cargas?.contagem.DESTINACAO_PARCIAL     ?? 0} unit="destinação em curso"    cor="amber"  loading={loading} />
          <KpiCard label="Destinado"          value={cargas?.contagem.DESTINADO              ?? 0} unit="destinadas hoje"        cor="teal"   loading={loading} />
        </div>

        {/* CARGAS POR FORNECEDOR */}

        <div style={{ marginTop: 16 }}>
          <GraficoFornecedores
            fornecedores={cargas?.fornecedores ?? []}
            isDark={isDark}
            loading={loading}
            badge={`CARGAS · ${dataSel}`}
            titulo="Cargas por Fornecedor"
          />
        </div>

        {/* BARRA DE PROGRESSO */}

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginTop: 16,
        }}>
          <BarraProgressoFornecedor
            titulo="Progresso de Conferência"
            dados={cargas?.progressoConferencia ?? []}
            loading={loading}
            badge={`POR FORNECEDOR · ${dataSel}`}
          />
          <BarraProgressoFornecedor
            titulo="Progresso de Destinação"
            dados={cargas?.progressoDestinacao ?? []}
            loading={loading}
            badge={`POR FORNECEDOR · ${dataSel}`}
          />
        </div>

        {/* SEÇÃO NOTAS */}
        <div style={{ marginBottom: 16, maxWidth: 280  }}>
          <KpiHero
            label="Total Recebido"
            value={data?.totalRecebido.toLocaleString("pt-BR") ?? "—"}
            unit="notas fiscais hoje"
            cor="blue"
            //largura={280}
            //loading={loading}
          />
        </div>

        <GraficoFornecedores
          fornecedores={data?.fornecedores ?? []}
          isDark={isDark}
          loading={loading}
          badge={`TODOS · ${dataSel}`}
        />

      </main>
    </div>
  );
}