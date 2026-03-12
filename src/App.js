import { useState, useEffect, useCallback } from "react";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
// Font: Nunito 900 (Deeper-Decks heavy rounded sans)
// Page bg: #5a5a5a (mid grey like DD)
// Surfaces: #2a2a2a / #333 / #3a3a3a (DD dark card family)
// Buttons: black primary, ghost outline, red danger — DD language
// All original layout, features, tabs preserved exactly

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #5a5a5a; font-family: 'Nunito', sans-serif; -webkit-font-smoothing: antialiased; }
  input, textarea, button, select { font-family: inherit; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }

  @keyframes fadeIn  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
  @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes floatBlob { 0%,100% { transform:translate(0,0); } 50% { transform:translate(6px,-10px); } }
  @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.5; } }

  .fade-in   { animation: fadeIn 0.3s ease both; }
  .fade-in-1 { animation: fadeIn 0.3s 0.05s ease both; }
  .fade-in-2 { animation: fadeIn 0.3s 0.10s ease both; }
  .fade-in-3 { animation: fadeIn 0.3s 0.15s ease both; }
  .scale-in  { animation: scaleIn 0.25s cubic-bezier(0.34,1.4,0.64,1) both; }
  .sheet-in  { animation: slideUp 0.28s cubic-bezier(0.4,0,0.2,1) both; }

  /* Deeper-Decks button press feel */
  .dd-btn { transition: filter 0.12s ease, transform 0.1s ease; cursor: pointer; }
  .dd-btn:hover:not(:disabled) { filter: brightness(1.12); }
  .dd-btn:active:not(:disabled) { transform: scale(0.97); }

  /* Card hover lift */
  .dd-card-hover { transition: transform 0.18s ease, box-shadow 0.18s ease; cursor: pointer; }
  .dd-card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(0,0,0,0.55) !important; }

  /* Row hover */
  .dd-row-hover { transition: background 0.14s ease; }
  .dd-row-hover:hover { background: rgba(255,255,255,0.05) !important; }

  /* Symptom tag toggle */
  .sym-tag { transition: background 0.12s, border-color 0.12s, color 0.12s; cursor: pointer; }
  .sym-tag:hover { filter: brightness(1.1); }

  /* Tab button */
  .tab-btn { transition: background 0.16s ease, color 0.16s ease, box-shadow 0.16s ease; }

  /* Input focus */
  .dd-input { transition: border-color 0.14s, box-shadow 0.14s; }
  .dd-input:focus { outline: none; border-color: rgba(255,255,255,0.35) !important; box-shadow: 0 0 0 3px rgba(255,255,255,0.06) !important; }
  .dd-input::placeholder { color: rgba(255,255,255,0.25); }

  /* Toggle */
  .tog-track { transition: background 0.18s ease; }
  .tog-thumb  { transition: transform 0.18s cubic-bezier(0.34,1.4,0.64,1); }
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

// ─── DESIGN TOKENS (Deeper-Decks palette) ────────────────────────────────────

const T = {
  // Backgrounds
  pageBg:   "#5a5a5a",      // mid-grey page (like DD)
  surface:  "#252525",      // main dark card surface
  surface2: "#2f2f2f",      // slightly lighter surface
  row:      "#383838",      // list row background
  rowAlt:   "#323232",

  // Borders
  border:   "rgba(255,255,255,0.08)",
  borderMd: "rgba(255,255,255,0.13)",

  // Text
  text:     "#ffffff",
  textSoft: "rgba(255,255,255,0.6)",
  textMute: "rgba(255,255,255,0.3)",

  // DD accent colors
  green:    "#4caf7a",   // safe / positive
  red:      "#e05555",   // danger / period
  lavender: "#7c5cbf",   // primary accent

  // Typography
  fontBody:  "'Nunito', sans-serif",
  fontSerif: "'Playfair Display', serif",

  // Radius
  r: { sm:8, md:12, lg:16, xl:20, pill:999 },

  // Shadows
  cardShadow: "0 6px 28px rgba(0,0,0,0.5)",
  deepShadow: "0 16px 48px rgba(0,0,0,0.65)",
};

