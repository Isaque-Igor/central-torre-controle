// app/page.tsx — versão completa
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import KpiCard          from "./components/KpiCard";
import PizzaChart       from "./components/PizzaChart";
import Navbar           from "./components/Navbar";
import SetorChart       from "./components/SetorChart";
import DateFilter       from "./components/DateFilter";
import ItinerarioChart  from "./components/ItinerarioChart";
import TransporteChart from "./components/TransporteChart";

const SETORES = [
  "Expedição Manaus",
  "Expedição Interior Fluvial",
  "Expedição Interior Terrestre",
  "Expedição Interestadual",
  "Transportadora",
  "Outros",
];

interface SetorData {
  SETOR: string;
  planilhados: string;
  concluidos: string;
  insucesso: string;
  pendentes: string;
  total_transportes: string;
  media_nf_viagem: string;
  eficiencia_pct: string;
}

interface ItnData {
  ITINERARIO: string;
  planilhados: string;
  concluidos: string;
  insucesso: string;
  pendentes: string;
  eficiencia_pct: string;
}

function ontemISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export default function LogTower() {
  const [isDark, setIsDark]           = useState(true);
  const [setorAtivo, setSetorAtivo]   = useState("Expedição Manaus");
  const [apiData, setApiData]         = useState<SetorData[]>([]);
  const [itnData, setItnData]         = useState<ItnData[]>([]);
  const [trpData, setTrpData]         = useState<any[]>([]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>("");
  const [loading, setLoading]         = useState(true);
  const [erro, setErro]               = useState<string | null>(null);
  const [inicio, setInicio]           = useState(ontemISO());
  const [fim, setFim]                 = useState(ontemISO());

  // BLOCO RESPONSAVEL PELA ATUALIZAÇÃO ABAIXO
  const carregarDados = useCallback((ini: string, f: string, setor: string) => {
    setLoading(true);
    setErro(null);

    const params = new URLSearchParams({ inicio: ini, fim: f, setor });
    fetch(`/api/expedicao?${params}`)
      .then(r => r.json())
      .then(json => {
        if (json.ok) {
          setApiData(json.data);
          setItnData(json.itinerarios ?? []);
          setTrpData(json.transportadores ?? []);
        } else {
          setErro(json.error);
        }
      })
      .catch(e => setErro(e.message))
      .finally(() => {
        setLoading(false);
        setUltimaAtualizacao(new Date().toLocaleTimeString("pt-BR"));
      });
  }, []); // sem dependências — nunca recria a função

  // refs para acessar os valores atuais dentro do intervalo sem recriar o effect
  const inicioRef   = useRef(inicio);
  const fimRef      = useRef(fim);
  const setorRef    = useRef(setorAtivo);

  useEffect(() => { inicioRef.current = inicio;     }, [inicio]);
  useEffect(() => { fimRef.current    = fim;         }, [fim]);
  useEffect(() => { setorRef.current  = setorAtivo;  }, [setorAtivo]);

  useEffect(() => {
    carregarDados(inicioRef.current, fimRef.current, setorRef.current);

    const intervalo = setInterval(() => {
      carregarDados(inicioRef.current, fimRef.current, setorRef.current);
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalo);
  }, []); // roda só uma vez — o intervalo usa refs para pegar valores atuais

  // BLOCO RESPONSAVEL PELA ATUALIZAÇÃO ACIMA

  const handleDateChange = (ini: string, f: string) => {
    setInicio(ini);
    setFim(f);
    carregarDados(ini, f, setorAtivo);
  };

  const handleSetorChange = (s: string) => {
    setSetorAtivo(s);
    carregarDados(inicio, fim, s);
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setIsDark(saved === "dark");
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  const setor: SetorData = apiData.find(s => s.SETOR === setorAtivo) ?? {
    SETOR: setorAtivo, planilhados: "0", concluidos: "0", insucesso: "0",
    pendentes: "0", total_transportes: "0", media_nf_viagem: "0", eficiencia_pct: "0",
  };

  const plan = Number(setor.planilhados);
  const conc = Number(setor.concluidos);
  const insc = Number(setor.insucesso);
  const pend = Number(setor.pendentes);
  const efic = Number(setor.eficiencia_pct);
  const fmt  = (n: number) => n.toLocaleString("pt-BR");

  return (
    <div className="relative z-10">
      <Navbar isDark={isDark} onToggle={toggleTheme}  ultimaAtualizacao={ultimaAtualizacao} />

      {/* HERO */}
      <div className="p-8 border-b border-[var(--border)] flex justify-between items-end">
        <div>
          <div className="font-mono text-[10px] text-[var(--accent)] tracking-[2px] uppercase mb-1">
            // central logística · torre de controle
          </div>
          <h1 className="font-condensed text-4xl font-bold uppercase text-[var(--text-primary)]">
            Eficiência de <span className="text-[var(--accent)]">Expedição</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-xs mt-2 max-w-lg">
            Monitoramento da performance de entregas, transportadores e itinerários.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-2 flex-wrap justify-end">
            {SETORES.map(s => (
              <button
                key={s}
                onClick={() => handleSetorChange(s)}
                className="font-mono text-[11px] px-3 py-1.5 rounded border transition-all"
                style={{
                  background:  setorAtivo === s ? "rgba(240,165,0,0.15)" : "var(--bg-card)",
                  borderColor: setorAtivo === s ? "var(--accent)"        : "var(--border)",
                  color:       setorAtivo === s ? "var(--accent)"        : "var(--text-secondary)",
                }}
              >
                {s.replace("Expedição ", "EXP. ").toUpperCase()}
              </button>
            ))}
          </div>
          <DateFilter inicio={inicio} fim={fim} onChange={handleDateChange} />
        </div>
      </div>

      {erro && (
        <div className="mx-8 mt-4 px-4 py-3 rounded border border-[var(--red)] bg-[rgba(248,81,73,0.08)] text-[var(--red)] font-mono text-xs">
          ⚠ Erro ao carregar dados: {erro}
        </div>
      )}

      <main className="main">

        {/* KPI CARDS */}
        <div className="kpi-row">
          <KpiCard title="Planilhados"     value={fmt(plan)}             unit="notas fiscais expedidas" type="blue"   loading={loading} />
          <KpiCard title="Concluídos"      value={fmt(conc)}             unit="entregues com sucesso"   type="green"  loading={loading} />
          <KpiCard title="Insucesso"       value={fmt(insc)}             unit="tentativas falhas"       type="red"    loading={loading} />
          <KpiCard title="Pendentes"       value={fmt(pend)}             unit="em rota / aguardando"    type="amber"  loading={loading} />
          <KpiCard title="Média NF/Viagem" value={setor.media_nf_viagem} unit="notas por viagem"        type="purple" loading={loading} />
          <KpiCard
            title="Eficiência"
            value={`${efic.toFixed(1)}%`}
            unit="concluído / planilhado"
            type="teal"
            loading={loading}
            efficiency={{
              label:  efic >= 95 ? "EXCELENTE" : efic >= 85 ? "ATENÇÃO" : "CRÍTICO",
              status: efic >= 95 ? "excelente" : efic >= 85 ? "atencao" : "critico",
            }}
          />
        </div>

        {/* MID ROW — pizza + itinerários + transportes */}
        <div className="mid-row">
          {/* PIZZA */}
          <div className="panel">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div className="panel-title" style={{ margin: 0 }}>Resultado</div>
              <span className="panel-badge">{setorAtivo.replace("Expedição ", "EXP. ").toUpperCase()}</span>
            </div>
            <PizzaChart data={{ plan, conc, insc, pend }} />
          </div>

          {/* ITINERÁRIOS */}
          <div className="panel">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div className="panel-title" style={{ margin: 0 }}>Por Itinerário</div>
              <span className="panel-badge">
                {setorAtivo.replace("Expedição ", "EXP. ").toUpperCase()} · {itnData.length} ITN
              </span>
            </div>
            <ItinerarioChart data={itnData} />
          </div>

          {/* TRANSPORTES */}
          <div className="panel">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div className="panel-title" style={{ margin: 0 }}>Por Transporte</div>
              <span className="panel-badge">
                {setorAtivo.replace("Expedição ", "EXP. ").toUpperCase()} · {trpData.length} TRP
              </span>
            </div>
            <TransporteChart data={trpData} />
          </div>
        </div>

        {/* SETORES — linha completa abaixo */}
        <div className="panel">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div className="panel-title" style={{ margin: 0 }}>Por Setor</div>
            <span className="panel-badge">TODOS OS SETORES</span>
          </div>
          <SetorChart data={apiData} setorAtivo={setorAtivo} />
        </div>

      </main>
    </div>
  );
}