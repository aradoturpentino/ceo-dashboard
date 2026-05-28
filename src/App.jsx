import { useState, useRef, useEffect, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";

// ─── DATASET MOCKADO ──────────────────────────────────────────────────────────
const WEEKLY_DATA = [
  { week: "S1 Mar", investimento: 42000, receita: 189000, meta: 18000, google: 16000, tiktok: 8000 },
  { week: "S2 Mar", investimento: 45000, receita: 198000, meta: 19500, google: 17000, tiktok: 8500 },
  { week: "S3 Mar", investimento: 51000, receita: 241000, meta: 22000, google: 19000, tiktok: 10000 },
  { week: "S4 Mar", investimento: 48000, receita: 192000, meta: 21000, google: 18000, tiktok: 9000 },
  { week: "S1 Abr", investimento: 53000, receita: 265000, meta: 23000, google: 20000, tiktok: 10000 },
  { week: "S2 Abr", investimento: 61000, receita: 244000, meta: 28000, google: 21000, tiktok: 12000 },
  { week: "S3 Abr", investimento: 58000, receita: 203000, meta: 26000, google: 22000, tiktok: 10000 },
  { week: "S4 Abr", investimento: 55000, receita: 220000, meta: 24000, google: 21000, tiktok: 10000 },
  { week: "S1 Mai", investimento: 62000, receita: 298000, meta: 27000, google: 24000, tiktok: 11000 },
  { week: "S2 Mai", investimento: 68000, receita: 312000, meta: 30000, google: 26000, tiktok: 12000 },
  { week: "S3 Mai", investimento: 71000, receita: 284000, meta: 33000, google: 25000, tiktok: 13000 },
  { week: "S4 Mai", investimento: 74000, receita: 259000, meta: 35000, google: 25000, tiktok: 14000 },
];

const CAMPAIGNS = [
  { id: "META_01", plataforma: "Meta Ads", nome: "Prospecting Broad — Verão", investimento: 42000, receita: 231000, conversoes: 1540, cpl: 27.27, roas: 5.5, status: "star", tendencia: +12 },
  { id: "META_02", plataforma: "Meta Ads", nome: "Retargeting 7D — Abandono Cart", investimento: 18000, receita: 108000, conversoes: 720, cpl: 25.00, roas: 6.0, status: "star", tendencia: +8 },
  { id: "META_03", plataforma: "Meta Ads", nome: "LAL 5% Compradores", investimento: 31000, receita: 130200, conversoes: 868, cpl: 35.71, roas: 4.2, status: "ok", tendencia: +2 },
  { id: "META_04", plataforma: "Meta Ads", nome: "Black Friday Evergreen", investimento: 55000, receita: 126500, conversoes: 1012, cpl: 54.35, roas: 2.3, status: "saturada", tendencia: -18 },
  { id: "META_05", plataforma: "Meta Ads", nome: "Awareness Branding Q2", investimento: 22000, receita: 44000, conversoes: 293, cpl: 75.09, roas: 2.0, status: "saturada", tendencia: -24 },
  { id: "GOOG_01", plataforma: "Google Ads", nome: "Search Institucional Brand", investimento: 28000, receita: 163800, conversoes: 1092, cpl: 25.64, roas: 5.85, status: "star", tendencia: +5 },
  { id: "GOOG_02", plataforma: "Google Ads", nome: "Search Não-Brand Produtos", investimento: 45000, receita: 202500, conversoes: 1350, cpl: 33.33, roas: 4.5, status: "ok", tendencia: +1 },
  { id: "GOOG_03", plataforma: "Google Ads", nome: "Shopping Smart Catálogo", investimento: 38000, receita: 193800, conversoes: 1292, cpl: 29.41, roas: 5.1, status: "star", tendencia: +7 },
  { id: "GOOG_04", plataforma: "Google Ads", nome: "Display Remarketing GDN", investimento: 19000, receita: 57000, conversoes: 380, cpl: 50.00, roas: 3.0, status: "saturada", tendencia: -11 },
  { id: "TIKT_01", plataforma: "TikTok Ads", nome: "TopView Lançamento Coleção", investimento: 24000, receita: 96000, conversoes: 640, cpl: 37.50, roas: 4.0, status: "ok", tendencia: +4 },
  { id: "TIKT_02", plataforma: "TikTok Ads", nome: "Spark Ads UGC #1", investimento: 18000, receita: 90000, conversoes: 600, cpl: 30.00, roas: 5.0, status: "star", tendencia: +15 },
  { id: "TIKT_03", plataforma: "TikTok Ads", nome: "In-Feed Influencers Pack", investimento: 28000, receita: 70000, conversoes: 467, cpl: 59.95, roas: 2.5, status: "saturada", tendencia: -21 },
];

const PLATFORM_SUMMARY = {
  meta: { nome: "Meta Ads", investimento: 168000, receita: 639700, conversoes: 4433, roas: 3.81, cor: "#1877F2" },
  google: { nome: "Google Ads", investimento: 130000, receita: 617100, conversoes: 4114, roas: 4.75, cor: "#34A853" },
  tiktok: { nome: "TikTok Ads", investimento: 70000, receita: 256000, conversoes: 1707, roas: 3.66, cor: "#010101" },
};

// ─── KPIS ────────────────────────────────────────────────────────────────────
const totalInvest = 368000;
const totalReceita = 1512800;
const blendedROAS = (totalReceita / totalInvest).toFixed(2);
const totalConversoes = 10254;
const cac = (totalInvest / totalConversoes).toFixed(2);

const lastWeek = WEEKLY_DATA[WEEKLY_DATA.length - 1];
const prevWeek = WEEKLY_DATA[WEEKLY_DATA.length - 2];
const receitaDelta = (((lastWeek.receita - prevWeek.receita) / prevWeek.receita) * 100).toFixed(1);
const investDelta = (((lastWeek.investimento - prevWeek.investimento) / prevWeek.investimento) * 100).toFixed(1);

// ─── MOTOR DE RESPOSTAS ───────────────────────────────────────────────────────
function generateResponse(input) {
  const q = input.toLowerCase();
  const saturadas = CAMPAIGNS.filter(c => c.status === "saturada");
  const stars = CAMPAIGNS.filter(c => c.status === "star");
  const totalSaturadaInvest = saturadas.reduce((a, c) => a + c.investimento, 0);

  if (q.includes("diagnóstico") || q.includes("geral") || q.includes("última semana") || q.includes("ultima semana")) {
    return {
      tipo: "diagnostico",
      titulo: "Diagnóstico Geral — Mídia Paga (Última Semana)",
      items: [
        { icone: "⚠️", cor: "amber", texto: `Receita caiu ${Math.abs(receitaDelta)}% vs semana anterior (R$${lastWeek.receita.toLocaleString("pt-BR")} vs R$${prevWeek.receita.toLocaleString("pt-BR")}), enquanto investimento subiu ${Math.abs(investDelta)}%. Sinal claro de ineficiência crescente.` },
        { icone: "📉", cor: "red", texto: `Blended ROAS atual: ${blendedROAS}x. Abaixo do benchmark de 4.5x definido para breakeven sustentável. Meta Ads puxando para baixo com ROAS médio de 3.81x.` },
        { icone: "🔥", cor: "red", texto: `${saturadas.length} campanhas em estado de saturação, queimando R$${totalSaturadaInvest.toLocaleString("pt-BR")} com ROAS < 3.0x. Principal ofensora: ${saturadas[0].nome} (ROAS ${saturadas[0].roas}x, queda de ${Math.abs(saturadas[0].tendencia)}%).` },
        { icone: "✅", cor: "green", texto: `Pontos fortes: Google Search Brand (ROAS 5.85x) e TikTok Spark Ads UGC #1 (ROAS 5.0x, +15% tendência) — candidatos a escala imediata.` },
        { icone: "🎯", cor: "blue", texto: `Ação imediata: Redistribuir R$55k das campanhas saturadas para os canais com ROAS > 5.0x pode recuperar ~R$80-120k de receita incremental sem aumentar budget total.` },
      ]
    };
  }

  if (q.includes("receita caiu") || q.includes("penúltima") || q.includes("penultima") || q.includes("queda")) {
    const semanaQueda = WEEKLY_DATA[WEEKLY_DATA.length - 2];
    const semanaAntes = WEEKLY_DATA[WEEKLY_DATA.length - 3];
    const queda = semanaQueda.receita - semanaAntes.receita;
    return {
      tipo: "causa_raiz",
      titulo: "Análise de Causa Raiz — Queda de Receita (Semana Anterior)",
      items: [
        { icone: "🔍", cor: "amber", texto: `Causa Primária: ROAS do Meta Ads despencou 18% na campanha [META_04 — Black Friday Evergreen]. CPL subiu de R$28 para R$54 em 3 semanas consecutivas — fadiga severa de criativo.` },
        { icone: "💸", cor: "red", texto: `Causa Secundária: [GOOG_04 — Display GDN] com queda de 11% em ROAS. Audiências de remarketing esgotadas — frequência média acima de 8x/usuário/semana.` },
        { icone: "📊", cor: "blue", texto: `Impacto quantificado: Queda de R$${Math.abs(queda).toLocaleString("pt-BR")} na receita da semana. R$${(semanaQueda.meta + semanaQueda.tiktok).toLocaleString("pt-BR")} de budget alocado em canais com ROI negativo naquele período.` },
        { icone: "🚨", cor: "red", texto: `Agravante: TikTok [TIKT_03 — In-Feed Influencers Pack] também em queda (-21%). Pacote de influencers com criativo único há 6+ semanas. Sem rotação, desempenho inevitavelmente colapsa.` },
        { icone: "✅", cor: "green", texto: `Ação Corretiva: Pausar imediatamente META_04 e TIKT_03. Migrar R$30k para META_01 (Prospecting Broad, ROAS 5.5x) e R$15k para GOOG_01 (Search Brand, ROAS 5.85x). Projeção de recuperação: +R$65-90k em 2 semanas.` },
      ]
    };
  }

  if (q.includes("saturaç") || q.includes("desperdício") || q.includes("desperdiçando") || q.includes("saturadas") || q.includes("pausar")) {
    return {
      tipo: "saturacao",
      titulo: "Auditoria de Campanhas Saturadas — Verba em Risco",
      items: saturadas.map(c => ({
        icone: "🔴",
        cor: "red",
        texto: `[${c.id}] ${c.nome} — Investimento: R$${c.investimento.toLocaleString("pt-BR")} | ROAS: ${c.roas}x (${c.tendencia}% de queda) | CPL: R$${c.cpl.toFixed(2)}. Status: PAUSAR IMEDIATAMENTE.`
      })).concat([
        { icone: "💰", cor: "amber", texto: `Total em risco: R$${totalSaturadaInvest.toLocaleString("pt-BR")} investidos em campanhas com retorno abaixo do breakeven. Potencial de recuperação realocando: R$${(totalSaturadaInvest * 4.5).toLocaleString("pt-BR")} em receita estimada.` },
        { icone: "🎯", cor: "blue", texto: `Diagnóstico técnico: Fadiga de criativo (frequência > 6x), esgotamento de audiência e sazonalidade fora de fase são os vetores comuns entre todas as campanhas saturadas listadas.` },
      ])
    };
  }

  if (q.includes("alocar") || q.includes("orçamento") || q.includes("recomendaç") || q.includes("próximo mês") || q.includes("proximo mes") || q.includes("investir")) {
    return {
      tipo: "recomendacao",
      titulo: "Recomendação Estratégica de Alocação — Próximo Mês",
      items: [
        { icone: "📈", cor: "green", texto: `META_01 — Prospecting Broad Verão: Escalar de R$42k → R$65k (+55%). ROAS estável em 5.5x com curva de crescimento positiva (+12%). Janela de escala ainda aberta.` },
        { icone: "📈", cor: "green", texto: `TIKT_02 — Spark Ads UGC #1: Escalar de R$18k → R$35k (+94%). Melhor ROAS incremental do portfólio (5.0x, +15% de tendência). UGC com alta relevância orgânica — custo de aquisição baixo.` },
        { icone: "📈", cor: "green", texto: `GOOG_01 — Search Institucional Brand: Incrementar budget em R$10k/mês. Canal de menor risco (ROAS 5.85x), captura demanda gerada por outras mídias. ROI garantido.` },
        { icone: "🔴", cor: "red", texto: `Desativar: META_04, META_05, GOOG_04, TIKT_03 — R$${(totalSaturadaInvest).toLocaleString("pt-BR")} liberados para realocação imediata em campanhas performantes.` },
        { icone: "🔬", cor: "amber", texto: `Teste obrigatório: Alocar R$15k em novos criativos para META (mínimo 5 variações de vídeo curto ≤ 15s) antes de escalar. Sem renovação criativa, o ciclo de saturação se repete em 4-6 semanas.` },
        { icone: "💡", cor: "blue", texto: `Projeção: Realocação otimizada + novos criativos deve elevar Blended ROAS de ${blendedROAS}x → 4.8-5.2x, representando +R$120-180k de receita incremental sem aumento de budget total.` },
      ]
    };
  }

  if (q.includes("roas") || q.includes("roi")) {
    return {
      tipo: "roas",
      titulo: "Análise de ROAS por Canal",
      items: [
        { icone: "🏆", cor: "green", texto: `Google Ads lidera com ROAS médio de 4.75x — principal driver de eficiência do portfólio. Search Intent captura demanda de alta intenção de compra.` },
        { icone: "⚖️", cor: "amber", texto: `Meta Ads com ROAS de 3.81x — abaixo do benchmark mas com alto volume. Problema: mix de campanhas ruins dilui campanhas excelentes (META_01 com 5.5x e META_04 com 2.3x na mesma média).` },
        { icone: "📊", cor: "blue", texto: `TikTok Ads: ROAS de 3.66x — canal mais jovem, ainda em fase de aprendizado. TIKT_02 (5.0x) prova potencial; TIKT_03 (2.5x) distorce a média negativamente.` },
        { icone: "🎯", cor: "green", texto: `Blended ROAS atual: ${blendedROAS}x. Meta recomendada: 4.5x+. Alcançável em 30 dias com a redistribuição proposta das campanhas saturadas.` },
      ]
    };
  }

  if (q.includes("meta ads") || q.includes("facebook") || q.includes("instagram")) {
    return {
      tipo: "meta",
      titulo: "Deep Dive — Meta Ads Performance",
      items: [
        { icone: "✅", cor: "green", texto: `Destaques: META_01 (ROAS 5.5x, +12%) e META_02 Retargeting 7D (ROAS 6.0x, +8%) — Top performers com potencial de escala imediata. Juntos representam apenas 35% do budget Meta.` },
        { icone: "🔴", cor: "red", texto: `Problemáticas: META_04 Black Friday Evergreen (ROAS 2.3x, -18%) e META_05 Awareness (ROAS 2.0x, -24%). Consomem 46% do budget Meta com retorno destrutivo.` },
        { icone: "💡", cor: "amber", texto: `Diagnóstico criativo: Campanhas rodando com mesmo conjunto de criativos há 8+ semanas. Frequência média subiu para 7.3x — usuários vendo o mesmo anúncio 7 vezes. Fadiga confirmada.` },
        { icone: "🎯", cor: "blue", texto: `Plano de ação: 1) Pausar META_04 e META_05 (R$77k liberados) → 2) Migrar 60% para META_01 e META_02 → 3) Testar 5 novos criativos UGC com R$15k de budget de testes → 4) Revisar em 14 dias.` },
      ]
    };
  }

  return {
    tipo: "geral",
    titulo: "Análise Executiva — CEO Insights",
    items: [
      { icone: "📊", cor: "blue", texto: `Performance consolidada (últimos 3 meses): Investimento total de R$${totalInvest.toLocaleString("pt-BR")} gerando R$${totalReceita.toLocaleString("pt-BR")} em receita. Blended ROAS: ${blendedROAS}x.` },
      { icone: "⚠️", cor: "amber", texto: `Ponto de atenção principal: ${saturadas.length} campanhas saturadas consumindo R$${totalSaturadaInvest.toLocaleString("pt-BR")} com ROAS médio de 2.5x — abaixo do breakeven operacional.` },
      { icone: "✅", cor: "green", texto: `Oportunidade imediata: ${stars.length} campanhas com performance acima da média. Realocação de budget das saturadas para as stars pode gerar +R$120k de receita incremental.` },
      { icone: "💡", cor: "blue", texto: `Pergunte sobre: "diagnóstico geral", "queda de receita", "campanhas saturadas", ou "onde alocar orçamento" para análises detalhadas.` },
    ]
  };
}

// ─── COMPONENTES ──────────────────────────────────────────────────────────────
const fmtBRL = (v) => `R$${Number(v).toLocaleString("pt-BR")}`;
const fmtK = (v) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`;

function KpiCard({ label, value, sub, delta, deltaLabel, accent }) {
  const isPos = parseFloat(delta) > 0;
  const colors = {
    blue: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8", icon: "#3B82F6" },
    green: { bg: "#F0FDF4", border: "#BBF7D0", text: "#15803D", icon: "#22C55E" },
    amber: { bg: "#FFFBEB", border: "#FDE68A", text: "#B45309", icon: "#F59E0B" },
    purple: { bg: "#F5F3FF", border: "#DDD6FE", text: "#6D28D9", icon: "#8B5CF6" },
  };
  const c = colors[accent] || colors.blue;
  return (
    <div style={{
      background: "#FFFFFF",
      border: `1px solid #E5E7EB`,
      borderRadius: 14,
      padding: "18px 20px",
      borderLeft: `4px solid ${c.icon}`,
      display: "flex",
      flexDirection: "column",
      gap: 6,
      flex: 1,
      minWidth: 0,
    }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontSize: 26, fontWeight: 700, color: "#111827", lineHeight: 1.1 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: "#6B7280" }}>{sub}</span>}
      {delta !== undefined && (
        <span style={{ fontSize: 12, fontWeight: 600, color: isPos ? "#15803D" : "#DC2626", display: "flex", alignItems: "center", gap: 3 }}>
          {isPos ? "▲" : "▼"} {Math.abs(delta)}% {deltaLabel}
        </span>
      )}
    </div>
  );
}

