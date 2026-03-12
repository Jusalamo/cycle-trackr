import { useState, useEffect, useCallback } from "react";

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: #6b6b6b; font-family: 'Nunito', sans-serif; -webkit-font-smoothing: antialiased; }
  input, textarea, button, select { font-family: inherit; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
  @keyframes slideRight { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes slideUp  { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

  .modal-wrap  { animation: fadeIn 0.2s ease both; }
  .modal-card  { animation: scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both; }
  .menu-panel  { animation: slideRight 0.28s cubic-bezier(0.4,0,0.2,1) both; }
  .sheet       { animation: slideUp 0.28s cubic-bezier(0.4,0,0.2,1) both; }
  .fade-up     { animation: fadeUp 0.3s ease both; }
  .fade-up-1   { animation: fadeUp 0.3s 0.06s ease both; }
  .fade-up-2   { animation: fadeUp 0.3s 0.12s ease both; }
  .fade-up-3   { animation: fadeUp 0.3s 0.18s ease both; }

  .row-hover { transition: background 0.15s ease; cursor:pointer; }
  .row-hover:hover { background: rgba(255,255,255,0.06) !important; }

  .btn-press { transition: transform 0.1s ease, filter 0.1s ease; cursor:pointer; }
  .btn-press:hover:not(:disabled) { filter: brightness(1.1); }
  .btn-press:active:not(:disabled) { transform: scale(0.97); }

  .toggle-track { transition: background 0.2s ease; }
  .toggle-thumb { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1); }

  .input-dd {
    width:100%; background: rgba(255,255,255,0.07);
    border: 1.5px solid rgba(255,255,255,0.12); border-radius:12px;
    padding:13px 16px; color:#fff; font-size:15px; outline:none; display:block;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .input-dd::placeholder { color: rgba(255,255,255,0.28); }
  .input-dd:focus { border-color: rgba(255,255,255,0.4); box-shadow: 0 0 0 3px rgba(255,255,255,0.06); }

  .deck-row { transition: background 0.15s ease, transform 0.15s ease; cursor:pointer; }
  .deck-row:hover { background: rgba(255,255,255,0.08) !important; transform: translateX(3px); }

  .stat-num { font-size:28px; font-weight:900; line-height:1; }
`;

function GlobalStyles() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────

// The grey page background (exactly as in the reference)
const PAGE_BG    = "#6b6b6b";
// Main dark card/modal surface
const SURFACE    = "#2a2a2a";
// Slightly lighter row/item background
const SURFACE2   = "#333333";
// Row in player list (a touch lighter)
const ROW_BG     = "#3a3a3a";
const BORDER     = "rgba(255,255,255,0.09)";
const TEXT       = "#ffffff";
const TEXT_DIM   = "rgba(255,255,255,0.55)";
const TEXT_MUTED = "rgba(255,255,255,0.28)";
const ACCENT_GREEN = "#4caf7a";
const ACCENT_RED   = "#c0392b";
const LAVENDER     = "#7c5cbf";

// Phase colours (match the game-card purple, pinks etc. from the reference)
const PHASES = {
  menstruation: { label:"Menstruation", short:"Period",    color:"#e84393", dim:"rgba(232,67,147,0.15)", bg:"#2c1020", emoji:"🔴", days:[1,5]  },
  follicular:   { label:"Follicular",   short:"Follicular",color:"#f5a623", dim:"rgba(245,166,35,0.15)",  bg:"#2c2010", emoji:"🌱", days:[6,13] },
  ovulation:    { label:"Ovulation",    short:"Ovulation", color:"#4caf7a", dim:"rgba(76,175,122,0.15)",  bg:"#102c1a", emoji:"⚡", days:[14,16]},
  luteal:       { label:"Luteal",       short:"Luteal",    color:"#9b59b6", dim:"rgba(155,89,182,0.15)",  bg:"#1a1028", emoji:"🌙", days:[17,28]},
};

const TIPS = {
  menstruation: { safe:false, risk:"HIGH RISK",  energy:"Low",     mood:"Variable",      libido:"Low",    note:"Active shedding. She may feel fatigued & crampy. Avoid unprotected sex." },
  follicular:   { safe:true,  risk:"LOWER RISK", energy:"Rising",  mood:"Positive",      libido:"Rising", note:"Estrogen rises — mood and energy improve. Risk increases toward ovulation." },
  ovulation:    { safe:false, risk:"PEAK RISK",  energy:"Peak",    mood:"Flirty/Social", libido:"Peak",   note:"Peak fertility. Highest pregnancy risk of the cycle." },
  luteal:       { safe:true,  risk:"LOWER RISK", energy:"Falling", mood:"Introspective", libido:"Medium", note:"Progesterone rises — she may be more emotional or withdrawn." },
};

const SYMPTOMS = ["Cramps","Bloating","Mood swings","Headache","Fatigue","Tender breasts","Spotting","Back pain","Nausea","High libido","Low libido","Irritability","Anxiety","Clear discharge","PMS","Acne","Insomnia","Food cravings"];
const AVATARS  = ["🌸","💜","🌙","🦋","🌺","✨","💎","🌹","🔮","🌊","🍒","🌷"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getDayOfCycle(lps, cl=28) { const d=Math.floor((new Date()-new Date(lps))/86400000); return((d%cl)+cl)%cl+1; }
function getPhaseFromDay(d) { if(d<=5)return"menstruation";if(d<=13)return"follicular";if(d<=16)return"ovulation";return"luteal"; }
function getNextPeriod(lps, cl=28) { let n=new Date(lps); const t=new Date(); while(n<=t)n.setDate(n.getDate()+cl); return n; }
function getOvulation(lps, cl=28)  { let o=new Date(lps); o.setDate(o.getDate()+13); const t=new Date(); while(o<t)o.setDate(o.getDate()+cl); return o; }
function daysUntil(d) { return Math.ceil((new Date(d)-new Date())/86400000); }
function fmtDate(d)   { return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"}); }
function todayStr()   { return new Date().toISOString().split("T")[0]; }

// ─── SHARED UI PRIMITIVES ─────────────────────────────────────────────────────

// Overlay backdrop
function Backdrop({ onClick }) {
  return (
    <div onClick={onClick} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.55)",
      backdropFilter:"blur(3px)", zIndex:100,
    }} />
  );
}

// The main styled modal card (like Deeper-Decks modals)
function ModalCard({ children, style={}, className="modal-card" }) {
  return (
    <div className={className} style={{
      background: SURFACE, borderRadius:20, padding:"28px 24px",
      boxShadow:"0 20px 60px rgba(0,0,0,0.6)",
      width:"100%", maxWidth:520,
      ...style,
    }}>
      {children}
    </div>
  );
}

// Section title inside modal
function ModalTitle({ children, sub }) {
  return (
    <div style={{ textAlign:"center", marginBottom:24 }}>
      <h2 style={{ fontSize:26, fontWeight:900, color:TEXT, letterSpacing:"-0.5px" }}>{children}</h2>
      {sub && <p style={{ fontSize:14, color:TEXT_DIM, marginTop:6, lineHeight:1.5 }}>{sub}</p>}
    </div>
  );
}

// Big full-width primary button (black, like "Choose Deck & Start Playing")
function BigBtn({ children, onClick, disabled, color, style={} }) {
  const bg = disabled ? "rgba(255,255,255,0.12)" : (color || "#111111");
  return (
    <button className="btn-press" onClick={disabled?undefined:onClick} disabled={disabled} style={{
      width:"100%", padding:"16px", border:"none", borderRadius:12,
      background:bg, color: disabled?"rgba(255,255,255,0.3)":TEXT,
      fontSize:16, fontWeight:800, letterSpacing:"0.02em",
      cursor: disabled?"not-allowed":"pointer", ...style,
    }}>{children}</button>
  );
}

// Small pill button (like "Add", "Remove")
function PillBtn({ children, onClick, variant="dark", style={} }) {
  const styles = {
    dark:    { background:"#111", color:TEXT, border:"none" },
    red:     { background:"rgba(180,30,30,0.5)", color:"#ff6b6b", border:"1px solid rgba(255,80,80,0.3)" },
    ghost:   { background:"rgba(255,255,255,0.08)", color:TEXT_DIM, border:`1px solid ${BORDER}` },
    green:   { background:ACCENT_GREEN, color:"#fff", border:"none" },
    lavender:{ background:LAVENDER, color:"#fff", border:"none" },
  };
  return (
    <button className="btn-press" onClick={onClick} style={{
      padding:"8px 18px", borderRadius:10, fontSize:13, fontWeight:700,
      cursor:"pointer", whiteSpace:"nowrap",
      ...styles[variant], ...style,
    }}>{children}</button>
  );
}

// Toggle switch (like the Settings toggles)
function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{ cursor:"pointer", flexShrink:0 }}>
      <div className="toggle-track" style={{
        width:50, height:28, borderRadius:14,
        background: on ? "#4caf7a" : "rgba(255,255,255,0.15)",
        position:"relative",
      }}>
        <div className="toggle-thumb" style={{
          width:22, height:22, borderRadius:"50%", background:"white",
          position:"absolute", top:3,
          transform: on ? "translateX(24px)" : "translateX(3px)",
          boxShadow:"0 2px 6px rgba(0,0,0,0.3)",
        }} />
      </div>
    </div>
  );
}

// Settings row with toggle or select
function SettingsRow({ label, sub, right }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:`1px solid ${BORDER}` }}>
      <div>
        <div style={{ fontSize:15, fontWeight:700, color:TEXT }}>{label}</div>
        {sub && <div style={{ fontSize:12, color:TEXT_MUTED, marginTop:2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

// The hamburger menu button (top right corner, exactly as in reference)
function HamburgerBtn({ onClick }) {
  return (
    <button onClick={onClick} className="btn-press" style={{
      position:"fixed", top:16, right:16, zIndex:200,
      width:46, height:46, borderRadius:12,
      background:"#1a1a1a", border:`1px solid ${BORDER}`,
      display:"flex", alignItems:"center", justifyContent:"center",
      cursor:"pointer",
    }}>
      <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
        <rect width="20" height="2.5" rx="1.25" fill="white"/>
        <rect y="5.75" width="20" height="2.5" rx="1.25" fill="white"/>
        <rect y="11.5" width="20" height="2.5" rx="1.25" fill="white"/>
      </svg>
    </button>
  );
}

// ─── CYCLE RING SVG ───────────────────────────────────────────────────────────

function CycleRing({ day, cycleLength, size=180 }) {
  const cx=size/2, cy=size/2, r=size*0.36, sw=size*0.09, circ=2*Math.PI*r;
  const phase = getPhaseFromDay(day);
  const segs = [
    {key:"menstruation",start:0, end:5,         color:"#e84393"},
    {key:"follicular",  start:5, end:13,        color:"#f5a623"},
    {key:"ovulation",   start:13,end:16,        color:"#4caf7a"},
    {key:"luteal",      start:16,end:cycleLength,color:"#9b59b6"},
  ];
  function sp(s,e) {
    const sa=(s/cycleLength)*2*Math.PI-Math.PI/2;
    const dl=((e-s)/cycleLength)*circ-4;
    const off=-(sa/(2*Math.PI))*circ;
    return {dl,gap:circ-dl,off};
  }
  const da=((day-1)/cycleLength)*2*Math.PI-Math.PI/2;
  const dx=cx+r*Math.cos(da), dy=cy+r*Math.sin(da);
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={sw}/>
      {segs.map(seg=>{
        const {dl,gap,off}=sp(seg.start,seg.end);
        const cur=phase===seg.key;
        return <circle key={seg.key} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={cur?sw+3:sw} strokeDasharray={`${dl} ${gap}`} strokeDashoffset={off} strokeLinecap="round" opacity={cur?1:0.18}/>;
      })}
      <circle cx={dx} cy={dy} r={size*0.055} fill="white"/>
      <circle cx={dx} cy={dy} r={size*0.03} fill={PHASES[phase].color}/>
      <text x={cx} y={cy-6} textAnchor="middle" fill="white" fontSize={size*0.16} fontWeight={900} fontFamily="Nunito, sans-serif">{day}</text>
      <text x={cx} y={cy+12} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={size*0.07} fontFamily="Nunito, sans-serif">of {cycleLength}</text>
      <text x={cx} y={cy+26} textAnchor="middle" fill={PHASES[phase].color} fontSize={size*0.075} fontWeight={700} fontFamily="Nunito, sans-serif">{PHASES[phase].short}</text>
    </svg>
  );
}

// ─── AI INSIGHT ───────────────────────────────────────────────────────────────

function AIInsight({ profile }) {
  const [text,setText]=useState("");
  const [loading,setLoading]=useState(false);
  const day=getDayOfCycle(profile.lastPeriodStart,profile.cycleLength);
  const phase=getPhaseFromDay(day);
  const PD=PHASES[phase];

  const generate=useCallback(async()=>{
    setLoading(true); setText("");
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:250,
          system:"You are a frank reproductive health advisor. Under 80 words. Start with one emoji. End with ✅ Safe or ⚠️ Caution.",
          messages:[{role:"user",content:`Partner: ${profile.name}. Day ${day}/${profile.cycleLength} (${phase}). Symptoms: ${(profile.symptoms||[]).join(", ")||"none"}. Sessions: ${(profile.intimacyLog||[]).length}. Period in ${daysUntil(getNextPeriod(profile.lastPeriodStart,profile.cycleLength))}d. Ovulation in ${daysUntil(getOvulation(profile.lastPeriodStart,profile.cycleLength))}d. Give insight.`}],
        }),
      });
      const d=await res.json();
      setText(d.content?.[0]?.text||"Could not generate insight.");
    } catch { setText("AI unavailable — check connection."); }
    setLoading(false);
  },[profile,day,phase]);

  return (
    <div style={{ background:SURFACE2, border:`1px solid ${BORDER}`, borderRadius:14, padding:16, marginTop:4 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <span style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:PD.color }}>✦ AI INSIGHT</span>
        <PillBtn onClick={generate} variant="ghost" style={{ padding:"5px 14px", fontSize:12 }}>
          {loading ? <span style={{display:"flex",gap:6,alignItems:"center"}}><span style={{width:10,height:10,border:"2px solid #fff3",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>Thinking…</span> : "Generate"}
        </PillBtn>
      </div>
      {text
        ? <p style={{fontSize:13,color:TEXT_DIM,lineHeight:1.7,margin:0}}>{text}</p>
        : <p style={{fontSize:12,color:TEXT_MUTED,margin:0,fontStyle:"italic"}}>Generate a personalized AI insight for this cycle phase.</p>
      }
    </div>
  );
}

// ─── MONTH CALENDAR ───────────────────────────────────────────────────────────

function MonthCalendar({ profile, monthOffset=0 }) {
  const base=new Date(); base.setMonth(base.getMonth()+monthOffset);
  const year=base.getFullYear(), month=base.getMonth();
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const today=new Date();
  const isThisMonth=today.getFullYear()===year&&today.getMonth()===month;

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
          <div key={i} style={{textAlign:"center",fontSize:11,fontWeight:700,color:TEXT_MUTED,padding:"2px 0"}}>{d}</div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {Array(firstDay).fill(null).map((_,i)=><div key={"e"+i}/>)}
        {Array(daysInMonth).fill(null).map((_,i)=>{
          const d=i+1, ph=phaseForDay(d), col=PHASES[ph].color;
          const isToday=isThisMonth&&d===today.getDate(), hasI=isIntimacy(d);
          return (
            <div key={d} style={{
              aspectRatio:"1",borderRadius:8,position:"relative",
              background:isToday?col:col+"1a",
              border:`1px solid ${isToday?col:col+"30"}`,
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>
              <span style={{fontSize:10,color:isToday?"#111":TEXT_DIM,fontWeight:isToday?800:400}}>{d}</span>
              {hasI&&<span style={{position:"absolute",top:1,right:1,fontSize:6}}>💕</span>}
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:10,paddingTop:10,borderTop:`1px solid ${BORDER}`}}>
        {Object.values(PHASES).map(v=>(
          <div key={v.short} style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:8,height:8,borderRadius:2,background:v.color}}/>
            <span style={{fontSize:10,color:TEXT_MUTED}}>{v.short}</span>
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <span style={{fontSize:10}}>💕</span>
          <span style={{fontSize:10,color:TEXT_MUTED}}>Intimacy</span>
        </div>
      </div>
    </div>
  );
}

// ─── MENU PANEL (right-side slide-in, exactly as Deeper-Decks) ────────────────

function MenuPanel({ onClose, onManageProfiles, onSettings, onBack }) {
  return (
    <>
      <Backdrop onClick={onClose}/>
      <div className="menu-panel" style={{
        position:"fixed", top:0, right:0, bottom:0, width:300,
        background:"#1e1e1e", zIndex:300, padding:"24px 0",
        display:"flex", flexDirection:"column",
        boxShadow:"-8px 0 40px rgba(0,0,0,0.5)",
      }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 24px 20px"}}>
          <span style={{fontSize:22,fontWeight:900,color:TEXT}}>Menu</span>
          <button onClick={onClose} className="btn-press" style={{background:"none",border:"none",color:TEXT_DIM,fontSize:22,cursor:"pointer",lineHeight:1}}>✕</button>
        </div>
        <div style={{height:1,background:BORDER,marginBottom:16}}/>

        {[
          { icon:"👥", label:"Manage Profiles",    action: onManageProfiles },
          { icon:"⚙️", label:"Settings",           action: onSettings      },
          { icon:"🏠", label:"Back to Dashboard",  action: onBack          },
        ].map((item,i)=>(
          <button key={i} className="row-hover btn-press" onClick={()=>{item.action();onClose();}} style={{
            display:"flex",alignItems:"center",gap:14,
            padding:"14px 24px", background:"transparent", border:"none",
            color:TEXT, fontSize:15, fontWeight:700, cursor:"pointer",
            textAlign:"left", width:"100%",
          }}>
            <span style={{fontSize:20,width:28,textAlign:"center"}}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{flex:1}}/>
        <div style={{padding:"12px 24px",borderTop:`1px solid ${BORDER}`}}>
          <p style={{fontSize:12,color:TEXT_MUTED,textAlign:"center",lineHeight:1.6}}>Cyclr™<br/>Cycle Intelligence</p>
        </div>
      </div>
    </>
  );
}

// ─── SETTINGS MODAL ───────────────────────────────────────────────────────────

function SettingsModal({ settings, onChange, onClose }) {
  return (
    <>
      <Backdrop onClick={onClose}/>
      <div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:20}}>
        <ModalCard style={{maxWidth:520,maxHeight:"85vh",overflow:"hidden",display:"flex",flexDirection:"column",padding:0}}>
          <div style={{padding:"24px 28px 0"}}>
            <ModalTitle>Settings</ModalTitle>
          </div>
          <div style={{overflowY:"auto",padding:"0 28px 28px",flex:1}}>
            {/* Theme row */}
            <SettingsRow
              label="Theme"
              right={
                <select value={settings.theme||"dark"} onChange={e=>onChange({...settings,theme:e.target.value})} style={{background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"8px 12px",color:TEXT,fontSize:13,cursor:"pointer"}}>
                  <option value="dark">Dark Mode</option>
                  <option value="light">Light Mode</option>
                </select>
              }
            />
            <SettingsRow label="Pass Phone Mode"   sub="Shows whose turn it is before each draw" right={<Toggle on={settings.passPhone??true}   onChange={v=>onChange({...settings,passPhone:v})}/>}/>
            <SettingsRow label="Show Intimacy Log"  sub="Keep a record of logged sessions"       right={<Toggle on={settings.showLog??true}     onChange={v=>onChange({...settings,showLog:v})}/>}/>
            <SettingsRow label="Cycle Reminders"   sub="Visual alerts when period is near"      right={<Toggle on={settings.reminders??true}   onChange={v=>onChange({...settings,reminders:v})}/>}/>
            <SettingsRow label="AI Insights"       sub="Enable AI-generated cycle insights"     right={<Toggle on={settings.aiInsights??true}  onChange={v=>onChange({...settings,aiInsights:v})}/>}/>
          </div>
        </ModalCard>
      </div>
    </>
  );
}

// ─── LOG INTIMACY MODAL ───────────────────────────────────────────────────────

function LogIntimacyModal({ profile, onSave, onClose }) {
  const [date, setDate] = useState(todayStr());
  return (
    <>
      <Backdrop onClick={onClose}/>
      <div style={{position:"fixed",inset:0,display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300,padding:"0 0 0"}}>
        <div className="sheet" style={{background:SURFACE,borderRadius:"20px 20px 0 0",padding:28,width:"100%",maxWidth:520,boxShadow:"0 -10px 40px rgba(0,0,0,0.5)"}}>
          <div style={{width:40,height:4,borderRadius:2,background:BORDER,margin:"0 auto 22px"}}/>
          <h3 style={{fontSize:20,fontWeight:800,color:TEXT,marginBottom:20}}>💕 Log Intimacy Session</h3>
          <label style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:TEXT_MUTED,display:"block",marginBottom:8}}>DATE</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="input-dd" style={{marginBottom:22}}/>
          <div style={{display:"flex",gap:10}}>
            <PillBtn onClick={onClose} variant="ghost" style={{flex:1,padding:13,fontSize:14}}>Cancel</PillBtn>
            <button className="btn-press" onClick={()=>onSave(date)} style={{flex:2,padding:13,background:LAVENDER,color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:800,cursor:"pointer"}}>Save 💕</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────

function DeleteModal({ name, onConfirm, onClose }) {
  return (
    <>
      <Backdrop onClick={onClose}/>
      <div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:20}}>
        <ModalCard style={{maxWidth:340,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:14}}>⚠️</div>
          <h3 style={{fontSize:22,fontWeight:800,color:TEXT,marginBottom:8}}>Delete {name}?</h3>
          <p style={{color:TEXT_DIM,fontSize:13,lineHeight:1.65,marginBottom:26}}>All cycle history, intimacy logs, symptoms, and notes will be permanently removed.</p>
          <div style={{display:"flex",gap:10}}>
            <PillBtn onClick={onClose} variant="ghost" style={{flex:1,padding:13,fontSize:14}}>Cancel</PillBtn>
            <button className="btn-press" onClick={onConfirm} style={{flex:1,padding:13,background:ACCENT_RED,color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:800,cursor:"pointer"}}>Delete</button>
          </div>
        </ModalCard>
      </div>
    </>
  );
}

// ─── PROFILE DETAIL VIEW ──────────────────────────────────────────────────────

function ProfileDetail({ profile, onUpdate, onBack, onDelete }) {
  const [tab,          setTab]          = useState("overview");
  const [monthOffset,  setMonthOffset]  = useState(0);
  const [editSym,      setEditSym]      = useState(false);
  const [showLog,      setShowLog]      = useState(false);
  const [showDel,      setShowDel]      = useState(false);
  const [showMenu,     setShowMenu]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings,     setSettings]     = useState({});
  const [periodFlash,  setPeriodFlash]  = useState(false);

  const day   = getDayOfCycle(profile.lastPeriodStart, profile.cycleLength);
  const phase = getPhaseFromDay(day);
  const PD    = PHASES[phase];
  const tips  = TIPS[phase];
  const nextP = getNextPeriod(profile.lastPeriodStart, profile.cycleLength);
  const nextO = getOvulation(profile.lastPeriodStart, profile.cycleLength);
  const dToP  = daysUntil(nextP);
  const dToO  = daysUntil(nextO);

  const calLabel=(()=>{const b=new Date();b.setMonth(b.getMonth()+monthOffset);return b.toLocaleString("default",{month:"long",year:"numeric"});})();

  function toggleSym(s) {
    const cur=profile.symptoms||[];
    onUpdate({...profile,symptoms:cur.includes(s)?cur.filter(x=>x!==s):[...cur,s]});
  }
  function saveIntimacy(date) {
    const cur=profile.intimacyLog||[];
    if(!cur.includes(date))onUpdate({...profile,intimacyLog:[...cur,date].sort()});
    setShowLog(false);
  }
  function removeIntimacy(d) { onUpdate({...profile,intimacyLog:(profile.intimacyLog||[]).filter(x=>x!==d)}); }
  function markPeriodToday() {
    onUpdate({...profile,lastPeriodStart:todayStr()});
    setPeriodFlash(true); setTimeout(()=>setPeriodFlash(false),2000);
  }

  const tabs=[{id:"overview",label:"Overview"},{id:"calendar",label:"Calendar"},{id:"log",label:"Log"},{id:"insights",label:"Insights"}];

  const inputStyle={
    width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${BORDER}`,
    borderRadius:10,padding:"11px 14px",color:TEXT,fontSize:14,outline:"none",display:"block",
  };

  return (
    <div style={{minHeight:"100vh",background:PAGE_BG,fontFamily:"'Nunito',sans-serif",position:"relative"}}>
      {/* Top-left back + title bar */}
      <div style={{background:"#1a1a1a",borderBottom:`1px solid ${BORDER}`,padding:"12px 20px",display:"flex",alignItems:"center",gap:14}}>
        <button onClick={onBack} className="btn-press" style={{background:"rgba(255,255,255,0.08)",border:`1px solid ${BORDER}`,borderRadius:8,padding:"7px 14px",color:TEXT_DIM,fontSize:13,fontWeight:700,cursor:"pointer"}}>← Back</button>
        <div style={{flex:1}}>
          <span style={{fontSize:16,fontWeight:800,color:TEXT}}>{profile.avatar} {profile.name}</span>
          <span style={{marginLeft:10,fontSize:12,color:PD.color,fontWeight:700,background:PD.dim,borderRadius:999,padding:"2px 10px"}}>{PD.emoji} {PD.label} · Day {day}</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <PillBtn onClick={()=>onUpdate({...profile,hidden:!profile.hidden})} variant="ghost" style={{fontSize:12,padding:"7px 12px"}}>{profile.hidden?"👁 Show":"🙈 Hide"}</PillBtn>
          <PillBtn onClick={()=>setShowDel(true)} variant="red" style={{fontSize:12,padding:"7px 12px"}}>🗑</PillBtn>
        </div>
      </div>

      <HamburgerBtn onClick={()=>setShowMenu(true)}/>

      {/* Two-column layout for wide screens, single col on narrow */}
      <div style={{maxWidth:900,margin:"0 auto",padding:"20px 16px 80px",display:"grid",gridTemplateColumns:"300px 1fr",gap:20,alignItems:"start"}}>

        {/* LEFT PANEL — stats + controls */}
        <div className="fade-up">
          {/* Phase card */}
          <div style={{background:SURFACE,borderRadius:16,padding:20,marginBottom:14,border:`1px solid ${BORDER}`}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
              <div style={{width:56,height:56,borderRadius:16,background:PD.dim,border:`2px solid ${PD.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{profile.avatar}</div>
              <div>
                <div style={{fontSize:18,fontWeight:800,color:TEXT}}>{profile.name}</div>
                <div style={{fontSize:12,color:TEXT_MUTED}}>Cycle length: {profile.cycleLength} days</div>
              </div>
            </div>
            {/* Risk badge */}
            <div style={{background:tips.safe?"rgba(76,175,122,0.15)":"rgba(232,67,147,0.15)",border:`1px solid ${tips.safe?ACCENT_GREEN+"44":PD.color+"44"}`,borderRadius:10,padding:"10px 14px",display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:16,flexShrink:0}}>{tips.safe?"✅":"⚠️"}</span>
              <div>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:1.8,color:tips.safe?ACCENT_GREEN:PD.color,marginBottom:3}}>{tips.risk}</div>
                <div style={{fontSize:12,color:TEXT_DIM,lineHeight:1.6}}>{tips.note}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{background:SURFACE,borderRadius:16,padding:18,marginBottom:14,border:`1px solid ${BORDER}`}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
              {[
                {label:"Period",  val:dToP<=0?"Today":`${dToP}d`,  color:"#e84393"},
                {label:"Ovulate", val:dToO<=0?"Now!":`${dToO}d`,   color:ACCENT_GREEN},
                {label:"Sessions",val:(profile.intimacyLog||[]).length, color:LAVENDER},
              ].map(s=>(
                <div key={s.label} style={{textAlign:"center"}}>
                  <div className="stat-num" style={{color:s.color}}>{s.val}</div>
                  <div style={{fontSize:10,color:TEXT_MUTED,marginTop:3}}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:TEXT_MUTED,marginBottom:6}}>ENERGY / MOOD</div>
            <div style={{display:"flex",gap:6}}>
              {[tips.energy,tips.mood,tips.libido].map((v,i)=>(
                <span key={i} style={{background:"rgba(255,255,255,0.07)",borderRadius:999,padding:"4px 10px",fontSize:11,color:TEXT_DIM,fontWeight:600}}>{v}</span>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <button className="btn-press" onClick={markPeriodToday} style={{padding:"13px 8px",background:periodFlash?"#4caf7a":"#e84393",color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:800,cursor:"pointer"}}>
              {periodFlash?"✓ Saved!":"🔴 Period"}
            </button>
            <button className="btn-press" onClick={()=>setShowLog(true)} style={{padding:"13px 8px",background:LAVENDER,color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:800,cursor:"pointer"}}>
              💕 Log
            </button>
          </div>
        </div>

        {/* RIGHT PANEL — tabs + content */}
        <div>
          {/* Tab bar — exactly like the reference action buttons style */}
          <div style={{display:"flex",background:SURFACE,borderRadius:14,padding:5,marginBottom:16,border:`1px solid ${BORDER}`,gap:4}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} className="btn-press" style={{
                flex:1,border:"none",borderRadius:10,padding:"10px 6px",
                background:tab===t.id?PD.color:"transparent",
                color:tab===t.id?"#111":TEXT_DIM,
                fontSize:13,fontWeight:tab===t.id?800:600,cursor:"pointer",
                transition:"all 0.18s ease",
                boxShadow:tab===t.id?`0 2px 12px ${PD.color}50`:"none",
              }}>{t.label}</button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab==="overview"&&(
            <div className="fade-up">
              <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
                <CycleRing day={day} cycleLength={profile.cycleLength} size={200}/>
              </div>
              {/* 4 stat cards */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                {[
                  {label:"Period in",val:dToP<=0?"Today":`${dToP}d`,sub:fmtDate(nextP),color:"#e84393",bg:PHASES.menstruation.bg},
                  {label:"Ovulation",val:dToO<=0?"Now!":dToO===1?"Tmrw":`${dToO}d`,sub:fmtDate(nextO),color:ACCENT_GREEN,bg:PHASES.ovulation.bg},
                  {label:"Energy",   val:tips.energy,  sub:"Current phase",color:"#f5a623",bg:PHASES.follicular.bg},
                  {label:"Mood",     val:tips.mood,    sub:"Expected",     color:LAVENDER,bg:PHASES.luteal.bg},
                ].map(s=>(
                  <div key={s.label} style={{background:s.bg,border:`1px solid ${s.color}22`,borderRadius:14,padding:16}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:s.color+"99",marginBottom:6}}>{s.label.toUpperCase()}</div>
                    <div style={{fontSize:20,fontWeight:900,color:s.color,marginBottom:3}}>{s.val}</div>
                    <div style={{fontSize:11,color:TEXT_MUTED}}>{s.sub}</div>
                  </div>
                ))}
              </div>
              {/* Symptoms */}
              <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:14,padding:16,marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <span style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:TEXT_MUTED}}>SYMPTOMS</span>
                  <PillBtn onClick={()=>setEditSym(!editSym)} variant="ghost" style={{padding:"4px 12px",fontSize:11}}>{editSym?"✓ Done":"Edit"}</PillBtn>
                </div>
                {editSym?(
                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                    {SYMPTOMS.map(s=>{const on=(profile.symptoms||[]).includes(s); return(
                      <button key={s} onClick={()=>toggleSym(s)} className="btn-press" style={{
                        background:on?PD.dim:"rgba(255,255,255,0.05)",border:`1px solid ${on?PD.color+"55":BORDER}`,
                        borderRadius:999,padding:"5px 13px",color:on?PD.color:TEXT_DIM,fontSize:12,cursor:"pointer",transition:"all 0.15s"
                      }}>{s}</button>
                    );})}
                  </div>
                ):(
                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                    {(profile.symptoms||[]).length===0
                      ?<span style={{fontSize:12,color:TEXT_MUTED,fontStyle:"italic"}}>None logged — tap Edit.</span>
                      :(profile.symptoms||[]).map(s=>(
                        <span key={s} style={{background:PD.dim,border:`1px solid ${PD.color}33`,borderRadius:999,padding:"5px 13px",fontSize:12,color:PD.color}}>{s}</span>
                      ))
                    }
                  </div>
                )}
              </div>
              <AIInsight profile={profile}/>
            </div>
          )}

          {/* ── CALENDAR ── */}
          {tab==="calendar"&&(
            <div className="fade-up">
              <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:14,padding:20,marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                  <button onClick={()=>setMonthOffset(m=>m-1)} className="btn-press" style={{width:36,height:36,borderRadius:"50%",background:SURFACE2,border:`1px solid ${BORDER}`,color:TEXT,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:16,fontWeight:800,color:TEXT}}>{calLabel}</div>
                    {monthOffset!==0&&<button onClick={()=>setMonthOffset(0)} style={{background:"none",border:"none",color:PD.color,fontSize:11,cursor:"pointer",marginTop:2}}>Today</button>}
                  </div>
                  <button onClick={()=>setMonthOffset(m=>m+1)} className="btn-press" style={{width:36,height:36,borderRadius:"50%",background:SURFACE2,border:`1px solid ${BORDER}`,color:TEXT,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
                </div>
                <MonthCalendar profile={profile} monthOffset={monthOffset}/>
              </div>
              <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:14,padding:16,marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:TEXT_MUTED,marginBottom:12}}>UPCOMING</div>
                {[{label:"🔴 Next Period",date:nextP,color:"#e84393"},{label:"⚡ Ovulation",date:nextO,color:ACCENT_GREEN}].map(ev=>(
                  <div key={ev.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${BORDER}`}}>
                    <span style={{color:ev.color,fontSize:13,fontWeight:700}}>{ev.label}</span>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:14,color:TEXT,fontWeight:700}}>{fmtDate(ev.date)}</div>
                      <div style={{fontSize:11,color:TEXT_MUTED}}>{daysUntil(ev.date)}d away</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Intimacy log */}
              <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:14,padding:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div>
                    <span style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:TEXT_MUTED}}>INTIMACY LOG</span>
                    <span style={{fontSize:11,color:TEXT_MUTED,marginLeft:6}}>({(profile.intimacyLog||[]).length})</span>
                  </div>
                  <PillBtn onClick={()=>setShowLog(true)} variant="lavender" style={{fontSize:12,padding:"5px 14px"}}>+ Add</PillBtn>
                </div>
                {(profile.intimacyLog||[]).length===0
                  ?<p style={{fontSize:12,color:TEXT_MUTED,fontStyle:"italic",margin:0}}>No sessions logged yet.</p>
                  :[...(profile.intimacyLog||[])].reverse().map(d=>{
                    const diff=Math.floor((new Date(d)-new Date(profile.lastPeriodStart))/86400000);
                    const cd=((diff%profile.cycleLength)+profile.cycleLength)%profile.cycleLength+1;
                    const ph=getPhaseFromDay(cd), col=PHASES[ph].color;
                    return (
                      <div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${BORDER}`}}>
                        <div>
                          <span style={{fontSize:13,color:TEXT,fontWeight:600}}>💕 {fmtDate(d)}</span>
                          <span style={{background:col+"1a",border:`1px solid ${col}33`,borderRadius:999,padding:"2px 9px",fontSize:10,color:col,marginLeft:8}}>{PHASES[ph].label}</span>
                        </div>
                        <button onClick={()=>removeIntimacy(d)} style={{background:"none",border:"none",color:TEXT_MUTED,cursor:"pointer",fontSize:18,lineHeight:1,padding:"2px 6px"}} className="btn-press">×</button>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          )}

          {/* ── LOG ── */}
          {tab==="log"&&(
            <div className="fade-up">
              <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:14,padding:20,marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:TEXT_MUTED,marginBottom:16}}>UPDATE CYCLE DATA</div>
                {[
                  {label:"LAST PERIOD START DATE",      key:"lastPeriodStart",type:"date"  },
                  {label:"AVERAGE CYCLE LENGTH (DAYS)", key:"cycleLength",    type:"number"},
                  {label:"PERIOD DURATION (DAYS)",      key:"periodLength",   type:"number"},
                ].map(f=>(
                  <div key={f.key} style={{marginBottom:14}}>
                    <label style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:TEXT_MUTED,display:"block",marginBottom:7}}>{f.label}</label>
                    <input type={f.type} value={profile[f.key]||""} className="input-dd"
                      onChange={e=>onUpdate({...profile,[f.key]:f.type==="number"?Math.max(1,parseInt(e.target.value)||28):e.target.value})}
                    />
                  </div>
                ))}
                <label style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:TEXT_MUTED,display:"block",marginBottom:7}}>PERSONAL NOTES</label>
                <textarea value={profile.notes||""} onChange={e=>onUpdate({...profile,notes:e.target.value})} placeholder="Mood patterns, observations…" className="input-dd" style={{minHeight:100,resize:"vertical"}}/>
              </div>
              <BigBtn onClick={()=>setShowLog(true)} color={LAVENDER}>💕 Log Intimacy Session</BigBtn>
            </div>
          )}

          {/* ── INSIGHTS ── */}
          {tab==="insights"&&(
            <div className="fade-up">
              {Object.values(PHASES).map((val,i)=>{
                const t=TIPS[val.key], isCur=phase===val.key;
                return (
                  <div key={val.key} className={`fade-up-${Math.min(i,3)}`} style={{background:isCur?val.bg:SURFACE,border:`1px solid ${isCur?val.color+"44":BORDER}`,borderRadius:14,padding:18,marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:42,height:42,borderRadius:12,background:val.color+"1a",border:`1px solid ${val.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{val.emoji}</div>
                        <div>
                          <div style={{fontSize:15,fontWeight:800,color:val.color}}>{val.label}</div>
                          <div style={{fontSize:11,color:TEXT_MUTED}}>Day {val.days[0]}–{val.days[1]}</div>
                        </div>
                      </div>
                      {isCur&&<span style={{background:val.color,borderRadius:999,padding:"3px 12px",fontSize:11,fontWeight:800,color:"#111"}}>NOW</span>}
                    </div>
                    <p style={{fontSize:13,color:TEXT_DIM,lineHeight:1.65,margin:"0 0 12px"}}>{t.note}</p>
                    <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                      {[`⚡ ${t.energy}`,`🧠 ${t.mood}`,`💫 ${t.libido}`,t.safe?"✅ Safe":"⚠️ Risky"].map(tag=>(
                        <span key={tag} style={{background:val.color+"18",border:`1px solid ${val.color}30`,borderRadius:999,padding:"4px 11px",fontSize:11,color:val.color}}>{tag}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
              <AIInsight profile={profile}/>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showLog    && <LogIntimacyModal profile={profile} onSave={saveIntimacy} onClose={()=>setShowLog(false)}/>}
      {showDel    && <DeleteModal name={profile.name} onConfirm={onDelete} onClose={()=>setShowDel(false)}/>}
      {showMenu   && <MenuPanel onClose={()=>setShowMenu(false)} onManageProfiles={onBack} onSettings={()=>{setShowMenu(false);setShowSettings(true);}} onBack={onBack}/>}
      {showSettings && <SettingsModal settings={settings} onChange={setSettings} onClose={()=>setShowSettings(false)}/>}
    </div>
  );
}

// ─── ADD PROFILE MODAL ────────────────────────────────────────────────────────

function AddProfileModal({ onAdd, onClose }) {
  const [form,setForm]=useState({name:"",lastPeriodStart:todayStr(),cycleLength:28,periodLength:5,avatar:"🌸"});
  const ok=form.name.trim().length>0;
  return (
    <>
      <Backdrop onClick={onClose}/>
      <div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
        <ModalCard style={{maxWidth:480}}>
          <ModalTitle sub="Add a new profile to track her cycle.">Add Profile</ModalTitle>
          {/* Avatar */}
          <label style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:TEXT_MUTED,display:"block",marginBottom:10}}>CHOOSE AVATAR</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
            {AVATARS.map(a=>(
              <button key={a} onClick={()=>setForm({...form,avatar:a})} className="btn-press" style={{
                width:44,height:44,fontSize:22,borderRadius:12,cursor:"pointer",
                background:form.avatar===a?"rgba(124,92,191,0.2)":"rgba(255,255,255,0.06)",
                border:`2px solid ${form.avatar===a?"#7c5cbf":BORDER}`,transition:"all 0.15s",
              }}>{a}</button>
            ))}
          </div>
          {/* Fields */}
          {[
            {label:"NAME",             key:"name",            type:"text",   ph:"Her name…"},
            {label:"LAST PERIOD START",key:"lastPeriodStart", type:"date"   },
            {label:"CYCLE LENGTH (DAYS)",key:"cycleLength",   type:"number" },
            {label:"PERIOD DURATION (DAYS)",key:"periodLength",type:"number"},
          ].map(f=>(
            <div key={f.key} style={{marginBottom:14}}>
              <label style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:TEXT_MUTED,display:"block",marginBottom:7}}>{f.label}</label>
              <input type={f.type} value={form[f.key]} placeholder={f.ph} className="input-dd"
                onChange={e=>setForm({...form,[f.key]:f.type==="number"?Math.max(1,parseInt(e.target.value)||28):e.target.value})}
                autoFocus={f.key==="name"}
              />
            </div>
          ))}
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <PillBtn onClick={onClose} variant="ghost" style={{flex:1,padding:14,fontSize:14}}>Cancel</PillBtn>
            <BigBtn onClick={()=>{if(ok)onAdd({...form,id:Date.now().toString(),symptoms:[],intimacyLog:[],notes:"",hidden:false});}} disabled={!ok} style={{flex:2}}>Add Profile →</BigBtn>
          </div>
        </ModalCard>
      </div>
    </>
  );
}

// ─── CHOOSE DECK MODAL (= "Choose Your Deck" screen from reference) ───────────
// For Cyclr this is the "Choose Profile" selection when entering the app

function ChooseProfileModal({ profiles, onSelect, onAdd, onClose }) {
  return (
    <>
      <Backdrop onClick={onClose}/>
      <div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
        <ModalCard style={{maxWidth:540,maxHeight:"85vh",display:"flex",flexDirection:"column",padding:"28px 0"}}>
          <div style={{padding:"0 28px 20px",textAlign:"center"}}>
            <h2 style={{fontSize:26,fontWeight:900,color:TEXT,marginBottom:6}}>Choose Profile</h2>
            <p style={{fontSize:14,color:TEXT_DIM}}>Select who to view, or add a new profile</p>
          </div>
          <div style={{overflowY:"auto",flex:1,padding:"0 20px"}}>
            {profiles.length===0
              ?<div style={{textAlign:"center",padding:"40px 20px",color:TEXT_MUTED,fontSize:14}}>No profiles yet. Add one below.</div>
              :profiles.filter(p=>!p.hidden).map((profile)=>{
                const day=getDayOfCycle(profile.lastPeriodStart,profile.cycleLength);
                const phase=getPhaseFromDay(day);
                const PD=PHASES[phase];
                const tips=TIPS[phase];
                return (
                  <div key={profile.id} className="deck-row" onClick={()=>onSelect(profile)} style={{
                    display:"flex",alignItems:"center",gap:16,
                    background:SURFACE2,borderRadius:14,padding:"16px 18px",marginBottom:10,
                    border:`1px solid ${BORDER}`,
                  }}>
                    <div style={{width:48,height:48,borderRadius:14,background:PD.dim,border:`2px solid ${PD.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{profile.avatar}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:16,fontWeight:800,color:TEXT,marginBottom:3}}>{profile.name}</div>
                      <div style={{fontSize:12,color:TEXT_DIM}}>{PD.emoji} {PD.label} · Day {day} · <span style={{color:tips.safe?ACCENT_GREEN:"#e84393",fontWeight:700}}>{tips.safe?"✓ Safe":"⚠️ Risk"}</span></div>
                    </div>
                    <span style={{color:TEXT_MUTED,fontSize:20}}>›</span>
                  </div>
                );
              })
            }
          </div>
          <div style={{padding:"16px 28px 0",borderTop:`1px solid ${BORDER}`,marginTop:12}}>
            <BigBtn onClick={onAdd}>+ Add New Profile</BigBtn>
          </div>
        </ModalCard>
      </div>
    </>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function Dashboard({ user, profiles, onSelect, onAdd, onLogout }) {
  const [showChoose,   setShowChoose]   = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMenu,     setShowMenu]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings,     setSettings]     = useState({});
  const [showHidden,   setShowHidden]   = useState(false);

  const active     = profiles.filter(p=>!p.hidden);
  const hidden     = profiles.filter(p=>p.hidden);
  const safeCt     = active.filter(p=>TIPS[getPhaseFromDay(getDayOfCycle(p.lastPeriodStart,p.cycleLength))].safe).length;
  const ovCt       = active.filter(p=>getPhaseFromDay(getDayOfCycle(p.lastPeriodStart,p.cycleLength))==="ovulation").length;
  const sessionsCt = active.reduce((a,p)=>a+(p.intimacyLog||[]).length,0);

  return (
    <div style={{minHeight:"100vh",background:PAGE_BG,fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"60px 16px 40px",position:"relative"}}>
      <HamburgerBtn onClick={()=>setShowMenu(true)}/>

      {/* Main card — exactly like Deeper-Decks center modal */}
      <ModalCard className="modal-card fade-up" style={{width:"100%",maxWidth:560}}>
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:36,marginBottom:8}}>🌙</div>
          <h1 style={{fontSize:30,fontWeight:900,color:TEXT,letterSpacing:"-0.5px",marginBottom:6}}>Cyclr™</h1>
          <p style={{fontSize:14,color:TEXT_DIM}}>Hey {user.username} · {active.length} profile{active.length!==1?"s":""}</p>
        </div>

        {/* Summary stats strip */}
        {active.length>0&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24,background:SURFACE2,borderRadius:12,padding:14}}>
            {[
              {label:"Profiles",  val:active.length,  color:"#9b59b6"},
              {label:"Safe Now",  val:safeCt,          color:ACCENT_GREEN},
              {label:"Ovulating", val:ovCt,            color:"#f5a623"},
              {label:"Sessions",  val:sessionsCt,      color:"#e84393"},
            ].map(s=>(
              <div key={s.label} style={{textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:900,color:s.color,lineHeight:1}}>{s.val}</div>
                <div style={{fontSize:10,color:TEXT_MUTED,marginTop:3,fontWeight:600}}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Profile list — styled exactly like the player list rows */}
        {active.length>0&&(
          <div style={{marginBottom:16}}>
            {active.map((profile,idx)=>{
              const day=getDayOfCycle(profile.lastPeriodStart,profile.cycleLength);
              const phase=getPhaseFromDay(day);
              const PD=PHASES[phase];
              const tips=TIPS[phase];
              const dToP=daysUntil(getNextPeriod(profile.lastPeriodStart,profile.cycleLength));
              return (
                <div key={profile.id} className="row-hover" onClick={()=>onSelect(profile)} style={{
                  display:"flex",alignItems:"center",gap:14,
                  background:ROW_BG,borderRadius:14,padding:"14px 16px",
                  marginBottom:8,border:`1px solid ${BORDER}`,
                  position:"relative",overflow:"hidden",
                }}>
                  {/* Left accent bar (like NOW indicator in reference) */}
                  <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:PD.color,borderRadius:"14px 0 0 14px"}}/>
                  <div style={{paddingLeft:4,display:"flex",alignItems:"center",gap:14,flex:1}}>
                    {/* Green dot + name area (like Player 1 NOW row) */}
                    <div style={{width:10,height:10,borderRadius:"50%",background:tips.safe?ACCENT_GREEN:"#e84393",flexShrink:0,boxShadow:`0 0 6px ${tips.safe?ACCENT_GREEN:"#e84393"}`}}/>
                    <div style={{width:44,height:44,borderRadius:12,background:PD.dim,border:`2px solid ${PD.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{profile.avatar}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                        <span style={{fontSize:15,fontWeight:800,color:TEXT}}>{profile.name}</span>
                        {idx===0&&<span style={{fontSize:10,fontWeight:700,letterSpacing:1,color:ACCENT_GREEN,background:"rgba(76,175,122,0.15)",borderRadius:999,padding:"1px 8px"}}>FIRST</span>}
                      </div>
                      <span style={{fontSize:12,color:TEXT_DIM}}>{PD.emoji} {PD.label} · Day {day} · {dToP<=0?"Period today":`Period in ${dToP}d`}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                      <span style={{background:tips.safe?"rgba(76,175,122,0.15)":"rgba(232,67,147,0.15)",color:tips.safe?ACCENT_GREEN:"#e84393",fontSize:11,fontWeight:700,borderRadius:999,padding:"4px 10px",border:`1px solid ${tips.safe?ACCENT_GREEN+"33":"#e8439333"}`}}>{tips.safe?"✓ Safe":"⚠️ Risk"}</span>
                      <span style={{color:TEXT_MUTED,fontSize:18}}>›</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hidden profiles toggle */}
        {hidden.length>0&&(
          <button onClick={()=>setShowHidden(h=>!h)} className="btn-press" style={{
            width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${BORDER}`,
            borderRadius:10,padding:"10px",color:TEXT_MUTED,fontSize:12,fontWeight:600,
            cursor:"pointer",marginBottom:14,
          }}>
            {showHidden?`👁 Hide ${hidden.length} hidden`:`🙈 ${hidden.length} hidden profile${hidden.length>1?"s":""}`}
          </button>
        )}

        {/* Count line (like "2 players added") */}
        {active.length>0&&(
          <p style={{textAlign:"center",fontSize:13,color:TEXT_MUTED,marginBottom:16}}>
            {active.length} profile{active.length!==1?"s":""} · tap any to view details
          </p>
        )}

        {/* Primary CTA — exactly like "Choose Deck & Start Playing" */}
        <BigBtn onClick={()=>setShowAddModal(true)}>
          + Add New Profile
        </BigBtn>

        {/* Sign out */}
        <button onClick={onLogout} className="btn-press" style={{
          display:"block",width:"100%",background:"none",border:"none",
          color:TEXT_MUTED,fontSize:12,marginTop:14,cursor:"pointer",textAlign:"center",
          padding:6,
        }}>Sign out</button>
      </ModalCard>

      {showAddModal&&<AddProfileModal onAdd={p=>{onAdd(p);setShowAddModal(false);}} onClose={()=>setShowAddModal(false)}/>}
      {showMenu   &&<MenuPanel onClose={()=>setShowMenu(false)} onManageProfiles={()=>{}} onSettings={()=>{setShowMenu(false);setShowSettings(true);}} onBack={()=>{}}/>}
      {showSettings&&<SettingsModal settings={settings} onChange={setSettings} onClose={()=>setShowSettings(false)}/>}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [focused,  setFocused]  = useState(false);
  const ok = username.trim().length > 0;

  return (
    <div style={{minHeight:"100vh",background:PAGE_BG,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Nunito',sans-serif"}}>
      {/* Exactly like the Deeper-Decks login modal — centered card on grey bg */}
      <ModalCard className="modal-card fade-up" style={{maxWidth:460}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:52,marginBottom:14}}>🌙</div>
          <h1 style={{fontSize:32,fontWeight:900,color:TEXT,letterSpacing:"-0.5px",marginBottom:8}}>Cyclr™</h1>
          <p style={{fontSize:14,color:TEXT_DIM,lineHeight:1.55}}>Cycle intelligence · enter a username to begin</p>
        </div>

        <label style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:TEXT_MUTED,display:"block",marginBottom:8}}>USERNAME</label>
        <div style={{display:"flex",gap:10,marginBottom:20}}>
          <input
            value={username}
            onChange={e=>setUsername(e.target.value)}
            onFocus={()=>setFocused(true)}
            onBlur={()=>setFocused(false)}
            onKeyDown={e=>e.key==="Enter"&&ok&&onLogin(username.trim())}
            placeholder="Enter username"
            autoFocus
            className="input-dd"
            style={{
              flex:1,
              borderColor:focused?"rgba(255,255,255,0.35)":undefined,
              boxShadow:focused?"0 0 0 3px rgba(255,255,255,0.07)":undefined,
            }}
          />
          <PillBtn onClick={()=>ok&&onLogin(username.trim())} variant="dark" style={{padding:"0 22px",fontSize:14,opacity:ok?1:0.45}}>Add</PillBtn>
        </div>

        <BigBtn onClick={()=>ok&&onLogin(username.trim())} disabled={!ok}>
          Choose Deck &amp; Start Playing
        </BigBtn>

        <p style={{textAlign:"center",color:TEXT_MUTED,fontSize:11,marginTop:16,lineHeight:1.5}}>Data stored locally · no account needed</p>
      </ModalCard>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen,   setScreen]   = useState("loading");
  const [user,     setUser]     = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState(null);

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
  function handleLogin(username){const u={username};setUser(u);localStorage.setItem("cyclr_user",JSON.stringify(u));setScreen("dashboard");}
  function handleLogout(){localStorage.removeItem("cyclr_user");setUser(null);setScreen("login");}
  function handleAdd(p){save([...profiles,p]);}
  function handleUpdate(u){const np=profiles.map(x=>x.id===u.id?u:x);save(np);setSelected(u);}
  function handleDelete(){save(profiles.filter(p=>p.id!==selected.id));setSelected(null);setScreen("dashboard");}
  function handleSelect(p){setSelected(p);setScreen("profile");}

  if(screen==="loading") return (
    <div style={{minHeight:"100vh",background:PAGE_BG,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:40,animation:"pulse 1.5s ease-in-out infinite"}}>🌙</div>
    </div>
  );

  return (
    <>
      <GlobalStyles/>
      {screen==="login"   && <Login onLogin={handleLogin}/>}
      {screen==="dashboard" && <Dashboard user={user||{username:"User"}} profiles={profiles} onSelect={handleSelect} onAdd={handleAdd} onLogout={handleLogout}/>}
      {screen==="profile" && selected && (
        <ProfileDetail profile={selected} onUpdate={handleUpdate} onBack={()=>setScreen("dashboard")} onDelete={handleDelete}/>
      )}
      {screen==="profile" && !selected && <Dashboard user={user||{username:"User"}} profiles={profiles} onSelect={handleSelect} onAdd={handleAdd} onLogout={handleLogout}/>}
    </>
  );
}
