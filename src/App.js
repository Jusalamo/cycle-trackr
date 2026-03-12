import { useState, useEffect, useCallback, useRef } from "react";

// ─── BRAND SYSTEM ─────────────────────────────────────────────────────────────

const B = {
  // Core palette
  bg:      "#09090f",
  surface: "#13131f",
  card:    "#1a1a2e",
  border:  "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.15)",

  // Text
  textPrimary:   "#f0eeff",
  textSecondary: "rgba(240,238,255,0.55)",
  textMuted:     "rgba(240,238,255,0.28)",

  // Brand accent
  lavender: "#9b87f5",
  lavenderDim: "rgba(155,135,245,0.15)",

  // Fonts
  serif: "'Playfair Display', Georgia, serif",
  sans:  "'Inter', 'Outfit', system-ui, sans-serif",

  // Radii
  r: { sm: 10, md: 14, lg: 20, xl: 24, pill: 999 },

  // Shadows
  shadow: {
    card: "0 4px 24px rgba(0,0,0,0.5)",
    glow: (col) => `0 0 28px ${col}40`,
    btn:  (col) => `0 6px 20px ${col}55`,
  },

  // Transitions
  tx: "all 0.18s ease",
  txSlow: "all 0.3s ease",
};

// Phase definitions — single source of truth
const PHASES = {
  menstruation: {
    label: "Menstruation", short: "Period", key: "menstruation",
    color: "#f472b6", dim: "rgba(244,114,182,0.12)", bg: "#1f0d17",
    emoji: "🔴", days: [1, 5], icon: "●",
  },
  follicular: {
    label: "Follicular", short: "Follicular", key: "follicular",
    color: "#fbbf24", dim: "rgba(251,191,36,0.12)", bg: "#1f1a0a",
    emoji: "🌱", days: [6, 13], icon: "◐",
  },
  ovulation: {
    label: "Ovulation", short: "Ovulation", key: "ovulation",
    color: "#34d399", dim: "rgba(52,211,153,0.12)", bg: "#0a1f17",
    emoji: "⚡", days: [14, 16], icon: "◉",
  },
  luteal: {
    label: "Luteal", short: "Luteal", key: "luteal",
    color: "#a78bfa", dim: "rgba(167,139,250,0.12)", bg: "#130f1f",
    emoji: "🌙", days: [17, 28], icon: "◑",
  },
};

const TIPS = {
  menstruation: { safe: false, risk: "HIGH RISK",  energy: "Low",     mood: "Variable",      libido: "Low",    note: "Active shedding. Avoid unprotected sex. She may feel fatigued and crampy — be extra caring." },
  follicular:   { safe: true,  risk: "LOWER RISK", energy: "Rising",  mood: "Positive",      libido: "Rising", note: "Rising estrogen boosts mood and energy. Lower pregnancy risk but increases toward ovulation." },
  ovulation:    { safe: false, risk: "PEAK RISK",  energy: "Peak",    mood: "Flirty/Social", libido: "Peak",   note: "Peak fertility window. Highest pregnancy risk of the entire cycle. Unprotected sex strongly inadvisable." },
  luteal:       { safe: true,  risk: "LOWER RISK", energy: "Falling", mood: "Introspective", libido: "Medium", note: "Post-ovulation. Progesterone rises — she may feel more emotional, bloated, or withdrawn." },
};

const SYMPTOMS = [
  "Cramps","Bloating","Mood swings","Headache","Fatigue","Tender breasts",
  "Spotting","Back pain","Nausea","High libido","Low libido","Irritability",
  "Anxiety","Clear discharge","PMS","Acne","Insomnia","Food cravings",
];

const AVATARS = ["🌸","💜","🌙","🦋","🌺","✨","💎","🌹","🔮","🌊","🍒","🌷"];
const CARD_ACCENTS = ["#9b87f5","#fbbf24","#f472b6","#34d399","#60a5fa","#fb923c"];

// ─── GLOBAL STYLES (injected once) ───────────────────────────────────────────

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #09090f; color: #f0eeff; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
  input, textarea, button { font-family: inherit; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(155,135,245,0.3); border-radius: 2px; }

  @keyframes fadeIn    { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeInUp  { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulseRing { 0%,100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.06); opacity: 1; } }
  @keyframes spin      { to { transform: rotate(360deg); } }
  @keyframes shimmer   { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes floatBlob { 0%,100% { transform: translate(0,0) rotate(0deg); } 33% { transform: translate(10px,-15px) rotate(3deg); } 66% { transform: translate(-8px,8px) rotate(-2deg); } }

  .fade-in  { animation: fadeIn  0.3s ease both; }
  .fade-in-1 { animation: fadeIn 0.3s 0.05s ease both; }
  .fade-in-2 { animation: fadeIn 0.3s 0.10s ease both; }
  .fade-in-3 { animation: fadeIn 0.3s 0.15s ease both; }
  .fade-in-4 { animation: fadeIn 0.3s 0.20s ease both; }

  .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.6) !important; }

  .btn-hover { transition: all 0.15s ease; }
  .btn-hover:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); }
  .btn-hover:active:not(:disabled) { transform: translateY(0); filter: brightness(0.95); }

  .tab-btn { transition: all 0.18s ease; }
  .sym-btn { transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease; }
  .sym-btn:hover { filter: brightness(1.1); }

  .input-field { transition: border-color 0.15s ease, box-shadow 0.15s ease; }
  .input-field:focus { border-color: rgba(155,135,245,0.5) !important; box-shadow: 0 0 0 3px rgba(155,135,245,0.12) !important; }