// Phase definitions (same structure, DD-adjacent colours)
const PHASES = {
  menstruation: { key:"menstruation", label:"Menstruation", short:"Period",     color:"#e84393", dim:"rgba(232,67,147,0.14)", bg:"#2a0f1c", emoji:"🔴", days:[1,5]   },
  follicular:   { key:"follicular",   label:"Follicular",   short:"Follicular", color:"#f5a623", dim:"rgba(245,166,35,0.14)",  bg:"#2a1e08", emoji:"🌱", days:[6,13]  },
  ovulation:    { key:"ovulation",    label:"Ovulation",    short:"Ovulation",  color:"#4caf7a", dim:"rgba(76,175,122,0.14)",  bg:"#0b2218", emoji:"⚡", days:[14,16] },
  luteal:       { key:"luteal",       label:"Luteal",       short:"Luteal",     color:"#9b59b6", dim:"rgba(155,89,182,0.14)",  bg:"#180e28", emoji:"🌙", days:[17,28] },
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

const AVATARS      = ["🌸","💜","🌙","🦋","🌺","✨","💎","🌹","🔮","🌊","🍒","🌷"];
const CARD_ACCENTS = ["#9b59b6","#f5a623","#e84393","#4caf7a","#3b9dd4","#e07b35"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getDayOfCycle(lps, cl=28) { const d=Math.floor((new Date()-new Date(lps))/86400000); return((d%cl)+cl)%cl+1; }
function getPhaseFromDay(d) { if(d<=5)return"menstruation"; if(d<=13)return"follicular"; if(d<=16)return"ovulation"; return"luteal"; }
function getNextPeriod(lps, cl=28) { let n=new Date(lps); const t=new Date(); while(n<=t) n.setDate(n.getDate()+cl); return n; }
function getOvulation(lps, cl=28)  { let o=new Date(lps); o.setDate(o.getDate()+13); const t=new Date(); while(o<t) o.setDate(o.getDate()+cl); return o; }
function daysUntil(d) { return Math.ceil((new Date(d)-new Date())/86400000); }
function fmtDate(d)   { return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"}); }
function todayStr()   { return new Date().toISOString().split("T")[0]; }

// ─── SHARED PRIMITIVES ────────────────────────────────────────────────────────

// Deeper-Decks style button: solid dark primary, or coloured variant
function DDBtn({ children, onClick, disabled, variant="primary", color, style={}, className="" }) {
  const base = {
    border:"none", borderRadius: T.r.lg, fontWeight:800, fontSize:14,
    cursor: disabled ? "not-allowed" : "pointer",
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7,
    padding:"11px 20px", fontFamily: T.fontBody, opacity: disabled ? 0.4 : 1,
    transition:"filter 0.12s, transform 0.1s",
  };
  const c = color || T.lavender;
  const variants = {
    primary:   { background: c, color: "#fff", boxShadow: `0 4px 16px ${c}55` },
    black:     { background: "#111", color:"#fff", boxShadow:"0 4px 14px rgba(0,0,0,0.5)" },
    ghost:     { background:"rgba(255,255,255,0.07)", color: T.textSoft, border:`1px solid ${T.border}` },
    danger:    { background:"rgba(224,85,85,0.18)", color:"#ff7070", border:`1px solid rgba(224,85,85,0.35)` },
    fullBlack: { background:"#111", color:"#fff", width:"100%", boxShadow:"0 4px 18px rgba(0,0,0,0.6)" },
  };
  return (
    <button className={`dd-btn ${className}`} onClick={disabled?undefined:onClick} disabled={disabled}
      style={{...base, ...variants[variant], ...style}}>
      {children}
    </button>
  );
}

// Label — DD small caps style
function Lbl({ children, style={} }) {
  return <div style={{ fontSize:10, fontWeight:800, letterSpacing:1.8, color:T.textMute, textTransform:"uppercase", marginBottom:8, ...style }}>{children}</div>;
}

// Divider
function Hr({ style={} }) {
  return <div style={{ height:1, background:T.border, margin:"14px 0", ...style }}/>;
}

// Toggle switch (green when on, exactly like DD settings)
function Toggle({ on, onChange }) {
  return (
    <div onClick={()=>onChange(!on)} style={{cursor:"pointer", flexShrink:0}}>
      <div className="tog-track" style={{ width:48, height:26, borderRadius:13, background:on?"#4caf7a":"rgba(255,255,255,0.15)", position:"relative" }}>
        <div className="tog-thumb" style={{ width:20, height:20, borderRadius:"50%", background:"white", position:"absolute", top:3, transform: on?"translateX(24px)":"translateX(3px)", boxShadow:"0 2px 5px rgba(0,0,0,0.35)" }}/>
      </div>
    </div>
  );
}

// Spinner
function Spin({ color="#fff" }) {
  return <span style={{ width:13, height:13, border:`2px solid ${color}33`, borderTopColor:color, borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }}/>;
}

// Background floating blobs (decorative, phase-tinted)
function BgDecor({ phase }) {
  const c = PHASES[phase||"luteal"].color;
  return (
    <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      <div style={{ position:"absolute", top:-100, right:-80, width:360, height:360, borderRadius:"60% 40% 55% 45%", background:c+"12", animation:"floatBlob 14s ease-in-out infinite" }}/>
      <div style={{ position:"absolute", bottom:60, left:-70, width:260, height:260, borderRadius:"50%", background:T.lavender+"0a", animation:"floatBlob 19s ease-in-out infinite reverse" }}/>
    </div>
  );
}

// ─── CYCLE RING ───────────────────────────────────────────────────────────────

function CycleRing({ day, cycleLength, size=200, glowing=false }) {
  const cx=size/2, cy=size/2, r=size*0.35, sw=size*0.09, circ=2*Math.PI*r;
  const phase = getPhaseFromDay(day);
  const segs = [
    {key:"menstruation",start:0, end:5,          color:"#e84393"},
    {key:"follicular",  start:5, end:13,         color:"#f5a623"},
    {key:"ovulation",   start:13,end:16,         color:"#4caf7a"},
    {key:"luteal",      start:16,end:cycleLength, color:"#9b59b6"},
  ];
  function sp(s,e){const sa=(s/cycleLength)*2*Math.PI-Math.PI/2; const dl=((e-s)/cycleLength)*circ-4; const off=-(sa/(2*Math.PI))*circ; return{dl,gap:circ-dl,off};}
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
      <text x={cx} y={cy-8}  textAnchor="middle" fill="white"          fontSize={size*0.15} fontWeight={900} fontFamily={T.fontBody}>{day}</text>
      <text x={cx} y={cy+10} textAnchor="middle" fill={T.textMute}     fontSize={size*0.07} fontFamily={T.fontBody}>of {cycleLength}</text>
      <text x={cx} y={cy+26} textAnchor="middle" fill={pc}             fontSize={size*0.074} fontWeight={800} fontFamily={T.fontBody}>{PHASES[phase].short}</text>
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
    return getPhaseFromDay(cd);
  }
  function isIntimacy(d) {
    const s=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return (profile.intimacyLog||[]).includes(s);
  }

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:6}}>
        {["S","M","T","W","T","F","S"].map((d,i)=>(
          <div key={i} style={{textAlign:"center",fontSize:10,fontWeight:700,color:T.textMute,padding:"2px 0"}}>{d}</div>
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
              <span style={{fontSize:10,color:isToday?"#111":T.textSoft,fontWeight:isToday?800:500}}>{d}</span>
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
            <span style={{fontSize:10,color:T.textMute}}>{v.short}</span>
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <span style={{fontSize:9}}>💕</span>
          <span style={{fontSize:10,color:T.textMute}}>Intimacy</span>
        </div>
      </div>
    </div>
  );
}

// ─── AI INSIGHT ───────────────────────────────────────────────────────────────

function AIInsight({ profile }) {
  const [text,setText]=useState(""); const [loading,setLoading]=useState(false); const [err,setErr]=useState(false);
  const day=getDayOfCycle(profile.lastPeriodStart,profile.cycleLength), phase=getPhaseFromDay(day), PD=PHASES[phase];

  const generate=useCallback(async()=>{
    setLoading(true); setText(""); setErr(false);
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:280,
          system:"You are a frank reproductive health advisor. Under 85 words. Start with one emoji. End with ✅ Safe or ⚠️ Caution.",
          messages:[{role:"user",content:`Partner: ${profile.name}. Day ${day}/${profile.cycleLength} (${phase}). Symptoms: ${(profile.symptoms||[]).join(",")||"none"}. Sessions: ${(profile.intimacyLog||[]).length}. Period in ${daysUntil(getNextPeriod(profile.lastPeriodStart,profile.cycleLength))}d. Ovulation in ${daysUntil(getOvulation(profile.lastPeriodStart,profile.cycleLength))}d. Give insight.`}]})});
      const d=await res.json(); setText(d.content?.[0]?.text||"Could not generate.");
    } catch { setErr(true); setText("AI unavailable — check connection."); }
    setLoading(false);
  },[profile,day,phase]);

  return (
    <div style={{background:T.surface2,border:`1px solid ${PD.color}28`,borderRadius:T.r.lg,padding:18,marginTop:4}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:26,height:26,borderRadius:7,background:PD.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>✦</div>
          <Lbl style={{marginBottom:0,color:PD.color}}>AI Insight</Lbl>
        </div>
        <DDBtn onClick={generate} disabled={loading} color={PD.color} style={{padding:"6px 16px",fontSize:12}}>
          {loading?<><Spin color="#fff"/>Thinking…</>:"Generate"}
        </DDBtn>
      </div>
      {text
        ?<p style={{fontSize:13,color:err?"#ff7070":T.textSoft,lineHeight:1.75,margin:0}}>{text}</p>
        :<p style={{fontSize:12,color:T.textMute,margin:0,fontStyle:"italic",lineHeight:1.6}}>Generate a personalized AI insight for this cycle phase.</p>
      }
    </div>
  );
}