function ChatMessage({ msg }) {
  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <div style={{
          background: "#1E40AF",
          color: "#FFF",
          borderRadius: "18px 18px 4px 18px",
          padding: "10px 16px",
          maxWidth: "80%",
          fontSize: 14,
          lineHeight: 1.5,
        }}>{msg.content}</div>
      </div>
    );
  }

  if (msg.role === "typing") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #1E40AF, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#FFF", fontSize: 14 }}>🤖</span>
        </div>
        <div style={{ background: "#F3F4F6", borderRadius: "4px 18px 18px 18px", padding: "12px 16px" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: "50%", background: "#9CA3AF",
                animation: "bounce 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`
              }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { data } = msg;
  if (!data) return null;

  const colorMap = {
    green: { bg: "#F0FDF4", border: "#BBF7D0", text: "#15803D" },
    red: { bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" },
    amber: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
    blue: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8" },
  };

  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "flex-start" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #1E40AF, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
        <span style={{ color: "#FFF", fontSize: 14 }}>🤖</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: "4px 16px 16px 16px", padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ background: "#1E40AF", color: "#FFF", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>BI ANALYTICS</span>
            {data.titulo}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.items.map((item, i) => {
              const c = colorMap[item.cor] || colorMap.blue;
              return (
                <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: "10px 12px", display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icone}</span>
                  <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{item.texto}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const QUICK_QUESTIONS = [
  { label: "Diagnóstico Geral", full: "Qual o diagnóstico geral da nossa mídia paga na última semana?", icon: "📊" },
  { label: "Por que a receita caiu?", full: "Por que nossa receita caiu na penúltima semana do mês passado?", icon: "📉" },
  { label: "Campanhas Saturadas", full: "Quais campanhas estão saturadas e desperdiçando verba?", icon: "🔴" },
  { label: "Onde alocar orçamento?", full: "Onde devemos alocar mais orçamento no próximo mês baseado nos dados?", icon: "🎯" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#1F2937", border: "1px solid #374151", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#F9FAFB" }}>
        <p style={{ fontWeight: 700, marginBottom: 6, color: "#E5E7EB" }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: "2px 0" }}>
            {p.name}: {fmtBRL(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      data: {
        titulo: "Bem-vindo ao CEO Insights Bot",
        items: [
          { icone: "👋", cor: "blue", texto: "Olá! Sou seu assistente de BI executivo. Tenho acesso a 3 meses de dados de mídia paga (Meta, Google e TikTok Ads) e posso traduzir qualquer número em decisão de negócio." },
          { icone: "⚡", cor: "amber", texto: `Alerta imediato: Blended ROAS em ${blendedROAS}x e receita caiu ${Math.abs(receitaDelta)}% na última semana. Existem campanhas críticas para revisar.` },
          { icone: "💡", cor: "green", texto: "Use os botões de acesso rápido abaixo ou me pergunte o que quiser sobre performance, diagnóstico ou alocação de budget." },
        ]
      }
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback((text) => {
    if (!text.trim() || isTyping) return;
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);
    setTimeout(() => {
      const response = generateResponse(text);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: "assistant", data: response }]);
    }, 1200 + Math.random() * 800);
  }, [isTyping]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(inputValue); }
  };

  const roasData = Object.values(PLATFORM_SUMMARY).map(p => ({ name: p.nome.replace(" Ads", ""), roas: p.roas, fill: p.cor }));
  const platformBarData = Object.values(PLATFORM_SUMMARY).map(p => ({
    name: p.nome.replace(" Ads", ""),
    investimento: p.investimento,
    receita: p.receita,
    fill: p.cor
  }));

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, system-ui, sans-serif", background: "#F1F5F9", minHeight: "100vh", padding: "20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        .msg-anim { animation: fadeIn 0.3s ease; }
        .tab-btn { border: none; cursor: pointer; padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; transition: all 0.15s; }
        .tab-btn.active { background: #1E40AF; color: #FFF; }
        .tab-btn:not(.active) { background: transparent; color: #6B7280; }
        .tab-btn:not(.active):hover { background: #F3F4F6; color: #374151; }
        .quick-btn { border: 1px solid #E5E7EB; background: #FFF; border-radius: 10px; padding: 8px 12px; font-size: 12.5px; cursor: pointer; color: #374151; display: flex; align-items: center; gap: 6px; transition: all 0.15s; text-align: left; }
        .quick-btn:hover { background: #EFF6FF; border-color: #93C5FD; color: #1E40AF; }
        .send-btn { background: #1E40AF; color: #FFF; border: none; border-radius: 10px; padding: 10px 18px; font-size: 14px; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; gap: 6px; }
        .send-btn:hover { background: #1D4ED8; }
        .send-btn:disabled { background: #9CA3AF; cursor: not-allowed; }
        .campaign-row:hover { background: #F8FAFC; }
        input:focus { outline: none; }
      `}</style>

      {/* HEADER */}
      <div style={{ background: "#FFF", borderRadius: 16, padding: "16px 24px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, #1E40AF, #7C3AED)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📈</div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>CEO Insights Bot & Dashboard</h1>
            <p style={{ fontSize: 12, color: "#9CA3AF" }}>Mídia Paga · Mar–Mai 2025 · E-Commerce B2C</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ background: "#FEF2F2", color: "#DC2626", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, border: "1px solid #FECACA" }}>
            ⚠️ {saturadas.length} campanhas saturadas
          </span>
          <span style={{ background: "#F0FDF4", color: "#15803D", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, border: "1px solid #BBF7D0" }}>
            ✅ ROAS {blendedROAS}x
          </span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 16, alignItems: "start" }}>

        {/* LEFT — DASHBOARD */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* KPI CARDS */}
          <div style={{ display: "flex", gap: 12 }}>
            <KpiCard label="Investimento Total" value={`R$${(totalInvest / 1000).toFixed(0)}k`} sub="últimos 3 meses" delta={investDelta} deltaLabel="vs sem. ant." accent="blue" />
            <KpiCard label="Receita Total" value={`R$${(totalReceita / 1000).toFixed(0)}k`} sub="últimos 3 meses" delta={receitaDelta} deltaLabel="vs sem. ant." accent="green" />
            <KpiCard label="Blended ROAS" value={`${blendedROAS}x`} sub="meta: 4.5x" delta={receitaDelta} deltaLabel="tendência" accent="purple" />
            <KpiCard label="CAC Médio" value={`R$${cac}`} sub={`${totalConversoes.toLocaleString("pt-BR")} conversões`} accent="amber" />
          </div>

          {/* TABS */}
          <div style={{ background: "#FFF", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px 0", display: "flex", gap: 4, borderBottom: "1px solid #F3F4F6" }}>
              {[["overview", "📊 Tendência"], ["plataformas", "🏢 Plataformas"], ["campanhas", "📋 Campanhas"]].map(([id, label]) => (
                <button key={id} className={`tab-btn ${activeTab === id ? "active" : ""}`} onClick={() => setActiveTab(id)}>{label}</button>
              ))}
            </div>

            <div style={{ padding: 20 }}>
              {activeTab === "overview" && (
                <>
                  <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Investimento vs Receita — 12 Semanas</span>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#6B7280" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 3, background: "#3B82F6", display: "inline-block", borderRadius: 2 }} />Investimento</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 3, background: "#10B981", display: "inline-block", borderRadius: 2 }} />Receita</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={WEEKLY_DATA} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={50} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="investimento" stroke="#3B82F6" strokeWidth={2.5} dot={false} name="Investimento" />
                      <Line type="monotone" dataKey="receita" stroke="#10B981" strokeWidth={2.5} dot={false} name="Receita" />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}

              {activeTab === "plataformas" && (
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>ROAS por Plataforma</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={roasData} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 6]} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v) => [`${v}x`, "ROAS"]} contentStyle={{ background: "#1F2937", border: "none", borderRadius: 8, color: "#F9FAFB", fontSize: 12 }} />
                        <Bar dataKey="roas" radius={[6, 6, 0, 0]}>
                          {roasData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Investimento vs Receita por Canal</div>
                    {Object.values(PLATFORM_SUMMARY).map(p => (
                      <div key={p.nome} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color: "#374151" }}>{p.nome}</span>
                          <span style={{ color: "#6B7280" }}>ROAS {p.roas}x</span>
                        </div>
                        <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden", marginBottom: 3 }}>
                          <div style={{ height: "100%", width: `${(p.investimento / 200000) * 100}%`, background: p.cor, borderRadius: 3, opacity: 0.7 }} />
                        </div>
                        <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(p.receita / 800000) * 100}%`, background: p.cor, borderRadius: 3 }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                          <span>Invest: {fmtBRL(p.investimento)}</span>
                          <span>Receita: {fmtBRL(p.receita)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "campanhas" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr 80px", gap: 8, padding: "6px 8px", fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #F3F4F6", marginBottom: 4 }}>
                    <span>Campanha</span><span>Invest.</span><span>Receita</span><span>ROAS</span><span>CPL</span><span>Status</span>
                  </div>
                  {CAMPAIGNS.map(c => {
                    const statusCfg = {
                      star: { bg: "#FEF9C3", color: "#92400E", label: "⭐ Star" },
                      ok: { bg: "#F0FDF4", color: "#15803D", label: "✅ OK" },
                      saturada: { bg: "#FEF2F2", color: "#DC2626", label: "🔴 Saturada" },
                    }[c.status];
                    return (
                      <div key={c.id} className="campaign-row" style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr 80px", gap: 8, padding: "8px 8px", fontSize: 12, color: "#374151", borderBottom: "1px solid #F9FAFB", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 12 }}>{c.nome}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>{c.plataforma} · {c.id}</div>
                        </div>
                        <span>{fmtBRL(c.investimento)}</span>
                        <span>{fmtBRL(c.receita)}</span>
                        <span style={{ fontWeight: 600, color: c.roas >= 4.5 ? "#15803D" : c.roas < 3 ? "#DC2626" : "#92400E" }}>{c.roas}x</span>
                        <span>R${c.cpl.toFixed(2)}</span>
                        <span style={{ background: statusCfg.bg, color: statusCfg.color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, textAlign: "center", whiteSpace: "nowrap" }}>{statusCfg.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — CHAT */}
        <div style={{ background: "#FFF", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", height: 620 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #1E40AF, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>CEO Insights Bot</div>
              <div style={{ fontSize: 11, color: "#10B981", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, background: "#10B981", borderRadius: "50%", display: "inline-block" }} />
                Conectado · dados em tempo real
              </div>
            </div>
          </div>

          {/* MESSAGES */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
            {messages.map((msg, i) => (
              <div key={i} className="msg-anim"><ChatMessage msg={msg} /></div>
            ))}
            {isTyping && <div className="msg-anim"><ChatMessage msg={{ role: "typing" }} /></div>}
            <div ref={messagesEndRef} />
          </div>

          {/* QUICK QUESTIONS */}
          <div style={{ padding: "8px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {QUICK_QUESTIONS.map((q, i) => (
              <button key={i} className="quick-btn" onClick={() => sendMessage(q.full)} disabled={isTyping}>
                <span>{q.icon}</span>
                <span style={{ fontWeight: 500 }}>{q.label}</span>
              </button>
            ))}
          </div>

          {/* INPUT */}
          <div style={{ padding: "10px 16px 16px", display: "flex", gap: 8 }}>
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Pergunte sobre ROI, Meta Ads, saturação..."
              disabled={isTyping}
              style={{
                flex: 1, border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 14px",
                fontSize: 13, color: "#374151", background: isTyping ? "#F9FAFB" : "#FFF",
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "#93C5FD"}
              onBlur={e => e.target.style.borderColor = "#E5E7EB"}
            />
            <button className="send-btn" onClick={() => sendMessage(inputValue)} disabled={!inputValue.trim() || isTyping}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const saturadas = CAMPAIGNS.filter(c => c.status === "saturada");
