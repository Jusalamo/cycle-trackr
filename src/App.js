import { useState, useEffect, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PHASES = {
  menstruation: {
    label: "Menstruation", short: "Period",
    color: "#ff6b9d", bg: "#2a1525", emoji: "🔴", days: [1, 5],
  },
  follicular: {
    label: "Follicular", short: "Follicular",
    color: "#f4c97a", bg: "#2a2010", emoji: "🌱", days: [6, 13],
  },
  ovulation: {
    label: "Ovulation", short: "Ovulation",
    color: "#b8f0c8", bg: "#0f2a18", emoji: "⚡", days: [14, 16],
  },
  luteal: {
    label: "Luteal", short: "Luteal",
    color: "#c9b8f0", bg: "#1a1528", emoji: "🌙", days: [17, 28],
  },
};

const CYCLE_TIPS = {
  menstruation: {
    safe: false, risk: "HIGH RISK",
    note: "Active shedding. Avoid unprotected sex. She may feel fatigued or crampy.",
    energy: "Low", mood: "Variable", libido: "Low",
  },
  follicular: {
    safe: true, risk: "LOWER RISK",
    note: "Rising estrogen lifts her mood & energy. Risk increases as ovulation nears.",
    energy: "Rising", mood: "Positive", libido: "Rising",
  },
  ovulation: {
    safe: false, risk: "PEAK RISK",
    note: "Peak fertility window — highest pregnancy risk. Raw is strongly inadvisable.",
    energy: "Peak", mood: "Flirty/Social", libido: "Peak",
  },
  luteal: {
    safe: true, risk: "LOWER RISK",
    note: "Post-ovulation. Progesterone rises — she may feel more emotional or bloated.",
    energy: "Falling", mood: "Introspective", libido: "Medium",
  },
};

const SYMPTOMS = [
  "Cramps", "Bloating", "Mood swings", "Headache", "Fatigue",
  "Tender breasts", "Spotting", "Back pain", "Nausea",
  "High libido", "Low libido", "Irritability", "Anxiety",
  "Clear discharge", "PMS",
];

const AVATARS = ["🌸", "💜", "🌙", "🦋", "🌺", "✨", "💎", "🌹", "🔮", "🌊", "🍒", "🌷"];

const PASTEL_CARDS = ["#c9b8f0", "#f4c97a", "#ffb3c6", "#b8f0c8", "#b8d4f0", "#f0c9b8"];

const font = "'Outfit', sans-serif";
const fontSerif = "'Playfair Display', serif";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function getNextPeriod(lastPeriodStart, cycleLength = 28) {
  const start = new Date(lastPeriodStart);
  const today = new Date();
  let next = new Date(start);
  while (next <= today) next.setDate(next.getDate() + cycleLength);
  return next;
}

function getOvulation(lastPeriodStart, cycleLength = 28) {
  const start = new Date(lastPeriodStart);
  const today = new Date();
  let ov = new Date(start);
  ov.setDate(ov.getDate() + 13);
  while (ov < today) ov.setDate(ov.getDate() + cycleLength);
  return ov;
}

function daysUntil(d) {
  return Math.ceil((new Date(d) - new Date()) / 86400000);
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// ─── Background Decor ─────────────────────────────────────────────────────────

function BgDecor({ phase }) {
  const c = PHASES[phase || "luteal"].color;
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{
        position: "absolute", top: -80, right: -80, width: 300, height: 300,
        borderRadius: "60% 40% 55% 45% / 45% 55% 40% 60%",
        background: c + "18",
      }} />
      <div style={{
        position: "absolute", bottom: 100, left: -60, width: 200, height: 200,
        borderRadius: "50%", background: c + "10",
      }} />
      <div style={{
        position: "absolute", top: 60, left: 30, width: 80, height: 80,
        borderRadius: "50%", border: `1px solid ${c}20`,
      }} />
      <div style={{
        position: "absolute", bottom: 200, right: 40, width: 50, height: 50,
        borderRadius: "50%", border: `1px solid ${c}20`,
      }} />
    </div>
  );
}

// ─── AI Insight ───────────────────────────────────────────────────────────────

