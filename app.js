import { useState, useEffect, useCallback, useRef } from "react";

// ─── Constants ──────────────────────────────────────────────────────────────
const PHASES = {
  menstruation: { label: "Menstruation", short: "Period",   color: "#ff4d7d", glow: "#ff4d7d40", emoji: "🔴", days: [1,5]  },
  follicular:   { label: "Follicular",   short: "Follicular", color: "#ff9a3c", glow: "#ff9a3c40", emoji: "🌱", days: [6,13] },
  ovulation:    { label: "Ovulation",    short: "Ovulation",  color: "#00e5cc", glow: "#00e5cc40", emoji: "⚡", days: [14,16]},
  luteal:       { label: "Luteal",       short: "Luteal",     color: "#a855f7", glow: "#a855f740", emoji: "🌙", days: [17,28]},
};

const CYCLE_TIPS = {
  menstruation: { safe: false, risk: "HIGH RISK",   note: "Active shedding — avoid unprotected sex. She may feel tired, crampy, or emotional.", energy: "Low",     mood: "Variable",     libido: "Low"    },
  follicular:   { safe: true,  risk: "LOWER RISK",  note: "Rising estrogen boosts her mood and energy. Fertility risk increases approaching ovulation.", energy: "Rising",  mood: "Positive",     libido: "Rising" },
  ovulation:    { safe: false, risk: "PEAK RISK",   note: "Peak fertility — highest pregnancy risk. Raw is strongly inadvisable right now.", energy: "Peak",    mood: "Flirty/Social", libido: "Peak"   },
  luteal:       { safe: true,  risk: "LOWER RISK",  note: "Post-ovulation. Progesterone rises — she may feel bloated or emotional. Risk drops.", energy: "Falling", mood: "Introspective", libido: "Medium" },
};

const SYMPTOMS = ["Cramps","Bloating","Mood swings","Headache","Fatigue","Tender breasts","Spotting","Back pain","Nausea","High libido","Low libido","Irritability","Anxiety","Clear discharge","PMS"];
const AVATARS   = ["🌸","💜","🌙","🦋","🌺","✨","💎","🌹","🔮","🌊","🍒","🌷"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getDayOfCycle(lastPeriodStart, cycleLength = 28) {
  const today = new Date();
  const start = new Date(lastPeriodStart);
  const diff  = Math.floor((today - start) / 86400000);
  return ((diff % cycleLength) + cycleLength) % cycleLength + 1;
}
function getPhaseFromDay(day) {
  if (day <= 5)  return "menstruation";
  if (day <= 13) return "follicular";
  if (day <= 16) return "ovulation";
  return "luteal";
}
function getNextPeriodDate(lastPeriodStart, cycleLength = 28) {
  const start = new Date(lastPeriodStart);
  const today = new Date();
  let next    = new Date(start);
  while (next <= today) next.setDate(next.getDate() + cycleLength);
  return next;
}
function getOvulationDate(lastPeriodStart, cycleLength = 28) {
  const start = new Date(lastPeriodStart);
  const today = new Date();
  let ov      = new Date(start);
  ov.setDate(ov.getDate() + 13);
  while (ov < today) ov.setDate(ov.getDate() + cycleLength);
  return ov;
}
function daysUntil(d) { return Math.ceil((new Date(d) - new Date()) / 86400000); }
function fmtDate(d)   { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
function todayStr()   { return new Date().toISOString().split("T")[0]; }

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight:"100vh", background:"#0a0010", color:"#f0e6ff",
    fontFamily:"'Outfit', sans-serif",
  },
  glass: {
    background:"rgba(255,255,255,0.04)",
    border:"1px solid rgba(255,255,255,0.08)",
    backdropFilter:"blur(20px)",
    borderRadius:20,
  },
  glassStrong: {
    background:"rgba(255,255,255,0.07)",
    border:"1px solid rgba(255,255,255,0.12)",
    backdropFilter:"blur(30px)",
    borderRadius:24,
  },
  input: {
    width:"100%", background:"rgba(255,255,255,0.06)",
    border:"1px solid rgba(255,255,255,0.12)", borderRadius:12,
    padding:"12px 16px", color:"#f0e6ff", fontSize:14,
    outline:"none", boxSizing:"border-box",
    fontFamily:"'Outfit', sans-serif",
  },
  btn: (color="#a855f7") => ({
    background:`linear-gradient(135deg, ${color}, ${color}cc)`,
    border:"none", borderRadius:12, padding:"12px 20px",
    color:"white", fontSize:14, fontWeight:600,
    cursor:"pointer", transition:"all 0.2s",
    fontFamily:"'Outfit', sans-serif",
  }),
  btnGhost: {
    background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
    borderRadius:12, padding:"10px 16px", color:"#9ca3af",
    fontSize:13, cursor:"pointer", fontFamily:"'Outfit', sans-serif",
  },
  tag: (color) => ({
    background: color + "22", border:`1px solid ${color}44`,
    borderRadius:20, padding:"4px 12px", fontSize:12,
    color, display:"inline-block",
  }),
};