// ─── PROFILE DETAIL ───────────────────────────────────────────────────────────

function ProfileDetail({ profile, onUpdate, onBack, onDelete }) {
  const [tab,          setTab]          = useState("overview");
  const [monthOffset,  setMonthOffset]  = useState(0);
  const [editSym,      setEditSym]      = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logDate,      setLogDate]      = useState(todayStr());
  const [showDelModal, setShowDelModal] = useState(false);
  const [periodFlash,  setPeriodFlash]  = useState(false);

  const day=getDayOfCycle(profile.lastPeriodStart,profile.cycleLength);
  const phase=getPhaseFromDay(day), PD=PHASES[phase], tips=TIPS[phase];
  const nextP=getNextPeriod(profile.lastPeriodStart,profile.cycleLength);
  const nextO=getOvulation(profile.lastPeriodStart,profile.cycleLength);
  const dToP=daysUntil(nextP), dToO=daysUntil(nextO);

  const calLabel=(()=>{const b=new Date();b.setMonth(b.getMonth()+monthOffset);return b.toLocaleString("default",{month:"long",year:"numeric"});})();

  function toggleSym(s){const c=profile.symptoms||[];onUpdate({...profile,symptoms:c.includes(s)?c.filter(x=>x!==s):[...c,s]});}
  function logIntimacy(){const c=profile.intimacyLog||[];if(!c.includes(logDate))onUpdate({...profile,intimacyLog:[...c,logDate].sort()});setShowLogModal(false);}
  function removeIntimacy(d){onUpdate({...profile,intimacyLog:(profile.intimacyLog||[]).filter(x=>x!==d)});}
  function markPeriod(){onUpdate({...profile,lastPeriodStart:todayStr()});setPeriodFlash(true);setTimeout(()=>setPeriodFlash(false),2200);}

  const inputStyle={width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,borderRadius:T.r.md,padding:"12px 15px",color:T.text,fontSize:14,outline:"none",display:"block"};
  const tabs=[{id:"overview",label:"Overview"},{id:"calendar",label:"Calendar"},{id:"log",label:"Log"},{id:"insights",label:"Insights"}];

  return (
    <div style={{minHeight:"100vh",background:T.pageBg,color:T.text,fontFamily:T.fontBody,position:"relative"}}>
      <BgDecor phase={phase}/>
      <div style={{position:"relative",zIndex:2,maxWidth:500,margin:"0 auto",padding:"0 16px 100px"}}>

        {/* ── TOP BAR ── */}
        <div className="fade-in" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 0 14px",gap:8}}>
          <DDBtn variant="ghost" onClick={onBack} style={{padding:"8px 16px",fontSize:13}}>← Back</DDBtn>
          <div style={{display:"flex",gap:8}}>
            <DDBtn variant="ghost" onClick={()=>onUpdate({...profile,hidden:!profile.hidden})} style={{padding:"8px 14px",fontSize:12}}>
              {profile.hidden?"👁 Show":"🙈 Hide"}
            </DDBtn>
            <DDBtn variant="danger" onClick={()=>setShowDelModal(true)} style={{padding:"8px 14px",fontSize:12}}>🗑 Delete</DDBtn>
          </div>
        </div>

        {/* ── HERO CARD ── */}
        <div className="fade-in" style={{position:"relative",marginBottom:16}}>
          <div style={{position:"absolute",top:-16,right:-16,width:130,height:130,borderRadius:"60% 40% 55% 45%",background:PD.color+"14",pointerEvents:"none",zIndex:-1}}/>
          <div style={{background:T.surface,border:`1px solid ${PD.color}28`,borderRadius:T.r.xl,padding:22,boxShadow:T.cardShadow}}>
            <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:18}}>
              <div style={{width:68,height:68,borderRadius:20,background:`linear-gradient(135deg,${PD.color}33,${PD.color}11)`,border:`2px solid ${PD.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0}}>{profile.avatar}</div>
              <div style={{flex:1,minWidth:0}}>
                <h2 style={{fontFamily:T.fontSerif,fontSize:24,fontWeight:800,margin:"0 0 6px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profile.name}</h2>
                <div style={{display:"inline-flex",alignItems:"center",gap:6,background:PD.color+"1a",borderRadius:T.r.pill,padding:"4px 12px",border:`1px solid ${PD.color}30`}}>
                  <span style={{fontSize:11}}>{PD.emoji}</span>
                  <span style={{fontSize:12,color:PD.color,fontWeight:700}}>{PD.label} · Day {day} of {profile.cycleLength}</span>
                </div>
              </div>
              <CycleRing day={day} cycleLength={profile.cycleLength} size={76}/>
            </div>
            {/* Risk banner */}
            <div style={{background:tips.safe?"rgba(76,175,122,0.1)":"rgba(232,67,147,0.1)",border:`1px solid ${tips.safe?T.green+"44":PD.color+"44"}`,borderRadius:T.r.md,padding:"12px 15px",display:"flex",gap:11,alignItems:"flex-start"}}>
              <span style={{fontSize:18,flexShrink:0,lineHeight:1.4}}>{tips.safe?"✅":"⚠️"}</span>
              <div>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:1.8,color:tips.safe?T.green:PD.color,marginBottom:4}}>{tips.risk}</div>
                <div style={{fontSize:12,color:T.textSoft,lineHeight:1.65}}>{tips.note}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── — Deeper-Decks style: dark pill bar, coloured active */}
        <div className="fade-in-1" style={{display:"flex",background:"rgba(0,0,0,0.25)",borderRadius:T.r.pill,padding:4,marginBottom:20,border:`1px solid ${T.border}`,gap:3}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className="tab-btn" style={{
              flex:1,border:"none",borderRadius:T.r.pill,padding:"9px 4px",
              background:tab===t.id?PD.color:"transparent",
              color:tab===t.id?"#111":T.textMute,
              fontSize:12,fontWeight:tab===t.id?800:600,cursor:"pointer",
              fontFamily:T.fontBody,
              boxShadow:tab===t.id?`0 2px 10px ${PD.color}45`:"none",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ══════════════ OVERVIEW ══════════════ */}
        {tab==="overview"&&(
          <div className="fade-in">
            <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
              <CycleRing day={day} cycleLength={profile.cycleLength} size={220} glowing/>
            </div>

            {/* 4 stat tiles */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {[
                {label:"Period in", val:dToP<=0?"Today":`${dToP}d`, sub:fmtDate(nextP),   color:"#e84393", bg:PHASES.menstruation.bg},
                {label:"Ovulation", val:dToO<=0?"Now!":dToO===1?"Tmrw":`${dToO}d`,        sub:fmtDate(nextO), color:T.green, bg:PHASES.ovulation.bg},
                {label:"Energy",    val:tips.energy,  sub:"Current phase",                 color:"#f5a623", bg:PHASES.follicular.bg},
                {label:"Mood",      val:tips.mood,    sub:"Expected",                      color:T.lavender, bg:PHASES.luteal.bg},
              ].map((s,i)=>(
                <div key={s.label} className={`fade-in-${i+1}`} style={{background:s.bg,border:`1px solid ${s.color}22`,borderRadius:T.r.lg,padding:"15px 17px"}}>
                  <Lbl style={{color:s.color+"88"}}>{s.label}</Lbl>
                  <div style={{fontSize:20,fontWeight:900,color:s.color,fontFamily:T.fontSerif,marginBottom:3,lineHeight:1}}>{s.val}</div>
                  <div style={{fontSize:11,color:T.textMute}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Libido row */}
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.md,padding:"11px 17px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <Lbl style={{marginBottom:0}}>Libido</Lbl>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {["Low","Medium","Rising","Peak","Falling"].map(l=>(
                  <div key={l} style={{width:24,height:5,borderRadius:3,background:tips.libido===l?PD.color:T.border,transition:"background 0.2s"}}/>
                ))}
                <span style={{fontSize:12,fontWeight:700,color:PD.color,marginLeft:5}}>{tips.libido}</span>
              </div>
            </div>

            {/* Symptoms */}
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.lg,padding:18,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <Lbl style={{marginBottom:0}}>Symptoms</Lbl>
                <DDBtn variant="ghost" onClick={()=>setEditSym(!editSym)} style={{padding:"5px 13px",fontSize:11}}>
                  {editSym?"✓ Done":"Edit"}
                </DDBtn>
              </div>
              {editSym?(
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {SYMPTOMS.map(s=>{
                    const on=(profile.symptoms||[]).includes(s);
                    return (
                      <button key={s} onClick={()=>toggleSym(s)} className="sym-tag" style={{
                        background:on?PD.color+"22":"rgba(255,255,255,0.05)",
                        border:`1px solid ${on?PD.color+"55":T.border}`,
                        borderRadius:T.r.pill,padding:"6px 13px",
                        color:on?PD.color:T.textMute,fontSize:12,cursor:"pointer",
                      }}>{s}</button>
                    );
                  })}
                </div>
              ):(
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {(profile.symptoms||[]).length===0
                    ?<span style={{fontSize:12,color:T.textMute,fontStyle:"italic"}}>None logged — tap Edit to add.</span>
                    :(profile.symptoms||[]).map(s=>(
                      <span key={s} style={{background:PD.color+"1a",border:`1px solid ${PD.color}33`,borderRadius:T.r.pill,padding:"5px 13px",fontSize:12,color:PD.color}}>{s}</span>
                    ))
                  }
                </div>
              )}
            </div>

            {/* Quick actions — DD black + colour pill style */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <DDBtn onClick={markPeriod} color={periodFlash?"#4caf7a":"#e84393"}
                style={{width:"100%",padding:"15px 10px",fontSize:13,borderRadius:T.r.lg}}>
                {periodFlash?"✓ Saved!":"🔴 Period Started"}
              </DDBtn>
              <DDBtn onClick={()=>setShowLogModal(true)} color={T.lavender}
                style={{width:"100%",padding:"15px 10px",fontSize:13,borderRadius:T.r.lg}}>
                💕 Log Intimacy
              </DDBtn>
            </div>

            <AIInsight profile={profile}/>
          </div>
        )}

        {/* ══════════════ CALENDAR ══════════════ */}
        {tab==="calendar"&&(
          <div className="fade-in">
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.xl,padding:22,marginBottom:14,boxShadow:T.cardShadow}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                <button onClick={()=>setMonthOffset(m=>m-1)} className="dd-btn" style={{width:38,height:38,borderRadius:"50%",background:T.surface2,border:`1px solid ${T.border}`,color:T.text,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:17,fontWeight:800,color:T.text}}>{calLabel}</div>
                  {monthOffset!==0&&<button onClick={()=>setMonthOffset(0)} style={{background:"none",border:"none",color:PD.color,fontSize:11,cursor:"pointer",marginTop:3,fontFamily:T.fontBody,textDecoration:"underline"}}>Today</button>}
                </div>
                <button onClick={()=>setMonthOffset(m=>m+1)} className="dd-btn" style={{width:38,height:38,borderRadius:"50%",background:T.surface2,border:`1px solid ${T.border}`,color:T.text,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
              </div>
              <MonthCalendar profile={profile} monthOffset={monthOffset}/>
            </div>

            {/* Upcoming */}
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.xl,padding:18,marginBottom:14,boxShadow:T.cardShadow}}>
              <Lbl>Upcoming Events</Lbl>
              {[{label:"🔴 Next Period",date:nextP,color:"#e84393"},{label:"⚡ Ovulation",date:nextO,color:T.green}].map((ev,i)=>(
                <div key={ev.label}>
                  {i>0&&<Hr style={{margin:"10px 0"}}/>}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{color:ev.color,fontSize:14,fontWeight:700}}>{ev.label}</span>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:15,fontWeight:800,color:T.text}}>{fmtDate(ev.date)}</div>
                      <div style={{fontSize:11,color:T.textMute}}>{daysUntil(ev.date)}d away</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Intimacy log */}
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.xl,padding:18,boxShadow:T.cardShadow}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div>
                  <Lbl style={{marginBottom:2}}>Intimacy Log</Lbl>
                  <div style={{fontSize:11,color:T.textMute}}>{(profile.intimacyLog||[]).length} session{(profile.intimacyLog||[]).length!==1?"s":""}</div>
                </div>
                <DDBtn color={T.lavender} onClick={()=>setShowLogModal(true)} style={{padding:"7px 16px",fontSize:12}}>+ Add</DDBtn>
              </div>
              {(profile.intimacyLog||[]).length===0
                ?<p style={{fontSize:12,color:T.textMute,fontStyle:"italic",margin:0}}>No sessions logged yet.</p>
                :[...(profile.intimacyLog||[])].reverse().map(d=>{
                  const diff=Math.floor((new Date(d)-new Date(profile.lastPeriodStart))/86400000);
                  const cd=((diff%profile.cycleLength)+profile.cycleLength)%profile.cycleLength+1;
                  const ph=getPhaseFromDay(cd), col=PHASES[ph].color;
                  return (
                    <div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                      <div>
                        <span style={{fontSize:13,color:T.text,fontWeight:600}}>💕 {fmtDate(d)}</span>
                        <span style={{background:col+"1a",border:`1px solid ${col}30`,borderRadius:T.r.pill,padding:"2px 9px",fontSize:10,color:col,marginLeft:8}}>{PHASES[ph].label} · Day {cd}</span>
                      </div>
                      <button onClick={()=>removeIntimacy(d)} className="dd-btn" style={{background:"none",border:"none",color:T.textMute,cursor:"pointer",fontSize:18,lineHeight:1,padding:"3px 7px"}}>×</button>
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}

        {/* ══════════════ LOG ══════════════ */}
        {tab==="log"&&(
          <div className="fade-in">
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.xl,padding:22,marginBottom:14,boxShadow:T.cardShadow}}>
              <Lbl>Update Cycle Data</Lbl>
              <Hr/>
              {[
                {label:"Last Period Start Date",        key:"lastPeriodStart", type:"date"  },
                {label:"Average Cycle Length (Days)",   key:"cycleLength",     type:"number"},
                {label:"Period Duration (Days)",        key:"periodLength",    type:"number"},
              ].map(f=>(
                <div key={f.key} style={{marginBottom:16}}>
                  <Lbl>{f.label}</Lbl>
                  <input type={f.type} value={profile[f.key]||""} className="dd-input"
                    min={f.type==="number"?1:undefined} max={f.type==="number"?60:undefined}
                    onChange={e=>onUpdate({...profile,[f.key]:f.type==="number"?Math.max(1,parseInt(e.target.value)||28):e.target.value})}
                    style={inputStyle}
                  />
                </div>
              ))}
              <Lbl>Personal Notes</Lbl>
              <textarea value={profile.notes||""} onChange={e=>onUpdate({...profile,notes:e.target.value})} placeholder="Mood patterns, observations…" className="dd-input"
                style={{...inputStyle,minHeight:100,resize:"vertical"}}/>
            </div>
            {/* DD "Draw Next Card" style CTA */}
            <button className="dd-btn" onClick={()=>setShowLogModal(true)} style={{
              width:"100%",padding:"16px",background:"#111",color:T.text,
              border:"none",borderRadius:T.r.lg,fontSize:15,fontWeight:800,
              cursor:"pointer",letterSpacing:"0.02em",boxShadow:"0 4px 18px rgba(0,0,0,0.55)",
            }}>💕 Log Intimacy Session</button>
          </div>
        )}

        {/* ══════════════ INSIGHTS ══════════════ */}
        {tab==="insights"&&(
          <div className="fade-in">
            {Object.values(PHASES).map((val,i)=>{
              const t=TIPS[val.key], isCur=phase===val.key;
              return (
                <div key={val.key} className={`fade-in-${Math.min(i,3)}`} style={{
                  background:isCur?`linear-gradient(135deg,${val.bg},${T.surface})`:T.surface,
                  border:`1px solid ${isCur?val.color+"50":T.border}`,
                  borderRadius:T.r.xl,padding:20,marginBottom:12,
                  boxShadow:isCur?`0 6px 28px ${val.color}18`:T.cardShadow,
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:44,height:44,borderRadius:14,background:val.color+"1a",border:`1px solid ${val.color}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{val.emoji}</div>
                      <div>
                        <div style={{fontSize:15,fontWeight:800,color:val.color,fontFamily:T.fontSerif}}>{val.label}</div>
                        <div style={{fontSize:11,color:T.textMute}}>Day {val.days[0]}–{val.days[1]}</div>
                      </div>
                    </div>
                    {isCur&&<div style={{background:val.color,borderRadius:T.r.pill,padding:"4px 14px",fontSize:11,fontWeight:800,color:"#111"}}>NOW</div>}
                  </div>
                  <p style={{fontSize:13,color:T.textSoft,lineHeight:1.7,margin:"0 0 14px"}}>{t.note}</p>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    {[`⚡ ${t.energy}`,`🧠 ${t.mood}`,`💫 ${t.libido}`,t.safe?"✅ Safe":"⚠️ Risky"].map(tag=>(
                      <span key={tag} style={{background:val.color+"18",border:`1px solid ${val.color}28`,borderRadius:T.r.pill,padding:"4px 12px",fontSize:11,color:val.color}}>{tag}</span>
                    ))}
                  </div>
                </div>
              );
            })}
            <AIInsight profile={profile}/>
          </div>
        )}
      </div>

      {/* ── LOG INTIMACY MODAL (bottom sheet) ── */}
      {showLogModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}}>
          <div className="sheet-in" style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"22px 22px 0 0",padding:28,width:"100%",maxWidth:500,boxShadow:"0 -8px 36px rgba(0,0,0,0.5)"}}>
            <div style={{width:36,height:4,borderRadius:2,background:T.border,margin:"0 auto 22px"}}/>
            <h3 style={{fontFamily:T.fontSerif,fontSize:20,marginBottom:20}}>💕 Log Intimacy Session</h3>
            <Lbl>Date</Lbl>
            <input type="date" value={logDate} onChange={e=>setLogDate(e.target.value)} className="dd-input"
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,borderRadius:T.r.md,padding:"12px 15px",color:T.text,fontSize:14,outline:"none",display:"block",marginBottom:22}}/>
            <div style={{display:"flex",gap:10}}>
              <DDBtn variant="ghost" onClick={()=>setShowLogModal(false)} style={{flex:1,padding:14}}>Cancel</DDBtn>
              <button className="dd-btn" onClick={logIntimacy} style={{flex:2,padding:14,background:T.lavender,color:"#fff",border:"none",borderRadius:T.r.lg,fontSize:14,fontWeight:800,cursor:"pointer",boxShadow:`0 4px 16px ${T.lavender}55`}}>Save Session 💕</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {showDelModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:20}}>
          <div className="scale-in" style={{background:T.surface,border:"1px solid rgba(224,85,85,0.28)",borderRadius:T.r.xl,padding:32,width:"100%",maxWidth:340,textAlign:"center",boxShadow:T.deepShadow}}>
            <div style={{fontSize:44,marginBottom:14}}>🗑️</div>
            <h3 style={{fontFamily:T.fontSerif,fontSize:22,marginBottom:8}}>Delete {profile.name}?</h3>
            <p style={{color:T.textSoft,fontSize:13,marginBottom:26,lineHeight:1.65}}>All cycle history, intimacy logs, symptoms, and notes will be permanently removed.</p>
            <div style={{display:"flex",gap:10}}>
              <DDBtn variant="ghost" onClick={()=>setShowDelModal(false)} style={{flex:1,padding:14}}>Cancel</DDBtn>
              <button className="dd-btn" onClick={onDelete} style={{flex:1,padding:14,background:T.red,color:"#fff",border:"none",borderRadius:T.r.lg,fontSize:14,fontWeight:800,cursor:"pointer"}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADD PROFILE ──────────────────────────────────────────────────────────────

function AddProfile({ onAdd, onBack }) {
  const [form,setForm]=useState({name:"",lastPeriodStart:todayStr(),cycleLength:28,periodLength:5,avatar:"🌸"});
  const ok=form.name.trim().length>0;
  const inputStyle={width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,borderRadius:T.r.md,padding:"12px 15px",color:T.text,fontSize:14,outline:"none",display:"block"};

  return (
    <div style={{minHeight:"100vh",background:T.pageBg,color:T.text,fontFamily:T.fontBody}}>
      <BgDecor phase="luteal"/>
      <div style={{position:"relative",zIndex:2,maxWidth:500,margin:"0 auto",padding:"18px 16px 100px"}}>
        <DDBtn variant="ghost" onClick={onBack} style={{marginBottom:24,padding:"8px 16px",fontSize:13}}>← Back</DDBtn>

        <div className="fade-in" style={{marginBottom:26}}>
          <h2 style={{fontFamily:T.fontSerif,fontSize:30,fontWeight:800,marginBottom:5,lineHeight:1.1}}>Add Profile</h2>
          <p style={{color:T.textSoft,fontSize:14,lineHeight:1.55}}>Track her cycle and get personalized insights.</p>
        </div>

        <div className="fade-in-1" style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.xl,padding:24,marginBottom:14,boxShadow:T.cardShadow}}>
          <Lbl>Choose Avatar</Lbl>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
            {AVATARS.map(a=>(
              <button key={a} onClick={()=>setForm({...form,avatar:a})} className="dd-btn" style={{
                width:46,height:46,fontSize:21,borderRadius:13,cursor:"pointer",
                background:form.avatar===a?"rgba(124,92,191,0.25)":"rgba(255,255,255,0.05)",
                border:`2px solid ${form.avatar===a?T.lavender:T.border}`,
                transition:"all 0.15s",
              }}>{a}</button>
            ))}
          </div>
          <Hr/>
          {[
            {label:"Name",                    key:"name",            type:"text",   ph:"Her name…"},
            {label:"Last Period Start Date",  key:"lastPeriodStart", type:"date"   },
            {label:"Average Cycle Length",    key:"cycleLength",     type:"number", ph:"28"},
            {label:"Period Duration (Days)",  key:"periodLength",    type:"number", ph:"5"},
          ].map(f=>(
            <div key={f.key} style={{marginBottom:16}}>
              <Lbl>{f.label}</Lbl>
              <input type={f.type} value={form[f.key]} placeholder={f.ph} className="dd-input"
                min={f.type==="number"?1:undefined} max={f.type==="number"?60:undefined}
                onChange={e=>setForm({...form,[f.key]:f.type==="number"?Math.max(1,parseInt(e.target.value)||28):e.target.value})}
                style={inputStyle} autoFocus={f.key==="name"}/>
            </div>
          ))}
        </div>

        {/* DD primary button: big black CTA */}
        <button className="dd-btn" onClick={()=>{if(ok)onAdd({...form,id:Date.now().toString(),symptoms:[],intimacyLog:[],notes:"",hidden:false});}} disabled={!ok}
          style={{width:"100%",padding:"16px",background:ok?"#111":"rgba(255,255,255,0.1)",color:ok?T.text:"rgba(255,255,255,0.25)",border:"none",borderRadius:T.r.lg,fontSize:15,fontWeight:800,cursor:ok?"pointer":"not-allowed",boxShadow:ok?"0 4px 18px rgba(0,0,0,0.55)":"none",letterSpacing:"0.02em"}}>
          Add Profile →
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function Dashboard({ user, profiles, onSelect, onAdd, onLogout }) {
  const [showHidden,setShowHidden]=useState(false);
  const visible=profiles.filter(p=>showHidden?p.hidden:!p.hidden);
  const hiddenCt=profiles.filter(p=>p.hidden).length;
  const active=profiles.filter(p=>!p.hidden);
  const safeCt=active.filter(p=>TIPS[getPhaseFromDay(getDayOfCycle(p.lastPeriodStart,p.cycleLength))].safe).length;
  const ovCt=active.filter(p=>getPhaseFromDay(getDayOfCycle(p.lastPeriodStart,p.cycleLength))==="ovulation").length;
  const sessCt=active.reduce((a,p)=>a+(p.intimacyLog||[]).length,0);

  return (
    <div style={{minHeight:"100vh",background:T.pageBg,color:T.text,fontFamily:T.fontBody,position:"relative"}}>
      <BgDecor phase="luteal"/>
      <div style={{position:"relative",zIndex:2,maxWidth:500,margin:"0 auto",padding:"0 16px 100px"}}>

        {/* ── HEADER ── */}
        <div className="fade-in" style={{padding:"26px 0 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <p style={{fontSize:12,color:T.textMute,letterSpacing:0.4,marginBottom:3,fontWeight:600}}>Welcome back</p>
              <h1 style={{fontFamily:T.fontSerif,fontSize:28,fontWeight:800,marginBottom:3,lineHeight:1.1}}>{user.username}</h1>
              <p style={{fontSize:12,color:T.textMute}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end",paddingTop:4}}>
              {/* DD style: black Add button */}
              <button className="dd-btn" onClick={onAdd} style={{background:"#111",color:T.text,border:"none",borderRadius:T.r.lg,padding:"9px 20px",fontSize:13,fontWeight:800,cursor:"pointer",boxShadow:"0 4px 14px rgba(0,0,0,0.5)"}}>+ Add Profile</button>
              <DDBtn variant="ghost" onClick={onLogout} style={{padding:"7px 14px",fontSize:12}}>Sign out</DDBtn>
            </div>
          </div>
        </div>

        {/* ── SUMMARY STRIP ── (DD stats panel style) */}
        {active.length>0&&(
          <div className="fade-in-1" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>
            {[
              {label:"Profiles",  val:active.length, color:T.lavender, bg:PHASES.luteal.bg},
              {label:"Safe Now",  val:safeCt,         color:T.green,    bg:PHASES.ovulation.bg},
              {label:"Ovulating", val:ovCt,           color:"#f5a623",  bg:PHASES.follicular.bg},
              {label:"Sessions",  val:sessCt,         color:"#e84393",  bg:PHASES.menstruation.bg},
            ].map(s=>(
              <div key={s.label} style={{background:s.bg,border:`1px solid ${s.color}20`,borderRadius:T.r.lg,padding:"12px 8px",textAlign:"center",boxShadow:T.cardShadow}}>
                <div style={{fontSize:22,fontWeight:900,color:s.color,lineHeight:1,fontFamily:T.fontSerif}}>{s.val}</div>
                <div style={{fontSize:10,color:T.textMute,marginTop:4,fontWeight:600}}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── HIDDEN TOGGLE ── */}
        {hiddenCt>0&&(
          <button onClick={()=>setShowHidden(h=>!h)} className="dd-btn" style={{
            width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,
            borderRadius:T.r.pill,padding:"11px",color:T.textMute,fontSize:12,fontWeight:700,
            cursor:"pointer",marginBottom:14,
          }}>
            {showHidden?`👁 Hide ${hiddenCt} hidden`:` 🙈 ${hiddenCt} hidden profile${hiddenCt>1?"s":""} — tap to reveal`}
          </button>
        )}

        {/* ── EMPTY STATE ── */}
        {visible.length===0?(
          <div className="fade-in" style={{textAlign:"center",padding:"72px 20px"}}>
            <div style={{fontSize:58,marginBottom:16}}>🌙</div>
            <h2 style={{fontFamily:T.fontSerif,fontSize:24,marginBottom:10}}>{showHidden?"No hidden profiles":"No profiles yet"}</h2>
            <p style={{color:T.textSoft,marginBottom:32,lineHeight:1.65,fontSize:14}}>
              {showHidden?"All profiles are visible.":"Add your first profile to start tracking."}
            </p>
            {!showHidden&&(
              <button className="dd-btn" onClick={onAdd} style={{background:"#111",color:T.text,border:"none",borderRadius:T.r.lg,padding:"13px 32px",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:"0 4px 18px rgba(0,0,0,0.55)"}}>
                Add First Profile →
              </button>
            )}
          </div>
        ):(
          /* ── PROFILE CARDS ── */
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {visible.map((profile,idx)=>{
              const day=getDayOfCycle(profile.lastPeriodStart,profile.cycleLength);
              const phase=getPhaseFromDay(day), PD=PHASES[phase], tips=TIPS[phase];
              const dToP=daysUntil(getNextPeriod(profile.lastPeriodStart,profile.cycleLength));
              const dToO=daysUntil(getOvulation(profile.lastPeriodStart,profile.cycleLength));
              const accent=CARD_ACCENTS[idx%CARD_ACCENTS.length];
              return (
                <div key={profile.id} className={`dd-card-hover fade-in-${Math.min(idx+1,3)}`} onClick={()=>onSelect(profile)}
                  style={{borderRadius:T.r.xl,overflow:"hidden",cursor:"pointer",background:T.surface,boxShadow:T.cardShadow}}>
                  {/* DD-style coloured top stripe */}
                  <div style={{height:5,background:`linear-gradient(90deg,${accent},${accent}77)`}}/>
                  <div style={{padding:"18px 18px 16px",border:`1px solid ${accent}15`,borderTop:"none",borderRadius:`0 0 ${T.r.xl}px ${T.r.xl}px`}}>
                    {/* Name row */}
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{width:52,height:52,borderRadius:16,background:accent+"25",border:`2px solid ${accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{profile.avatar}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:17,fontWeight:800,fontFamily:T.fontSerif,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:4}}>{profile.name}</div>
                        <div style={{display:"inline-flex",alignItems:"center",gap:5,background:PD.color+"1a",borderRadius:T.r.pill,padding:"3px 10px",border:`1px solid ${PD.color}25`}}>
                          <span style={{fontSize:10}}>{PD.emoji}</span>
                          <span style={{fontSize:11,color:PD.color,fontWeight:700}}>{PD.label} · Day {day}</span>
                        </div>
                      </div>
                      {/* DD safety badge */}
                      <div style={{background:tips.safe?"rgba(76,175,122,0.15)":"rgba(232,67,147,0.15)",border:`1px solid ${tips.safe?T.green+"38":"#e84393"+"38"}`,borderRadius:T.r.pill,padding:"6px 12px",flexShrink:0}}>
                        <div style={{fontSize:11,fontWeight:800,color:tips.safe?T.green:"#e84393"}}>{tips.safe?"✅ OK":"⚠️ Risk"}</div>
                      </div>
                    </div>
                    {/* Phase bar */}
                    <div style={{display:"flex",height:5,borderRadius:5,overflow:"hidden",gap:2,marginBottom:12}}>
                      {Object.values(PHASES).map(v=>{
                        const w=((v.days[1]-v.days[0]+1)/profile.cycleLength)*100;
                        return <div key={v.key} style={{width:`${w}%`,background:phase===v.key?v.color:v.color+"22",borderRadius:3,transition:"background 0.3s"}}/>;
                      })}
                    </div>
                    {/* 3 mini stats */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:(profile.symptoms||[]).length>0?12:0}}>
                      {[
                        {label:"Period",   val:dToP<=0?"Today":`${dToP}d`,                  color:"#e84393", bg:PHASES.menstruation.bg},
                        {label:"Ovulation",val:dToO<=0?"Now!":dToO===1?"Tmrw":`${dToO}d`,   color:T.green,   bg:PHASES.ovulation.bg},
                        {label:"Sessions", val:(profile.intimacyLog||[]).length,             color:T.lavender,bg:PHASES.luteal.bg},
                      ].map(s=>(
                        <div key={s.label} style={{background:s.bg,borderRadius:T.r.md,padding:"9px 10px"}}>
                          <div style={{fontSize:15,fontWeight:900,color:s.color,fontFamily:T.fontSerif,lineHeight:1}}>{s.val}</div>
                          <div style={{fontSize:10,color:T.textMute,marginTop:3}}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {/* Symptom tags */}
                    {(profile.symptoms||[]).length>0&&(
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {(profile.symptoms||[]).slice(0,4).map(s=>(
                          <span key={s} style={{background:PD.color+"18",border:`1px solid ${PD.color}25`,borderRadius:T.r.pill,padding:"3px 10px",fontSize:10,color:PD.color}}>{s}</span>
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
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

function Login({ onLogin }) {
  const [username,setUsername]=useState("");
  const [focused,setFocused]=useState(false);
  const ok=username.trim().length>0;

  return (
    <div style={{minHeight:"100vh",background:T.pageBg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.fontBody,position:"relative",padding:20}}>
      <BgDecor phase="luteal"/>
      {/* Extra blobs */}
      <div style={{position:"absolute",top:"8%",right:"-6%",width:240,height:240,borderRadius:"60% 40% 55% 45%",background:T.lavender+"15",pointerEvents:"none",animation:"floatBlob 16s ease-in-out infinite"}}/>
      <div style={{position:"absolute",bottom:"12%",left:"-8%",width:200,height:200,borderRadius:"50%",background:"#e84393"+"12",pointerEvents:"none",animation:"floatBlob 21s ease-in-out infinite 4s"}}/>

      {/* ── LOGIN CARD — DD centered modal on grey bg ── */}
      <div className="scale-in" style={{position:"relative",zIndex:2,width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:54,marginBottom:14,animation:"floatBlob 6s ease-in-out infinite"}}>🌙</div>
          <h1 style={{fontFamily:T.fontSerif,fontSize:40,fontWeight:800,lineHeight:1.1,color:T.text,margin:"0 0 10px"}}>
            Find Your<br/>Best Insight.
          </h1>
          <p style={{color:T.textMute,fontSize:14,lineHeight:1.6}}>Cycle intelligence for the informed man.</p>
        </div>

        {/* The actual form card */}
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.r.xl,padding:28,boxShadow:T.deepShadow}}>
          <Lbl>Username</Lbl>
          {/* DD: input + small "Add" button side by side */}
          <div style={{display:"flex",gap:10,marginBottom:20}}>
            <input value={username} onChange={e=>setUsername(e.target.value)}
              onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
              onKeyDown={e=>e.key==="Enter"&&ok&&onLogin(username.trim())}
              placeholder="Enter your name" autoFocus className="dd-input"
              style={{flex:1,background:"rgba(255,255,255,0.05)",border:`1.5px solid ${focused?T.borderMd:T.border}`,borderRadius:T.r.md,padding:"13px 16px",color:T.text,fontSize:15,outline:"none",boxShadow:focused?"0 0 0 3px rgba(255,255,255,0.06)":undefined,transition:"border-color 0.14s,box-shadow 0.14s"}}
            />
            {/* Small "Add" style black pill (exactly like DD "Add" button) */}
            <button className="dd-btn" onClick={()=>ok&&onLogin(username.trim())}
              style={{background:"#111",color:T.text,border:"none",borderRadius:T.r.md,padding:"0 22px",fontSize:14,fontWeight:800,cursor:ok?"pointer":"not-allowed",opacity:ok?1:0.4,boxShadow:"0 3px 10px rgba(0,0,0,0.4)"}}>
              Add
            </button>
          </div>
          {/* Big black CTA — "Choose Deck & Start Playing" equivalent */}
          <button className="dd-btn" onClick={()=>ok&&onLogin(username.trim())} disabled={!ok}
            style={{width:"100%",padding:"15px",background:ok?"#111":"rgba(255,255,255,0.08)",color:ok?T.text:"rgba(255,255,255,0.25)",border:"none",borderRadius:T.r.lg,fontSize:15,fontWeight:800,cursor:ok?"pointer":"not-allowed",boxShadow:ok?"0 4px 20px rgba(0,0,0,0.6)":"none",letterSpacing:"0.02em",transition:"all 0.15s"}}>
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
  const [screen,  setScreen]  = useState("loading");
  const [user,    setUser]    = useState(null);
  const [profiles,setProfiles]= useState([]);
  const [selected,setSelected]= useState(null);

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
  function handleAdd(p){save([...profiles,p]);setScreen("dashboard");}
  function handleUpdate(u){const np=profiles.map(x=>x.id===u.id?u:x);save(np);setSelected(u);}
  function handleDelete(){save(profiles.filter(p=>p.id!==selected.id));setSelected(null);setScreen("dashboard");}
  function handleSelect(p){setSelected(p);setScreen("profile");}

  if(screen==="loading") return (
    <div style={{minHeight:"100vh",background:T.pageBg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:40,animation:"pulse 1.5s ease-in-out infinite"}}>🌙</div>
    </div>
  );

  return (
    <>
      <GlobalStyles/>
      {screen==="login"     && <Login onLogin={handleLogin}/>}
      {screen==="add"       && <AddProfile onAdd={handleAdd} onBack={()=>setScreen("dashboard")}/>}
      {screen==="profile"   && selected && <ProfileDetail profile={selected} onUpdate={handleUpdate} onBack={()=>setScreen("dashboard")} onDelete={handleDelete}/>}
      {(screen==="dashboard"||(screen==="profile"&&!selected)) && <Dashboard user={user||{username:"User"}} profiles={profiles} onSelect={handleSelect} onAdd={()=>setScreen("add")} onLogout={handleLogout}/>}
    </>
  );
}