function AIInsight({ profile }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const day = getDayOfCycle(profile.lastPeriodStart, profile.cycleLength);
  const phase = getPhaseFromDay(day);
  const PD = PHASES[phase];

  const generate = useCallback(async () => {
    setLoading(true);
    setText("");
    const symptoms = (profile.symptoms || []).join(", ") || "none";
    const sessions = (profile.intimacyLog || []).length;
    const nextPeriodDays = daysUntil(getNextPeriod(profile.lastPeriodStart, profile.cycleLength));
    const nextOvDays = daysUntil(getOvulation(profile.lastPeriodStart, profile.cycleLength));

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
            content: `Partner: ${profile.name}. Cycle day ${day} of ${profile.cycleLength} (${phase} phase). Symptoms: ${symptoms}. Intimacy sessions this cycle: ${sessions}. Days until next period: ${nextPeriodDays}. Days until ovulation: ${nextOvDays}. Give insight and recommendation.`,
          }],
        }),
      });
      const data = await res.json();
      setText(data.content?.[0]?.text || "Could not generate insight.");
    } catch {
      setText("AI unavailable — check your connection.");
    }
    setLoading(false);
  }, [profile, day, phase]);

  return (
    <div style={{
      background: "#1a1a2e",
      border: `1px solid ${PD.color}33`,
      borderRadius: 20,
      padding: 20,
      marginTop: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: PD.color, fontFamily: font }}>
          ✦ AI INSIGHT
        </span>
        <button
          onClick={generate}
          disabled={loading}
          style={{
            background: PD.color, border: "none", borderRadius: 20,
            padding: "6px 16px", color: "#111", fontSize: 12, fontWeight: 700,
            cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1,
            fontFamily: font,
          }}
        >
          {loading ? "Thinking…" : "Generate"}
        </button>
      </div>
      {text
        ? <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, margin: 0, fontFamily: font }}>{text}</p>
        : <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0, fontStyle: "italic", fontFamily: font }}>
            Tap Generate for personalized cycle insights powered by AI.
          </p>
      }
    </div>
  );
}

// ─── Cycle Ring ───────────────────────────────────────────────────────────────

function CycleRing({ day, cycleLength, size = 180 }) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.36;
  const strokeW = size * 0.1;
  const circ = 2 * Math.PI * r;
  const phase = getPhaseFromDay(day);

  const segments = [
    { name: "menstruation", start: 0,  end: 5,           color: "#ff6b9d" },
    { name: "follicular",   start: 5,  end: 13,          color: "#f4c97a" },
    { name: "ovulation",    start: 13, end: 16,          color: "#b8f0c8" },
    { name: "luteal",       start: 16, end: cycleLength,  color: "#c9b8f0" },
  ];

  function segProps(startDay, endDay) {
    const startAngle = (startDay / cycleLength) * 2 * Math.PI - Math.PI / 2;
    const portion = (endDay - startDay) / cycleLength;
    const dashLen = portion * circ - 3;
    const offset = -(startAngle / (2 * Math.PI)) * circ;
    return { dashLen, gap: circ - dashLen, offset };
  }

  const dotAngle = ((day - 1) / cycleLength) * 2 * Math.PI - Math.PI / 2;
  const dotX = cx + r * Math.cos(dotAngle);
  const dotY = cy + r * Math.sin(dotAngle);

  return (
    <svg width={size} height={size}>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeW} />
      {/* Phase segments */}
      {segments.map(seg => {
        const { dashLen, gap, offset } = segProps(seg.start, seg.end);
        const isCurrent = phase === seg.name;
        return (
          <circle
            key={seg.name} cx={cx} cy={cy} r={r}
            fill="none" stroke={seg.color} strokeWidth={strokeW}
            strokeDasharray={`${dashLen} ${gap}`} strokeDashoffset={offset}
            strokeLinecap="round" opacity={isCurrent ? 1 : 0.2}
          />
        );
      })}
      {/* Current day dot */}
      <circle cx={dotX} cy={dotY} r={size * 0.055} fill="white" />
      <circle cx={dotX} cy={dotY} r={size * 0.03} fill={PHASES[phase].color} />
      {/* Center text */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize={size * 0.16} fontWeight={700} fontFamily={font}>{day}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={size * 0.07} fontFamily={font}>of {cycleLength}</text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill={PHASES[phase].color} fontSize={size * 0.075} fontWeight={600} fontFamily={font}>{PHASES[phase].short}</text>
    </svg>
  );
}

// ─── Month Calendar ───────────────────────────────────────────────────────────