// ─── Gradient Background ─────────────────────────────────────────────────────
function BgOrbs() {
  return (
    <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      <div style={{ position:"absolute", top:"-20%", left:"-10%", width:500, height:500, background:"radial-gradient(circle, #7c3aed22 0%, transparent 70%)", borderRadius:"50%" }} />
      <div style={{ position:"absolute", top:"30%", right:"-15%", width:400, height:400, background:"radial-gradient(circle, #ec4899 22 0%, transparent 70%)", borderRadius:"50%" }} />
      <div style={{ position:"absolute", bottom:"-10%", left:"20%", width:350, height:350, background:"radial-gradient(circle, #06b6d422 0%, transparent 70%)", borderRadius:"50%" }} />
    </div>
  );
}

// ─── AI Insight Component ────────────────────────────────────────────────────
function AIInsight({ profile }) {
  const [text,    setText]    = useState("");
  const [loading, setLoading] = useState(false);
  const phase = getPhaseFromDay(getDayOfCycle(profile.lastPeriodStart, profile.cycleLength));
  const phaseData = PHASES[phase];

  const generate = useCallback(async () => {
    setLoading(true); setText("");
    const day       = getDayOfCycle(profile.lastPeriodStart, profile.cycleLength);
    const symptoms  = (profile.symptoms || []).join(", ") || "none";
    const sessions  = (profile.intimacyLog || []).length;
    const nextP     = daysUntil(getNextPeriodDate(profile.lastPeriodStart, profile.cycleLength));
    const nextO     = daysUntil(getOvulationDate(profile.lastPeriodStart, profile.cycleLength));
    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:300,
          system:`You are a frank, medically-accurate reproductive health advisor. Give concise insights (under 100 words) for someone tracking a partner's menstrual cycle. Be direct, use plain language. Always start with a single emoji and end with either ✅ Safe or ⚠️ Caution for unprotected sex.`,
          messages:[{ role:"user", content:`Partner: ${profile.name}. Cycle day: ${day} of ${profile.cycleLength} (${phase}). Symptoms: ${symptoms}. Sessions logged: ${sessions}. Period in: ${nextP}d. Ovulation in: ${nextO}d. Give insight + recommendation.` }]
        })
      });
      const data = await res.json();
      setText(data.content?.[0]?.text || "Could not generate insight.");
    } catch { setText("AI unavailable — check connection."); }
    setLoading(false);
  }, [profile, phase]);

  return (
    <div style={{ ...S.glass, padding:20, marginTop:16, borderColor: phaseData.color + "33" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:phaseData.color, boxShadow:`0 0 8px ${phaseData.color}` }} />
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:2, color:phaseData.color, fontFamily:"'Space Mono', monospace" }}>AI INSIGHT</span>
        </div>
        <button onClick={generate} disabled={loading} style={{ ...S.btn(phaseData.color), padding:"6px 14px", fontSize:12 }}>
          {loading ? "Thinking…" : "Generate"}
        </button>
      </div>
      {text
        ? <p style={{ fontSize:13, color:"#c4b5fd", lineHeight:1.7, margin:0 }}>{text}</p>
        : <p style={{ fontSize:12, color:"#4a4060", margin:0, fontStyle:"italic" }}>Get personalized cycle insights powered by Claude AI.</p>
      }
    </div>
  );
}