`;

function GlobalStyles() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getDayOfCycle(lastPeriodStart, cycleLength = 28) {
  const diff = Math.floor((new Date() - new Date(lastPeriodStart)) / 86400000);
  return ((diff % cycleLength) + cycleLength) % cycleLength + 1;
}
function getPhaseFromDay(day) {
  if (day <= 5) return "menstruation";
  if (day <= 13) return "follicular";
  if (day <= 16) return "ovulation";
  return "luteal";
}
function getNextPeriod(lps, cl = 28) {
  let n = new Date(lps);
  const t = new Date();
  while (n <= t) n.setDate(n.getDate() + cl);
  return n;
}
function getOvulation(lps, cl = 28) {
  let o = new Date(lps);
  o.setDate(o.getDate() + 13);
  const t = new Date();
  while (o < t) o.setDate(o.getDate() + cl);
  return o;
}
function daysUntil(d) { return Math.ceil((new Date(d) - new Date()) / 86400000); }
function fmtDate(d)   { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
function todayStr()   { return new Date().toISOString().split("T")[0]; }

// ─── REUSABLE PRIMITIVES ──────────────────────────────────────────────────────

function Card({ children, style = {}, className = "", onClick }) {
  return (
    <div
      className={`card-hover ${className}`}
      onClick={onClick}
      style={{
        background: B.card,
        border: `1px solid ${B.border}`,
        borderRadius: B.r.xl,
        padding: 20,
        boxShadow: B.shadow.card,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", color, disabled, style = {}, className = "" }) {
  const base = {
    border: "none", borderRadius: B.r.pill, fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer", fontFamily: B.sans,
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    transition: B.tx, opacity: disabled ? 0.45 : 1,
    padding: "10px 20px", fontSize: 13,
  };
  const c = color || B.lavender;
  const variants = {
    primary:  { background: c, color: "#0d0d1a", boxShadow: B.shadow.btn(c) },
    secondary:{ background: "rgba(255,255,255,0.07)", color: B.textSecondary, border: `1px solid ${B.border}` },
    ghost:    { background: "transparent", color: B.textMuted, border: `1px solid ${B.border}` },
    danger:   { background: "rgba(244,114,182,0.15)", color: "#f472b6", border: "1px solid rgba(244,114,182,0.3)" },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`btn-hover ${className}`}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

function Label({ children, style = {} }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.8, color: B.textMuted, textTransform: "uppercase", marginBottom: 8, ...style }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: B.border, margin: "16px 0" }} />;
}

function Spinner({ color = B.lavender }) {
  return (
    <div style={{
      width: 14, height: 14, borderRadius: "50%",
      border: `2px solid ${color}40`,
      borderTopColor: color,
      animation: "spin 0.7s linear infinite",
      display: "inline-block",
    }} />
  );
}

// ─── BACKGROUND DECOR ─────────────────────────────────────────────────────────

function BgDecor({ phase }) {
  const c = PHASES[phase || "luteal"].color;
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{
        position: "absolute", top: -120, right: -100, width: 400, height: 400,
        borderRadius: "60% 40% 55% 45% / 45% 55% 40% 60%",
        background: c + "14", animation: "floatBlob 14s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: 80, left: -80, width: 280, height: 280,
        borderRadius: "50% 60% 40% 55%", background: B.lavender + "0a",
        animation: "floatBlob 18s ease-in-out infinite reverse",
      }} />
      <div style={{
        position: "absolute", top: "40%", right: "8%", width: 120, height: 120,
        borderRadius: "50%", background: c + "08",
        animation: "floatBlob 22s ease-in-out infinite 5s",
      }} />
      {/* Subtle grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(155,135,245,0.04) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      }} />
    </div>
  );
}

// ─── CYCLE RING ───────────────────────────────────────────────────────────────

function CycleRing({ day, cycleLength, size = 200, glowing = false }) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.35, strokeW = size * 0.09;
  const circ = 2 * Math.PI * r;
  const phase = getPhaseFromDay(day);

  const segs = [
    { key: "menstruation", start: 0,  end: 5,          color: "#f472b6" },
    { key: "follicular",   start: 5,  end: 13,         color: "#fbbf24" },
    { key: "ovulation",    start: 13, end: 16,         color: "#34d399" },
    { key: "luteal",       start: 16, end: cycleLength, color: "#a78bfa" },
  ];

  function sp(s, e) {
    const sa = (s / cycleLength) * 2 * Math.PI - Math.PI / 2;
    const dl = ((e - s) / cycleLength) * circ - 4;
    const off = -(sa / (2 * Math.PI)) * circ;
    return { dl, gap: circ - dl, off };
  }

  const da = ((day - 1) / cycleLength) * 2 * Math.PI - Math.PI / 2;
  const dx = cx + r * Math.cos(da), dy = cy + r * Math.sin(da);
  const curColor = PHASES[phase].color;

  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeW} />
      {/* Segments */}
      {segs.map(seg => {
        const { dl, gap, off } = sp(seg.start, seg.end);
        const cur = phase === seg.key;
        return (
          <circle key={seg.key} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={cur ? strokeW + 2 : strokeW}
            strokeDasharray={`${dl} ${gap}`} strokeDashoffset={off}
            strokeLinecap="round" opacity={cur ? 1 : 0.18}
            filter={cur && glowing ? "url(#glow)" : undefined}
          />
        );
      })}
      {/* Day dot */}
      <circle cx={dx} cy={dy} r={size * 0.06} fill="white" />
      <circle cx={dx} cy={dy} r={size * 0.035} fill={curColor} />
      {/* Center */}
      <text x={cx} y={cy - 10} textAnchor="middle" fill={B.textPrimary}
        fontSize={size * 0.15} fontWeight={800} fontFamily={B.serif}>{day}</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill={B.textMuted}
        fontSize={size * 0.065} fontFamily={B.sans}>of {cycleLength}</text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill={curColor}
        fontSize={size * 0.072} fontWeight={700} fontFamily={B.sans}>{PHASES[phase].short}</text>
    </svg>
  );
}

// ─── MONTH CALENDAR ───────────────────────────────────────────────────────────

function MonthCalendar({ profile, monthOffset = 0 }) {
  const base = new Date();
  base.setMonth(base.getMonth() + monthOffset);
  const year = base.getFullYear(), month = base.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isThisMonth = today.getFullYear() === year && today.getMonth() === month;

  function phaseForDay(d) {
    const date = new Date(year, month, d);
    const diff = Math.floor((date - new Date(profile.lastPeriodStart)) / 86400000);
    const cd = ((diff % profile.cycleLength) + profile.cycleLength) % profile.cycleLength + 1;
    return getPhaseFromDay(cd);
  }

  function isIntimacy(d) {
    const s = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return (profile.intimacyLog || []).includes(s);
  }

  return (
    <div>
      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 6 }}>
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: B.textMuted, padding: "3px 0" }}>{d}</div>
        ))}
      </div>
      {/* Days grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {Array(firstDay).fill(null).map((_, i) => <div key={"e" + i} />)}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const d = i + 1;
          const ph = phaseForDay(d);
          const col = PHASES[ph].color;
          const isToday = isThisMonth && d === today.getDate();
          const hasI = isIntimacy(d);
          return (
            <div key={d} style={{
              aspectRatio: "1", borderRadius: 8, position: "relative",
              background: isToday ? col : col + "1a",
              border: `1px solid ${isToday ? col : col + "35"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: isToday ? `0 0 12px ${col}50` : "none",
            }}>
              <span style={{ fontSize: 10, color: isToday ? "#111" : B.textSecondary, fontWeight: isToday ? 700 : 400 }}>{d}</span>
              {hasI && <span style={{ position: "absolute", top: 1, right: 1, fontSize: 6, lineHeight: 1 }}>💕</span>}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${B.border}` }}>
        {Object.values(PHASES).map(v => (
          <div key={v.key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: v.color }} />
            <span style={{ fontSize: 10, color: B.textMuted }}>{v.short}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 10 }}>💕</span>
          <span style={{ fontSize: 10, color: B.textMuted }}>Intimacy</span>
        </div>
      </div>
    </div>
  );
}

// ─── AI INSIGHT ───────────────────────────────────────────────────────────────

function AIInsight({ profile }) {
  const [text, setText]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(false);

  const day   = getDayOfCycle(profile.lastPeriodStart, profile.cycleLength);
  const phase = getPhaseFromDay(day);
  const PD    = PHASES[phase];

  const generate = useCallback(async () => {
    setLoading(true); setText(""); setError(false);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          system: "You are a frank reproductive health advisor. Give concise insights under 90 words. Be direct and plain. Start with one relevant emoji. End with either ✅ Safe or ⚠️ Caution for unprotected sex.",
          messages: [{
            role: "user",
            content: `Partner: ${profile.name}. Cycle day ${day} of ${profile.cycleLength} (${phase}). Symptoms: ${(profile.symptoms||[]).join(", ")||"none"}. Sessions: ${(profile.intimacyLog||[]).length}. Period in: ${daysUntil(getNextPeriod(profile.lastPeriodStart,profile.cycleLength))}d. Ovulation in: ${daysUntil(getOvulation(profile.lastPeriodStart,profile.cycleLength))}d. Give insight.`,
          }],
        }),
      });
      const d = await res.json();
      setText(d.content?.[0]?.text || "Could not generate insight.");
    } catch {
      setError(true);
      setText("AI unavailable. Check your connection and try again.");
    }
    setLoading(false);
  }, [profile, day, phase]);

  return (
    <div style={{
      background: `linear-gradient(135deg, ${PD.color}0d, ${B.card})`,
      border: `1px solid ${PD.color}30`,
      borderRadius: B.r.xl, padding: 20, marginTop: 4,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: PD.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✦</div>
          <Label style={{ marginBottom: 0, color: PD.color }}>AI Insight</Label>
        </div>
        <Btn
          onClick={generate}
          disabled={loading}
          color={PD.color}
          style={{ padding: "6px 16px", fontSize: 12 }}
        >
          {loading ? <><Spinner color="#0d0d1a" /> Thinking…</> : "Generate"}
        </Btn>
      </div>
      {text ? (
        <p style={{ fontSize: 13, color: error ? "#f472b6" : B.textSecondary, lineHeight: 1.75, margin: 0 }}>{text}</p>
      ) : (
        <p style={{ fontSize: 12, color: B.textMuted, margin: 0, fontStyle: "italic", lineHeight: 1.6 }}>
          Generate a personalized AI insight based on her current cycle phase, symptoms, and history.
        </p>
      )}
    </div>
  );
}

// ─── PROFILE DETAIL ───────────────────────────────────────────────────────────

function ProfileDetail({ profile, onUpdate, onBack, onDelete }) {
  const [tab,           setTab]           = useState("overview");
  const [monthOffset,   setMonthOffset]   = useState(0);
  const [editSym,       setEditSym]       = useState(false);
  const [showLogModal,  setShowLogModal]  = useState(false);
  const [logDate,       setLogDate]       = useState(todayStr());
  const [showDelModal,  setShowDelModal]  = useState(false);
  const [periodFlash,   setPeriodFlash]   = useState(false);

  const day    = getDayOfCycle(profile.lastPeriodStart, profile.cycleLength);
  const phase  = getPhaseFromDay(day);
  const PD     = PHASES[phase];
  const tips   = TIPS[phase];
  const nextP  = getNextPeriod(profile.lastPeriodStart, profile.cycleLength);
  const nextO  = getOvulation(profile.lastPeriodStart, profile.cycleLength);
  const dToP   = daysUntil(nextP);
  const dToO   = daysUntil(nextO);

  const calLabel = (() => {
    const b = new Date(); b.setMonth(b.getMonth() + monthOffset);
    return b.toLocaleString("default", { month: "long", year: "numeric" });
  })();

  function toggleSym(s) {
    const cur = profile.symptoms || [];
    onUpdate({ ...profile, symptoms: cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s] });
  }
  function logIntimacy() {
    const cur = profile.intimacyLog || [];
    if (!cur.includes(logDate)) onUpdate({ ...profile, intimacyLog: [...cur, logDate].sort() });
    setShowLogModal(false);
  }
  function removeIntimacy(d) {
    onUpdate({ ...profile, intimacyLog: (profile.intimacyLog || []).filter(x => x !== d) });
  }
  function markPeriodToday() {
    onUpdate({ ...profile, lastPeriodStart: todayStr() });
    setPeriodFlash(true);
    setTimeout(() => setPeriodFlash(false), 2000);
  }

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: `1px solid ${B.border}`, borderRadius: B.r.md,
    padding: "12px 16px", color: B.textPrimary, fontSize: 14,
    outline: "none", display: "block",
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "calendar", label: "Calendar" },
    { id: "log",      label: "Log"      },
    { id: "insights", label: "Insights" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: B.bg, color: B.textPrimary, fontFamily: B.sans }}>
      <BgDecor phase={phase} />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 500, margin: "0 auto", padding: "0 18px 100px" }}>

        {/* ── TOP BAR ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0 14px", gap: 8 }}>
          <Btn variant="secondary" onClick={onBack} style={{ padding: "8px 16px", fontSize: 13 }}>← Back</Btn>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" onClick={() => onUpdate({ ...profile, hidden: !profile.hidden })} style={{ padding: "8px 14px", fontSize: 12 }}>
              {profile.hidden ? "👁 Show" : "🙈 Hide"}
            </Btn>
            <Btn variant="danger" onClick={() => setShowDelModal(true)} style={{ padding: "8px 14px", fontSize: 12 }}>
              🗑 Delete
            </Btn>
          </div>
        </div>

        {/* ── HERO CARD ── */}
        <div className="fade-in" style={{ position: "relative", marginBottom: 16 }}>
          {/* Floating accent blob */}
          <div style={{ position: "absolute", top: -20, right: -20, width: 140, height: 140, borderRadius: "60% 40% 55% 45%", background: PD.color + "18", pointerEvents: "none", zIndex: -1 }} />
          <Card style={{ border: `1px solid ${PD.color}30`, background: `linear-gradient(135deg, ${PD.bg}, ${B.card})`, padding: 22, marginBottom: 0 }}>
            {/* Name row */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div style={{
                width: 68, height: 68, borderRadius: 20, flexShrink: 0,
                background: `linear-gradient(135deg, ${PD.color}33, ${PD.color}11)`,
                border: `2px solid ${PD.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
              }}>{profile.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontFamily: B.serif, fontSize: 24, fontWeight: 700, margin: "0 0 6px", color: B.textPrimary, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile.name}
                </h2>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: PD.color + "1a", borderRadius: B.r.pill, padding: "4px 12px", border: `1px solid ${PD.color}30` }}>
                  <span style={{ fontSize: 11 }}>{PD.emoji}</span>
                  <span style={{ fontSize: 12, color: PD.color, fontWeight: 600 }}>{PD.label} · Day {day} of {profile.cycleLength}</span>
                </div>
              </div>
              <CycleRing day={day} cycleLength={profile.cycleLength} size={76} />
            </div>

            {/* Risk banner */}
            <div style={{
              background: tips.safe ? "rgba(52,211,153,0.08)" : "rgba(244,114,182,0.08)",
              border: `1px solid ${tips.safe ? "#34d39940" : "#f472b640"}`,
              borderRadius: B.r.lg, padding: "12px 16px",
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{tips.safe ? "✅" : "⚠️"}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.8, color: tips.safe ? "#34d399" : "#f472b6", marginBottom: 4 }}>
                  {tips.risk}
                </div>
                <div style={{ fontSize: 12, color: B.textSecondary, lineHeight: 1.65 }}>{tips.note}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── TABS ── */}
        <div className="fade-in-1" style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: B.r.pill, padding: 4, marginBottom: 20, border: `1px solid ${B.border}`, gap: 2 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="tab-btn"
              style={{
                flex: 1, border: "none", borderRadius: B.r.pill, padding: "9px 4px",
                background: tab === t.id ? PD.color : "transparent",
                color: tab === t.id ? "#111" : B.textMuted,
                fontSize: 12, fontWeight: tab === t.id ? 700 : 500,
                cursor: "pointer", fontFamily: B.sans,
                boxShadow: tab === t.id ? `0 2px 10px ${PD.color}40` : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ═════════════ OVERVIEW ═════════════ */}
        {tab === "overview" && (
          <div className="fade-in">
            {/* Cycle ring */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24, animation: "pulseRing 4s ease-in-out infinite" }}>
              <CycleRing day={day} cycleLength={profile.cycleLength} size={220} glowing />
            </div>

            {/* 4 stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[
                { label: "Period in",  val: dToP <= 0 ? "Today" : `${dToP}d`,  sub: fmtDate(nextP),     color: "#f472b6", bg: PHASES.menstruation.bg },
                { label: "Ovulation",  val: dToO <= 0 ? "Now!" : dToO === 1 ? "Tmrw" : `${dToO}d`, sub: fmtDate(nextO), color: "#34d399", bg: PHASES.ovulation.bg },
                { label: "Energy",     val: tips.energy,   sub: "Current phase",  color: "#fbbf24", bg: PHASES.follicular.bg },
                { label: "Mood",       val: tips.mood,     sub: "Expected",       color: "#a78bfa", bg: PHASES.luteal.bg },
              ].map((s, i) => (
                <div key={s.label} className={`fade-in-${i + 1}`} style={{
                  background: s.bg, border: `1px solid ${s.color}28`,
                  borderRadius: B.r.xl, padding: "16px 18px",
                }}>
                  <Label style={{ color: s.color + "99" }}>{s.label}</Label>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: B.serif, marginBottom: 3, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: B.textMuted }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Libido bar */}
            <div style={{ background: B.card, border: `1px solid ${B.border}`, borderRadius: B.r.lg, padding: "12px 18px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Label style={{ marginBottom: 0 }}>Libido</Label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {["Low","Medium","Rising","Peak","Falling"].map(l => (
                  <div key={l} style={{ width: 28, height: 6, borderRadius: 3, background: tips.libido === l ? PD.color : B.border, transition: B.tx }} />
                ))}
                <span style={{ fontSize: 12, fontWeight: 600, color: PD.color, marginLeft: 4 }}>{tips.libido}</span>
              </div>
            </div>

            {/* Symptoms */}
            <Card style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <Label style={{ marginBottom: 0 }}>Symptoms</Label>
                <Btn variant="ghost" onClick={() => setEditSym(!editSym)} style={{ padding: "5px 14px", fontSize: 11 }}>
                  {editSym ? "✓ Done" : "Edit"}
                </Btn>
              </div>
              {editSym ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {SYMPTOMS.map(s => {
                    const on = (profile.symptoms || []).includes(s);
                    return (
                      <button key={s} onClick={() => toggleSym(s)} className="sym-btn" style={{
                        background: on ? PD.color + "25" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${on ? PD.color + "60" : B.border}`,
                        borderRadius: B.r.pill, padding: "6px 13px",
                        color: on ? PD.color : B.textMuted, fontSize: 12, cursor: "pointer",
                      }}>{s}</button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {(profile.symptoms || []).length === 0
                    ? <span style={{ fontSize: 12, color: B.textMuted, fontStyle: "italic" }}>None logged — tap Edit to add symptoms.</span>
                    : (profile.symptoms || []).map(s => (
                      <span key={s} style={{ background: PD.color + "1a", border: `1px solid ${PD.color}35`, borderRadius: B.r.pill, padding: "5px 13px", fontSize: 12, color: PD.color }}>{s}</span>
                    ))
                  }
                </div>
              )}
            </Card>

            {/* Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <Btn
                color={periodFlash ? "#34d399" : "#f472b6"}
                onClick={markPeriodToday}
                style={{ width: "100%", padding: "15px 12px", fontSize: 13, justifyContent: "center", borderRadius: B.r.lg }}
              >
                {periodFlash ? "✓ Saved!" : "🔴 Period Started"}
              </Btn>
              <Btn
                color={B.lavender}
                onClick={() => setShowLogModal(true)}
                style={{ width: "100%", padding: "15px 12px", fontSize: 13, justifyContent: "center", borderRadius: B.r.lg }}
              >
                💕 Log Intimacy
              </Btn>
            </div>

            <AIInsight profile={profile} />
          </div>
        )}

        {/* ═════════════ CALENDAR ═════════════ */}
        {tab === "calendar" && (
          <div className="fade-in">
            {/* Month nav */}
            <Card style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <button onClick={() => setMonthOffset(m => m - 1)} style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: `1px solid ${B.border}`, color: B.textPrimary, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: B.tx }} className="btn-hover">‹</button>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, fontFamily: B.serif, color: B.textPrimary }}>{calLabel}</div>
                  {monthOffset !== 0 && (
                    <button onClick={() => setMonthOffset(0)} style={{ background: "none", border: "none", color: PD.color, fontSize: 11, cursor: "pointer", marginTop: 3, fontFamily: B.sans, textDecoration: "underline" }}>
                      Today
                    </button>
                  )}
                </div>
                <button onClick={() => setMonthOffset(m => m + 1)} style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: `1px solid ${B.border}`, color: B.textPrimary, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: B.tx }} className="btn-hover">›</button>
              </div>
              <MonthCalendar profile={profile} monthOffset={monthOffset} />
            </Card>

            {/* Upcoming events */}
            <Card style={{ marginBottom: 14 }}>
              <Label>Upcoming Events</Label>
              {[
                { label: "Next Period",  date: nextP, color: "#f472b6", emoji: "🔴" },
                { label: "Ovulation",   date: nextO, color: "#34d399", emoji: "⚡" },
              ].map((ev, i) => (
                <div key={ev.label}>
                  {i > 0 && <Divider />}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: ev.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{ev.emoji}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: B.textPrimary }}>{ev.label}</div>
                        <div style={{ fontSize: 11, color: B.textMuted }}>{fmtDate(ev.date)}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: ev.color, fontFamily: B.serif }}>{daysUntil(ev.date)}d</div>
                      <div style={{ fontSize: 10, color: B.textMuted }}>away</div>
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            {/* Intimacy log */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <Label style={{ marginBottom: 2 }}>Intimacy Log</Label>
                  <div style={{ fontSize: 11, color: B.textMuted }}>{(profile.intimacyLog || []).length} session{(profile.intimacyLog || []).length !== 1 ? "s" : ""} recorded</div>
                </div>
                <Btn color={B.lavender} onClick={() => setShowLogModal(true)} style={{ padding: "7px 16px", fontSize: 12 }}>+ Add</Btn>
              </div>
              {(profile.intimacyLog || []).length === 0
                ? <p style={{ fontSize: 12, color: B.textMuted, fontStyle: "italic", margin: 0 }}>No sessions logged yet.</p>
                : <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {[...(profile.intimacyLog || [])].reverse().map(d => {
                      const diff = Math.floor((new Date(d) - new Date(profile.lastPeriodStart)) / 86400000);
                      const cd = ((diff % profile.cycleLength) + profile.cycleLength) % profile.cycleLength + 1;
                      const ph = getPhaseFromDay(cd);
                      const col = PHASES[ph].color;
                      return (
                        <div key={d} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${B.border}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 16 }}>💕</span>
                            <div>
                              <div style={{ fontSize: 13, color: B.textPrimary, fontWeight: 500 }}>{fmtDate(d)}</div>
                              <span style={{ background: col + "1a", border: `1px solid ${col}35`, borderRadius: B.r.pill, padding: "2px 9px", fontSize: 10, color: col }}>
                                {PHASES[ph].label} · Day {cd}
                              </span>
                            </div>
                          </div>
                          <button onClick={() => removeIntimacy(d)} style={{ background: "none", border: "none", color: B.textMuted, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "4px 8px", borderRadius: 6, transition: B.tx }} className="btn-hover">×</button>
                        </div>
                      );
                    })}
                  </div>
              }
            </Card>
          </div>
        )}

        {/* ═════════════ LOG ═════════════ */}
        {tab === "log" && (
          <div className="fade-in">
            <Card style={{ marginBottom: 14 }}>
              <Label>Update Cycle Data</Label>
              <Divider />
              {[
                { label: "Last Period Start Date",       key: "lastPeriodStart", type: "date"   },
                { label: "Average Cycle Length (days)",  key: "cycleLength",     type: "number" },
                { label: "Period Duration (days)",       key: "periodLength",    type: "number" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <Label>{f.label}</Label>
                  <input
                    type={f.type}
                    value={profile[f.key] || ""}
                    min={f.type === "number" ? 1 : undefined}
                    max={f.type === "number" ? 60 : undefined}
                    onChange={e => onUpdate({ ...profile, [f.key]: f.type === "number" ? Math.max(1, parseInt(e.target.value) || 28) : e.target.value })}
                    className="input-field"
                    style={inputStyle}
                  />
                </div>
              ))}
              <Label>Personal Notes</Label>
              <textarea
                value={profile.notes || ""}
                onChange={e => onUpdate({ ...profile, notes: e.target.value })}
                placeholder="Mood patterns, preferences, observations…"
                className="input-field"
                style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
              />
            </Card>
            <Btn color={B.lavender} onClick={() => setShowLogModal(true)} style={{ width: "100%", padding: 16, fontSize: 14, borderRadius: B.r.lg }}>
              💕 Log Intimacy Session
            </Btn>
          </div>
        )}

        {/* ═════════════ INSIGHTS ═════════════ */}
        {tab === "insights" && (
          <div className="fade-in">
            {/* Phase guide cards */}
            {Object.values(PHASES).map((val, i) => {
              const t = TIPS[val.key];
              const isCur = phase === val.key;
              return (
                <div key={val.key} className={`fade-in-${Math.min(i + 1, 4)}`} style={{ marginBottom: 12 }}>
                  <Card style={{
                    border: `1px solid ${isCur ? val.color + "55" : B.border}`,
                    background: isCur ? `linear-gradient(135deg, ${val.bg}, ${B.card})` : B.card,
                    boxShadow: isCur ? `0 6px 30px ${val.color}18` : B.shadow.card,
                  }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: val.color + "1a", border: `1px solid ${val.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                          {val.emoji}
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: val.color, fontFamily: B.serif }}>{val.label}</div>
                          <div style={{ fontSize: 11, color: B.textMuted }}>Day {val.days[0]}–{val.days[1]}</div>
                        </div>
                      </div>
                      {isCur && (
                        <div style={{ background: val.color, borderRadius: B.r.pill, padding: "4px 14px", fontSize: 11, fontWeight: 700, color: "#0d0d1a" }}>NOW</div>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: B.textSecondary, lineHeight: 1.7, margin: "0 0 14px" }}>{t.note}</p>
                    {/* Tags */}
                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                      {[
                        { icon: "⚡", label: `Energy: ${t.energy}` },
                        { icon: "🧠", label: `Mood: ${t.mood}` },
                        { icon: "💫", label: `Libido: ${t.libido}` },
                        { icon: t.safe ? "✅" : "⚠️", label: t.safe ? "Safe" : "Risky" },
                      ].map(tag => (
                        <span key={tag.label} style={{ background: val.color + "18", border: `1px solid ${val.color}30`, borderRadius: B.r.pill, padding: "4px 12px", fontSize: 11, color: val.color }}>
                          {tag.icon} {tag.label}
                        </span>
                      ))}
                    </div>
                  </Card>
                </div>
              );
            })}
            <AIInsight profile={profile} />
          </div>
        )}

      </div>

      {/* ── LOG INTIMACY MODAL ── */}
      {showLogModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300, backdropFilter: "blur(8px)" }}>
          <div className="fade-in" style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: "28px 28px 0 0", padding: 28, width: "100%", maxWidth: 500 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: B.border, margin: "0 auto 22px" }} />
            <h3 style={{ fontFamily: B.serif, fontSize: 20, marginBottom: 20, color: B.textPrimary }}>💕 Log Intimacy Session</h3>
            <Label>Date</Label>
            <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="input-field"
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${B.border}`, borderRadius: B.r.md, padding: "12px 16px", color: B.textPrimary, fontSize: 14, outline: "none", display: "block", marginBottom: 22 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="secondary" onClick={() => setShowLogModal(false)} style={{ flex: 1, padding: 14 }}>Cancel</Btn>
              <Btn color={B.lavender} onClick={logIntimacy} style={{ flex: 2, padding: 14, fontSize: 14 }}>Save Session 💕</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {showDelModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, backdropFilter: "blur(8px)", padding: 20 }}>
          <div className="fade-in" style={{ background: B.surface, border: "1px solid rgba(244,114,182,0.25)", borderRadius: B.r.xl, padding: 32, width: "100%", maxWidth: 340, textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🗑️</div>
            <h3 style={{ fontFamily: B.serif, fontSize: 22, marginBottom: 8, color: B.textPrimary }}>Delete {profile.name}?</h3>
            <p style={{ color: B.textSecondary, fontSize: 13, marginBottom: 26, lineHeight: 1.65 }}>
              All cycle history, intimacy logs, symptoms, and notes will be permanently removed.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="secondary" onClick={() => setShowDelModal(false)} style={{ flex: 1, padding: 14 }}>Cancel</Btn>
              <Btn variant="danger" onClick={onDelete} style={{ flex: 1, padding: 14, background: "#f472b6", color: "white", border: "none" }}>Delete</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADD PROFILE ──────────────────────────────────────────────────────────────

function AddProfile({ onAdd, onBack }) {
  const [form, setForm] = useState({
    name: "", lastPeriodStart: todayStr(),
    cycleLength: 28, periodLength: 5, avatar: "🌸",
  });
  const canSubmit = form.name.trim().length > 0;

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: `1px solid ${B.border}`, borderRadius: B.r.md,
    padding: "12px 16px", color: B.textPrimary, fontSize: 14,
    outline: "none", display: "block",
  };

  return (
    <div style={{ minHeight: "100vh", background: B.bg, color: B.textPrimary, fontFamily: B.sans }}>
      <BgDecor phase="luteal" />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 500, margin: "0 auto", padding: "18px 18px 100px" }}>

        <Btn variant="secondary" onClick={onBack} style={{ marginBottom: 24, padding: "8px 16px", fontSize: 13 }}>← Back</Btn>

        <div className="fade-in" style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: B.serif, fontSize: 32, fontWeight: 700, marginBottom: 6, lineHeight: 1.1, color: B.textPrimary }}>Add Profile</h2>
          <p style={{ color: B.textSecondary, fontSize: 14, lineHeight: 1.55 }}>Track her cycle and get personalized insights.</p>
        </div>

        <Card className="fade-in-1" style={{ marginBottom: 14 }}>
          {/* Avatar picker */}
          <Label>Choose Avatar</Label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {AVATARS.map(a => (
              <button key={a} onClick={() => setForm({ ...form, avatar: a })} className="btn-hover" style={{
                width: 46, height: 46, fontSize: 20, borderRadius: 14, cursor: "pointer",
                background: form.avatar === a ? B.lavenderDim : "rgba(255,255,255,0.04)",
                border: `2px solid ${form.avatar === a ? B.lavender : B.border}`,
                transition: B.tx,
              }}>{a}</button>
            ))}
          </div>
          <Divider />

          {/* Fields */}
          {[
            { label: "Name",                    key: "name",            type: "text",   ph: "Her name…"   },
            { label: "Last Period Start Date",  key: "lastPeriodStart", type: "date"                      },
            { label: "Average Cycle Length",    key: "cycleLength",     type: "number", ph: "28"          },
            { label: "Period Duration (days)",  key: "periodLength",    type: "number", ph: "5"           },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <Label>{f.label}</Label>
              <input
                type={f.type}
                value={form[f.key]}
                placeholder={f.ph}
                min={f.type === "number" ? 1 : undefined}
                max={f.type === "number" ? 60 : undefined}
                onChange={e => setForm({ ...form, [f.key]: f.type === "number" ? Math.max(1, parseInt(e.target.value) || 28) : e.target.value })}
                className="input-field"
                style={inputStyle}
                autoFocus={f.key === "name"}
              />
            </div>
          ))}
        </Card>

        <Btn
          color={B.lavender}
          onClick={() => { if (canSubmit) onAdd({ ...form, id: Date.now().toString(), symptoms: [], intimacyLog: [], notes: "", hidden: false }); }}
          disabled={!canSubmit}
          style={{ width: "100%", padding: "16px", fontSize: 15, borderRadius: B.r.lg }}
        >
          Add Profile →
        </Btn>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function Dashboard({ user, profiles, onSelect, onAdd, onLogout }) {
  const [showHidden, setShowHidden] = useState(false);
  const visible = profiles.filter(p => showHidden ? p.hidden : !p.hidden);
  const hiddenCount = profiles.filter(p => p.hidden).length;
  const activeProfiles = profiles.filter(p => !p.hidden);

  // Summary stats
  const safeCt    = activeProfiles.filter(p => TIPS[getPhaseFromDay(getDayOfCycle(p.lastPeriodStart, p.cycleLength))].safe).length;
  const ovCt      = activeProfiles.filter(p => getPhaseFromDay(getDayOfCycle(p.lastPeriodStart, p.cycleLength)) === "ovulation").length;
  const sessionCt = activeProfiles.reduce((a, p) => a + (p.intimacyLog || []).length, 0);

  return (
    <div style={{ minHeight: "100vh", background: B.bg, color: B.textPrimary, fontFamily: B.sans }}>
      <BgDecor phase="luteal" />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 500, margin: "0 auto", padding: "0 18px 100px" }}>

        {/* ── HEADER ── */}
        <div className="fade-in" style={{ padding: "26px 0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: 12, color: B.textMuted, letterSpacing: 0.5, marginBottom: 3, fontWeight: 500 }}>Welcome back</p>
              <h1 style={{ fontFamily: B.serif, fontSize: 28, fontWeight: 700, marginBottom: 3, lineHeight: 1.1, color: B.textPrimary }}>{user.username}</h1>
              <p style={{ fontSize: 12, color: B.textMuted }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", paddingTop: 4 }}>
              <Btn color={B.lavender} onClick={onAdd} style={{ padding: "9px 20px" }}>+ Add Profile</Btn>
              <Btn variant="ghost" onClick={onLogout} style={{ padding: "7px 14px", fontSize: 12 }}>Sign out</Btn>
            </div>
          </div>
        </div>

        {/* ── SUMMARY STRIP ── */}
        {activeProfiles.length > 0 && (
          <div className="fade-in-1" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 20 }}>
            {[
              { label: "Profiles",  val: activeProfiles.length, color: B.lavender,  bg: PHASES.luteal.bg  },
              { label: "Safe Now",  val: safeCt,                color: "#34d399",   bg: PHASES.ovulation.bg },
              { label: "Ovulating", val: ovCt,                  color: "#fbbf24",   bg: PHASES.follicular.bg },
              { label: "Sessions",  val: sessionCt,             color: "#f472b6",   bg: PHASES.menstruation.bg },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}25`, borderRadius: B.r.lg, padding: "12px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: B.serif, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: B.textMuted, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── HIDDEN TOGGLE ── */}
        {hiddenCount > 0 && (
          <button
            onClick={() => setShowHidden(h => !h)}
            className="btn-hover"
            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${B.border}`, borderRadius: B.r.pill, padding: "11px 16px", color: B.textMuted, fontSize: 12, cursor: "pointer", marginBottom: 16, fontFamily: B.sans, transition: B.tx }}
          >
            {showHidden ? `👁 Showing ${hiddenCount} hidden — tap to hide` : `🙈 ${hiddenCount} hidden profile${hiddenCount > 1 ? "s" : ""} — tap to reveal`}
          </button>
        )}

        {/* ── EMPTY STATE ── */}
        {visible.length === 0 ? (
          <div className="fade-in" style={{ textAlign: "center", padding: "72px 20px" }}>
            <div style={{ fontSize: 60, marginBottom: 18 }}>🌙</div>
            <h2 style={{ fontFamily: B.serif, fontSize: 24, marginBottom: 10, color: B.textPrimary }}>
              {showHidden ? "No hidden profiles" : "No profiles yet"}
            </h2>
            <p style={{ color: B.textSecondary, marginBottom: 32, lineHeight: 1.65, fontSize: 14 }}>
              {showHidden ? "All profiles are visible." : "Add your first profile to start tracking cycles and getting insights."}
            </p>
            {!showHidden && (
              <Btn color={B.lavender} onClick={onAdd} style={{ padding: "13px 32px", fontSize: 15 }}>
                Add First Profile →
              </Btn>
            )}
          </div>
        ) : (
          /* ── PROFILE CARDS ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visible.map((profile, idx) => {
              const day   = getDayOfCycle(profile.lastPeriodStart, profile.cycleLength);
              const phase = getPhaseFromDay(day);
              const PD    = PHASES[phase];
              const tips  = TIPS[phase];
              const dToP  = daysUntil(getNextPeriod(profile.lastPeriodStart, profile.cycleLength));
              const dToO  = daysUntil(getOvulation(profile.lastPeriodStart, profile.cycleLength));
              const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];

              return (
                <div
                  key={profile.id}
                  className={`card-hover fade-in-${Math.min(idx + 1, 4)}`}
                  onClick={() => onSelect(profile)}
                  style={{ borderRadius: B.r.xl, overflow: "hidden", cursor: "pointer", background: B.card, boxShadow: B.shadow.card }}
                >
                  {/* Color top stripe */}
                  <div style={{ height: 5, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
                  <div style={{ padding: "18px 18px 16px", border: `1px solid ${accent}18`, borderTop: "none", borderRadius: `0 0 ${B.r.xl}px ${B.r.xl}px` }}>

                    {/* Name + phase + badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: accent + "28", border: `2px solid ${accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                        {profile.avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: B.serif, color: B.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>
                          {profile.name}
                        </div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: PD.color + "18", borderRadius: B.r.pill, padding: "3px 10px", border: `1px solid ${PD.color}28` }}>
                          <span style={{ fontSize: 10 }}>{PD.emoji}</span>
                          <span style={{ fontSize: 11, color: PD.color, fontWeight: 600 }}>{PD.label} · Day {day}</span>
                        </div>
                      </div>
                      <div style={{
                        background: tips.safe ? "rgba(52,211,153,0.15)" : "rgba(244,114,182,0.15)",
                        border: `1px solid ${tips.safe ? "#34d39940" : "#f472b640"}`,
                        borderRadius: B.r.pill, padding: "6px 12px", flexShrink: 0,
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: tips.safe ? "#34d399" : "#f472b6" }}>
                          {tips.safe ? "✅ OK" : "⚠️ Risk"}
                        </div>
                      </div>
                    </div>

                    {/* Phase progress bar */}
                    <div style={{ display: "flex", height: 5, borderRadius: 5, overflow: "hidden", gap: 2, marginBottom: 12 }}>
                      {Object.values(PHASES).map(v => {
                        const w = ((v.days[1] - v.days[0] + 1) / profile.cycleLength) * 100;
                        return <div key={v.key} style={{ width: `${w}%`, background: phase === v.key ? v.color : v.color + "25", borderRadius: 3, transition: B.txSlow }} />;
                      })}
                    </div>

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: (profile.symptoms || []).length > 0 ? 12 : 0 }}>
                      {[
                        { label: "Period",    val: dToP <= 0 ? "Today" : `${dToP}d`,                             color: "#f472b6", bg: PHASES.menstruation.bg },
                        { label: "Ovulation", val: dToO <= 0 ? "Now!" : dToO === 1 ? "Tmrw" : `${dToO}d`,        color: "#34d399", bg: PHASES.ovulation.bg    },
                        { label: "Sessions",  val: `${(profile.intimacyLog || []).length}`,                       color: B.lavender, bg: PHASES.luteal.bg      },
                      ].map(s => (
                        <div key={s.label} style={{ background: s.bg, borderRadius: B.r.md, padding: "9px 10px" }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: s.color, fontFamily: B.serif, lineHeight: 1 }}>{s.val}</div>
                          <div style={{ fontSize: 10, color: B.textMuted, marginTop: 3 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Symptom tags */}
                    {(profile.symptoms || []).length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {(profile.symptoms || []).slice(0, 4).map(s => (
                          <span key={s} style={{ background: PD.color + "18", border: `1px solid ${PD.color}28`, borderRadius: B.r.pill, padding: "3px 10px", fontSize: 10, color: PD.color }}>{s}</span>
                        ))}
                        {(profile.symptoms || []).length > 4 && (
                          <span style={{ fontSize: 11, color: B.textMuted, alignSelf: "center" }}>+{(profile.symptoms || []).length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [focused,  setFocused]  = useState(false);
  const canLogin = username.trim().length > 0;

  return (
    <div style={{ minHeight: "100vh", background: B.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: B.sans, position: "relative", padding: 20 }}>
      <BgDecor phase="luteal" />
      {/* Extra decorative blobs */}
      <div style={{ position: "absolute", top: "8%", right: "-8%", width: 260, height: 260, borderRadius: "60% 40% 55% 45%", background: B.lavender + "18", pointerEvents: "none", animation: "floatBlob 16s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "12%", left: "-10%", width: 220, height: 220, borderRadius: "50%", background: "#f472b618", pointerEvents: "none", animation: "floatBlob 20s ease-in-out infinite 3s" }} />
      <div style={{ position: "absolute", top: "50%", right: "6%", width: 100, height: 100, borderRadius: "50%", background: "#fbbf2412", pointerEvents: "none", animation: "floatBlob 25s ease-in-out infinite 7s" }} />

      <div className="fade-in" style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 380 }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ fontSize: 56, marginBottom: 16, animation: "floatBlob 6s ease-in-out infinite" }}>🌙</div>
          <h1 style={{ fontFamily: B.serif, fontSize: 42, fontWeight: 700, lineHeight: 1.1, color: B.textPrimary, margin: "0 0 10px" }}>
            Find Your<br />Best Insight.
          </h1>
          <p style={{ color: B.textMuted, fontSize: 14, lineHeight: 1.6 }}>
            Cycle intelligence for the informed man.
          </p>
        </div>

        <div style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: B.r.xl, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
          <Label>Username</Label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter a username"
            onKeyDown={e => e.key === "Enter" && canLogin && onLogin(username.trim())}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="input-field"
            autoFocus
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)",
              border: `1px solid ${focused ? B.lavender + "80" : B.border}`,
              borderRadius: B.r.md, padding: "14px 18px", color: B.textPrimary,
              fontSize: 15, outline: "none", display: "block",
              boxShadow: focused ? `0 0 0 3px ${B.lavender}18` : "none",
              transition: B.tx, marginBottom: 20,
            }}
          />
          <Btn
            color={B.lavender}
            onClick={() => canLogin && onLogin(username.trim())}
            disabled={!canLogin}
            style={{ width: "100%", padding: "15px", fontSize: 15, borderRadius: B.r.lg }}
          >
            Enter Cyclr →
          </Btn>
          <p style={{ textAlign: "center", color: B.textMuted, fontSize: 11, marginTop: 16, lineHeight: 1.5 }}>
            All data is stored locally on your device.<br />No account needed.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen,   setScreen]   = useState("loading");
  const [user,     setUser]     = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("cyclr_user") || "null");
      const p = JSON.parse(localStorage.getItem("cyclr_profiles") || "[]");
      setProfiles(Array.isArray(p) ? p : []);
      if (u && u.username) { setUser(u); setScreen("dashboard"); }
      else setScreen("login");
    } catch {
      setScreen("login");
    }
  }, []);

  function save(p) {
    const safe = Array.isArray(p) ? p : [];
    setProfiles(safe);
    localStorage.setItem("cyclr_profiles", JSON.stringify(safe));
  }
  function handleLogin(username) {
    const u = { username };
    setUser(u); localStorage.setItem("cyclr_user", JSON.stringify(u));
    setScreen("dashboard");
  }
  function handleLogout() {
    localStorage.removeItem("cyclr_user"); setUser(null); setScreen("login");
  }
  function handleAdd(profile) { save([...profiles, profile]); setScreen("dashboard"); }
  function handleUpdate(updated) {
    const np = profiles.map(x => x.id === updated.id ? updated : x);
    save(np); setSelected(updated);
  }
  function handleDelete() {
    save(profiles.filter(p => p.id !== selected.id));
    setSelected(null); setScreen("dashboard");
  }
  function handleSelect(profile) { setSelected(profile); setScreen("profile"); }

  // Loading guard — prevents blank flash
  if (screen === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: B.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 40, animation: "floatBlob 2s ease-in-out infinite" }}>🌙</div>
      </div>
    );
  }

  return (
    <>
      <GlobalStyles />
      {screen === "login"   && <Login onLogin={handleLogin} />}
      {screen === "add"     && <AddProfile onAdd={handleAdd} onBack={() => setScreen("dashboard")} />}
      {screen === "profile" && selected && (
        <ProfileDetail
          profile={selected}
          onUpdate={handleUpdate}
          onBack={() => setScreen("dashboard")}
          onDelete={handleDelete}
        />
      )}
      {(screen === "dashboard" || (screen === "profile" && !selected)) && (
        <Dashboard
          user={user || { username: "User" }}
          profiles={profiles}
          onSelect={handleSelect}
          onAdd={() => setScreen("add")}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