function MonthCalendar({ profile, monthOffset = 0 }) {
  const base = new Date();
  base.setMonth(base.getMonth() + monthOffset);
  const year = base.getFullYear();
  const month = base.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  function phaseForDay(d) {
    const date = new Date(year, month, d);
    const start = new Date(profile.lastPeriodStart);
    const diff = Math.floor((date - start) / 86400000);
    const cycleDay = ((diff % profile.cycleLength) + profile.cycleLength) % profile.cycleLength + 1;
    return getPhaseFromDay(cycleDay);
  }

  function cycleDayFor(d) {
    const date = new Date(year, month, d);
    const start = new Date(profile.lastPeriodStart);
    const diff = Math.floor((date - start) / 86400000);
    return ((diff % profile.cycleLength) + profile.cycleLength) % profile.cycleLength + 1;
  }

  function isIntimacyDay(d) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return (profile.intimacyLog || []).includes(dateStr);
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.25)", padding: "4px 0", fontFamily: font }}>{d}</div>
        ))}
        {Array(firstDay).fill(null).map((_, i) => <div key={"empty" + i} />)}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const d = i + 1;
          const ph = phaseForDay(d);
          const col = PHASES[ph].color;
          const isToday = isCurrentMonth && d === today.getDate();
          const hasIntimacy = isIntimacyDay(d);
          const cd = cycleDayFor(d);
          return (
            <div
              key={d}
              title={`Day ${cd} · ${PHASES[ph].label}`}
              style={{
                aspectRatio: "1", borderRadius: 10, position: "relative",
                background: isToday ? col : col + "20",
                border: `1px solid ${isToday ? col : col + "40"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: isToday ? `0 0 10px ${col}60` : "none",
              }}
            >
              <span style={{ fontSize: 11, color: isToday ? "#111" : "rgba(255,255,255,0.6)", fontWeight: isToday ? 700 : 400, fontFamily: font }}>{d}</span>
              {hasIntimacy && <span style={{ position: "absolute", top: 1, right: 2, fontSize: 7 }}>💕</span>}
            </div>
          );
        })}
      </div>
      {/* Phase legend */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
        {Object.entries(PHASES).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: v.color }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: font }}>{v.short}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9 }}>💕</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: font }}>Intimacy</span>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Detail ───────────────────────────────────────────────────────────

function ProfileDetail({ profile, onUpdate, onBack, onDelete }) {
  const [tab, setTab] = useState("overview");
  const [monthOffset, setMonthOffset] = useState(0);
  const [editingSymptoms, setEditingSymptoms] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logDate, setLogDate] = useState(todayStr());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const day = getDayOfCycle(profile.lastPeriodStart, profile.cycleLength);
  const phase = getPhaseFromDay(day);
  const PD = PHASES[phase];
  const tips = CYCLE_TIPS[phase];
  const nextPeriod = getNextPeriod(profile.lastPeriodStart, profile.cycleLength);
  const nextOvulation = getOvulation(profile.lastPeriodStart, profile.cycleLength);
  const daysToNextPeriod = daysUntil(nextPeriod);
  const daysToOvulation = daysUntil(nextOvulation);

  const calendarLabel = (() => {
    const b = new Date();
    b.setMonth(b.getMonth() + monthOffset);
    return b.toLocaleString("default", { month: "long", year: "numeric" });
  })();

  function toggleSymptom(s) {
    const current = profile.symptoms || [];
    const updated = current.includes(s)
      ? current.filter(x => x !== s)
      : [...current, s];
    onUpdate({ ...profile, symptoms: updated });
  }

  function logIntimacy() {
    const current = profile.intimacyLog || [];
    if (!current.includes(logDate)) {
      onUpdate({ ...profile, intimacyLog: [...current, logDate].sort() });
    }
    setShowLogModal(false);
  }

  function removeIntimacy(date) {
    onUpdate({ ...profile, intimacyLog: (profile.intimacyLog || []).filter(d => d !== date) });
  }

  const tabs = [
    { id: "overview",  label: "Overview"  },
    { id: "calendar",  label: "Calendar"  },
    { id: "log",       label: "Log"       },
    { id: "insights",  label: "Insights"  },
  ];

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
    padding: "12px 16px", color: "white", fontSize: 14,
    outline: "none", boxSizing: "border-box", fontFamily: font,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", color: "white", fontFamily: font, position: "relative" }}>
      <BgDecor phase={phase} />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "0 16px 80px" }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0 16px" }}>
          <button
            onClick={onBack}
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "8px 18px", color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", fontFamily: font }}
          >
            ← Back
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onUpdate({ ...profile, hidden: !profile.hidden })}
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "8px 14px", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontFamily: font }}
            >
              {profile.hidden ? "👁 Show" : "🙈 Hide"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{ background: "rgba(255,80,100,0.1)", border: "1px solid rgba(255,80,100,0.25)", borderRadius: 20, padding: "8px 14px", color: "#ff6b9d", fontSize: 12, cursor: "pointer", fontFamily: font }}
            >
              🗑 Delete
            </button>
          </div>
        </div>

        {/* Hero card */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <div style={{
            position: "absolute", top: -10, right: -10, width: 160, height: 160,
            borderRadius: "60% 40% 55% 45% / 45% 55% 40% 60%",
            background: PD.color + "22", pointerEvents: "none",
          }} />
          <div style={{ background: "#161628", border: `1px solid ${PD.color}30`, borderRadius: 28, padding: 24, position: "relative" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 24,
                background: `linear-gradient(135deg, ${PD.color}44, ${PD.color}11)`,
                border: `2px solid ${PD.color}55`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, flexShrink: 0,
              }}>
                {profile.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 700, fontFamily: fontSerif }}>{profile.name}</h2>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: PD.color + "22", borderRadius: 20, padding: "4px 12px" }}>
                  <span style={{ fontSize: 12 }}>{PD.emoji}</span>
                  <span style={{ fontSize: 12, color: PD.color, fontWeight: 600 }}>{PD.label} · Day {day} of {profile.cycleLength}</span>
                </div>
              </div>
              <CycleRing day={day} cycleLength={profile.cycleLength} size={80} />
            </div>

            {/* Risk banner */}
            <div style={{
              background: tips.safe ? "rgba(184,240,200,0.1)" : "rgba(255,107,157,0.1)",
              border: `1px solid ${tips.safe ? "#b8f0c855" : "#ff6b9d55"}`,
              borderRadius: 16, padding: "12px 16px",
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{tips.safe ? "✅" : "⚠️"}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: tips.safe ? "#b8f0c8" : "#ff6b9d", letterSpacing: 2, marginBottom: 4 }}>{tips.risk}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{tips.note}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 4, marginBottom: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, border: "none", borderRadius: 16, padding: "10px 4px",
                background: tab === t.id ? PD.color : "transparent",
                color: tab === t.id ? "#111" : "rgba(255,255,255,0.35)",
                fontSize: 12, fontWeight: tab === t.id ? 700 : 400,
                cursor: "pointer", transition: "all 0.2s", fontFamily: font,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div>
            {/* Big cycle ring */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <CycleRing day={day} cycleLength={profile.cycleLength} size={220} />
            </div>

            {/* Stat cards: Period, Ovulation, Energy, Mood */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Period in",  val: daysToNextPeriod <= 0 ? "Today" : `${daysToNextPeriod}d`, sub: fmtDate(nextPeriod),    color: "#ff6b9d", bg: "#2a1525" },
                { label: "Ovulation",  val: daysToOvulation <= 0 ? "Now!" : daysToOvulation === 1 ? "Tomorrow" : `${daysToOvulation}d`, sub: fmtDate(nextOvulation), color: "#b8f0c8", bg: "#0f2a18" },
                { label: "Energy",     val: tips.energy,    sub: "Current phase", color: "#f4c97a", bg: "#2a2010" },
                { label: "Mood",       val: tips.mood,      sub: "Expected",      color: "#c9b8f0", bg: "#1a1528" },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}33`, borderRadius: 20, padding: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, marginBottom: 8 }}>{s.label.toUpperCase()}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginBottom: 4, fontFamily: fontSerif }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Libido stat */}
            <div style={{ background: "#1e1030", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "12px 18px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>LIBIDO LEVEL</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: PD.color }}>{tips.libido}</span>
            </div>

            {/* Symptoms section */}
            <div style={{ background: "#161628", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.4)" }}>SYMPTOMS</span>
                <button
                  onClick={() => setEditingSymptoms(!editingSymptoms)}
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "5px 14px", color: "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer", fontFamily: font }}
                >
                  {editingSymptoms ? "Done" : "Edit"}
                </button>
              </div>
              {editingSymptoms ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SYMPTOMS.map(s => {
                    const active = (profile.symptoms || []).includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleSymptom(s)}
                        style={{
                          background: active ? PD.color + "33" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${active ? PD.color + "66" : "rgba(255,255,255,0.08)"}`,
                          borderRadius: 20, padding: "6px 14px",
                          color: active ? PD.color : "rgba(255,255,255,0.4)",
                          fontSize: 12, cursor: "pointer", fontFamily: font,
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(profile.symptoms || []).length === 0
                    ? <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>No symptoms logged. Tap Edit to add.</span>
                    : (profile.symptoms || []).map(s => (
                      <span key={s} style={{ background: PD.color + "22", border: `1px solid ${PD.color}44`, borderRadius: 20, padding: "5px 14px", fontSize: 12, color: PD.color }}>{s}</span>
                    ))
                  }
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <button
                onClick={() => onUpdate({ ...profile, lastPeriodStart: todayStr() })}
                style={{ background: "#ff6b9d", border: "none", borderRadius: 20, padding: "16px 12px", color: "#1a0010", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 8px 24px #ff6b9d44" }}
              >
                🔴 Period Started
              </button>
              <button
                onClick={() => setShowLogModal(true)}
                style={{ background: "#c9b8f0", border: "none", borderRadius: 20, padding: "16px 12px", color: "#1a1028", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 8px 24px #c9b8f044" }}
              >
                💕 Log Intimacy
              </button>
            </div>

            {/* AI Insight */}
            <AIInsight profile={profile} />
          </div>
        )}

        {/* ── CALENDAR TAB ── */}
        {tab === "calendar" && (
          <div>
            {/* Month nav + calendar */}
            <div style={{ background: "#161628", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <button
                  onClick={() => setMonthOffset(m => m - 1)}
                  style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  ‹
                </button>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: fontSerif, color: "white" }}>{calendarLabel}</div>
                  {monthOffset !== 0 && (
                    <button
                      onClick={() => setMonthOffset(0)}
                      style={{ background: "none", border: "none", color: PD.color, fontSize: 11, cursor: "pointer", marginTop: 4, fontFamily: font }}
                    >
                      Back to today
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setMonthOffset(m => m + 1)}
                  style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  ›
                </button>
              </div>
              <MonthCalendar profile={profile} monthOffset={monthOffset} />
            </div>

            {/* Upcoming events */}
            <div style={{ background: "#161628", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>UPCOMING EVENTS</div>
              {[
                { label: "🔴 Next Period",  date: nextPeriod,    color: "#ff6b9d" },
                { label: "⚡ Ovulation",    date: nextOvulation, color: "#b8f0c8" },
              ].map(ev => (
                <div key={ev.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: ev.color, fontSize: 14, fontWeight: 600 }}>{ev.label}</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{fmtDate(ev.date)}</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{daysUntil(ev.date)}d away</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Intimacy log */}
            <div style={{ background: "#161628", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.3)" }}>
                  INTIMACY LOG ({(profile.intimacyLog || []).length} sessions)
                </div>
                <button
                  onClick={() => setShowLogModal(true)}
                  style={{ background: "#c9b8f0", border: "none", borderRadius: 20, padding: "6px 16px", color: "#1a1028", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}
                >
                  + Add
                </button>
              </div>
              {(profile.intimacyLog || []).length === 0
                ? <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>No sessions logged yet.</span>
                : [...(profile.intimacyLog || [])].reverse().map(d => {
                    const start = new Date(profile.lastPeriodStart);
                    const date = new Date(d);
                    const diff = Math.floor((date - start) / 86400000);
                    const cd = ((diff % profile.cycleLength) + profile.cycleLength) % profile.cycleLength + 1;
                    const ph = getPhaseFromDay(cd);
                    return (
                      <div key={d} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <div>
                          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>💕 {fmtDate(d)}</span>
                          <span style={{ background: PHASES[ph].color + "22", border: `1px solid ${PHASES[ph].color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, color: PHASES[ph].color, marginLeft: 8 }}>
                            {PHASES[ph].label} · Day {cd}
                          </span>
                        </div>
                        <button
                          onClick={() => removeIntimacy(d)}
                          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 20, lineHeight: 1 }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        )}

        {/* ── LOG TAB ── */}
        {tab === "log" && (
          <div>
            <div style={{ background: "#161628", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: 24, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>UPDATE CYCLE DATA</div>

              {[
                { label: "Last Period Start Date",     key: "lastPeriodStart", type: "date"   },
                { label: "Average Cycle Length (days)", key: "cycleLength",    type: "number" },
                { label: "Period Duration (days)",     key: "periodLength",    type: "number" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 8, fontWeight: 600 }}>
                    {f.label.toUpperCase()}
                  </label>
                  <input
                    type={f.type}
                    value={profile[f.key] || ""}
                    onChange={e => onUpdate({ ...profile, [f.key]: f.type === "number" ? parseInt(e.target.value) || 28 : e.target.value })}
                    style={inputStyle}
                  />
                </div>
              ))}

              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 8, fontWeight: 600 }}>NOTES</label>
              <textarea
                value={profile.notes || ""}
                onChange={e => onUpdate({ ...profile, notes: e.target.value })}
                placeholder="Mood patterns, preferences, observations, special notes…"
                style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
              />
            </div>

            <button
              onClick={() => setShowLogModal(true)}
              style={{ width: "100%", background: "#c9b8f0", border: "none", borderRadius: 20, padding: 18, color: "#1a1028", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font }}
            >
              💕 Log Intimacy Session
            </button>
          </div>
        )}

        {/* ── INSIGHTS TAB ── */}
        {tab === "insights" && (
          <div>
            {/* Full phase guide */}
            {Object.entries(PHASES).map(([key, val]) => {
              const t = CYCLE_TIPS[key];
              const isCurrent = phase === key;
              return (
                <div
                  key={key}
                  style={{
                    background: isCurrent ? val.bg : "#161628",
                    border: `1px solid ${isCurrent ? val.color + "55" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 24, padding: 20, marginBottom: 12,
                    boxShadow: isCurrent ? `0 8px 32px ${val.color}15` : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 16, background: val.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                        {val.emoji}
                      </div>
                      <div>
                        <div style={{ color: val.color, fontSize: 15, fontWeight: 700, fontFamily: fontSerif }}>{val.label}</div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Day {val.days[0]}–{val.days[1]}</div>
                      </div>
                    </div>
                    {isCurrent && (
                      <span style={{ background: val.color, borderRadius: 20, padding: "4px 14px", fontSize: 11, fontWeight: 700, color: "#111" }}>NOW</span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 14px" }}>{t.note}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[`⚡ ${t.energy}`, `🧠 ${t.mood}`, `💫 ${t.libido}`, t.safe ? "✅ Safe" : "⚠️ Risky"].map(tag => (
                      <span key={tag} style={{ background: val.color + "22", border: `1px solid ${val.color}44`, borderRadius: 20, padding: "4px 12px", fontSize: 11, color: val.color }}>{tag}</span>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* AI Insight on insights tab too */}
            <AIInsight profile={profile} />
          </div>
        )}

      </div>

      {/* Log Intimacy Modal - bottom sheet */}
      {showLogModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200, backdropFilter: "blur(6px)" }}>
          <div style={{ background: "#161628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "28px 28px 0 0", padding: 28, width: "100%", maxWidth: 480 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 24px" }} />
            <h3 style={{ margin: "0 0 20px", fontSize: 20, fontFamily: fontSerif, color: "white" }}>💕 Log Intimacy Session</h3>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 8, fontWeight: 600 }}>DATE</label>
            <input
              type="date"
              value={logDate}
              onChange={e => setLogDate(e.target.value)}
              style={{ ...inputStyle, marginBottom: 24 }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowLogModal(false)}
                style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 14, color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer", fontFamily: font }}
              >
                Cancel
              </button>
              <button
                onClick={logIntimacy}
                style={{ flex: 2, background: "#c9b8f0", border: "none", borderRadius: 20, padding: 14, color: "#1a1028", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}
              >
                Save 💕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(6px)", padding: 20 }}>
          <div style={{ background: "#161628", border: "1px solid rgba(255,80,100,0.3)", borderRadius: 28, padding: 32, width: "100%", maxWidth: 340, textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ margin: "0 0 10px", fontSize: 22, fontFamily: fontSerif, color: "white" }}>Delete {profile.name}?</h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
              All her data — cycle history, intimacy log, symptoms, and notes — will be permanently removed.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 14, color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer", fontFamily: font }}
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                style={{ flex: 1, background: "#ff6b9d", border: "none", borderRadius: 20, padding: 14, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Profile ──────────────────────────────────────────────────────────────

function AddProfile({ onAdd, onBack }) {
  const [form, setForm] = useState({
    name: "", lastPeriodStart: todayStr(),
    cycleLength: 28, periodLength: 5, avatar: "🌸",
  });

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
    padding: "13px 16px", color: "white", fontSize: 14,
    outline: "none", boxSizing: "border-box", fontFamily: font,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", color: "white", fontFamily: font, position: "relative" }}>
      <BgDecor phase="luteal" />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "20px 16px 80px" }}>

        <button
          onClick={onBack}
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "8px 18px", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", marginBottom: 28, fontFamily: font }}
        >
          ← Back
        </button>

        <h2 style={{ margin: "0 0 6px", fontSize: 32, fontFamily: fontSerif, fontWeight: 700 }}>Add Profile</h2>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 32, lineHeight: 1.5 }}>
          Track her cycle and get smart insights.
        </p>

        <div style={{ background: "#161628", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 28, padding: 24, marginBottom: 16 }}>

          {/* Avatar picker */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5, display: "block", marginBottom: 12 }}>CHOOSE AVATAR</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {AVATARS.map(a => (
                <button
                  key={a}
                  onClick={() => setForm({ ...form, avatar: a })}
                  style={{
                    width: 48, height: 48, fontSize: 22, borderRadius: 16, cursor: "pointer",
                    background: form.avatar === a ? "rgba(201,184,240,0.2)" : "rgba(255,255,255,0.04)",
                    border: `2px solid ${form.avatar === a ? "#c9b8f0" : "rgba(255,255,255,0.08)"}`,
                    transition: "all 0.15s",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          {[
            { label: "Name",                    key: "name",            type: "text",   ph: "Her name…"  },
            { label: "Last Period Start Date",  key: "lastPeriodStart", type: "date"                     },
            { label: "Average Cycle Length",    key: "cycleLength",     type: "number", ph: "28 days"    },
            { label: "Period Duration",         key: "periodLength",    type: "number", ph: "5 days"     },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5, display: "block", marginBottom: 8 }}>
                {f.label.toUpperCase()}
              </label>
              <input
                type={f.type}
                value={form[f.key]}
                placeholder={f.ph}
                onChange={e => setForm({ ...form, [f.key]: f.type === "number" ? parseInt(e.target.value) || 28 : e.target.value })}
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => { if (form.name.trim()) onAdd({ ...form, id: Date.now().toString(), symptoms: [], intimacyLog: [], notes: "", hidden: false }); }}
          disabled={!form.name.trim()}
          style={{
            width: "100%",
            background: form.name.trim() ? "#c9b8f0" : "rgba(201,184,240,0.3)",
            border: "none", borderRadius: 20, padding: 18,
            color: form.name.trim() ? "#1a1028" : "rgba(255,255,255,0.2)",
            fontSize: 16, fontWeight: 700,
            cursor: form.name.trim() ? "pointer" : "default",
            fontFamily: fontSerif, transition: "all 0.2s",
          }}
        >
          Add Profile →
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ user, profiles, onSelect, onAdd, onLogout }) {
  const [showHidden, setShowHidden] = useState(false);
  const visible = profiles.filter(p => showHidden ? p.hidden : !p.hidden);
  const hiddenCount = profiles.filter(p => p.hidden).length;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", color: "white", fontFamily: font, position: "relative" }}>
      <BgDecor phase="luteal" />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 480, margin: "0 auto", padding: "0 16px 100px" }}>

        {/* Header */}
        <div style={{ padding: "28px 0 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>Welcome back,</p>
              <h1 style={{ margin: "0 0 4px", fontSize: 30, fontFamily: fontSerif, fontWeight: 700 }}>{user.username}</h1>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
              <button
                onClick={onAdd}
                style={{ background: "#c9b8f0", border: "none", borderRadius: 20, padding: "10px 20px", color: "#1a1028", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 6px 20px #c9b8f044" }}
              >
                + Add
              </button>
              <button
                onClick={onLogout}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "6px 14px", color: "rgba(255,255,255,0.3)", fontSize: 12, cursor: "pointer", fontFamily: font }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Summary stats strip */}
        {profiles.filter(p => !p.hidden).length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24 }}>
            {[
              { label: "Profiles",  val: profiles.filter(p => !p.hidden).length,                                                                                                  color: "#c9b8f0", bg: "#1a1528" },
              { label: "Safe Now",  val: profiles.filter(p => !p.hidden && CYCLE_TIPS[getPhaseFromDay(getDayOfCycle(p.lastPeriodStart, p.cycleLength))].safe).length,               color: "#b8f0c8", bg: "#0f2a18" },
              { label: "Ovulating", val: profiles.filter(p => !p.hidden && getPhaseFromDay(getDayOfCycle(p.lastPeriodStart, p.cycleLength)) === "ovulation").length,                color: "#f4c97a", bg: "#2a2010" },
              { label: "Sessions",  val: profiles.filter(p => !p.hidden).reduce((a, p) => a + (p.intimacyLog || []).length, 0),                                                   color: "#ffb3c6", bg: "#2a1520" },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}25`, borderRadius: 18, padding: "14px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: fontSerif }}>{s.val}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Hidden profiles toggle */}
        {hiddenCount > 0 && (
          <button
            onClick={() => setShowHidden(h => !h)}
            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "12px", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", marginBottom: 16, fontFamily: font }}
          >
            {showHidden
              ? `👁 Showing ${hiddenCount} hidden profile${hiddenCount > 1 ? "s" : ""} — tap to hide again`
              : `🙈 ${hiddenCount} hidden profile${hiddenCount > 1 ? "s" : ""} — tap to reveal`
            }
          </button>
        )}

        {/* Empty state */}
        {visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🌙</div>
            <h2 style={{ fontFamily: fontSerif, margin: "0 0 12px", fontSize: 26, color: "white" }}>
              {showHidden ? "No hidden profiles" : "No profiles yet"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.3)", marginBottom: 32, lineHeight: 1.6, fontSize: 14 }}>
              {showHidden ? "All profiles are currently visible." : "Add your first profile to start tracking."}
            </p>
            {!showHidden && (
              <button
                onClick={onAdd}
                style={{ background: "#c9b8f0", border: "none", borderRadius: 20, padding: "14px 32px", color: "#1a1028", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: fontSerif }}
              >
                Add Profile →
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {visible.map((profile, idx) => {
              const day = getDayOfCycle(profile.lastPeriodStart, profile.cycleLength);
              const phase = getPhaseFromDay(day);
              const PD = PHASES[phase];
              const tips = CYCLE_TIPS[phase];
              const dToP = daysUntil(getNextPeriod(profile.lastPeriodStart, profile.cycleLength));
              const dToO = daysUntil(getOvulation(profile.lastPeriodStart, profile.cycleLength));
              const accentColor = PASTEL_CARDS[idx % PASTEL_CARDS.length];

              return (
                <div
                  key={profile.id}
                  onClick={() => onSelect(profile)}
                  style={{ position: "relative", borderRadius: 28, overflow: "hidden", cursor: "pointer", transition: "transform 0.2s", background: "#161628" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {/* Pastel color top strip */}
                  <div style={{ height: 6, background: accentColor, opacity: 0.85 }} />

                  <div style={{ padding: 20, border: `1px solid ${accentColor}22`, borderTop: "none", borderRadius: "0 0 28px 28px" }}>
                    {/* Name + phase + safety badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 20, background: accentColor + "33", border: `2px solid ${accentColor}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
                        {profile.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 5px", fontSize: 20, fontFamily: fontSerif, fontWeight: 700, color: "white" }}>{profile.name}</h3>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: PD.color + "22", borderRadius: 20, padding: "3px 10px" }}>
                          <span style={{ fontSize: 11 }}>{PD.emoji}</span>
                          <span style={{ fontSize: 11, color: PD.color, fontWeight: 600 }}>{PD.label} · Day {day}</span>
                        </div>
                      </div>
                      <div style={{ background: tips.safe ? "#b8f0c8" : "#ff6b9d", borderRadius: 20, padding: "6px 14px", flexShrink: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#111" }}>{tips.safe ? "✅ OK" : "⚠️ Risk"}</div>
                      </div>
                    </div>

                    {/* Phase progress bar */}
                    <div style={{ display: "flex", height: 6, borderRadius: 6, overflow: "hidden", gap: 2, marginBottom: 14 }}>
                      {Object.entries(PHASES).map(([k, v]) => {
                        const w = ((v.days[1] - v.days[0] + 1) / profile.cycleLength) * 100;
                        return (
                          <div key={k} style={{ width: `${w}%`, background: phase === k ? v.color : v.color + "30", borderRadius: 3, transition: "all 0.3s" }} />
                        );
                      })}
                    </div>

                    {/* Stat mini-cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                      {[
                        { label: "Period in",  val: dToP <= 0 ? "Today" : `${dToP}d`,                             bg: "#2a1525", color: "#ff6b9d" },
                        { label: "Ovulation",  val: dToO <= 0 ? "Now!" : dToO === 1 ? "Tmrw" : `${dToO}d`,        bg: "#0f2a18", color: "#b8f0c8" },
                        { label: "Sessions",   val: `${(profile.intimacyLog || []).length} 💕`,                    bg: "#1a1528", color: "#c9b8f0" },
                      ].map(s => (
                        <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "10px 10px" }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: s.color, fontFamily: fontSerif }}>{s.val}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Symptom tags preview */}
                    {(profile.symptoms || []).length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {(profile.symptoms || []).slice(0, 4).map(s => (
                          <span key={s} style={{ background: PD.color + "20", border: `1px solid ${PD.color}33`, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: PD.color }}>{s}</span>
                        ))}
                        {(profile.symptoms || []).length > 4 && (
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", alignSelf: "center" }}>+{(profile.symptoms || []).length - 4} more</span>
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

// ─── Login ────────────────────────────────────────────────────────────────────

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, position: "relative", padding: 20 }}>
      <BgDecor phase="luteal" />
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: "10%", right: "-5%", width: 220, height: 220, borderRadius: "60% 40% 55% 45% / 45% 55% 40% 60%", background: "#c9b8f033", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "15%", left: "-8%", width: 180, height: 180, borderRadius: "50%", background: "#ff6b9d22", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "55%", right: "5%", width: 80, height: 80, borderRadius: "50%", background: "#f4c97a18", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 380 }}>
        {/* Hero text like the inspo "Find Your Best Partner" */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🌙</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 44, fontFamily: fontSerif, fontWeight: 700, lineHeight: 1.1, color: "white" }}>
            Find Your<br />Best Insight.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, marginTop: 12 }}>
            Cycle intelligence for the informed man.
          </p>
        </div>

        <div style={{ background: "#161628", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, padding: 28 }}>
          <input
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            placeholder="Username"
            onKeyDown={e => e.key === "Enter" && form.username && onLogin(form.username)}
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 18px", color: "white", fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 12, fontFamily: font }}
          />
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="Password (optional)"
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 18px", color: "white", fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 24, fontFamily: font }}
          />
          <button
            onClick={() => form.username && onLogin(form.username)}
            disabled={!form.username}
            style={{
              width: "100%",
              background: form.username ? "#c9b8f0" : "rgba(201,184,240,0.3)",
              border: "none", borderRadius: 20, padding: "16px",
              color: form.username ? "#1a1028" : "rgba(255,255,255,0.2)",
              fontSize: 16, fontWeight: 700,
              cursor: form.username ? "pointer" : "default",
              fontFamily: fontSerif,
              boxShadow: form.username ? "0 8px 28px #c9b8f044" : "none",
              transition: "all 0.2s",
            }}
          >
            Enter →
          </button>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.15)", fontSize: 11, marginTop: 16, marginBottom: 0 }}>
            All data stored locally on your device
          </p>
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
      const u = JSON.parse(localStorage.getItem("cyclr_user") || "null");
      const p = JSON.parse(localStorage.getItem("cyclr_profiles") || "[]");
      if (u) { setUser(u); setScreen("dashboard"); }
      setProfiles(p);
    } catch {}
  }, []);

  function save(p) {
    setProfiles(p);
    localStorage.setItem("cyclr_profiles", JSON.stringify(p));
  }

  function handleLogin(username) {
    const u = { username };
    setUser(u);
    localStorage.setItem("cyclr_user", JSON.stringify(u));
    setScreen("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("cyclr_user");
    setUser(null);
    setScreen("login");
  }

  function handleAdd(profile) {
    save([...profiles, profile]);
    setScreen("dashboard");
  }

  function handleUpdate(updated) {
    const newProfiles = profiles.map(x => x.id === updated.id ? updated : x);
    save(newProfiles);
    setSelected(updated);
  }

  function handleDelete() {
    save(profiles.filter(p => p.id !== selected.id));
    setSelected(null);
    setScreen("dashboard");
  }

  function handleSelect(profile) {
    setSelected(profile);
    setScreen("profile");
  }

  if (screen === "login")                    return <Login onLogin={handleLogin} />;
  if (screen === "add")                      return <AddProfile onAdd={handleAdd} onBack={() => setScreen("dashboard")} />;
  if (screen === "profile" && selected)      return <ProfileDetail profile={selected} onUpdate={handleUpdate} onBack={() => setScreen("dashboard")} onDelete={handleDelete} />;
  return <Dashboard user={user} profiles={profiles} onSelect={handleSelect} onAdd={() => setScreen("add")} onLogout={handleLogout} />;
}