// ─── Cycle Ring ───────────────────────────────────────────────────────────────
function CycleRing({ day, cycleLength, size = 200 }) {
  const cx    = size / 2, cy = size / 2;
  const outer = size * 0.42, inner = size * 0.3;
  const strokeW = (outer - inner);
  const r     = (outer + inner) / 2;
  const circ  = 2 * Math.PI * r;
  const phase = getPhaseFromDay(day);

  const segments = [
    { name:"menstruation", start:0,  end:5,         color:"#ff4d7d" },
    { name:"follicular",   start:5,  end:13,        color:"#ff9a3c" },
    { name:"ovulation",    start:13, end:16,        color:"#00e5cc" },
    { name:"luteal",       start:16, end:cycleLength,color:"#a855f7"},
  ];

  function segProps(startDay, endDay) {
    const startAngle = (startDay / cycleLength) * 2 * Math.PI - Math.PI / 2;
    const endAngle   = (endDay   / cycleLength) * 2 * Math.PI - Math.PI / 2;
    const portion    = (endDay - startDay) / cycleLength;
    const dashLen    = portion * circ - 4;
    const offset     = -(startAngle / (2 * Math.PI)) * circ;
    return { dashLen, gap: circ - dashLen, offset };
  }

  const dotAngle = ((day - 1) / cycleLength) * 2 * Math.PI - Math.PI / 2;
  const dotX     = cx + outer * Math.cos(dotAngle);
  const dotY     = cy + outer * Math.sin(dotAngle);

  return (
    <svg width={size} height={size} style={{ filter:"drop-shadow(0 0 20px rgba(168,85,247,0.3))" }}>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeW} />
      {/* Segments */}
      {segments.map(seg => {
        const { dashLen, gap, offset } = segProps(seg.start, seg.end);
        const isCurrent = getPhaseFromDay(day) === seg.name;
        return (
          <circle key={seg.name} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={strokeW}
            strokeDasharray={`${dashLen} ${gap}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            opacity={isCurrent ? 1 : 0.2}
            style={{ filter: isCurrent ? `drop-shadow(0 0 8px ${seg.color})` : "none" }}
          />
        );
      })}
      {/* Dot */}
      <circle cx={dotX} cy={dotY} r={8} fill="white" style={{ filter:"drop-shadow(0 0 6px white)" }} />
      <circle cx={dotX} cy={dotY} r={4} fill={PHASES[phase].color} />
      {/* Center */}
      <text x={cx} y={cy - 14} textAnchor="middle" fill="white" fontSize={size * 0.14} fontWeight={700} fontFamily="Outfit, sans-serif">{day}</text>
      <text x={cx} y={cy + 4}  textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={size * 0.065} fontFamily="Outfit, sans-serif">day</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fill={PHASES[phase].color} fontSize={size * 0.07} fontWeight={600} fontFamily="Outfit, sans-serif">{PHASES[phase].short}</text>
    </svg>
  );
}

// ─── Month Calendar ───────────────────────────────────────────────────────────
function MonthCalendar({ profile, monthOffset = 0 }) {
  const base     = new Date();
  base.setMonth(base.getMonth() + monthOffset);
  const year     = base.getFullYear();
  const month    = base.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInM  = new Date(year, month + 1, 0).getDate();
  const today    = new Date();
  const isThisM  = today.getFullYear() === year && today.getMonth() === month;

  function phaseForDay(d) {
    const date  = new Date(year, month, d);
    const start = new Date(profile.lastPeriodStart);
    const diff  = Math.floor((date - start) / 86400000);
    const cd    = ((diff % profile.cycleLength) + profile.cycleLength) % profile.cycleLength + 1;
    return getPhaseFromDay(cd);
  }
  function cycleDayForDay(d) {
    const date  = new Date(year, month, d);
    const start = new Date(profile.lastPeriodStart);
    const diff  = Math.floor((date - start) / 86400000);
    return ((diff % profile.cycleLength) + profile.cycleLength) % profile.cycleLength + 1;
  }
  function isIntimacy(d) {
    const s = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return (profile.intimacyLog || []).includes(s);
  }
  function isToday(d) { return isThisM && d === today.getDate(); }

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:4 }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d =>
          <div key={d} style={{ textAlign:"center", fontSize:10, color:"rgba(255,255,255,0.25)", padding:"4px 0" }}>{d}</div>
        )}
        {Array(firstDay).fill(null).map((_,i) => <div key={"e"+i} />)}
        {Array(daysInM).fill(null).map((_,i) => {
          const d     = i + 1;
          const phase = phaseForDay(d);
          const col   = PHASES[phase].color;
          const intim = isIntimacy(d);
          const tod   = isToday(d);
          const cd    = cycleDayForDay(d);
          return (
            <div key={d} title={`Day ${cd} · ${PHASES[phase].label}`}
              style={{
                aspectRatio:"1", borderRadius:8, position:"relative",
                background: tod ? col : col + "18",
                border:`1px solid ${tod ? col : col + "33"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow: tod ? `0 0 12px ${col}66` : "none",
              }}>
              <span style={{ fontSize:11, color: tod ? "white" : "rgba(255,255,255,0.6)", fontWeight: tod ? 700 : 400 }}>{d}</span>
              {intim && <span style={{ position:"absolute", top:1, right:2, fontSize:8 }}>💕</span>}
            </div>
          );
        })}
      </div>
      <div style={{ display:"flex", gap:10, marginTop:10, flexWrap:"wrap" }}>
        {Object.entries(PHASES).map(([k,v]) => (
          <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:v.color }} />
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>{v.short}</span>
          </div>
        ))}
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ fontSize:9 }}>💕</span>
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>Intimacy</span>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Detail ───────────────────────────────────────────────────────────
function ProfileDetail({ profile, onUpdate, onBack, onDelete }) {
  const [tab,           setTab]           = useState("overview");
  const [monthOffset,   setMonthOffset]   = useState(0);
  const [editSym,       setEditSym]       = useState(false);
  const [showLogModal,  setShowLogModal]  = useState(false);
  const [logDate,       setLogDate]       = useState(todayStr());
  const [showDelete,    setShowDelete]    = useState(false);

  const day      = getDayOfCycle(profile.lastPeriodStart, profile.cycleLength);
  const phase    = getPhaseFromDay(day);
  const PD       = PHASES[phase];
  const tips     = CYCLE_TIPS[phase];
  const nextP    = getNextPeriodDate(profile.lastPeriodStart, profile.cycleLength);
  const nextO    = getOvulationDate(profile.lastPeriodStart, profile.cycleLength);
  const dToP     = daysUntil(nextP);
  const dToO     = daysUntil(nextO);

  const calLabel = (() => {
    const b = new Date(); b.setMonth(b.getMonth() + monthOffset);
    return b.toLocaleString("default", { month:"long", year:"numeric" });
  })();

  function toggleSym(s) {
    const cur = profile.symptoms || [];
    onUpdate({ ...profile, symptoms: cur.includes(s) ? cur.filter(x=>x!==s) : [...cur,s] });
  }
  function logIntimacy() {
    const cur = profile.intimacyLog || [];
    if (!cur.includes(logDate)) onUpdate({ ...profile, intimacyLog: [...cur, logDate].sort() });
    setShowLogModal(false);
  }
  function removeIntimacy(date) {
    onUpdate({ ...profile, intimacyLog: (profile.intimacyLog||[]).filter(d=>d!==date) });
  }

  const tabs = [
    { id:"overview",  label:"Overview"  },
    { id:"calendar",  label:"Calendar"  },
    { id:"log",       label:"Log"       },
    { id:"insights",  label:"Insights"  },
  ];

  return (
    <div style={{ ...S.page, position:"relative", zIndex:1 }}>
      <BgOrbs />
      <div style={{ position:"relative", zIndex:2, maxWidth:500, margin:"0 auto", padding:"0 16px 40px" }}>

        {/* Top Bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 0 16px" }}>
          <button onClick={onBack} style={{ ...S.btnGhost, padding:"8px 14px", fontSize:13 }}>← Back</button>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => onUpdate({ ...profile, hidden: !profile.hidden })}
              style={{ ...S.btnGhost, fontSize:12 }}>
              {profile.hidden ? "👁 Show" : "🙈 Hide"}
            </button>
            <button onClick={() => setShowDelete(true)}
              style={{ ...S.btnGhost, color:"#ff4d7d", borderColor:"#ff4d7d33", fontSize:12 }}>
              🗑 Delete
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div style={{ ...S.glassStrong, padding:28, marginBottom:20, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-60, right:-60, width:180, height:180, background:`radial-gradient(circle, ${PD.color}20 0%, transparent 70%)`, borderRadius:"50%", pointerEvents:"none" }} />
          <div style={{ display:"flex", gap:20, alignItems:"center", marginBottom:24 }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:`linear-gradient(135deg, ${PD.color}33, ${PD.color}11)`, border:`2px solid ${PD.color}66`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, boxShadow:`0 0 20px ${PD.color}33` }}>
              {profile.avatar}
            </div>
            <div style={{ flex:1 }}>
              <h2 style={{ margin:0, fontSize:22, fontWeight:700 }}>{profile.name}</h2>
              <div style={{ color:PD.color, fontSize:13, marginTop:4, fontWeight:500 }}>{PD.emoji} {PD.label} · Day {day} of {profile.cycleLength}</div>
            </div>
            <CycleRing day={day} cycleLength={profile.cycleLength} size={80} />
          </div>

          {/* Risk Badge */}
          <div style={{ background: tips.safe ? "rgba(34,197,94,0.1)" : "rgba(255,77,125,0.1)", border:`1px solid ${tips.safe?"#22c55e33":"#ff4d7d33"}`, borderRadius:12, padding:"12px 16px", display:"flex", gap:12, alignItems:"flex-start" }}>
            <span style={{ fontSize:18, flexShrink:0 }}>{tips.safe ? "✅" : "⚠️"}</span>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:tips.safe?"#22c55e":"#ff4d7d", marginBottom:4, letterSpacing:1.5 }}>{tips.risk}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.6 }}>{tips.note}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", background:"rgba(255,255,255,0.04)", borderRadius:14, padding:4, marginBottom:20, border:"1px solid rgba(255,255,255,0.06)" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:1, border:"none", borderRadius:10, padding:"9px 4px",
              background: tab===t.id ? `linear-gradient(135deg, ${PD.color}cc, ${PD.color}88)` : "transparent",
              color: tab===t.id ? "white" : "rgba(255,255,255,0.4)",
              fontSize:12, fontWeight: tab===t.id ? 600 : 400, cursor:"pointer",
              transition:"all 0.2s", fontFamily:"'Outfit', sans-serif",
              boxShadow: tab===t.id ? `0 4px 15px ${PD.color}44` : "none",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
              <CycleRing day={day} cycleLength={profile.cycleLength} size={220} />
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              {[
                { label:"Period in",    val: dToP<=0?"Today":`${dToP}d`,   sub:fmtDate(nextP), color:"#ff4d7d" },
                { label:"Ovulation",    val: dToO<=0?"Now!":dToO===1?"Tomorrow":`${dToO}d`, sub:fmtDate(nextO), color:"#00e5cc" },
                { label:"Energy",       val: tips.energy,       sub:"Current phase",      color:"#ff9a3c" },
                { label:"Libido",       val: tips.libido,       sub:"Expected level",     color:"#a855f7" },
              ].map(s => (
                <div key={s.label} style={{ ...S.glass, padding:16, borderColor:s.color+"22" }}>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:600, letterSpacing:1.5, marginBottom:6 }}>{s.label.toUpperCase()}</div>
                  <div style={{ fontSize:20, fontWeight:700, color:s.color, marginBottom:2 }}>{s.val}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Symptoms */}
            <div style={{ ...S.glass, padding:20, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <span style={{ fontSize:12, fontWeight:600, letterSpacing:1.5, color:"rgba(255,255,255,0.4)" }}>SYMPTOMS</span>
                <button onClick={() => setEditSym(!editSym)} style={{ ...S.btnGhost, padding:"5px 12px", fontSize:11 }}>{editSym?"Done":"Edit"}</button>
              </div>
              {editSym ? (
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {SYMPTOMS.map(s => {
                    const on = (profile.symptoms||[]).includes(s);
                    return <button key={s} onClick={()=>toggleSym(s)} style={{ background:on?PD.color+"33":"rgba(255,255,255,0.04)", border:`1px solid ${on?PD.color+"66":"rgba(255,255,255,0.08)"}`, borderRadius:20, padding:"6px 14px", color:on?PD.color:"rgba(255,255,255,0.4)", fontSize:12, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>{s}</button>;
                  })}
                </div>
              ) : (
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {(profile.symptoms||[]).length === 0
                    ? <span style={{ fontSize:12, color:"rgba(255,255,255,0.2)", fontStyle:"italic" }}>No symptoms logged — tap Edit to add</span>
                    : (profile.symptoms||[]).map(s => <span key={s} style={S.tag(PD.color)}>{s}</span>)
                  }
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              <button onClick={() => onUpdate({...profile, lastPeriodStart: todayStr()})}
                style={{ ...S.btn("#ff4d7d"), textAlign:"center" }}>
                🔴<br/><span style={{ fontSize:12 }}>Period Started</span>
              </button>
              <button onClick={() => setShowLogModal(true)}
                style={{ ...S.btn("#a855f7"), textAlign:"center" }}>
                💕<br/><span style={{ fontSize:12 }}>Log Intimacy</span>
              </button>
            </div>

            <AIInsight profile={profile} />
          </div>
        )}

        {/* ── CALENDAR ── */}
        {tab === "calendar" && (
          <div>
            {/* Month Nav */}
            <div style={{ ...S.glass, padding:"14px 20px", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <button onClick={() => setMonthOffset(m=>m-1)} style={{ ...S.btnGhost, padding:"8px 14px", fontSize:18, lineHeight:1 }}>‹</button>
                <span style={{ fontSize:15, fontWeight:600, color:"white" }}>{calLabel}</span>
                <button onClick={() => setMonthOffset(m=>m+1)} style={{ ...S.btnGhost, padding:"8px 14px", fontSize:18, lineHeight:1 }}>›</button>
              </div>
              {monthOffset !== 0 && (
                <div style={{ textAlign:"center", marginTop:-8, marginBottom:8 }}>
                  <button onClick={() => setMonthOffset(0)} style={{ ...S.btnGhost, fontSize:11, padding:"4px 10px" }}>Today</button>
                </div>
              )}
              <MonthCalendar profile={profile} monthOffset={monthOffset} />
            </div>

            {/* Upcoming Events */}
            <div style={{ ...S.glass, padding:20, marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:600, letterSpacing:1.5, color:"rgba(255,255,255,0.4)", marginBottom:14 }}>UPCOMING</div>
              {[
                { label:"🔴 Next Period",   date:nextP, color:"#ff4d7d" },
                { label:"⚡ Ovulation",     date:nextO, color:"#00e5cc" },
              ].map(ev => (
                <div key={ev.label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color:ev.color, fontSize:13, fontWeight:500 }}>{ev.label}</span>
                  <span style={{ color:"rgba(255,255,255,0.35)", fontSize:12 }}>{fmtDate(ev.date)} · {daysUntil(ev.date)}d away</span>
                </div>
              ))}
            </div>

            {/* Intimacy Log */}
            <div style={{ ...S.glass, padding:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:600, letterSpacing:1.5, color:"rgba(255,255,255,0.4)" }}>INTIMACY LOG ({(profile.intimacyLog||[]).length})</div>
                <button onClick={() => setShowLogModal(true)} style={{ ...S.btn("#a855f7"), padding:"6px 12px", fontSize:12 }}>+ Add</button>
              </div>
              {(profile.intimacyLog||[]).length === 0
                ? <span style={{ fontSize:12, color:"rgba(255,255,255,0.2)", fontStyle:"italic" }}>No sessions logged yet.</span>
                : [...(profile.intimacyLog||[])].reverse().map(d => {
                    const start = new Date(profile.lastPeriodStart);
                    const date  = new Date(d);
                    const diff  = Math.floor((date-start)/86400000);
                    const cd    = ((diff%profile.cycleLength)+profile.cycleLength)%profile.cycleLength+1;
                    const ph    = getPhaseFromDay(cd);
                    return (
                      <div key={d} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                        <div>
                          <span style={{ color:"rgba(255,255,255,0.7)", fontSize:13 }}>💕 {fmtDate(d)}</span>
                          <span style={{ color:PHASES[ph].color, fontSize:11, marginLeft:8 }}>{PHASES[ph].label}</span>
                        </div>
                        <button onClick={() => removeIntimacy(d)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.2)", cursor:"pointer", fontSize:16 }}>×</button>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        )}

        {/* ── LOG ── */}
        {tab === "log" && (
          <div>
            <div style={{ ...S.glass, padding:24, marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:600, letterSpacing:1.5, color:"rgba(255,255,255,0.4)", marginBottom:18 }}>CYCLE DATA</div>
              {[
                { label:"Last Period Start", key:"lastPeriodStart", type:"date" },
                { label:"Cycle Length (days)", key:"cycleLength", type:"number" },
                { label:"Period Duration (days)", key:"periodLength", type:"number" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom:16 }}>
                  <label style={{ fontSize:12, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:8, fontWeight:500 }}>{f.label}</label>
                  <input type={f.type} value={profile[f.key]||""}
                    min={f.type==="number"?1:undefined}
                    max={f.key==="cycleLength"?45:f.key==="periodLength"?10:undefined}
                    onChange={e => onUpdate({...profile, [f.key]: f.type==="number"?parseInt(e.target.value)||28:e.target.value})}
                    style={S.input} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:8, fontWeight:500 }}>Notes</label>
                <textarea value={profile.notes||""} onChange={e=>onUpdate({...profile,notes:e.target.value})}
                  placeholder="Mood patterns, preferences, observations..."
                  style={{ ...S.input, minHeight:100, resize:"vertical" }} />
              </div>
            </div>
            <button onClick={() => setShowLogModal(true)} style={{ ...S.btn("#a855f7"), width:"100%", padding:16, fontSize:15 }}>
              💕 Log Intimacy Session
            </button>
          </div>
        )}

        {/* ── INSIGHTS ── */}
        {tab === "insights" && (
          <div>
            {Object.entries(PHASES).map(([key,val]) => {
              const t   = CYCLE_TIPS[key];
              const cur = phase === key;
              return (
                <div key={key} style={{ ...S.glass, padding:20, marginBottom:12, borderColor:cur?val.color+"44":"rgba(255,255,255,0.06)", boxShadow:cur?`0 0 20px ${val.color}15`:"none" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:val.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{val.emoji}</div>
                      <div>
                        <div style={{ color:val.color, fontSize:14, fontWeight:600 }}>{val.label}</div>
                        <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>Day {val.days[0]}–{val.days[1]}</div>
                      </div>
                    </div>
                    {cur && <span style={{ ...S.tag(val.color), fontSize:10 }}>NOW</span>}
                  </div>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.7, margin:"0 0 12px" }}>{t.note}</p>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <span style={S.tag(val.color)}>⚡ {t.energy}</span>
                    <span style={S.tag(val.color)}>🧠 {t.mood}</span>
                    <span style={{ ...S.tag(t.safe?"#22c55e":"#ff4d7d") }}>{t.safe?"✅ Safe":"⚠️ Risky"}</span>
                  </div>
                </div>
              );
            })}
            <AIInsight profile={profile} />
          </div>
        )}
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200, backdropFilter:"blur(4px)" }}>
          <div style={{ ...S.glassStrong, padding:28, width:"100%", maxWidth:500, borderBottomLeftRadius:0, borderBottomRightRadius:0 }}>
            <h3 style={{ margin:"0 0 20px", fontSize:17 }}>💕 Log Intimacy</h3>
            <label style={{ fontSize:12, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:8 }}>Date</label>
            <input type="date" value={logDate} onChange={e=>setLogDate(e.target.value)} style={{ ...S.input, marginBottom:20 }} />
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowLogModal(false)} style={{ ...S.btnGhost, flex:1, padding:12 }}>Cancel</button>
              <button onClick={logIntimacy} style={{ ...S.btn("#a855f7"), flex:2, padding:12 }}>Save 💕</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDelete && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, backdropFilter:"blur(4px)", padding:20 }}>
          <div style={{ ...S.glassStrong, padding:28, width:"100%", maxWidth:360, textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
            <h3 style={{ margin:"0 0 10px" }}>Delete {profile.name}?</h3>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, marginBottom:24 }}>This will remove all her data permanently.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowDelete(false)} style={{ ...S.btnGhost, flex:1, padding:12 }}>Cancel</button>
              <button onClick={onDelete} style={{ ...S.btn("#ff4d7d"), flex:1, padding:12 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Profile Screen ───────────────────────────────────────────────────────
function AddProfile({ onAdd, onBack }) {
  const [form, setForm] = useState({ name:"", lastPeriodStart:todayStr(), cycleLength:28, periodLength:5, avatar:"🌸" });

  return (
    <div style={{ ...S.page, position:"relative" }}>
      <BgOrbs />
      <div style={{ position:"relative", zIndex:2, maxWidth:500, margin:"0 auto", padding:"20px 16px 60px" }}>
        <button onClick={onBack} style={{ ...S.btnGhost, marginBottom:24 }}>← Back</button>
        <h2 style={{ margin:"0 0 8px", fontSize:22, fontWeight:700 }}>Add Profile</h2>
        <p style={{ color:"rgba(255,255,255,0.35)", fontSize:13, marginBottom:28 }}>Track her cycle and get smart insights.</p>

        <div style={{ ...S.glassStrong, padding:24, marginBottom:16 }}>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:12, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:10, fontWeight:600 }}>AVATAR</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {AVATARS.map(a => (
                <button key={a} onClick={() => setForm({...form,avatar:a})} style={{
                  width:42, height:42, fontSize:20, borderRadius:10, cursor:"pointer",
                  background: form.avatar===a ? "rgba(168,85,247,0.3)" : "rgba(255,255,255,0.05)",
                  border:`2px solid ${form.avatar===a?"#a855f7":"rgba(255,255,255,0.08)"}`,
                  boxShadow: form.avatar===a ? "0 0 12px #a855f744" : "none",
                }}>{a}</button>
              ))}
            </div>
          </div>

          {[
            { label:"Name",                   key:"name",            type:"text",   placeholder:"Her name" },
            { label:"Last Period Start",       key:"lastPeriodStart", type:"date"                           },
            { label:"Average Cycle Length",    key:"cycleLength",     type:"number", placeholder:"28"       },
            { label:"Period Duration (days)",  key:"periodLength",    type:"number", placeholder:"5"        },
          ].map(f => (
            <div key={f.key} style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:8, fontWeight:600 }}>{f.label.toUpperCase()}</label>
              <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                onChange={e => setForm({...form,[f.key]:f.type==="number"?parseInt(e.target.value)||28:e.target.value})}
                style={S.input} />
            </div>
          ))}
        </div>

        <button
          onClick={() => { if (form.name.trim()) onAdd({...form, id:Date.now().toString(), symptoms:[], intimacyLog:[], notes:"", hidden:false }); }}
          style={{ ...S.btn("#a855f7"), width:"100%", padding:16, fontSize:15, fontWeight:700 }}
          disabled={!form.name.trim()}>
          Add Profile →
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ user, profiles, onSelect, onAdd, onLogout }) {
  const [showHidden,   setShowHidden]   = useState(false);
  const visible = profiles.filter(p => showHidden ? p.hidden : !p.hidden);
  const hiddenCount = profiles.filter(p=>p.hidden).length;

  return (
    <div style={{ ...S.page, position:"relative" }}>
      <BgOrbs />
      <div style={{ position:"relative", zIndex:2, maxWidth:500, margin:"0 auto", padding:"0 16px 60px" }}>

        {/* Header */}
        <div style={{ padding:"24px 0 20px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <span style={{ fontSize:22 }}>🌙</span>
              <h1 style={{ margin:0, fontSize:24, fontWeight:800, background:"linear-gradient(135deg, #f0e6ff, #c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CYCLR</h1>
            </div>
            <p style={{ margin:0, color:"rgba(255,255,255,0.3)", fontSize:13 }}>Hey, <span style={{ color:"#c084fc" }}>{user.username}</span></p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onAdd} style={{ ...S.btn("#a855f7"), padding:"9px 16px", fontSize:13 }}>+ Add</button>
            <button onClick={onLogout} style={{ ...S.btnGhost, padding:"9px 14px", fontSize:13 }}>Out</button>
          </div>
        </div>

        {/* Summary Strip */}
        {profiles.filter(p=>!p.hidden).length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:20 }}>
            {[
              { label:"Profiles",    val:profiles.filter(p=>!p.hidden).length,                                                                     color:"#c084fc" },
              { label:"Safe Now",    val:profiles.filter(p=>!p.hidden&&CYCLE_TIPS[getPhaseFromDay(getDayOfCycle(p.lastPeriodStart,p.cycleLength))].safe).length, color:"#22c55e" },
              { label:"Ovulating",   val:profiles.filter(p=>!p.hidden&&getPhaseFromDay(getDayOfCycle(p.lastPeriodStart,p.cycleLength))==="ovulation").length,   color:"#00e5cc" },
              { label:"Sessions",    val:profiles.filter(p=>!p.hidden).reduce((a,p)=>a+(p.intimacyLog||[]).length,0),                               color:"#f472b6" },
            ].map(s => (
              <div key={s.label} style={{ ...S.glass, padding:"12px 8px", textAlign:"center" }}>
                <div style={{ fontSize:20, fontWeight:700, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Hidden Toggle */}
        {hiddenCount > 0 && (
          <button onClick={() => setShowHidden(h=>!h)} style={{ ...S.btnGhost, width:"100%", marginBottom:16, fontSize:12 }}>
            {showHidden ? `👁 Showing hidden (${hiddenCount}) — tap to show visible` : `🙈 ${hiddenCount} hidden profile${hiddenCount>1?"s":""} — tap to reveal`}
          </button>
        )}

        {/* Profile Cards */}
        {visible.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🌙</div>
            <p style={{ color:"rgba(255,255,255,0.3)", marginBottom:24, fontSize:15 }}>
              {showHidden ? "No hidden profiles." : "No profiles yet — add your first one."}
            </p>
            {!showHidden && (
              <button onClick={onAdd} style={{ ...S.btn("#a855f7"), padding:"12px 28px" }}>Add Profile →</button>
            )}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {visible.map(profile => {
              const day   = getDayOfCycle(profile.lastPeriodStart, profile.cycleLength);
              const phase = getPhaseFromDay(day);
              const PD    = PHASES[phase];
              const tips  = CYCLE_TIPS[phase];
              const dToP  = daysUntil(getNextPeriodDate(profile.lastPeriodStart, profile.cycleLength));
              const dToO  = daysUntil(getOvulationDate(profile.lastPeriodStart, profile.cycleLength));

              return (
                <div key={profile.id} onClick={() => onSelect(profile)}
                  style={{ ...S.glassStrong, padding:20, cursor:"pointer", position:"relative", overflow:"hidden",
                    borderColor: PD.color+"33", transition:"transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 32px ${PD.color}22`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
                >
                  <div style={{ position:"absolute", top:-30, right:-30, width:100, height:100, background:`radial-gradient(circle, ${PD.color}15 0%, transparent 70%)`, borderRadius:"50%", pointerEvents:"none" }} />

                  {/* Top row */}
                  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
                    <div style={{ width:52, height:52, borderRadius:"50%", background:`linear-gradient(135deg,${PD.color}33,${PD.color}11)`, border:`2px solid ${PD.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
                      {profile.avatar}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:16, marginBottom:3 }}>{profile.name}</div>
                      <div style={{ color:PD.color, fontSize:12, fontWeight:500 }}>{PD.emoji} {PD.label} · Day {day}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:11, fontWeight:700, color: tips.safe?"#22c55e":"#ff4d7d", background:tips.safe?"rgba(34,197,94,0.1)":"rgba(255,77,125,0.1)", border:`1px solid ${tips.safe?"#22c55e33":"#ff4d7d33"}`, borderRadius:20, padding:"4px 10px" }}>
                        {tips.safe?"✅ OK":"⚠️ Caution"}
                      </div>
                    </div>
                  </div>

                  {/* Phase bar */}
                  <div style={{ display:"flex", height:4, borderRadius:4, overflow:"hidden", marginBottom:14, gap:2 }}>
                    {Object.entries(PHASES).map(([key,val]) => {
                      const w = ((val.days[1]-val.days[0]+1)/profile.cycleLength)*100;
                      return <div key={key} style={{ width:`${w}%`, background:phase===key?val.color:val.color+"33", borderRadius:2, transition:"all 0.3s" }} />;
                    })}
                  </div>

                  {/* Stats */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                    {[
                      { label:"Period in", val:dToP<=0?"Today":`${dToP}d`,  color:"#ff4d7d" },
                      { label:"Ovulation", val:dToO<=0?"Now!":dToO===1?"Tomorrow":`${dToO}d`, color:"#00e5cc" },
                      { label:"Sessions",  val:(profile.intimacyLog||[]).length+"💕",          color:"#f472b6" },
                    ].map(s => (
                      <div key={s.label} style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"8px 10px" }}>
                        <div style={{ fontSize:14, fontWeight:700, color:s.color }}>{s.val}</div>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:1 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {(profile.symptoms||[]).length > 0 && (
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:12 }}>
                      {(profile.symptoms||[]).slice(0,4).map(s => (
                        <span key={s} style={{ ...S.tag(PD.color), fontSize:11 }}>{s}</span>
                      ))}
                      {(profile.symptoms||[]).length>4 && <span style={{ fontSize:11, color:"rgba(255,255,255,0.25)", alignSelf:"center" }}>+{(profile.symptoms||[]).length-4}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Login ───────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [form, setForm] = useState({ username:"", password:"" });
  return (
    <div style={{ ...S.page, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", position:"relative", padding:20 }}>
      <BgOrbs />
      <div style={{ position:"relative", zIndex:2, width:"100%", maxWidth:380 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:56, marginBottom:16, filter:"drop-shadow(0 0 30px rgba(168,85,247,0.5))" }}>🌙</div>
          <h1 style={{ margin:"0 0 6px", fontSize:36, fontWeight:800, background:"linear-gradient(135deg, #f0e6ff 0%, #c084fc 50%, #f472b6 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:4 }}>CYCLR</h1>
          <p style={{ color:"rgba(255,255,255,0.25)", fontSize:12, letterSpacing:3 }}>CYCLE INTELLIGENCE</p>
        </div>

        <div style={{ ...S.glassStrong, padding:28 }}>
          <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})}
            placeholder="Username" style={{ ...S.input, marginBottom:12 }}
            onKeyDown={e=>e.key==="Enter"&&form.username&&onLogin(form.username)} />
          <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
            placeholder="Password (optional)" style={{ ...S.input, marginBottom:24 }} />
          <button onClick={() => form.username && onLogin(form.username)}
            disabled={!form.username}
            style={{ ...S.btn("#a855f7"), width:"100%", padding:14, fontSize:15, fontWeight:700, opacity:form.username?1:0.5 }}>
            Enter →
          </button>
          <p style={{ textAlign:"center", color:"rgba(255,255,255,0.15)", fontSize:11, marginTop:16, marginBottom:0 }}>All data stored locally on your device</p>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,   setScreen]   = useState("login");
  const [user,     setUser]     = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("cyclr_user")||"null");
      const p = JSON.parse(localStorage.getItem("cyclr_profiles")||"[]");
      if (u) { setUser(u); setScreen("dashboard"); }
      setProfiles(p);
    } catch {}
  }, []);

  function save(p) { setProfiles(p); localStorage.setItem("cyclr_profiles", JSON.stringify(p)); }

  function handleLogin(username) {
    const u = { username };
    setUser(u); localStorage.setItem("cyclr_user", JSON.stringify(u));
    setScreen("dashboard");
  }
  function handleLogout() {
    localStorage.removeItem("cyclr_user"); setUser(null); setScreen("login");
  }
  function handleAdd(profile) {
    save([...profiles, profile]); setScreen("dashboard");
  }
  function handleUpdate(updated) {
    const p = profiles.map(x=>x.id===updated.id?updated:x);
    save(p); setSelected(updated);
  }
  function handleDelete() {
    save(profiles.filter(p=>p.id!==selected.id)); setSelected(null); setScreen("dashboard");
  }
  function handleSelect(profile) {
    setSelected(profile); setScreen("profile");
  }

  if (screen==="login") return <Login onLogin={handleLogin} />;
  if (screen==="add")   return <AddProfile onAdd={handleAdd} onBack={()=>setScreen("dashboard")} />;
  if (screen==="profile" && selected) return (
    <ProfileDetail
      profile={selected}
      onUpdate={handleUpdate}
      onBack={()=>setScreen("dashboard")}
      onDelete={handleDelete}
    />
  );
  return (
    <Dashboard
      user={user}
      profiles={profiles}
      onSelect={handleSelect}
      onAdd={()=>setScreen("add")}
      onLogout={handleLogout}
    />
  );
}
