import { useState, useEffect, useCallback, useRef } from "react";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Scroll fix: prevent iOS rubber-band bounce ── */
  html, body {
    height: 100%; overflow: hidden;
    background: #111;
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  #root {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: none;
  }
  input, textarea, button, select { font-family: inherit; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }

  /* ── Custom scrollbar ── */
  #root::-webkit-scrollbar { width: 4px; }
  #root::-webkit-scrollbar-track { background: transparent; }
  #root::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

  /* ── Keyframes ── */
  @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
  @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.45; } }
  
  .fade-up   { animation: fadeUp 0.28s ease both; }
  .fade-up-1 { animation: fadeUp 0.28s 0.05s ease both; }
  .fade-up-2 { animation: fadeUp 0.28s 0.10s ease both; }
  .fade-up-3 { animation: fadeUp 0.28s 0.15s ease both; }
  .scale-in  { animation: scaleIn 0.22s cubic-bezier(0.34,1.3,0.64,1) both; }
  .sheet-in  { animation: slideUp 0.26s cubic-bezier(0.4,0,0.2,1) both; }

  /* ── Interactive states ── */
  .pressable { transition: opacity 0.1s, transform 0.1s; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  .pressable:active { opacity: 0.75; transform: scale(0.97); }

  .card-lift { transition: transform 0.18s ease, box-shadow 0.18s ease; }
  .card-lift:hover { transform: translateY(-1px); }

  /* ── Inputs ── */
  .field {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 13px 15px;
    color: #fff;
    font-size: 15px;
    font-family: 'Inter', sans-serif;
    outline: none;
    display: block;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .field:focus {
    border-color: rgba(139,111,232,0.6);
    box-shadow: 0 0 0 3px rgba(139,111,232,0.12);
  }
  .field::placeholder { color: rgba(255,255,255,0.2); }

  /* ── Symptom tags ── */
  .sym { transition: background 0.12s, border-color 0.12s, color 0.12s; cursor: pointer; -webkit-tap-highlight-color: transparent; }

  /* ── Tab ── */
  .tab { transition: background 0.15s, color 0.15s; }

  /* ── Range (hide native) ── */
  input[type=range] { -webkit-appearance:none; appearance:none; background:transparent; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:22px; height:22px; opacity:0; }
  input[type=range]::-moz-range-thumb { width:22px; height:22px; opacity:0; border:none; }
  input[type=range]:focus { outline:none; }
`;

function GlobalStyles() {
  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = GLOBAL_CSS;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);
  return null;
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
// Colour system: 60-30-10 rule
//   60% Neutral  — page bg, surfaces, borders (near-black family)
//   30% Mid      — card surfaces, secondary text
//   10% Accent   — brand purple #8B6FE8, used sparingly for CTAs and active states
//
// Semantic colours only for phase data (health meaning, not decoration)
// Phase colours are MUTED — they inform, not shout

const T = {
  // ── 60% neutrals ──
  page:     "#111111",    // body background — deep, not grey
  surface:  "#1c1c1e",   // iOS-dark-like card surface
  surface2: "#242426",   // elevated surface
  // ── Borders (barely visible) ──
  border:   "rgba(255,255,255,0.07)",
  borderMd: "rgba(255,255,255,0.12)",

  // ── 30% text hierarchy ──  (3 weights, not 5 random opacities)
  text:     "#f2f2f7",   // primary  — iOS-style near-white
  textSub:  "#8e8e93",   // secondary — iOS grey
  textMute: "#6e6e73",   // tertiary — very dim

  // ── 10% brand accent ──
  accent:   "#8B6FE8",   // single brand purple
  accentDim:"rgba(139,111,232,0.12)",

  // ── Semantic (meaning-only, used for phase data) ──
  green:  "#30d158",   // iOS green — safe
  red:    "#ff453a",   // iOS red   — danger / delete

  // ── Typography ──
  fontUI:   "'Inter', system-ui, sans-serif",
  fontDisp: "'DM Serif Display', Georgia, serif",

  // ── Spacing / radius ──
  r: { sm:8, md:10, lg:14, xl:18, pill:999 },

  // ── Elevation ──
  shadow:  "0 2px 12px rgba(0,0,0,0.4)",
  shadowLg:"0 8px 32px rgba(0,0,0,0.6)",
};

// ── Type scale (7 stops, not 14) ──
// caption: 11 / body-sm: 13 / body: 15 / body-lg: 17 / title-sm: 20 / title: 24 / display: 32

// Phase semantic colours — MUTED versions that inform without noise
const PHASES = {
  menstruation: { key:"menstruation", label:"Menstruation", short:"Period",     color:"#e8547a", dim:"rgba(232,84,122,0.12)", bg:"rgba(232,84,122,0.06)",  emoji:"🔴", days:[1,5]   },
  follicular:   { key:"follicular",   label:"Follicular",   short:"Follicular", color:"#d4831a", dim:"rgba(212,131,26,0.12)",  bg:"rgba(212,131,26,0.06)",  emoji:"🌱", days:[6,13]  },
  ovulation:    { key:"ovulation",    label:"Ovulation",    short:"Ovulation",  color:"#2fb57a", dim:"rgba(47,181,122,0.12)",  bg:"rgba(47,181,122,0.06)",  emoji:"⚡", days:[14,16] },
  luteal:       { key:"luteal",       label:"Luteal",       short:"Luteal",     color:"#7c5cbf", dim:"rgba(124,92,191,0.12)",  bg:"rgba(124,92,191,0.06)",  emoji:"🌙", days:[17,28] },
};

const TIPS = {
  menstruation: { safe:false, risk:"HIGH RISK",  energy:"Low",     mood:"Variable",      libido:"Low",    note:"Active shedding. Avoid unprotected sex. She may feel fatigued and crampy — be extra caring." },
  follicular:   { safe:true,  risk:"LOWER RISK", energy:"Rising",  mood:"Positive",      libido:"Rising", note:"Rising estrogen boosts mood and energy. Lower pregnancy risk but increases toward ovulation." },
  ovulation:    { safe:false, risk:"PEAK RISK",  energy:"Peak",    mood:"Flirty/Social", libido:"Peak",   note:"Peak fertility window. Highest pregnancy risk of the entire cycle. Unprotected sex strongly inadvisable." },
  luteal:       { safe:true,  risk:"LOWER RISK", energy:"Falling", mood:"Introspective", libido:"Medium", note:"Post-ovulation. Progesterone rises — she may feel more emotional, bloated, or withdrawn." },
};

const SYMPTOMS = [
  "Cramps","Bloating","Mood swings","Headache","Fatigue","Tender breasts",
  "Spotting","Back pain","Nausea","High libido","Low libido","Irritability",
  "Anxiety","Clear discharge","PMS","Acne","Insomnia","Food cravings",
];

const AVATARS = ["🌸","💜","🌙","🦋","🌺","✨","💎","🌹","🔮","🌊","🍒","🌷"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getDayOfCycle(lps, cl=28) { const d=Math.floor((new Date()-new Date(lps))/86400000); return((d%cl)+cl)%cl+1; }

// Compute per-profile phase boundaries from stored settings
function getPhaseBounds(profile) {
  const cl  = profile.cycleLength     || 28;
  const pd  = Math.max(1, Math.min(profile.periodLength    || 5,  cl - 4));
  // ovulationDay must leave room for at least 1 follicular day (pd+2) and 1 luteal day
  const ovd = Math.max(pd+2, Math.min(profile.ovulationDay || 14, cl - 2));
  const ovl = Math.max(1, Math.min(profile.ovulationLength || 3,  cl - ovd));
  const ovEnd = Math.min(ovd + ovl - 1, cl - 1);
  return {
    menstruation: [1,       pd          ],
    follicular:   [pd+1,    ovd - 1     ],
    ovulation:    [ovd,     ovEnd       ],
    luteal:       [ovEnd+1, cl          ],
  };
}

// Profile-aware phase lookup (falls back to defaults if no profile given)
function getPhaseFromDay(d, profile=null) {
  if (!profile) { if(d<=5)return"menstruation"; if(d<=13)return"follicular"; if(d<=16)return"ovulation"; return"luteal"; }
  const b = getPhaseBounds(profile);
  if (d >= b.menstruation[0] && d <= b.menstruation[1]) return "menstruation";
  if (d >= b.follicular[0]   && d <= b.follicular[1])   return "follicular";
  if (d >= b.ovulation[0]    && d <= b.ovulation[1])    return "ovulation";
  return "luteal";
}

function getNextPeriod(lps, cl=28) { let n=new Date(lps); const t=new Date(); while(n<=t) n.setDate(n.getDate()+cl); return n; }
function getOvulation(lps, profile) {
  const cl  = (profile&&profile.cycleLength) || 28;
  const ovd = (profile&&profile.ovulationDay) || 14;
  let o=new Date(lps); o.setDate(o.getDate()+ ovd - 1);
  const t=new Date(); while(o<t) o.setDate(o.getDate()+cl); return o;
}
function daysUntil(d) { return Math.ceil((new Date(d)-new Date())/86400000); }
function fmtDate(d)   { return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"}); }
function todayStr()   { return new Date().toISOString().split("T")[0]; }

// ─── PARTNER CODE ─────────────────────────────────────────────────────────────
// Encodes all profile data into a compact shareable string.
// Format: base64(JSON) prefixed with "CYC-" so it's recognisable.

function encodePartnerCode(profile) {
  const payload = {
    n:  profile.name,
    av: profile.avatar        || "🌸",
    lp: profile.lastPeriodStart,
    cl: profile.cycleLength   || 28,
    pl: profile.periodLength  || 5,
    od: profile.ovulationDay  || 14,
    ol: profile.ovulationLength || 3,
    sy: profile.symptoms      || [],
    il: profile.intimacyLog   || [],
    nt: profile.notes         || "",
  };
  try {
    return "CYC-" + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  } catch { return null; }
}

function decodePartnerCode(code) {
  const raw = code.trim();
  if (!raw) return null;

  // ── Strategy 1: Our own CYC- base64 format ──
  if (/^CYC-/i.test(raw)) {
    try {
      const stripped = raw.replace(/^CYC-/i, "");
      const json = JSON.parse(decodeURIComponent(escape(atob(stripped))));
      if (!json.n || !json.lp) throw new Error("missing fields");
      return {
        name:            json.n,
        avatar:          json.av || "🌸",
        lastPeriodStart: json.lp,
        cycleLength:     Math.max(18, Math.min(60,  json.cl || 28)),
        periodLength:    Math.max(1,  Math.min(10,  json.pl || 5)),
        ovulationDay:    Math.max(2,  Math.min(58,  json.od || 14)),
        ovulationLength: Math.max(1,  Math.min(7,   json.ol || 3)),
        symptoms:        Array.isArray(json.sy) ? json.sy : [],
        intimacyLog:     Array.isArray(json.il) ? json.il : [],
        notes:           json.nt || "",
      };
    } catch { return null; }
  }

  // ── Strategy 2: Bare base64 (no prefix) ──
  if (/^[A-Za-z0-9+/=]{20,}$/.test(raw)) {
    try {
      const json = JSON.parse(decodeURIComponent(escape(atob(raw))));
      if (json.n && json.lp) {
        return {
          name: json.n, avatar: json.av||"🌸", lastPeriodStart: json.lp,
          cycleLength: Math.max(18,Math.min(60,json.cl||28)),
          periodLength: Math.max(1,Math.min(10,json.pl||5)),
          ovulationDay: Math.max(2,Math.min(58,json.od||14)),
          ovulationLength: Math.max(1,Math.min(7,json.ol||3)),
          symptoms:[], intimacyLog:[], notes:"",
        };
      }
    } catch {}
  }

  // ── Strategy 3: JSON object (exported data from apps like Clue, Flo) ──
  try {
    const json = JSON.parse(raw);
    // Try to extract the most common field names used by period apps
    const name   = json.name || json.username || json.user || json.partner || "Imported";
    const avatar = "🌸";
    // Date fields — try many possible names
    const lp = json.last_period || json.lastPeriodDate || json.lastPeriod ||
               json.last_period_start || json.periodStart || json.start_date ||
               json.cycle_start || json.cycleStart || json.period_start;
    const cl = parseInt(json.cycle_length || json.cycleLength || json.avg_cycle || json.averageCycle || 28);
    const pl = parseInt(json.period_length || json.periodLength || json.flow_days || json.period_days || 5);
    // Validate we got at least a date
    if (lp && !isNaN(new Date(lp).getTime())) {
      return {
        name, avatar, lastPeriodStart: new Date(lp).toISOString().split("T")[0],
        cycleLength: Math.max(18, Math.min(60, isNaN(cl)?28:cl)),
        periodLength: Math.max(1, Math.min(10, isNaN(pl)?5:pl)),
        ovulationDay: 14, ovulationLength: 3,
        symptoms:[], intimacyLog:[], notes: "Imported from another app",
      };
    }
  } catch {}

  // ── Strategy 4: Plain text / CSV — extract dates and numbers ──
  try {
    // Look for an ISO date (last period start)
    const dateMatch = raw.match(/\b(20\d{2}[-/]\d{1,2}[-/]\d{1,2})\b/);
    if (dateMatch) {
      const dateStr = dateMatch[1].replace(/\//g,"-");
      const dateObj = new Date(dateStr);
      if (!isNaN(dateObj.getTime())) {
        // Try to find cycle length — a number between 21–35 near "cycle" or "days"
        const cycleMatch = raw.match(/cycle[^\d]{0,15}(\d{2,3})|(\d{2,3})[^\d]{0,10}days/i);
        const cl = cycleMatch ? parseInt(cycleMatch[1]||cycleMatch[2]) : 28;
        // Try to find period length
        const periodMatch = raw.match(/period[^\d]{0,15}(\d{1,2})|flow[^\d]{0,15}(\d{1,2})/i);
        const pl = periodMatch ? parseInt(periodMatch[1]||periodMatch[2]) : 5;
        return {
          name: "Imported", avatar: "🌸",
          lastPeriodStart: dateObj.toISOString().split("T")[0],
          cycleLength: Math.max(18, Math.min(60, isNaN(cl)?28:cl)),
          periodLength: Math.max(1, Math.min(10, isNaN(pl)?5:pl)),
          ovulationDay: 14, ovulationLength: 3,
          symptoms:[], intimacyLog:[], notes: "Imported — please verify dates in the Edit tab.",
        };
      }
    }
  } catch {}

  return null; // Nothing worked
}

// ─── SHARED PRIMITIVES ────────────────────────────────────────────────────────

// Primary action button — brand accent or custom colour
function Btn({ children, onClick, disabled, variant="accent", color, style={} }) {
  const c = color || T.accent;
  const map = {
    accent:  { background:c, color:"#fff", border:"none", boxShadow:`0 4px 20px ${c}44` },
    black:   { background:"#0a0a0a", color:T.text, border:"none", boxShadow:"0 4px 14px rgba(0,0,0,0.5)" },
    ghost:   { background:"rgba(255,255,255,0.05)", color:T.textSub, border:`1px solid ${T.border}` },
    danger:  { background:"rgba(255,69,58,0.1)", color:T.red, border:`1px solid rgba(255,69,58,0.25)` },
  };
  return (
    <button className="pressable" onClick={disabled?undefined:onClick} disabled={disabled} style={{
      border:"none", borderRadius:T.r.lg, fontWeight:700, fontSize:15,
      fontFamily:T.fontUI, cursor:disabled?"not-allowed":"pointer",
      display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
      padding:"12px 20px", opacity:disabled?0.35:1,
      ...map[variant], ...style,
    }}>{children}</button>
  );
}

// Section label — restrained caps
function Lbl({ children, style={} }) {
  return <div style={{ fontSize:11, fontWeight:600, letterSpacing:1.4, color:T.textMute, textTransform:"uppercase", marginBottom:8, fontFamily:T.fontUI, ...style }}>{children}</div>;
}

// Divider
function Hr({ style={} }) {
  return <div style={{ height:1, background:T.border, margin:"16px 0", ...style }}/>;
}

// Toggle switch
function Toggle({ on, onChange }) {
  return (
    <div onClick={()=>onChange(!on)} className="pressable" style={{flexShrink:0}}>
      <div style={{ width:48,height:28,borderRadius:14, background:on?T.green:"rgba(255,255,255,0.12)", position:"relative", transition:"background 0.2s" }}>
        <div style={{ width:22,height:22,borderRadius:"50%",background:"white",position:"absolute",top:3, transform:on?"translateX(23px)":"translateX(3px)", transition:"transform 0.2s cubic-bezier(0.34,1.3,0.64,1)", boxShadow:"0 2px 5px rgba(0,0,0,0.3)" }}/>
      </div>
    </div>
  );
}

// Spinner
function Spin({ color="#fff" }) {
  return <span style={{ width:13,height:13,border:`2px solid ${color}33`,borderTopColor:color,borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite" }}/>;
}

// BgDecor removed — adds visual noise, not signal

// ─── CYCLE RING ───────────────────────────────────────────────────────────────

function CycleRing({ day, cycleLength, profile=null, size=200 }) {
  const cx=size/2, cy=size/2, r=size*0.35, sw=size*0.09, circ=2*Math.PI*r;
  const phase = getPhaseFromDay(day, profile);
  const b = profile ? getPhaseBounds(profile) : {
    menstruation:[1,5], follicular:[6,13], ovulation:[14,16], luteal:[17,cycleLength]
  };
  const segs = [
    {key:"menstruation", start:b.menstruation[0]-1, end:b.menstruation[1], color:PHASES.menstruation.color},
    {key:"follicular",   start:b.follicular[0]-1,   end:b.follicular[1],   color:PHASES.follicular.color},
    {key:"ovulation",    start:b.ovulation[0]-1,    end:b.ovulation[1],    color:PHASES.ovulation.color},
    {key:"luteal",       start:b.luteal[0]-1,        end:b.luteal[1],       color:"#9b59b6"},
  ];
  function sp(s,e){const sa=(s/cycleLength)*2*Math.PI-Math.PI/2; const dl=Math.max(0,((e-s)/cycleLength)*circ-4); const off=-(sa/(2*Math.PI))*circ; return{dl,gap:circ-dl,off};}
  const da=((day-1)/cycleLength)*2*Math.PI-Math.PI/2;
  const dx=cx+r*Math.cos(da), dy=cy+r*Math.sin(da);
  const pc = PHASES[phase].color;
  return (
    <svg width={size} height={size} style={{overflow:"visible"}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw}/>
      {segs.map(seg=>{
        const {dl,gap,off}=sp(seg.start,seg.end), cur=phase===seg.key;
        return <circle key={seg.key} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color}
          strokeWidth={cur?sw+2:sw} strokeDasharray={`${dl} ${gap}`} strokeDashoffset={off}
          strokeLinecap="round" opacity={cur?1:0.16}/>;
      })}
      <circle cx={dx} cy={dy} r={size*0.055} fill="white"/>
      <circle cx={dx} cy={dy} r={size*0.032} fill={pc}/>
      <text x={cx} y={cy-8}  textAnchor="middle" fill="white"       fontSize={size*0.15} fontWeight={700} fontFamily={T.fontUI}>{day}</text>
      <text x={cx} y={cy+10} textAnchor="middle" fill={T.textMute}  fontSize={size*0.07} fontFamily={T.fontUI}>of {cycleLength}</text>
      <text x={cx} y={cy+26} textAnchor="middle" fill={pc}          fontSize={size*0.074} fontWeight={700} fontFamily={T.fontUI}>{PHASES[phase].short}</text>
    </svg>
  );
}

// ─── MONTH CALENDAR ───────────────────────────────────────────────────────────

function MonthCalendar({ profile, monthOffset=0 }) {
  const base = new Date(); base.setMonth(base.getMonth()+monthOffset);
  const year=base.getFullYear(), month=base.getMonth();
  const firstDay=new Date(year,month,1).getDay(), daysInMonth=new Date(year,month+1,0).getDate();
  const today=new Date(), isNow=today.getFullYear()===year&&today.getMonth()===month;

  function phaseForDay(d) {
    const diff=Math.floor((new Date(year,month,d)-new Date(profile.lastPeriodStart))/86400000);
    const cd=((diff%profile.cycleLength)+profile.cycleLength)%profile.cycleLength+1;
    return getPhaseFromDay(cd, profile);
  }
  function isIntimacy(d) {
    const s=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return (profile.intimacyLog||[]).includes(s);
  }

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:6}}>
        {["S","M","T","W","T","F","S"].map((d,i)=>(
          <div key={i} style={{textAlign:"center",fontSize:12,fontWeight:700,color:T.textMute,padding:"2px 0"}}>{d}</div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {Array(firstDay).fill(null).map((_,i)=><div key={"e"+i}/>)}
        {Array(daysInMonth).fill(null).map((_,i)=>{
          const d=i+1, ph=phaseForDay(d), col=PHASES[ph].color;
          const isToday=isNow&&d===today.getDate(), hasI=isIntimacy(d);
          return (
            <div key={d} style={{aspectRatio:"1",borderRadius:7,position:"relative",
              background:isToday?col:col+"1a", border:`1px solid ${isToday?col:col+"30"}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:isToday?`0 0 10px ${col}55`:"none"}}>
              <span style={{fontSize:12,color:isToday?"#111":T.textSub,fontWeight:isToday?800:500}}>{d}</span>
              {hasI&&<span style={{position:"absolute",top:1,right:1,fontSize:7}}>💕</span>}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`}}>
        {Object.values(PHASES).map(v=>(
          <div key={v.key} style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:8,height:8,borderRadius:2,background:v.color}}/>
            <span style={{fontSize:12,color:T.textMute}}>{v.short}</span>
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <span style={{fontSize:9}}>💕</span>
          <span style={{fontSize:12,color:T.textMute}}>Intimacy</span>
        </div>
      </div>
    </div>
  );
}

// ─── AI INSIGHT ───────────────────────────────────────────────────────────────

function AIInsight({ profile }) {
  const [text,     setText]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState("");
  const [apiKey,   setApiKey]   = useState(()=>localStorage.getItem("cyclr_api_key")||"");
  const [showKey,  setShowKey]  = useState(false);
  const [keyInput, setKeyInput] = useState("");

  const day   = getDayOfCycle(profile.lastPeriodStart, profile.cycleLength);
  const phase = getPhaseFromDay(day, profile);
  const PD    = PHASES[phase];
  const hasKey = apiKey.trim().startsWith("sk-ant-");

  function saveKey() {
    const k = keyInput.trim();
    localStorage.setItem("cyclr_api_key", k);
    setApiKey(k);
    setShowKey(false);
    setKeyInput("");
  }

  function clearKey() {
    localStorage.removeItem("cyclr_api_key");
    setApiKey("");
  }

  const generate = useCallback(async () => {
    if (!hasKey) { setShowKey(true); return; }
    setLoading(true); setText(""); setErr("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 200,
          system: "You are a reproductive health advisor for men tracking their partner's cycle. Under 70 words. Start with one emoji. End with ✅ Safe or ⚠️ Caution.",
          messages: [{
            role: "user",
            content: `Partner: ${profile.name}. Day ${day}/${profile.cycleLength} (${phase}). Symptoms: ${(profile.symptoms||[]).join(",")||"none"}. Sessions this cycle: ${(profile.intimacyLog||[]).length}. Period in ${daysUntil(getNextPeriod(profile.lastPeriodStart,profile.cycleLength))}d. Ovulation in ${daysUntil(getOvulation(profile.lastPeriodStart,profile))}d. Give a brief, frank insight.`
          }],
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(()=>({}));
        throw new Error(e?.error?.message || `API error ${res.status}`);
      }
      const d = await res.json();
      setText(d.content?.[0]?.text || "No response.");
    } catch (e) {
      const msg = e.message || "";
      if (msg.includes("401") || msg.includes("authentication")) {
        setErr("Invalid API key. Tap the key icon to update it.");
        clearKey();
      } else if (msg.includes("403")) {
        setErr("Access denied. Make sure your API key has the right permissions.");
      } else {
        setErr(`Error: ${msg || "Check your connection and try again."}`);
      }
    }
    setLoading(false);
  }, [profile, day, phase, apiKey, hasKey]);

  return (
    <div style={{background:T.surface2,border:`1px solid ${PD.color}22`,borderRadius:T.r.lg,padding:18,marginTop:4}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:26,height:26,borderRadius:7,background:PD.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>✦</div>
          <Lbl style={{marginBottom:0,color:PD.color}}>AI Insight</Lbl>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {/* Key icon */}
          <button onClick={()=>{setKeyInput(apiKey);setShowKey(true);}} className="pressable" title="Set API key" style={{
            width:28,height:28,borderRadius:8,background:hasKey?"rgba(48,209,88,0.12)":"rgba(255,255,255,0.06)",
            border:`1px solid ${hasKey?T.green+"40":T.border}`,color:hasKey?T.green:T.textMute,
            fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
          }}>🔑</button>
          <Btn onClick={generate} disabled={loading} color={PD.color} style={{padding:"6px 16px",fontSize:13}}>
            {loading ? <><Spin color="#fff"/>Thinking…</> : hasKey ? "Generate" : "Setup →"}
          </Btn>
        </div>
      </div>

      {/* API key setup panel */}
      {showKey && (
        <div style={{background:T.surface,border:`1px solid ${T.accent}33`,borderRadius:T.r.md,padding:14,marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:4}}>Anthropic API Key</div>
          <div style={{fontSize:12,color:T.textMute,lineHeight:1.55,marginBottom:10}}>
            Get a free key at <span style={{color:T.accent}}>console.anthropic.com</span> → API Keys. Your key stays on this device only.
          </div>
          <input
            value={keyInput} onChange={e=>setKeyInput(e.target.value)}
            placeholder="sk-ant-api03-..."
            className="field"
            type="password"
            style={{marginBottom:10,fontSize:13,fontFamily:"monospace",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:T.r.md,padding:"10px 13px",color:T.text,width:"100%",outline:"none"}}
            onKeyDown={e=>e.key==="Enter"&&saveKey()}
          />
          <div style={{display:"flex",gap:8}}>
            <Btn variant="ghost" onClick={()=>setShowKey(false)} style={{flex:1,padding:"9px"}}>Cancel</Btn>
            <Btn onClick={saveKey} disabled={!keyInput.trim().startsWith("sk-ant-")} style={{flex:2,padding:"9px"}}>Save Key</Btn>
          </div>
          {hasKey && (
            <button onClick={clearKey} className="pressable" style={{background:"none",border:"none",color:T.red,fontSize:12,cursor:"pointer",marginTop:8,padding:0}}>
              Remove saved key
            </button>
          )}
        </div>
      )}

      {err
        ? <p style={{fontSize:13,color:T.red,lineHeight:1.7,margin:0}}>{err}</p>
        : text
          ? <p style={{fontSize:14,color:T.textSub,lineHeight:1.75,margin:0}}>{text}</p>
          : <p style={{fontSize:13,color:T.textMute,margin:0,lineHeight:1.6}}>
              {hasKey
                ? "Tap Generate for an AI-powered cycle insight."
                : "Tap Setup to add your Anthropic API key and unlock AI insights."}
            </p>
      }
    </div>
  );
}

// ─── SLIDER ROW ──────────────────────────────────────────────────────────────

function SliderRow({ label, emoji, color, value, min, max, onChange, note }) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div style={{marginBottom:22}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
        <span style={{fontSize:14,fontWeight:800,color}}>{emoji} {label}</span>
        <span style={{fontSize:22,fontWeight:400,color,fontFamily:T.fontDisp,lineHeight:1}}>
          {value}<span style={{fontSize:13,fontWeight:600,color:T.textMute}}> days</span>
        </span>
      </div>
      <div style={{position:"relative",height:36,display:"flex",alignItems:"center"}}>
        <div style={{position:"absolute",left:0,right:0,height:6,borderRadius:3,background:"rgba(255,255,255,0.08)"}}/>
        <div style={{position:"absolute",left:0,height:6,borderRadius:3,background:color,width:`${pct}%`,transition:"width 0.1s",boxShadow:`0 0 8px ${color}66`}}/>
        <input type="range" min={min} max={max} value={value}
          onChange={e=>onChange(parseInt(e.target.value))}
          style={{position:"relative",width:"100%",height:36,opacity:0,cursor:"pointer",zIndex:2,margin:0,padding:0}}
        />
        <div style={{
          position:"absolute",width:22,height:22,borderRadius:"50%",pointerEvents:"none",
          background:"white",border:`3px solid ${color}`,
          boxShadow:`0 2px 8px rgba(0,0,0,0.5),0 0 0 4px ${color}22`,
          left:`calc(${pct}% - 11px)`,transition:"left 0.1s",
        }}/>
      </div>
      {note && <div style={{fontSize:12,color:T.textMute,marginTop:5,lineHeight:1.55}}>{note}</div>}
    </div>
  );
}

// ─── PHASE DIVIDER BAR ───────────────────────────────────────────────────────
// Single interactive bar. Three draggable handles sit at phase boundaries.
// Dragging moves the boundary between the two adjacent phases.

function PhaseDividerBar({ profile, onUpdate }) {
  const cl  = profile.cycleLength    || 28;
  const pd  = profile.periodLength   || 5;
  const ovd = profile.ovulationDay   || 14;
  const ovl = profile.ovulationLength|| 3;
  const b   = getPhaseBounds(profile);

  const phase = getPhaseFromDay(getDayOfCycle(profile.lastPeriodStart, cl), profile);

  // The 3 boundary positions as fractions of total cycle (0–1)
  // boundary[0] = end of menstruation = pd/cl
  // boundary[1] = end of follicular   = (ovd-1)/cl
  // boundary[2] = end of ovulation    = (ovd+ovl-1)/cl
  const boundaries = [pd/cl, (ovd-1)/cl, (ovd+ovl-1)/cl];

  const barRef = useRef(null);
  const dragging = useRef(null); // index 0,1,2

  const SEGMENTS = [
    {key:"menstruation", label:"Period",     color:"#e84393"},
    {key:"follicular",   label:"Follicular", color:"#f5a623"},
    {key:"ovulation",    label:"Ovulation",  color:"#4caf7a"},
    {key:"luteal",       label:"Luteal",     color:"#9b59b6"},
  ];

  function fractionToDay(f) { return Math.round(f * cl); }

  function onPointerDown(e, idx) {
    e.preventDefault();
    dragging.current = idx;
    const bar = barRef.current;
    if (!bar) return;

    function onMove(ev) {
      const rect = bar.getBoundingClientRect();
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const raw = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const day = Math.max(1, Math.min(cl-1, Math.round(raw * cl)));

      if (idx === 0) {
        // boundary between menstruation and follicular: move periodLength
        // must be at least 1, at most ovd-2
        const newPd = Math.max(1, Math.min(ovd - 2, day));
        onUpdate({...profile, periodLength: newPd});
      } else if (idx === 1) {
        // boundary between follicular and ovulation: move ovulationDay
        // must be at least pd+2, at most cl-ovl-1
        const newOvd = Math.max(pd + 2, Math.min(cl - ovl - 1, day + 1));
        onUpdate({...profile, ovulationDay: newOvd});
      } else {
        // boundary between ovulation and luteal: move ovulationLength
        // ovEnd = day, so ovl = day - ovd + 1
        const newOvEnd = Math.max(ovd, Math.min(cl - 2, day));
        const newOvl = Math.max(1, Math.min(7, newOvEnd - ovd + 1));
        onUpdate({...profile, ovulationLength: newOvl});
      }
    }

    function onUp() {
      dragging.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("touchmove", onMove, {passive:false});
    window.addEventListener("touchend", onUp);
  }

  // Segment widths as percentages
  const segs = [
    {key:"menstruation", color:"#e84393", from:0,         to:boundaries[0]},
    {key:"follicular",   color:"#f5a623", from:boundaries[0], to:boundaries[1]},
    {key:"ovulation",    color:"#4caf7a", from:boundaries[1], to:boundaries[2]},
    {key:"luteal",       color:"#9b59b6", from:boundaries[2], to:1},
  ];

  const phaseRows = [
    {key:"menstruation", label:"Period",     color:"#e84393", days:b.menstruation},
    {key:"follicular",   label:"Follicular", color:"#f5a623", days:b.follicular},
    {key:"ovulation",    label:"Ovulation",  color:"#4caf7a", days:b.ovulation},
    {key:"luteal",       label:"Luteal",     color:"#9b59b6", days:b.luteal},
  ];

  return (
    <div>
      <div style={{fontSize:13,color:T.textMute,marginBottom:14,lineHeight:1.6}}>
        Drag the handles between phases to resize. Each segment represents one phase of the cycle.
      </div>

      {/* The bar */}
      <div ref={barRef} style={{position:"relative",height:52,borderRadius:T.r.lg,overflow:"visible",marginBottom:28,userSelect:"none",touchAction:"none"}}>
        {/* Segments */}
        <div style={{position:"absolute",inset:0,borderRadius:T.r.lg,overflow:"hidden",display:"flex"}}>
          {segs.map((seg,i)=>{
            const w = (seg.to - seg.from) * 100;
            const isCur = phase === seg.key;
            const len = Math.max(0, Math.round((seg.to - seg.from) * cl));
            return (
              <div key={seg.key} style={{
                width:`${w}%`, height:"100%",
                background: seg.color + (isCur ? "" : "77"),
                display:"flex", alignItems:"center", justifyContent:"center",
                position:"relative", transition:"background 0.2s",
                boxShadow: isCur ? `inset 0 0 0 2px ${seg.color}` : "none",
              }}>
                {len >= 2 && (
                  <span style={{fontSize:11,fontWeight:800,color:isCur?"#111":"rgba(255,255,255,0.85)",pointerEvents:"none"}}>
                    {PHASES[seg.key].emoji} {len}d
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Draggable handles at the 3 boundaries */}
        {boundaries.map((pos, idx) => (
          <div
            key={idx}
            onPointerDown={e=>onPointerDown(e, idx)}
            onTouchStart={e=>onPointerDown(e, idx)}
            style={{
              position:"absolute",
              left:`${pos*100}%`,
              top:"50%",
              transform:"translate(-50%,-50%)",
              width:20, height:60,
              cursor:"ew-resize",
              zIndex:10,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}
          >
            {/* Visual handle pill */}
            <div style={{
              width:6, height:40,
              borderRadius:3,
              background:"white",
              boxShadow:"0 2px 10px rgba(0,0,0,0.6), 0 0 0 2px rgba(0,0,0,0.2)",
              pointerEvents:"none",
            }}/>
          </div>
        ))}
      </div>

      {/* Phase summary rows */}
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {phaseRows.map(seg=>{
          const len = Math.max(0, seg.days[1]-seg.days[0]+1);
          if (!len) return null;
          const isCur = phase === seg.key;
          return (
            <div key={seg.key} style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"10px 14px", borderRadius:T.r.md,
              background: isCur ? seg.color+"18" : T.surface2,
              border:`1px solid ${isCur ? seg.color+"44" : T.border}`,
              transition:"all 0.2s",
            }}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{width:10,height:10,borderRadius:3,background:seg.color,flexShrink:0}}/>
                <span style={{fontSize:14,fontWeight:700,color:isCur?seg.color:T.textSub}}>
                  {PHASES[seg.key].emoji} {seg.label}
                </span>
                {isCur && <span style={{fontSize:11,fontWeight:800,color:seg.color,background:seg.color+"20",borderRadius:T.r.pill,padding:"2px 9px"}}>NOW</span>}
              </div>
              <span style={{fontSize:13,color:T.textMute,fontWeight:700}}>Day {seg.days[0]}–{seg.days[1]} · {len}d</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}



function ShareCodeModal({ profile, onClose }) {
  const code = encodePartnerCode(profile);
  const [copied, setCopied] = useState(false);

  function copyCode() {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = code; document.body.appendChild(el);
      el.select(); document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true); setTimeout(() => setCopied(false), 2200);
    });
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:20}}>
      <div className="scale-in" style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.xl,padding:28,width:"100%",maxWidth:440,boxShadow:T.shadowLg}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:4}}>📤 Partner Code</div>
            <div style={{fontSize:13,color:T.textMute,lineHeight:1.5}}>Share with any period tracking app or send directly. The code contains all of {profile.name}'s cycle data.</div>
          </div>
          <button onClick={onClose} className="pressable" style={{background:"none",border:"none",color:T.textMute,fontSize:22,cursor:"pointer",padding:"0 0 0 12px",lineHeight:1,flexShrink:0}}>✕</button>
        </div>

        {/* Code box */}
        <div style={{background:T.surface2,border:`1px solid ${T.border}`,borderRadius:T.r.lg,padding:16,marginBottom:16,position:"relative"}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:1.5,color:T.accent,marginBottom:10}}>PARTNER CODE</div>
          <div style={{
            fontSize:12, fontFamily:"monospace", color:T.textSub,
            wordBreak:"break-all", lineHeight:1.7, userSelect:"all",
            maxHeight:110, overflowY:"auto",
          }}>{code}</div>
        </div>

        {/* What's included */}
        <div style={{background:"rgba(124,92,191,0.08)",border:`1px solid ${T.accent}22`,borderRadius:T.r.md,padding:"12px 14px",marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:1.5,color:T.accent,marginBottom:8}}>WHAT'S INCLUDED</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {["Name & avatar","Last period date","Cycle length","Phase boundaries","Symptoms","Intimacy log","Notes"].map(item => (
              <span key={item} style={{fontSize:11,color:T.textSub,background:"rgba(255,255,255,0.06)",borderRadius:T.r.pill,padding:"3px 10px"}}>✓ {item}</span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:10}}>
          <Btn variant="ghost" onClick={onClose} style={{flex:1,padding:13}}>Close</Btn>
          <button className="pressable" onClick={copyCode} style={{
            flex:2,padding:13,border:"none",borderRadius:T.r.lg,fontSize:14,fontWeight:800,cursor:"pointer",
            background:copied?"#4caf7a":"#111",color:"#fff",
            boxShadow:copied?"0 4px 16px #4caf7a55":"0 4px 16px rgba(0,0,0,0.5)",
            transition:"all 0.2s ease",
          }}>
            {copied ? "✓ Copied!" : "📋 Copy Code"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE DETAIL ───────────────────────────────────────────────────────────

function ProfileDetail({ profile, onUpdate, onBack, onDelete }) {
  const [tab,          setTab]          = useState("overview");
  const [monthOffset,  setMonthOffset]  = useState(0);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logDate,      setLogDate]      = useState(todayStr());
  const [showDelModal, setShowDelModal] = useState(false);
  const [showShareCode,setShowShareCode]= useState(false);
  const [showKebab,    setShowKebab]    = useState(false);
  const [periodFlash,  setPeriodFlash]  = useState(false);
  const [dupeDateMsg,  setDupeDateMsg]  = useState(false);
  const [undoPeriod,   setUndoPeriod]   = useState(null);

  const day=getDayOfCycle(profile.lastPeriodStart,profile.cycleLength);
  const phase=getPhaseFromDay(day,profile), PD=PHASES[phase], tips=TIPS[phase];
  const bounds=getPhaseBounds(profile);
  const nextP=getNextPeriod(profile.lastPeriodStart,profile.cycleLength);
  const nextO=getOvulation(profile.lastPeriodStart,profile);
  const dToP=daysUntil(nextP), dToO=daysUntil(nextO);

  const calLabel=(()=>{const b=new Date();b.setMonth(b.getMonth()+monthOffset);return b.toLocaleString("default",{month:"long",year:"numeric"});})();

  function toggleSym(s){const c=profile.symptoms||[];onUpdate({...profile,symptoms:c.includes(s)?c.filter(x=>x!==s):[...c,s]});}
  function logIntimacy(){const c=profile.intimacyLog||[];if(c.includes(logDate)){setDupeDateMsg(true);setTimeout(()=>setDupeDateMsg(false),2500);return;}onUpdate({...profile,intimacyLog:[...c,logDate].sort()});setShowLogModal(false);}
  function removeIntimacy(d){onUpdate({...profile,intimacyLog:(profile.intimacyLog||[]).filter(x=>x!==d)});}
  function markPeriod(){const prev=profile.lastPeriodStart;setUndoPeriod(prev);onUpdate({...profile,lastPeriodStart:todayStr()});setPeriodFlash(true);setTimeout(()=>{setPeriodFlash(false);setUndoPeriod(null);},5000);}

  const inputStyle={};  // uses .field CSS class — no inline override needed
  const tabs=[{id:"overview",label:"Overview"},{id:"calendar",label:"Calendar"},{id:"insights",label:"Insights"},{id:"edit",label:"Edit"}];

  return (
    <div style={{minHeight:"100%",background:T.page,color:T.text,fontFamily:T.fontUI,position:"relative"}}>
      <div style={{position:"relative",zIndex:2,maxWidth:500,margin:"0 auto",padding:"0 16px 120px"}}>

        {/* ── TOP BAR — back arrow left, kebab right ── */}
        <div className="fade-up" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 0 14px"}}>
          <button onClick={onBack} className="pressable" style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.07)",border:`1px solid ${T.border}`,borderRadius:T.r.lg,padding:"8px 16px",color:T.textSub,fontSize:13,fontWeight:700,cursor:"pointer"}}>
            <span style={{fontSize:16,lineHeight:1}}>←</span> Back
          </button>
          {/* Kebab ⋯ */}
          <button onClick={()=>setShowKebab(true)} className="pressable" style={{width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,0.07)",border:`1px solid ${T.border}`,color:T.textSub,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",letterSpacing:1}}>
            ⋯
          </button>
        </div>

        {/* ── HERO CARD ── */}
        <div className="fade-up" style={{position:"relative",marginBottom:16}}>
          <div style={{background:T.surface,border:`1px solid ${PD.color}28`,borderRadius:T.r.xl,padding:22,boxShadow:T.shadow}}>
            <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:18}}>
              <div style={{width:68,height:68,borderRadius:20,background:`linear-gradient(135deg,${PD.color}33,${PD.color}11)`,border:`2px solid ${PD.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0}}>{profile.avatar}</div>
              <div style={{flex:1,minWidth:0}}>
                <h2 style={{fontFamily:T.fontDisp,fontSize:22,fontWeight:400,margin:"0 0 5px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profile.name}</h2>
                <div style={{display:"inline-flex",alignItems:"center",gap:6,background:PD.color+"1a",borderRadius:T.r.pill,padding:"4px 12px",border:`1px solid ${PD.color}30`}}>
                  <span style={{fontSize:12}}>{PD.emoji}</span>
                  <span style={{fontSize:13,color:PD.color,fontWeight:700}}>{PD.label} · Day {day} of {profile.cycleLength}</span>
                </div>
              </div>
              <CycleRing day={day} cycleLength={profile.cycleLength} profile={profile} size={76}/>
            </div>
            {/* Risk banner */}
            <div style={{background:tips.safe?`${T.green}15`:`${PD.color}12`,border:`1px solid ${tips.safe?T.green+"44":PD.color+"44"}`,borderRadius:T.r.md,padding:"12px 15px",display:"flex",gap:11,alignItems:"flex-start"}}>
              <span style={{fontSize:18,flexShrink:0,lineHeight:1.4}}>{tips.safe?"✅":"⚠️"}</span>
              <div>
                <div style={{fontSize:11,fontWeight:800,letterSpacing:1.8,color:tips.safe?T.green:PD.color,marginBottom:4}}>{tips.risk}</div>
                <div style={{fontSize:14,color:T.textSub,lineHeight:1.65}}>{tips.note}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="fade-up-1" style={{display:"flex",background:"rgba(0,0,0,0.25)",borderRadius:T.r.pill,padding:4,marginBottom:20,border:`1px solid ${T.border}`,gap:3}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className="tab pressable" style={{
              flex:1,border:"none",borderRadius:T.r.pill,padding:"9px 4px",
              background:tab===t.id?PD.color:"transparent",
              color:tab===t.id?"#111":T.textMute,
              fontSize:13,fontWeight:tab===t.id?800:600,cursor:"pointer",
              fontFamily:T.fontUI,
              boxShadow:tab===t.id?`0 2px 10px ${PD.color}45`:"none",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ══════════════ OVERVIEW ══════════════ */}
        {tab==="overview"&&(
          <div className="fade-up">
            {/* 4 stat tiles — period/ovulation/energy/mood */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {[
                {label:"Period in", val:dToP<=0?"Today":`${dToP}d`, sub:fmtDate(nextP),   color:PHASES.menstruation.color, bg:PHASES.menstruation.bg},
                {label:"Ovulation", val:dToO<=0?"Now!":dToO===1?"Tmrw":`${dToO}d`,        sub:fmtDate(nextO), color:T.green, bg:PHASES.ovulation.bg},
                {label:"Energy",    val:tips.energy,  sub:"Current phase",                 color:PHASES.follicular.color, bg:PHASES.follicular.bg},
                {label:"Mood",      val:tips.mood,    sub:"Expected",                      color:T.accent, bg:PHASES.luteal.bg},
              ].map((s,i)=>(
                <div key={s.label} className={`fade-up-${i+1}`} style={{background:s.bg,border:`1px solid ${s.color}22`,borderRadius:T.r.lg,padding:"15px 17px"}}>
                  <Lbl style={{color:s.color+"88"}}>{s.label}</Lbl>
                  <div style={{fontSize:20,fontWeight:400,color:s.color,fontFamily:T.fontDisp,marginBottom:3,lineHeight:1}}>{s.val}</div>
                  <div style={{fontSize:12,color:T.textMute}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Libido bar */}
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.md,padding:"11px 17px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <Lbl style={{marginBottom:0}}>Libido</Lbl>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {["Low","Medium","Rising","Peak","Falling"].map(l=>(
                  <div key={l} style={{width:24,height:5,borderRadius:3,background:tips.libido===l?PD.color:T.border,transition:"background 0.2s"}}/>
                ))}
                <span style={{fontSize:12,fontWeight:700,color:PD.color,marginLeft:5}}>{tips.libido}</span>
              </div>
            </div>

            {/* Symptoms — always tappable, no edit mode */}
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.lg,padding:18,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <Lbl style={{marginBottom:0}}>Symptoms</Lbl>
                <span style={{fontSize:11,color:T.textMute}}>tap to toggle</span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {SYMPTOMS.map(s=>{
                  const on=(profile.symptoms||[]).includes(s);
                  return (
                    <button key={s} onClick={()=>toggleSym(s)} className="sym" style={{
                      background:on?PD.color+"22":"rgba(255,255,255,0.05)",
                      border:`1px solid ${on?PD.color+"55":T.border}`,
                      borderRadius:T.r.pill,padding:"6px 13px",
                      color:on?PD.color:T.textMute,fontSize:13,cursor:"pointer",
                    }}>{s}</button>
                  );
                })}
              </div>
            </div>

            {/* Period started today — inline row with undo */}
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.md,padding:"12px 16px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:T.text}}>🔴 Period started today?</div>
                  <div style={{fontSize:12,color:T.textMute,marginTop:2}}>Updates your last period date to today</div>
                </div>
                <button onClick={markPeriod} className="pressable" style={{
                  background:periodFlash?T.green:PHASES.menstruation.color,color:"#fff",border:"none",
                  borderRadius:T.r.lg,padding:"9px 16px",fontSize:13,fontWeight:700,
                  cursor:"pointer",flexShrink:0,
                  boxShadow:`0 3px 10px ${periodFlash?T.green+"44":PHASES.menstruation.color+"44"}`,
                  transition:"all 0.2s",
                }}>{periodFlash?"✓ Saved":"Mark"}</button>
              </div>
              {/* Undo toast */}
              {undoPeriod&&(
                <div className="fade-up" style={{marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"rgba(139,111,232,0.1)",border:`1px solid ${T.accent}30`,borderRadius:T.r.md}}>
                  <span style={{fontSize:12,color:T.textSub}}>Period date updated</span>
                  <button onClick={()=>{onUpdate({...profile,lastPeriodStart:undoPeriod});setUndoPeriod(null);setPeriodFlash(false);}} className="pressable" style={{background:"none",border:"none",color:T.accent,fontSize:12,fontWeight:700,cursor:"pointer",padding:"2px 6px"}}>
                    Undo
                  </button>
                </div>
              )}
            </div>

            <AIInsight profile={profile}/>
          </div>
        )}

        {/* ══════════════ CALENDAR ══════════════ */}
        {tab==="calendar"&&(
          <div className="fade-up">
            {/* Month calendar */}
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.xl,padding:22,marginBottom:14,boxShadow:T.shadow}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                <button onClick={()=>setMonthOffset(m=>m-1)} className="pressable" style={{width:38,height:38,borderRadius:"50%",background:T.surface2,border:`1px solid ${T.border}`,color:T.text,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:17,fontWeight:800,color:T.text}}>{calLabel}</div>
                  {monthOffset!==0&&<button onClick={()=>setMonthOffset(0)} style={{background:"none",border:"none",color:PD.color,fontSize:11,cursor:"pointer",marginTop:3,fontFamily:T.fontUI,textDecoration:"underline"}}>Today</button>}
                </div>
                <button onClick={()=>setMonthOffset(m=>m+1)} className="pressable" style={{width:38,height:38,borderRadius:"50%",background:T.surface2,border:`1px solid ${T.border}`,color:T.text,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
              </div>
              <MonthCalendar profile={profile} monthOffset={monthOffset}/>
            </div>

            {/* Intimacy log — no separate + Add button, FAB handles it */}
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.xl,padding:18,boxShadow:T.shadow}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div>
                  <Lbl style={{marginBottom:2}}>Intimacy Log</Lbl>
                  <div style={{fontSize:12,color:T.textMute}}>{(profile.intimacyLog||[]).length} session{(profile.intimacyLog||[]).length!==1?"s":""} · tap 💕 below to add</div>
                </div>
              </div>
              {(profile.intimacyLog||[]).length===0
                ?<p style={{fontSize:13,color:T.textMute,fontStyle:"italic",margin:0}}>No sessions logged yet.</p>
                :[...(profile.intimacyLog||[])].reverse().map(d=>{
                  const diff=Math.floor((new Date(d)-new Date(profile.lastPeriodStart))/86400000);
                  const cd=((diff%profile.cycleLength)+profile.cycleLength)%profile.cycleLength+1;
                  const ph=getPhaseFromDay(cd,profile), col=PHASES[ph].color;
                  return (
                    <div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                      <div>
                        <span style={{fontSize:13,color:T.text,fontWeight:600}}>💕 {fmtDate(d)}</span>
                        <span style={{background:col+"1a",border:`1px solid ${col}30`,borderRadius:T.r.pill,padding:"2px 9px",fontSize:12,color:col,marginLeft:8}}>{PHASES[ph].label} · Day {cd}</span>
                      </div>
                      <button onClick={()=>removeIntimacy(d)} className="pressable" style={{background:"none",border:"none",color:T.textMute,cursor:"pointer",fontSize:18,lineHeight:1,padding:"3px 7px"}}>×</button>
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}

        {/* ══════════════ INSIGHTS ══════════════ */}
        {tab==="insights"&&(
          <div className="fade-up">
            {Object.values(PHASES).map((val,i)=>{
              const t=TIPS[val.key], isCur=phase===val.key;
              const liveDays=bounds[val.key];
              return (
                <div key={val.key} className={`fade-up-${Math.min(i,3)}`} style={{
                  background:isCur?`linear-gradient(135deg,${val.bg},${T.surface})`:T.surface,
                  border:`1px solid ${isCur?val.color+"50":T.border}`,
                  borderRadius:T.r.xl,padding:20,marginBottom:12,
                  boxShadow:isCur?`0 6px 28px ${val.color}18`:T.shadow,
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:44,height:44,borderRadius:14,background:val.color+"1a",border:`1px solid ${val.color}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{val.emoji}</div>
                      <div>
                        <div style={{fontSize:15,fontWeight:400,color:val.color,fontFamily:T.fontDisp}}>{val.label}</div>
                        <div style={{fontSize:11,color:T.textMute}}>Day {liveDays[0]}–{liveDays[1]} · {Math.max(0,liveDays[1]-liveDays[0]+1)}d</div>
                      </div>
                    </div>
                    {isCur&&<div style={{background:val.color,borderRadius:T.r.pill,padding:"4px 14px",fontSize:11,fontWeight:800,color:"#111"}}>NOW</div>}
                  </div>
                  <p style={{fontSize:14,color:T.textSub,lineHeight:1.7,margin:"0 0 14px"}}>{t.note}</p>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    {[`⚡ ${t.energy}`,`🧠 ${t.mood}`,`💫 ${t.libido}`,t.safe?"✅ Safe":"⚠️ Risky"].map(tag=>(
                      <span key={tag} style={{background:val.color+"18",border:`1px solid ${val.color}28`,borderRadius:T.r.pill,padding:"5px 13px",fontSize:12,color:val.color}}>{tag}</span>
                    ))}
                  </div>
                </div>
              );
            })}
            <AIInsight profile={profile}/>
          </div>
        )}

        {/* ══════════════ EDIT (was "Log") ══════════════ */}
        {tab==="edit"&&(()=>{
          const cl   = profile.cycleLength    || 28;
          const ovd  = profile.ovulationDay   || 14;
          const ovl  = profile.ovulationLength|| 3;
          return (
            <div className="fade-up">
              <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.xl,padding:24,marginBottom:14,boxShadow:T.shadow}}>
                <div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:14}}>🗓 Cycle Settings</div>
                <div style={{marginBottom:18}}>
                  <Lbl>Last Period Start Date</Lbl>
                  <input type="date" value={profile.lastPeriodStart||""} className="field"
                    onChange={e=>onUpdate({...profile,lastPeriodStart:e.target.value})}
                    style={inputStyle}/>
                </div>
                <SliderRow label="Total Cycle Length" emoji="🔄" color={T.accent}
                  value={cl} min={18} max={60}
                  note={`Full cycle from Day 1 to Day ${cl}`}
                  onChange={v=>{
                    const newOvd=Math.min(ovd,v-2), newOvl=Math.min(ovl,v-newOvd-1);
                    onUpdate({...profile,cycleLength:v,ovulationDay:newOvd,ovulationLength:Math.max(1,newOvl)});
                  }}
                />
                <Hr/>
                <div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:6}}>⚙️ Phase Boundaries</div>
                <PhaseDividerBar profile={profile} onUpdate={onUpdate}/>
                <Hr/>
                <div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:12}}>📝 Notes</div>
                <textarea value={profile.notes||""} onChange={e=>onUpdate({...profile,notes:e.target.value})}
                  placeholder="Mood patterns, observations…" className="field"
                  style={{...inputStyle,minHeight:90,resize:"vertical",fontSize:14}}/>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── FAB — fixed bottom-right, opens log intimacy ── */}
      <button onClick={()=>setShowLogModal(true)} className="pressable" style={{
        position:"fixed",bottom:28,right:24,
        width:58,height:58,borderRadius:"50%",
        background:`linear-gradient(135deg,${T.accent},#9b6fe8)`,
        border:"none",boxShadow:`0 6px 24px ${T.accent}77`,
        fontSize:24,cursor:"pointer",zIndex:200,
        display:"flex",alignItems:"center",justifyContent:"center",
        transition:"transform 0.15s ease, box-shadow 0.15s ease",
      }}>💕</button>

      {/* ── KEBAB BOTTOM SHEET ── */}
      {showKebab&&(
        <>
          <div onClick={()=>setShowKebab(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",zIndex:300}}/>
          <div className="sheet-in" style={{position:"fixed",bottom:0,left:0,right:0,background:T.surface,borderRadius:"22px 22px 0 0",padding:"10px 0 32px",zIndex:301,maxWidth:500,margin:"0 auto",boxShadow:"0 -8px 40px rgba(0,0,0,0.5)"}}>
            <div style={{width:36,height:4,borderRadius:2,background:T.border,margin:"8px auto 16px"}}/>
            {/* Profile name header */}
            <div style={{padding:"0 22px 14px",borderBottom:`1px solid ${T.border}`,marginBottom:8}}>
              <div style={{fontSize:13,color:T.textMute,marginBottom:2}}>Actions for</div>
              <div style={{fontSize:18,fontWeight:800,color:T.text}}>{profile.avatar} {profile.name}</div>
            </div>
            {[
              {icon:"📤",label:"Share Partner Code",  action:()=>{setShowKebab(false);setShowShareCode(true);}},
              {icon:profile.hidden?"👁":"🙈", label:profile.hidden?"Show Profile":"Hide Profile", action:()=>{onUpdate({...profile,hidden:!profile.hidden});setShowKebab(false);}},
            ].map(item=>(
              <button key={item.label} onClick={item.action} className="pressable" style={{
                display:"flex",alignItems:"center",gap:16,width:"100%",
                padding:"14px 22px",background:"none",border:"none",
                color:T.text,fontSize:15,fontWeight:600,cursor:"pointer",textAlign:"left",
              }}>
                <span style={{fontSize:20,width:28,textAlign:"center"}}>{item.icon}</span>{item.label}
              </button>
            ))}
            {/* Delete — separate, red */}
            <div style={{margin:"8px 22px 0",borderTop:`1px solid ${T.border}`,paddingTop:8}}>
              <button onClick={()=>{setShowKebab(false);setShowDelModal(true);}} style={{
                display:"flex",alignItems:"center",gap:16,width:"100%",
                padding:"14px 0",background:"none",border:"none",
                color:"#ff6b6b",fontSize:15,fontWeight:700,cursor:"pointer",textAlign:"left",
              }}>
                <span style={{fontSize:20,width:28,textAlign:"center"}}>🗑</span>Delete Profile
              </button>
            </div>
          </div>
        </>
      )}

      {showShareCode&&<ShareCodeModal profile={profile} onClose={()=>setShowShareCode(false)}/>}

      {/* ── LOG INTIMACY MODAL ── */}
      {showLogModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:400}}>
          <div className="sheet-in" style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"22px 22px 0 0",padding:28,width:"100%",maxWidth:500,boxShadow:"0 -8px 36px rgba(0,0,0,0.5)"}}>
            <div style={{width:36,height:4,borderRadius:2,background:T.border,margin:"0 auto 22px"}}/>
            <h3 style={{fontFamily:T.fontDisp,fontSize:20,marginBottom:20}}>💕 Log Intimacy Session</h3>
            <Lbl>Date</Lbl>
            <input type="date" value={logDate} onChange={e=>setLogDate(e.target.value)} className="field"
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,borderRadius:T.r.md,padding:"12px 15px",color:T.text,fontSize:14,outline:"none",display:"block",marginBottom:dupeDateMsg?10:22}}/>
            {dupeDateMsg&&(
              <div style={{marginBottom:14,padding:"8px 12px",background:`${PHASES.menstruation.color}15`,border:`1px solid ${PHASES.menstruation.color}35`,borderRadius:T.r.md,fontSize:13,color:PHASES.menstruation.color}}>
                Already logged for this date
              </div>
            )}
            <div style={{display:"flex",gap:10}}>
              <Btn variant="ghost" onClick={()=>setShowLogModal(false)} style={{flex:1,padding:14}}>Cancel</Btn>
              <button className="pressable" onClick={logIntimacy} style={{flex:2,padding:14,background:T.accent,color:"#fff",border:"none",borderRadius:T.r.lg,fontSize:14,fontWeight:800,cursor:"pointer",boxShadow:`0 4px 16px ${T.accent}55`}}>Save Session 💕</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {showDelModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:20}}>
          <div className="scale-in" style={{background:T.surface,border:"1px solid rgba(224,85,85,0.28)",borderRadius:T.r.xl,padding:32,width:"100%",maxWidth:340,textAlign:"center",boxShadow:T.shadowLg}}>
            <div style={{fontSize:44,marginBottom:14}}>🗑️</div>
            <h3 style={{fontFamily:T.fontDisp,fontSize:22,marginBottom:8}}>Delete {profile.name}?</h3>
            <p style={{color:T.textSub,fontSize:13,marginBottom:26,lineHeight:1.65}}>All cycle history, intimacy logs, symptoms and notes will be permanently removed.</p>
            <div style={{display:"flex",gap:10}}>
              <Btn variant="ghost" onClick={()=>setShowDelModal(false)} style={{flex:1,padding:14}}>Cancel</Btn>
              <button className="pressable" onClick={onDelete} style={{flex:1,padding:14,background:T.red,color:"#fff",border:"none",borderRadius:T.r.lg,fontSize:14,fontWeight:800,cursor:"pointer"}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADD PROFILE ──────────────────────────────────────────────────────────────

function AddProfile({ onAdd, onBack, startTab="manual" }) {
  const [mode,    setMode]    = useState(startTab); // "manual" | "import"
  const [form,    setForm]    = useState({name:"",lastPeriodStart:todayStr(),cycleLength:28,periodLength:5,avatar:"🌸"});
  const [codeStr, setCodeStr] = useState("");
  const [decoded, setDecoded] = useState(null);
  const [codeErr, setCodeErr] = useState(false);
  const [editingImport, setEditingImport] = useState(false);

  const ok = form.name.trim().length > 0;
  const inputStyle={};  // uses .field CSS class — no inline override needed

  function tryDecode(val) {
    setCodeStr(val);
    if (!val.trim() || val.trim().length < 8) { setDecoded(null); setCodeErr(false); return; }
    const result = decodePartnerCode(val.trim());
    if (result) { setDecoded(result); setCodeErr(false); }
    else        { setDecoded(null);   setCodeErr(true);  }
  }

  function submitImport() {
    if (!decoded) return;
    onAdd({ ...decoded, id: Date.now().toString(), hidden: false });
  }

  function submitManual() {
    if (!ok) return;
    onAdd({ ...form, id:Date.now().toString(), symptoms:[], intimacyLog:[], notes:"", hidden:false, ovulationDay:form.ovulationDay||14, ovulationLength:form.ovulationLength||3 });
  }

  return (
    <div style={{minHeight:"100%",background:T.page,color:T.text,fontFamily:T.fontUI}}>
      <div style={{position:"relative",zIndex:2,maxWidth:500,margin:"0 auto",padding:"18px 16px 100px"}}>
        <Btn variant="ghost" onClick={onBack} style={{marginBottom:24,padding:"8px 16px",fontSize:13}}>← Back</Btn>

        <div className="fade-up" style={{marginBottom:22}}>
          <h2 style={{fontFamily:T.fontDisp,fontSize:26,fontWeight:400,marginBottom:5,lineHeight:1.1}}>Add Profile</h2>
          <p style={{color:T.textSub,fontSize:14,lineHeight:1.55}}>Fill in manually or paste a partner code to import.</p>
        </div>

        {/* Mode toggle — DD pill tab style */}
        <div style={{display:"flex",background:"rgba(0,0,0,0.25)",borderRadius:T.r.pill,padding:4,marginBottom:20,border:`1px solid ${T.border}`,gap:3}}>
          {[{id:"manual",label:"✏️ Manual"},{id:"import",label:"📥 Import Code"}].map(m=>(
            <button key={m.id} onClick={()=>setMode(m.id)} className="tab pressable" style={{
              flex:1,border:"none",borderRadius:T.r.pill,padding:"10px 8px",
              background:mode===m.id?T.accent:"transparent",
              color:mode===m.id?"#fff":T.textMute,
              fontSize:13,fontWeight:mode===m.id?800:600,cursor:"pointer",
              fontFamily:T.fontUI,
              boxShadow:mode===m.id?`0 2px 10px ${T.accent}45`:"none",
            }}>{m.label}</button>
          ))}
        </div>

        {/* ── MANUAL MODE ── */}
        {mode==="manual"&&(
          <div className="fade-up">
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.xl,padding:24,marginBottom:14,boxShadow:T.shadow}}>
              <Lbl>Choose Avatar</Lbl>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
                {AVATARS.map(a=>(
                  <button key={a} onClick={()=>setForm({...form,avatar:a})} className="pressable" style={{
                    width:46,height:46,fontSize:21,borderRadius:13,cursor:"pointer",
                    background:form.avatar===a?"rgba(124,92,191,0.25)":"rgba(255,255,255,0.05)",
                    border:`2px solid ${form.avatar===a?T.accent:T.border}`,transition:"all 0.15s",
                  }}>{a}</button>
                ))}
              </div>
              <Hr/>
              {[
                {label:"Name",                   key:"name",            type:"text",   ph:"Her name…"},
                {label:"Last Period Start Date",  key:"lastPeriodStart", type:"date"   },
                {label:"Average Cycle Length",    key:"cycleLength",     type:"number", ph:"28"},
                {label:"Period Duration (Days)",  key:"periodLength",    type:"number", ph:"5"},
              ].map(f=>(
                <div key={f.key} style={{marginBottom:16}}>
                  <Lbl>{f.label}</Lbl>
                  <input type={f.type} value={form[f.key]} placeholder={f.ph} className="field"
                    min={f.type==="number"?1:undefined} max={f.type==="number"?60:undefined}
                    onChange={e=>setForm({...form,[f.key]:f.type==="number"?Math.max(1,parseInt(e.target.value)||28):e.target.value})}
                    style={inputStyle} autoFocus={f.key==="name"}/>
                </div>
              ))}
            </div>
            <button className="pressable" onClick={submitManual} disabled={!ok}
              style={{width:"100%",padding:"16px",background:ok?"#111":"rgba(255,255,255,0.1)",color:ok?T.text:"rgba(255,255,255,0.25)",border:"none",borderRadius:T.r.lg,fontSize:15,fontWeight:800,cursor:ok?"pointer":"not-allowed",boxShadow:ok?"0 4px 18px rgba(0,0,0,0.55)":"none",letterSpacing:"0.02em"}}>
              Add Profile →
            </button>
          </div>
        )}

        {/* ── IMPORT MODE ── */}
        {mode==="import"&&(
          <div className="fade-up">
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.xl,padding:24,marginBottom:14,boxShadow:T.shadow}}>

              <div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:6}}>📥 Paste Cycle Data</div>
              <div style={{fontSize:13,color:T.textMute,lineHeight:1.6,marginBottom:16}}>
                Paste a Cyclr partner code, a JSON export from Flo/Clue/Natural Cycles, or any text containing a date and cycle length.
              </div>

              <textarea
                value={codeStr}
                onChange={e=>tryDecode(e.target.value)}
                placeholder="Paste here — CYC- code, JSON export, or any text with a cycle date…"
                className="field"
                style={{...inputStyle,minHeight:100,resize:"vertical",fontSize:13,fontFamily:"monospace",marginBottom:0}}
              />

              {/* Error state — more helpful */}
              {codeErr&&(
                <div style={{marginTop:10,padding:"12px 14px",background:"rgba(255,69,58,0.08)",border:`1px solid ${T.red}30`,borderRadius:T.r.md}}>
                  <div style={{fontSize:13,color:T.red,marginBottom:6,fontWeight:600}}>⚠️ Couldn't read that format</div>
                  <div style={{fontSize:12,color:T.textMute,lineHeight:1.6}}>
                    Cyclr can read: <b style={{color:T.textSub}}>CYC- codes</b>, <b style={{color:T.textSub}}>JSON exports</b>, or text containing a <b style={{color:T.textSub}}>date (2024-03-15)</b> and cycle info. Try copying just the data section from your app's export.
                  </div>
                </div>
              )}

              {/* Success preview */}
              {decoded&&!editingImport&&(
                <div className="fade-up" style={{marginTop:14}}>
                  <div style={{padding:"4px 0 10px",fontSize:11,fontWeight:800,letterSpacing:1.5,color:T.green}}>✓ CODE RECOGNISED</div>
                  {/* Profile preview card */}
                  <div style={{background:T.surface2,border:`1px solid ${T.green}33`,borderRadius:T.r.lg,padding:16,marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                      <div style={{fontSize:28}}>{decoded.avatar}</div>
                      <div>
                        <div style={{fontSize:17,fontWeight:800,color:T.text}}>{decoded.name}</div>
                        <div style={{fontSize:12,color:T.textMute}}>Cycle: {decoded.cycleLength}d · Period: {decoded.periodLength}d · Ovulation day {decoded.ovulationDay}</div>
                      </div>
                    </div>
                    {/* Phase bar preview */}
                    {(()=>{
                      const b=getPhaseBounds(decoded);
                      const cl=decoded.cycleLength;
                      return (
                        <div style={{display:"flex",borderRadius:6,overflow:"hidden",height:10,gap:2}}>
                          {[
                            {key:"menstruation",days:b.menstruation,color:PHASES.menstruation.color},
                            {key:"follicular",  days:b.follicular,  color:PHASES.follicular.color},
                            {key:"ovulation",   days:b.ovulation,   color:PHASES.ovulation.color},
                            {key:"luteal",      days:b.luteal,      color:PHASES.luteal.color},
                          ].map(s=>{
                            const len = Math.max(0, s.days[1]-s.days[0]+1);
                            if(len===0) return null;
                            return <div key={s.key} style={{width:`${(len/cl)*100}%`,background:s.color,borderRadius:3}}/>;
                          })}
                        </div>
                      );
                    })()}
                    <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                      {[
                        {label:`📅 Last period`,  val:fmtDate(decoded.lastPeriodStart)},
                        {label:`💕 Sessions`,      val:decoded.intimacyLog.length},
                        {label:`🏷 Symptoms`,      val:decoded.symptoms.length},
                      ].map(s=>(
                        <span key={s.label} style={{fontSize:11,color:T.textSub,background:"rgba(255,255,255,0.06)",borderRadius:T.r.pill,padding:"4px 10px"}}>{s.label}: <b style={{color:T.text}}>{s.val}</b></span>
                      ))}
                    </div>
                  </div>
                  {/* Options */}
                  <div style={{display:"flex",gap:10}}>
                    <button className="pressable" onClick={()=>setEditingImport(true)} style={{flex:1,padding:12,background:T.surface2,color:T.textSub,border:`1px solid ${T.border}`,borderRadius:T.r.lg,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                      ✏️ Edit First
                    </button>
                    <button className="pressable" onClick={submitImport} style={{flex:2,padding:12,background:"#111",color:T.text,border:"none",borderRadius:T.r.lg,fontSize:14,fontWeight:800,cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,0.5)"}}>
                      ✓ Import Profile
                    </button>
                  </div>
                </div>
              )}

              {/* Edit-before-import mode */}
              {decoded&&editingImport&&(
                <div className="fade-up" style={{marginTop:14}}>
                  <div style={{padding:"4px 0 14px",fontSize:11,fontWeight:800,letterSpacing:1.5,color:T.accent}}>EDITING IMPORTED DATA</div>
                  {/* Avatar */}
                  <Lbl>Avatar</Lbl>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
                    {AVATARS.map(a=>(
                      <button key={a} onClick={()=>setDecoded({...decoded,avatar:a})} className="pressable" style={{
                        width:42,height:42,fontSize:19,borderRadius:11,cursor:"pointer",
                        background:decoded.avatar===a?"rgba(124,92,191,0.25)":"rgba(255,255,255,0.05)",
                        border:`2px solid ${decoded.avatar===a?T.accent:T.border}`,transition:"all 0.15s",
                      }}>{a}</button>
                    ))}
                  </div>
                  {[
                    {label:"Name",                   key:"name",            type:"text"},
                    {label:"Last Period Start Date",  key:"lastPeriodStart", type:"date"},
                    {label:"Cycle Length (Days)",     key:"cycleLength",     type:"number"},
                    {label:"Period Duration (Days)",  key:"periodLength",    type:"number"},
                    {label:"Ovulation Starts (Day)",  key:"ovulationDay",    type:"number"},
                    {label:"Ovulation Window (Days)", key:"ovulationLength", type:"number"},
                  ].map(f=>(
                    <div key={f.key} style={{marginBottom:14}}>
                      <Lbl>{f.label}</Lbl>
                      <input type={f.type} value={decoded[f.key]||""} className="field"
                        min={f.type==="number"?1:undefined} max={f.type==="number"?60:undefined}
                        onChange={e=>setDecoded({...decoded,[f.key]:f.type==="number"?Math.max(1,parseInt(e.target.value)||1):e.target.value})}
                        style={inputStyle}/>
                    </div>
                  ))}
                  <div style={{display:"flex",gap:10,marginTop:6}}>
                    <button className="pressable" onClick={()=>setEditingImport(false)} style={{flex:1,padding:12,background:T.surface2,color:T.textSub,border:`1px solid ${T.border}`,borderRadius:T.r.lg,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                      ← Back
                    </button>
                    <button className="pressable" onClick={submitImport} style={{flex:2,padding:12,background:"#111",color:T.text,border:"none",borderRadius:T.r.lg,fontSize:14,fontWeight:800,cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,0.5)"}}>
                      ✓ Import Profile
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* How it works info box */}
            {!decoded&&!codeErr&&(
              <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.lg,padding:18,boxShadow:T.shadow}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>💡 What you can paste</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {step:"A", text:"A CYC- code from Cyclr — open any profile → ⋯ → Share Partner Code"},
                    {step:"B", text:"A JSON data export from Flo, Clue, or Natural Cycles (Settings → Export data)"},
                    {step:"C", text:"Any text that contains a date like 2024-03-15 — Cyclr will extract what it can"},
                    {step:"D", text:"After importing, go to the Edit tab to fine-tune phase boundaries"},
                  ].map(s=>(
                    <div key={s.step} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                      <div style={{width:24,height:24,borderRadius:"50%",background:T.accent+"22",border:`1px solid ${T.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:T.accent,flexShrink:0}}>{s.step}</div>
                      <div style={{fontSize:13,color:T.textSub,lineHeight:1.55,paddingTop:2}}>{s.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function Dashboard({ user, profiles, onSelect, onAdd, onImport, onLogout }) {
  const [showHidden, setShowHidden] = useState(false);
  const [showMenu,   setShowMenu]   = useState(false);
  const visible  = profiles.filter(p=>showHidden?p.hidden:!p.hidden);
  const hiddenCt = profiles.filter(p=>p.hidden).length;
  const active   = profiles.filter(p=>!p.hidden);
  const safeCt   = active.filter(p=>TIPS[getPhaseFromDay(getDayOfCycle(p.lastPeriodStart,p.cycleLength),p)].safe).length;
  const ovCt     = active.filter(p=>getPhaseFromDay(getDayOfCycle(p.lastPeriodStart,p.cycleLength),p)==="ovulation").length;
  const sessCt   = active.reduce((a,p)=>a+(p.intimacyLog||[]).length,0);

  return (
    <div style={{minHeight:"100%",background:T.page,color:T.text,fontFamily:T.fontUI,position:"relative"}}>
      <div style={{position:"relative",zIndex:2,maxWidth:500,margin:"0 auto",padding:"0 16px 120px"}}>

        {/* ── HEADER — name left, kebab right ── */}
        <div className="fade-up" style={{padding:"26px 0 20px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <p style={{fontSize:12,color:T.textMute,letterSpacing:0.4,marginBottom:3,fontWeight:600}}>Welcome back</p>
            <h1 style={{fontFamily:T.fontDisp,fontSize:26,fontWeight:400,marginBottom:3,lineHeight:1.1}}>{user.username}</h1>
            <p style={{fontSize:12,color:T.textMute}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p>
          </div>
          <button onClick={()=>setShowMenu(true)} className="pressable" style={{
            width:42,height:42,borderRadius:"50%",marginTop:4,flexShrink:0,
            background:"rgba(255,255,255,0.07)",border:`1px solid ${T.border}`,
            color:T.textSub,fontSize:20,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",letterSpacing:1,
          }}>⋯</button>
        </div>

        {/* ── SUMMARY STRIP ── */}
        {active.length>0&&(
          <div className="fade-up-1" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>
            {[
              {label:"Safe Now",  val:safeCt,         color:T.green,    bg:PHASES.ovulation.bg},
              {label:"Ovulating", val:ovCt,           color:PHASES.follicular.color, bg:PHASES.follicular.bg},
              {label:"Sessions",  val:sessCt,         color:PHASES.menstruation.color, bg:PHASES.menstruation.bg},
              {label:"Profiles",  val:active.length, color:T.accent, bg:PHASES.luteal.bg},
            ].map(s=>(
              <div key={s.label} style={{background:s.bg,border:`1px solid ${s.color}20`,borderRadius:T.r.lg,padding:"12px 8px",textAlign:"center",boxShadow:T.shadow}}>
                <div style={{fontSize:22,fontWeight:400,color:s.color,lineHeight:1,fontFamily:T.fontDisp}}>{s.val}</div>
                <div style={{fontSize:12,color:T.textMute,marginTop:4,fontWeight:600}}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── HIDDEN TOGGLE ── */}
        {hiddenCt>0&&(
          <button onClick={()=>setShowHidden(h=>!h)} className="pressable" style={{
            width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,
            borderRadius:T.r.pill,padding:"11px",color:T.textMute,fontSize:12,fontWeight:700,
            cursor:"pointer",marginBottom:14,
          }}>
            {showHidden?`👁 Hide ${hiddenCt} hidden`:`🙈 ${hiddenCt} hidden profile${hiddenCt>1?"s":""} — tap to reveal`}
          </button>
        )}

        {/* ── EMPTY STATE — first-time onboarding ── */}
        {visible.length===0?(
          <div className="fade-up">
            {!showHidden?(
              <div>
                {/* Welcome hero */}
                <div style={{textAlign:"center",padding:"40px 0 32px"}}>
                  <div style={{fontSize:52,marginBottom:16}}>🌙</div>
                  <h2 style={{fontFamily:T.fontDisp,fontSize:26,fontWeight:400,marginBottom:10,color:T.text}}>Welcome to Cyclr</h2>
                  <p style={{color:T.textSub,fontSize:15,lineHeight:1.65,maxWidth:320,margin:"0 auto"}}>
                    Track your partner's cycle, understand her phases, and get AI-powered insights.
                  </p>
                </div>
                {/* Feature cards */}
                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
                  {[
                    {icon:"📊",title:"Phase tracking",desc:"See exactly where she is in her cycle every day — period, follicular, ovulation, or luteal."},
                    {icon:"🤖",title:"AI insights",desc:"Get frank, personalised advice for each phase using your Anthropic API key."},
                    {icon:"📥",title:"Import from any app",desc:"Paste data from Flo, Clue, or Natural Cycles — or share a CYC- code between devices."},
                  ].map(f=>(
                    <div key={f.title} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.lg,padding:"14px 16px",display:"flex",gap:14,alignItems:"flex-start"}}>
                      <div style={{fontSize:22,flexShrink:0,marginTop:1}}>{f.icon}</div>
                      <div>
                        <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:3}}>{f.title}</div>
                        <div style={{fontSize:13,color:T.textSub,lineHeight:1.55}}>{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* CTAs */}
                <div style={{display:"flex",gap:10}}>
                  <button className="pressable" onClick={onImport} style={{flex:1,padding:"13px 10px",background:T.surface,color:T.textSub,border:`1px solid ${T.border}`,borderRadius:T.r.lg,fontSize:14,fontWeight:600,cursor:"pointer"}}>
                    📥 Import code
                  </button>
                  <button className="pressable" onClick={onAdd} style={{flex:2,padding:"13px 10px",background:T.accent,color:"#fff",border:"none",borderRadius:T.r.lg,fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 20px ${T.accent}44`}}>
                    Add first profile →
                  </button>
                </div>
              </div>
            ):(
              <div style={{textAlign:"center",padding:"72px 20px"}}>
                <div style={{fontSize:40,marginBottom:12}}>🙈</div>
                <h2 style={{fontFamily:T.fontDisp,fontSize:22,fontWeight:400,marginBottom:8}}>No hidden profiles</h2>
                <p style={{color:T.textSub,fontSize:14}}>All profiles are currently visible.</p>
              </div>
            )}
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {visible.map((profile,idx)=>{
              const day=getDayOfCycle(profile.lastPeriodStart,profile.cycleLength);
              const phase=getPhaseFromDay(day,profile), PD=PHASES[phase], tips=TIPS[phase];
              const dToP=daysUntil(getNextPeriod(profile.lastPeriodStart,profile.cycleLength));
              const dToO=daysUntil(getOvulation(profile.lastPeriodStart,profile));
              const accent=PD.color;
              const b=getPhaseBounds(profile);
              const segs=[
                {key:"menstruation",days:b.menstruation,color:PHASES.menstruation.color},
                {key:"follicular",  days:b.follicular,  color:PHASES.follicular.color},
                {key:"ovulation",   days:b.ovulation,   color:PHASES.ovulation.color},
                {key:"luteal",      days:b.luteal,      color:PHASES.luteal.color},
              ];
              return (
                <div key={profile.id} className={`card-lift fade-up-${Math.min(idx+1,3)}`} onClick={()=>onSelect(profile)}
                  style={{borderRadius:T.r.xl,overflow:"hidden",cursor:"pointer",background:T.surface,boxShadow:T.shadow}}>
                  <div style={{height:5,background:`linear-gradient(90deg,${accent},${accent}77)`}}/>
                  <div style={{padding:"18px 18px 16px",border:`1px solid ${accent}15`,borderTop:"none",borderRadius:`0 0 ${T.r.xl}px ${T.r.xl}px`}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{width:52,height:52,borderRadius:16,background:accent+"25",border:`2px solid ${accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{profile.avatar}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:17,fontWeight:400,fontFamily:T.fontDisp,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:4}}>{profile.name}</div>
                        <div style={{display:"inline-flex",alignItems:"center",gap:5,background:PD.color+"1a",borderRadius:T.r.pill,padding:"3px 10px",border:`1px solid ${PD.color}25`}}>
                          <span style={{fontSize:10}}>{PD.emoji}</span>
                          <span style={{fontSize:11,color:PD.color,fontWeight:700}}>{PD.label} · Day {day}</span>
                        </div>
                      </div>
                      <div style={{background:tips.safe?"rgba(76,175,122,0.15)":"rgba(232,67,147,0.15)",border:`1px solid ${tips.safe?T.green+"38":"#e84393"+"38"}`,borderRadius:T.r.pill,padding:"6px 12px",flexShrink:0}}>
                        <div style={{fontSize:11,fontWeight:800,color:tips.safe?T.green:"#e84393"}}>{tips.safe?"✅ OK":"⚠️ Risk"}</div>
                      </div>
                    </div>
                    {/* Phase bar using live profile bounds */}
                    <div style={{display:"flex",height:5,borderRadius:5,overflow:"hidden",gap:2,marginBottom:12}}>
                      {segs.map(s=>{
                        const len=Math.max(0,s.days[1]-s.days[0]+1);
                        if(!len)return null;
                        return <div key={s.key} style={{width:`${(len/profile.cycleLength)*100}%`,background:phase===s.key?s.color:s.color+"22",borderRadius:3,transition:"background 0.3s"}}/>;
                      })}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:(profile.symptoms||[]).length>0?12:0}}>
                      {[
                        {label:"Period",    val:dToP<=0?"Today":`${dToP}d`,                color:"#e84393",bg:PHASES.menstruation.bg},
                        {label:"Ovulation", val:dToO<=0?"Now!":dToO===1?"Tmrw":`${dToO}d`,color:T.green,  bg:PHASES.ovulation.bg},
                        {label:"Sessions",  val:(profile.intimacyLog||[]).length,          color:T.accent,bg:PHASES.luteal.bg},
                      ].map(s=>(
                        <div key={s.label} style={{background:s.bg,borderRadius:T.r.md,padding:"9px 10px"}}>
                          <div style={{fontSize:15,fontWeight:400,color:s.color,fontFamily:T.fontDisp,lineHeight:1}}>{s.val}</div>
                          <div style={{fontSize:12,color:T.textMute,marginTop:3}}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {(profile.symptoms||[]).length>0&&(
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {(profile.symptoms||[]).slice(0,4).map(s=>(
                          <span key={s} style={{background:PD.color+"18",border:`1px solid ${PD.color}25`,borderRadius:T.r.pill,padding:"3px 10px",fontSize:12,color:PD.color}}>{s}</span>
                        ))}
                        {(profile.symptoms||[]).length>4&&<span style={{fontSize:11,color:T.textMute,alignSelf:"center"}}>+{(profile.symptoms||[]).length-4}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FAB — add profile ── */}
      <button onClick={onAdd} className="pressable" style={{
        position:"fixed",bottom:28,right:24,
        width:58,height:58,borderRadius:"50%",
        background:T.accent,border:"none",
        boxShadow:`0 6px 28px ${T.accent}55`,
        fontSize:26,cursor:"pointer",zIndex:200,
        display:"flex",alignItems:"center",justifyContent:"center",
      }}>+</button>

      {/* ── MENU BOTTOM SHEET ── */}
      {showMenu&&(
        <>
          <div onClick={()=>setShowMenu(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",zIndex:300}}/>
          <div className="sheet-in" style={{position:"fixed",bottom:0,left:0,right:0,background:T.surface,borderRadius:"22px 22px 0 0",padding:"10px 0 36px",zIndex:301,maxWidth:500,margin:"0 auto",boxShadow:"0 -8px 40px rgba(0,0,0,0.5)"}}>
            <div style={{width:36,height:4,borderRadius:2,background:T.border,margin:"8px auto 16px"}}/>
            <div style={{padding:"0 22px 14px",borderBottom:`1px solid ${T.border}`,marginBottom:8}}>
              <div style={{fontSize:18,fontWeight:800,color:T.text}}>Menu</div>
            </div>
            {[
              {icon:"➕",label:"Add Profile manually",  action:()=>{setShowMenu(false);onAdd();}},
              {icon:"📥",label:"Import from code",       action:()=>{setShowMenu(false);onImport();}},
              {icon:hiddenCt>0&&showHidden?"👁":"🙈",
               label:showHidden?`Hide ${hiddenCt} hidden`:`Show hidden (${hiddenCt})`,
               action:()=>{setShowHidden(h=>!h);setShowMenu(false);},
               hidden:hiddenCt===0},
            ].filter(i=>!i.hidden).map(item=>(
              <button key={item.label} onClick={item.action} className="pressable" style={{
                display:"flex",alignItems:"center",gap:16,width:"100%",
                padding:"14px 22px",background:"none",border:"none",
                color:T.text,fontSize:15,fontWeight:700,cursor:"pointer",textAlign:"left",
              }}>
                <span style={{fontSize:20,width:28,textAlign:"center"}}>{item.icon}</span>{item.label}
              </button>
            ))}
            <div style={{margin:"8px 22px 0",borderTop:`1px solid ${T.border}`,paddingTop:8}}>
              <button onClick={()=>{setShowMenu(false);onLogout();}} style={{
                display:"flex",alignItems:"center",gap:16,width:"100%",
                padding:"14px 0",background:"none",border:"none",
                color:T.textMute,fontSize:15,fontWeight:700,cursor:"pointer",
              }}>
                <span style={{fontSize:20,width:28,textAlign:"center"}}>🚪</span>Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

function Login({ onLogin }) {
  const [username,setUsername]=useState("");
  const [focused,setFocused]=useState(false);
  const ok=username.trim().length>0;

  return (
    <div style={{minHeight:"100%",background:T.page,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.fontUI,position:"relative",padding:20}}>
      {/* ── LOGIN CARD — DD centered modal on grey bg ── */}
      <div className="scale-in" style={{position:"relative",zIndex:2,width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:54,marginBottom:14}}>🌙</div>
          <h1 style={{fontFamily:T.fontDisp,fontSize:36,fontWeight:400,lineHeight:1.15,color:T.text,margin:"0 0 10px"}}>
            Find Your<br/>Best Insight.
          </h1>
          <p style={{color:T.textMute,fontSize:14,lineHeight:1.6}}>Cycle intelligence for the informed man.</p>
        </div>

        {/* The actual form card */}
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.xl,padding:28,boxShadow:T.shadowLg}}>
          <Lbl>Username</Lbl>
          <div style={{marginBottom:20}}>
            <input value={username} onChange={e=>setUsername(e.target.value)}
              onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
              onKeyDown={e=>e.key==="Enter"&&ok&&onLogin(username.trim())}
              placeholder="Enter your name" autoFocus className="field"
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1.5px solid ${focused?T.borderMd:T.border}`,borderRadius:T.r.md,padding:"13px 16px",color:T.text,fontSize:15,outline:"none",boxShadow:focused?"0 0 0 3px rgba(255,255,255,0.06)":undefined,transition:"border-color 0.14s,box-shadow 0.14s"}}
            />
          </div>
          {/* Big black CTA — "Choose Deck & Start Playing" equivalent */}
          <button className="pressable" onClick={()=>ok&&onLogin(username.trim())} disabled={!ok}
            style={{width:"100%",padding:"15px",background:ok?T.accent:"rgba(255,255,255,0.06)",color:ok?"#fff":"rgba(255,255,255,0.25)",border:"none",borderRadius:T.r.lg,fontSize:15,fontWeight:700,cursor:ok?"pointer":"not-allowed",boxShadow:ok?`0 4px 20px ${T.accent}55`:"none",letterSpacing:"0.02em",transition:"all 0.15s"}}>
            Get Started →
          </button>
          <p style={{textAlign:"center",color:T.textMute,fontSize:11,marginTop:14,lineHeight:1.5}}>All data stored locally · no account needed</p>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen,     setScreen]     = useState("loading");
  const [user,       setUser]       = useState(null);
  const [profiles,   setProfiles]   = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [addMode,    setAddMode]    = useState("manual"); // "manual" | "import"

  useEffect(()=>{
    try {
      const u=JSON.parse(localStorage.getItem("cyclr_user")||"null");
      const p=JSON.parse(localStorage.getItem("cyclr_profiles")||"[]");
      setProfiles(Array.isArray(p)?p:[]);
      if(u?.username){setUser(u);setScreen("dashboard");}
      else setScreen("login");
    } catch { setScreen("login"); }
  },[]);

  function save(p){const s=Array.isArray(p)?p:[];setProfiles(s);localStorage.setItem("cyclr_profiles",JSON.stringify(s));}
  function handleLogin(u){const usr={username:u};setUser(usr);localStorage.setItem("cyclr_user",JSON.stringify(usr));setScreen("dashboard");}
  function handleLogout(){localStorage.removeItem("cyclr_user");setUser(null);setScreen("login");}
  function handleAdd(p){save([...profiles,p]);setAddMode("manual");setScreen("dashboard");}
  function handleUpdate(u){const np=profiles.map(x=>x.id===u.id?u:x);save(np);setSelected(u);}
  function handleDelete(){save(profiles.filter(p=>p.id!==selected.id));setSelected(null);setScreen("dashboard");}
  function handleSelect(p){setSelected(p);setScreen("profile");}
  function goAdd()   { setAddMode("manual");  setScreen("add"); }
  function goImport(){ setAddMode("import");  setScreen("add"); }

  if(screen==="loading") return (
    <div style={{minHeight:"100vh",background:T.page,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:40,animation:"pulse 1.5s ease-in-out infinite"}}>🌙</div>
    </div>
  );

  return (
    <>
      <GlobalStyles/>
      {screen==="login"   && <Login onLogin={handleLogin}/>}
      {screen==="add"     && <AddProfile onAdd={handleAdd} onBack={()=>setScreen("dashboard")} startTab={addMode}/>}
      {screen==="profile" && selected && <ProfileDetail profile={selected} onUpdate={handleUpdate} onBack={()=>setScreen("dashboard")} onDelete={handleDelete}/>}
      {(screen==="dashboard"||(screen==="profile"&&!selected)) && (
        <Dashboard
          user={user||{username:"User"}} profiles={profiles}
          onSelect={handleSelect} onAdd={goAdd} onImport={goImport} onLogout={handleLogout}
        />
      )}
    </>
  );
}
