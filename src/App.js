import { useState, useEffect, useCallback } from "react";

// ─── Brand Identity & Constants ─────────────────────────────────────────────

const BRAND = {
  name: "Luna",
  tagline: "Understand her rhythm",
  colors: {
    primary: "#9b87f5",      // Soft lavender
    secondary: "#f9a8d4",    // Warm pink
    accent: "#6ee7b7",       // Mint
    background: "#0f0f1a",
    surface: "#1a1a2e",
    text: "#ffffff",
    textSoft: "rgba(255,255,255,0.7)",
    textMuted: "rgba(255,255,255,0.4)",
  },
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Inter', sans-serif",
  },
  animations: {
    spring: "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  }
};

const PHASES = {
  menstruation: {
    label: "Menstruation", short: "Period",
    color: "#f87171", bg: "#2a1515", emoji: "🩸", icon: "Drop",
    days: [1, 5], description: "Rest & recharge",
  },
  follicular: {
    label: "Follicular", short: "Follicular",
    color: "#fbbf24", bg: "#2a2010", emoji: "🌱", icon: "Sprout",
    days: [6, 13], description: "Energy rising",
  },
  ovulation: {
    label: "Ovulation", short: "Ovulation",
    color: "#34d399", bg: "#0f2a1a", emoji: "✨", icon: "Sparkles",
    days: [14, 16], description: "Peak vitality",
  },
  luteal: {
    label: "Luteal", short: "Luteal",
    color: "#c084fc", bg: "#1a1528", emoji: "🌙", icon: "Moon",
    days: [17, 28], description: "Wind down",
  },
};

const CYCLE_TIPS = {
  menstruation: {
    safe: false, risk: "High Risk",
    note: "Shedding phase. She may need extra rest and care.",
    energy: "Low", mood: "Sensitive", libido: "Low",
  },
  follicular: {
    safe: true, risk: "Lower Risk",
    note: "Estrogen rises — mood and energy improve steadily.",
    energy: "Building", mood: "Optimistic", libido: "Increasing",
  },
  ovulation: {
    safe: false, risk: "Peak Risk",
    note: "Most fertile window. Energy and confidence peak.",
    energy: "Peak", mood: "Confident", libido: "Peak",
  },
  luteal: {
    safe: true, risk: "Lower Risk",
    note: "Progesterone rises. She may prefer cozy time.",
    energy: "Declining", mood: "Introspective", libido: "Moderate",
  },
};

const SYMPTOMS = [
  "Cramps", "Bloating", "Mood swings", "Headache", "Fatigue",
  "Tender breasts", "Spotting", "Back pain", "Nausea",
  "High libido", "Low libido", "Irritability", "Anxiety",
  "Clear discharge", "PMS",
];

const AVATARS = ["🌸", "💜", "🌙", "🦋", "🌺", "✨", "💎", "🌹", "🔮", "🌊", "🍒", "🌷"];

// ─── Animations & Styling Utilities ───────────────────────────────────────

const animations = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(155, 135, 245, 0); }
    50% { box-shadow: 0 0 20px 0 rgba(155, 135, 245, 0.3); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  
  .hover-lift {
    transition: all 0.3s ${BRAND.animations.spring};
  }
  
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  }
  
  .hover-glow:hover {
    box-shadow: 0 0 20px ${props => props.color}40;
  }
  
  .fade-in {
    animation: fadeIn 0.5s ${BRAND.animations.spring};
  }
`;

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

// ─── Professional Icons Component ───────────────────────────────────────────

const Icons = {
  Drop: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 2.5L12 21M12 2.5L8 6.5M12 2.5L16 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 21C8.5 21 5.5 18 5.5 14.5C5.5 11 8.5 8 12 8C15.5 8 18.5 11 18.5 14.5C18.5 18 15.5 21 12 21Z" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Sprout: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 22V12M12 12C12 8 15 5 19 5C19 9 16 12 12 12ZM12 12C12 8 9 5 5 5C5 9 8 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Sparkles: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 3L13.5 9L18 10.5L13.5 12L12 18L10.5 12L6 10.5L10.5 9L12 3Z" fill="currentColor" fillOpacity="0.8"/>
      <path d="M19 14L20 17L23 18L20 19L19 22L18 19L15 18L18 17L19 14Z" fill="currentColor" fillOpacity="0.6"/>
      <path d="M5 2L5.5 4L7 4.5L5.5 5L5 7L4.5 5L3 4.5L4.5 4L5 2Z" fill="currentColor" fillOpacity="0.6"/>
    </svg>
  ),
  Moon: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M21 12.5C21 16.5 18 20 13 20C8 20 4 16 4 11C4 6 7.5 3 11.5 3C12 3 12 3 12 3C10 6 10.5 9.5 13 12C15.5 14.5 19 15 21 12.5Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2"/>
    </svg>
  ),
  Calendar: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Heart: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 21C12 21 4 16 4 10C4 6.5 7 4 10 4C12 4 14 5.5 15 7C16 5.5 18 4 20 4C23 4 24 6.5 24 10C24 16 16 21 16 21" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2"/>
    </svg>
  ),
  Chart: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M3 3V21H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 17L11 11L15 14L21 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Settings: (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M19.4 15C18.9 16 18.1 16.7 17.2 17.2L19 20.6L15.8 19.2C14.9 19.7 13.9 20 12.9 20L12 23.5L11.1 20C10.1 19.9 9.1 19.6 8.2 19.2L5 20.6L6.8 17.2C5.9 16.7 5.1 16 4.6 15L1.5 14L4.6 12.5C4.5 11.8 4.5 11.2 4.6 10.5L1.5 9L4.6 7.5C5.1 6.5 5.9 5.8 6.8 5.3L5 2L8.2 3.5C9.1 3 10.1 2.7 11.1 2.5L12 -1L12.9 2.5C13.9 2.7 14.9 3 15.8 3.5L19 2L17.2 5.3C18.1 5.8 18.9 6.5 19.4 7.5L22.5 9L19.4 10.5C19.5 11.2 19.5 11.8 19.4 12.5L22.5 14L19.4 15Z" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
};

// ─── Background Decor with Animation ───────────────────────────────────────

function BgDecor({ phase }) {
  const c = PHASES[phase || "luteal"].color;
  
  return (
    <div style={{ 
      position: "fixed", 
      inset: 0, 
      overflow: "hidden", 
      pointerEvents: "none", 
      zIndex: 0,
      opacity: 0.3,
    }}>
      <div style={{
        position: "absolute", top: -100, right: -100, width: 400, height: 400,
        borderRadius: "60% 40% 55% 45% / 45% 55% 40% 60%",
        background: `radial-gradient(circle at 30% 30%, ${c}, transparent 70%)`,
        animation: "float 8s infinite ease-in-out",
      }} />
      <div style={{
        position: "absolute", bottom: 50, left: -80, width: 300, height: 300,
        borderRadius: "50%",
        background: `radial-gradient(circle at 70% 70%, ${c}40, transparent 70%)`,
        animation: "float 12s infinite ease-in-out reverse",
      }} />
    </div>
  );
}

// ─── Card Component with Hover Effects ─────────────────────────────────────

function Card({ children, color, onClick, className = "", style = {} }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className={`hover-lift ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        background: BRAND.colors.surface,
        border: `1px solid ${color || PHASES.luteal.color}30`,
        borderRadius: 24,
        padding: 20,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: onClick ? "pointer" : "default",
        transform: isHovered && onClick ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered && onClick ? `0 20px 30px -10px ${color || PHASES.luteal.color}30` : "0 10px 20px -5px rgba(0,0,0,0.3)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Button Component ─────────────────────────────────────────────────────

function Button({ children, variant = "primary", onClick, disabled, icon, fullWidth, style = {} }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const variants = {
    primary: {
      background: BRAND.colors.primary,
      color: "#ffffff",
      border: "none",
      hoverBg: "#8a75f0",
    },
    secondary: {
      background: "transparent",
      color: BRAND.colors.text,
      border: `1px solid ${BRAND.colors.primary}40`,
      hoverBg: `${BRAND.colors.primary}10`,
    },
    accent: {
      background: BRAND.colors.secondary,
      color: "#1a1a2e",
      border: "none",
      hoverBg: "#f594c4",
    },
    danger: {
      background: "rgba(248, 113, 113, 0.1)",
      color: "#f87171",
      border: "1px solid #f8717140",
      hoverBg: "rgba(248, 113, 113, 0.2)",
    },
  };
  
  const v = variants[variant];
  
  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "10px 20px",
        borderRadius: 40,
        fontSize: 14,
        fontWeight: 600,
        fontFamily: BRAND.fonts.body,
        cursor: disabled ? "default" : "pointer",
        transition: "all 0.2s ease",
        background: isHovered && !disabled ? v.hoverBg : v.background,
        color: v.color,
        border: v.border,
        opacity: disabled ? 0.4 : 1,
        width: fullWidth ? "100%" : "auto",
        ...style,
      }}
    >
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
      {children}
    </button>
  );
}

// ─── AI Insight with Animation ───────────────────────────────────────────────

function AIInsight({ profile }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      setText(`✨ Day ${day} of her cycle. ${symptoms ? `She's experiencing ${symptoms}. ` : ''}Energy is ${CYCLE_TIPS[phase].energy.toLowerCase()}. ${CYCLE_TIPS[phase].safe ? '✅ Safe for unprotected intimacy.' : '⚠️ Caution - fertile window.'}`);
      setLoading(false);
      setIsVisible(true);
    }, 1000);
  }, [profile, day, phase]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <Card color={PD.color} style={{ marginTop: 16, position: "relative", overflow: "hidden" }}>
      {isVisible && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${PD.color}, ${BRAND.colors.secondary})`,
          animation: "pulseGlow 2s infinite",
        }} />
      )}
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ 
          fontSize: 12, 
          fontWeight: 600, 
          letterSpacing: 1, 
          color: BRAND.colors.textMuted,
          textTransform: "uppercase",
        }}>
          ✦ AI Insight
        </span>
        <Button
          variant="secondary"
          onClick={generate}
          disabled={loading}
          size="small"
          style={{ padding: "6px 16px" }}
        >
          {loading ? "Thinking..." : "Generate"}
        </Button>
      </div>
      
      <div style={{
        minHeight: 60,
        transition: "all 0.3s ease",
      }}>
        {text ? (
          <p style={{ 
            fontSize: 14, 
            color: BRAND.colors.textSoft, 
            lineHeight: 1.6, 
            margin: 0,
            animation: "fadeIn 0.5s ease",
          }}>
            {text}
          </p>
        ) : (
          <p style={{ 
            fontSize: 13, 
            color: BRAND.colors.textMuted, 
            margin: 0, 
            fontStyle: "italic" 
          }}>
            Tap Generate for personalized cycle insights
          </p>
        )}
      </div>
    </Card>
  );
}

// ─── Cycle Ring with Animation ───────────────────────────────────────────────

function CycleRing({ day, cycleLength, size = 180 }) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.36;
  const strokeW = size * 0.1;
  const circ = 2 * Math.PI * r;
  const phase = getPhaseFromDay(day);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 1000);
    return () => clearTimeout(timer);
  }, [day]);

  const segments = [
    { name: "menstruation", start: 0,  end: 5,           color: "#f87171" },
    { name: "follicular",   start: 5,  end: 13,          color: "#fbbf24" },
    { name: "ovulation",    start: 13, end: 16,          color: "#34d399" },
    { name: "luteal",       start: 16, end: cycleLength,  color: "#c084fc" },
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
    <svg width={size} height={size} style={{ filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.3))" }}>
      <style>{`
        @keyframes rotateIn {
          from { transform: rotate(-90deg) scale(0.8); opacity: 0; }
          to { transform: rotate(0) scale(1); opacity: 1; }
        }
        .ring-segment {
          transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ring-dot {
          transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
      
      {/* Track */}
      <circle 
        cx={cx} cy={cy} r={r} 
        fill="none" 
        stroke="rgba(255,255,255,0.06)" 
        strokeWidth={strokeW} 
      />
      
      {/* Phase segments */}
      {segments.map(seg => {
        const { dashLen, gap, offset } = segProps(seg.start, seg.end);
        const isCurrent = phase === seg.name;
        return (
          <circle
            key={seg.name}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeW}
            strokeDasharray={`${dashLen} ${gap}`}
            strokeDashoffset={animate && isCurrent ? offset + 10 : offset}
            strokeLinecap="round"
            opacity={isCurrent ? 1 : 0.2}
            className="ring-segment"
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        );
      })}
      
      {/* Current day dot */}
      <circle 
        cx={dotX} cy={dotY} r={size * 0.055} 
        fill="white" 
        className="ring-dot"
        style={{
          transition: "all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          filter: "drop-shadow(0 0 10px white)",
        }}
      />
      <circle 
        cx={dotX} cy={dotY} r={size * 0.03} 
        fill={PHASES[phase].color}
        className="ring-dot"
      />
      
      {/* Center text */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize={size * 0.16} fontWeight={700} fontFamily={BRAND.fonts.heading}>{day}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill={BRAND.colors.textMuted} fontSize={size * 0.07} fontFamily={BRAND.fonts.body}>of {cycleLength}</text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill={PHASES[phase].color} fontSize={size * 0.075} fontWeight={600} fontFamily={BRAND.fonts.body}>{PHASES[phase].short}</text>
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

  function isIntimacyDay(d) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return (profile.intimacyLog || []).includes(dateStr);
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map(d => (
          <div key={d} style={{ 
            textAlign: "center", 
            fontSize: 12, 
            color: BRAND.colors.textMuted, 
            fontWeight: 500,
            padding: "4px 0",
          }}>
            {d}
          </div>
        ))}
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {Array(firstDay).fill(null).map((_, i) => (
          <div key={"empty" + i} style={{ aspectRatio: "1" }} />
        ))}
        
        {Array(daysInMonth).fill(null).map((_, i) => {
          const d = i + 1;
          const ph = phaseForDay(d);
          const col = PHASES[ph].color;
          const isToday = isCurrentMonth && d === today.getDate();
          const hasIntimacy = isIntimacyDay(d);
          const [isHovered, setIsHovered] = useState(false);
          
          return (
            <div
              key={d}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                aspectRatio: "1",
                borderRadius: 12,
                position: "relative",
                background: isToday ? `linear-gradient(135deg, ${col}, ${col}80)` : `${col}15`,
                border: `1px solid ${isToday ? col : col}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: isHovered ? "scale(1.1)" : "scale(1)",
                transition: "all 0.2s ease",
                cursor: "pointer",
                boxShadow: isHovered ? `0 5px 15px ${col}40` : "none",
                zIndex: isHovered ? 2 : 1,
              }}
            >
              <span style={{ 
                fontSize: 13, 
                color: isToday ? "#111" : BRAND.colors.textSoft, 
                fontWeight: isToday ? 700 : 400,
              }}>
                {d}
              </span>
              {hasIntimacy && (
                <span style={{ 
                  position: "absolute", 
                  bottom: 2, 
                  right: 2, 
                  fontSize: 8,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                }}>
                  ❤️
                </span>
              )}
            </div>
          );
        })}
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
  const [animateHeader, setAnimateHeader] = useState(false);

  const day = getDayOfCycle(profile.lastPeriodStart, profile.cycleLength);
  const phase = getPhaseFromDay(day);
  const PD = PHASES[phase];
  const tips = CYCLE_TIPS[phase];
  const nextPeriod = getNextPeriod(profile.lastPeriodStart, profile.cycleLength);
  const nextOvulation = getOvulation(profile.lastPeriodStart, profile.cycleLength);
  const daysToNextPeriod = daysUntil(nextPeriod);
  const daysToOvulation = daysUntil(nextOvulation);

  useEffect(() => {
    setAnimateHeader(true);
    const timer = setTimeout(() => setAnimateHeader(false), 500);
    return () => clearTimeout(timer);
  }, [phase]);

  const tabs = [
    { id: "overview", label: "Overview", icon: <Icons.Chart /> },
    { id: "calendar", label: "Calendar", icon: <Icons.Calendar /> },
    { id: "insights", label: "Insights", icon: <Icons.Sparkles /> },
  ];

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: BRAND.colors.background, 
      color: BRAND.colors.text, 
      fontFamily: BRAND.fonts.body,
      position: "relative",
    }}>
      <style>{animations}</style>
      <BgDecor phase={phase} />
      
      <div style={{ 
        position: "relative", 
        zIndex: 2, 
        maxWidth: 480, 
        margin: "0 auto", 
        padding: "0 16px 80px",
        animation: "fadeIn 0.5s ease",
      }}>

        {/* Top bar */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "20px 0 16px",
          animation: "fadeIn 0.5s ease",
        }}>
          <Button variant="secondary" onClick={onBack} icon="←">
            Back
          </Button>
          
          <div style={{ display: "flex", gap: 8 }}>
            <Button 
              variant="secondary" 
              onClick={() => onUpdate({ ...profile, hidden: !profile.hidden })}
              style={{ padding: "8px 14px" }}
            >
              {profile.hidden ? "👁 Show" : "🙈 Hide"}
            </Button>
            <Button 
              variant="danger" 
              onClick={() => setShowDeleteConfirm(true)}
              style={{ padding: "8px 14px" }}
            >
              🗑 Delete
            </Button>
          </div>
        </div>

        {/* Hero card */}
        <Card 
          color={PD.color} 
          style={{ 
            marginBottom: 20,
            transform: animateHeader ? "scale(1.02)" : "scale(1)",
            transition: "transform 0.3s ease",
          }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 24,
              background: `linear-gradient(135deg, ${PD.color}40, ${PD.color}10)`,
              border: `2px solid ${PD.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, flexShrink: 0,
              transition: "all 0.3s ease",
              boxShadow: `0 10px 20px ${PD.color}30`,
            }}>
              {profile.avatar}
            </div>
            
            <div style={{ flex: 1 }}>
              <h2 style={{ 
                margin: "0 0 6px", 
                fontSize: 28, 
                fontWeight: 700, 
                fontFamily: BRAND.fonts.heading,
                color: BRAND.colors.text,
              }}>
                {profile.name}
              </h2>
              <div style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: 6, 
                background: `${PD.color}20`,
                borderRadius: 30, 
                padding: "6px 14px",
                border: `1px solid ${PD.color}40`,
              }}>
                <span style={{ fontSize: 14 }}>{PD.emoji}</span>
                <span style={{ fontSize: 13, color: PD.color, fontWeight: 600 }}>
                  {PD.label} · Day {day}
                </span>
              </div>
            </div>
            
            <CycleRing day={day} cycleLength={profile.cycleLength} size={80} />
          </div>

          {/* Risk banner */}
          <div style={{
            background: tips.safe ? `${BRAND.colors.accent}15` : `${PD.color}15`,
            border: `1px solid ${tips.safe ? BRAND.colors.accent : PD.color}40`,
            borderRadius: 16,
            padding: "14px 18px",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 24 }}>{tips.safe ? "✅" : "⚠️"}</span>
            <div>
              <div style={{ 
                fontSize: 12, 
                fontWeight: 700, 
                color: tips.safe ? BRAND.colors.accent : PD.color,
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}>
                {tips.risk}
              </div>
              <div style={{ 
                fontSize: 13, 
                color: BRAND.colors.textMuted, 
                lineHeight: 1.6 
              }}>
                {tips.note}
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div style={{ 
          display: "flex", 
          background: `${BRAND.colors.surface}80`,
          borderRadius: 40, 
          padding: 4, 
          marginBottom: 20,
          backdropFilter: "blur(10px)",
          border: `1px solid ${BRAND.colors.primary}20`,
        }}>
          {tabs.map(t => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: 36,
                  padding: "10px",
                  background: isActive ? `linear-gradient(135deg, ${PD.color}, ${PD.color}cc)` : "transparent",
                  color: isActive ? "#ffffff" : BRAND.colors.textMuted,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <span style={{ width: 18, height: 18 }}>{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {tab === "overview" && (
          <div className="fade-in">
            {/* Cycle ring */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <CycleRing day={day} cycleLength={profile.cycleLength} size={220} />
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Period in", val: daysToNextPeriod <= 0 ? "Today" : `${daysToNextPeriod} days`, sub: fmtDate(nextPeriod), color: "#f87171" },
                { label: "Ovulation", val: daysToOvulation <= 0 ? "Now" : daysToOvulation === 1 ? "Tomorrow" : `${daysToOvulation} days`, sub: fmtDate(nextOvulation), color: "#34d399" },
                { label: "Energy", val: tips.energy, sub: "Current phase", color: "#fbbf24" },
                { label: "Mood", val: tips.mood, sub: "Expected", color: "#c084fc" },
              ].map(s => (
                <Card key={s.label} color={s.color} style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.colors.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 4, fontFamily: BRAND.fonts.heading }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: 12, color: BRAND.colors.textMuted }}>
                    {s.sub}
                  </div>
                </Card>
              ))}
            </div>

            {/* Libido stat */}
            <Card color={PD.color} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: BRAND.colors.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                  Libido Level
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: PD.color }}>
                  {tips.libido}
                </span>
              </div>
            </Card>

            {/* Symptoms */}
            <Card color={PD.color} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.colors.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>
                  Symptoms
                </span>
                <Button variant="secondary" onClick={() => setEditingSymptoms(!editingSymptoms)}>
                  {editingSymptoms ? "Done" : "Edit"}
                </Button>
              </div>
              
              {editingSymptoms ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SYMPTOMS.map(s => {
                    const active = (profile.symptoms || []).includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          const current = profile.symptoms || [];
                          const updated = current.includes(s)
                            ? current.filter(x => x !== s)
                            : [...current, s];
                          onUpdate({ ...profile, symptoms: updated });
                        }}
                        style={{
                          background: active ? `${PD.color}30` : "rgba(255,255,255,0.05)",
                          border: `1px solid ${active ? PD.color : "rgba(255,255,255,0.1)"}`,
                          borderRadius: 30,
                          padding: "8px 16px",
                          color: active ? PD.color : BRAND.colors.textMuted,
                          fontSize: 13,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(profile.symptoms || []).length === 0 ? (
                    <span style={{ fontSize: 13, color: BRAND.colors.textMuted, fontStyle: "italic" }}>
                      No symptoms logged
                    </span>
                  ) : (
                    (profile.symptoms || []).map(s => (
                      <span
                        key={s}
                        style={{
                          background: `${PD.color}20`,
                          border: `1px solid ${PD.color}40`,
                          borderRadius: 30,
                          padding: "6px 14px",
                          fontSize: 13,
                          color: PD.color,
                        }}
                      >
                        {s}
                      </span>
                    ))
                  )}
                </div>
              )}
            </Card>

            {/* Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <Button
                variant="accent"
                onClick={() => onUpdate({ ...profile, lastPeriodStart: todayStr() })}
                icon="🩸"
                fullWidth
              >
                Period Started
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowLogModal(true)}
                icon="❤️"
                fullWidth
              >
                Log Intimacy
              </Button>
            </div>

            <AIInsight profile={profile} />
          </div>
        )}

        {tab === "calendar" && (
          <div className="fade-in">
            <Card color={PD.color}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <Button variant="secondary" onClick={() => setMonthOffset(m => m - 1)} icon="←" />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: BRAND.fonts.heading }}>
                    {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
                  </div>
                </div>
                <Button variant="secondary" onClick={() => setMonthOffset(m => m + 1)} icon="→" />
              </div>
              
              <MonthCalendar profile={profile} monthOffset={monthOffset} />
            </Card>

            {/* Upcoming events */}
            <Card color={PD.color} style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.colors.textMuted, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>
                Upcoming Events
              </div>
              {[
                { label: "Next Period", date: nextPeriod, color: "#f87171", icon: "🩸" },
                { label: "Ovulation", date: nextOvulation, color: "#34d399", icon: "✨" },
              ].map(ev => (
                <div key={ev.label} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{ev.icon}</span>
                    <span style={{ color: ev.color, fontWeight: 600 }}>{ev.label}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: BRAND.colors.textSoft, fontSize: 14 }}>{fmtDate(ev.date)}</div>
                    <div style={{ color: BRAND.colors.textMuted, fontSize: 12 }}>
                      {daysUntil(ev.date)} days away
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {tab === "insights" && (
          <div className="fade-in">
            {Object.entries(PHASES).map(([key, val]) => {
              const t = CYCLE_TIPS[key];
              const isCurrent = phase === key;
              
              return (
                <Card
                  key={key}
                  color={val.color}
                  style={{
                    marginBottom: 12,
                    border: isCurrent ? `2px solid ${val.color}` : `1px solid ${val.color}20`,
                    transform: isCurrent ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 16,
                        background: `${val.color}20`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 24,
                      }}>
                        {val.emoji}
                      </div>
                      <div>
                        <div style={{ color: val.color, fontSize: 16, fontWeight: 700, fontFamily: BRAND.fonts.heading }}>
                          {val.label}
                        </div>
                        <div style={{ color: BRAND.colors.textMuted, fontSize: 12 }}>
                          Day {val.days[0]}–{val.days[1]}
                        </div>
                      </div>
                    </div>
                    {isCurrent && (
                      <span style={{
                        background: val.color,
                        borderRadius: 30,
                        padding: "4px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#111",
                      }}>
                        Current
                      </span>
                    )}
                  </div>
                  
                  <p style={{ fontSize: 14, color: BRAND.colors.textMuted, lineHeight: 1.6, marginBottom: 16 }}>
                    {t.note}
                  </p>
                  
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{
                      background: `${val.color}20`,
                      border: `1px solid ${val.color}40`,
                      borderRadius: 30,
                      padding: "4px 12px",
                      fontSize: 12,
                      color: val.color,
                    }}>
                      ⚡ {t.energy}
                    </span>
                    <span style={{
                      background: `${val.color}20`,
                      border: `1px solid ${val.color}40`,
                      borderRadius: 30,
                      padding: "4px 12px",
                      fontSize: 12,
                      color: val.color,
                    }}>
                      🧠 {t.mood}
                    </span>
                    <span style={{
                      background: `${val.color}20`,
                      border: `1px solid ${val.color}40`,
                      borderRadius: 30,
                      padding: "4px 12px",
                      fontSize: 12,
                      color: val.color,
                    }}>
                      {t.safe ? "✅ Safe" : "⚠️ Risky"}
                    </span>
                  </div>
                </Card>
              );
            })}
            
            <AIInsight profile={profile} />
          </div>
        )}
      </div>

      {/* Log Intimacy Modal */}
      {showLogModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          animation: "fadeIn 0.3s ease",
        }}>
          <Card color={PD.color} style={{ maxWidth: 400, width: "90%", padding: 28 }}>
            <h3 style={{ 
              margin: "0 0 20px", 
              fontSize: 24, 
              fontFamily: BRAND.fonts.heading,
              color: BRAND.colors.text,
            }}>
              Log Intimacy Session
            </h3>
            
            <label style={{ 
              fontSize: 12, 
              color: BRAND.colors.textMuted, 
              display: "block", 
              marginBottom: 8, 
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}>
              Date
            </label>
            <input
              type="date"
              value={logDate}
              onChange={e => setLogDate(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${PD.color}40`,
                borderRadius: 16,
                padding: "14px 18px",
                color: BRAND.colors.text,
                fontSize: 14,
                outline: "none",
                marginBottom: 24,
              }}
            />
            
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="secondary" onClick={() => setShowLogModal(false)} fullWidth>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  const current = profile.intimacyLog || [];
                  if (!current.includes(logDate)) {
                    onUpdate({ ...profile, intimacyLog: [...current, logDate].sort() });
                  }
                  setShowLogModal(false);
                }}
                fullWidth
              >
                Save
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          animation: "fadeIn 0.3s ease",
        }}>
          <Card color="#f87171" style={{ maxWidth: 340, padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ 
              margin: "0 0 12px", 
              fontSize: 22, 
              fontFamily: BRAND.fonts.heading,
              color: BRAND.colors.text,
            }}>
              Delete {profile.name}?
            </h3>
            <p style={{ color: BRAND.colors.textMuted, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              All her data will be permanently removed.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} fullWidth>
                Cancel
              </Button>
              <Button variant="danger" onClick={onDelete} fullWidth>
                Delete
              </Button>
            </div>
          </Card>
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
  const [step, setStep] = useState(1);

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: BRAND.colors.background, 
      color: BRAND.colors.text, 
      fontFamily: BRAND.fonts.body,
      position: "relative",
    }}>
      <style>{animations}</style>
      <BgDecor phase="luteal" />
      
      <div style={{ 
        position: "relative", 
        zIndex: 2, 
        maxWidth: 480, 
        margin: "0 auto", 
        padding: "20px 16px 80px",
        animation: "fadeIn 0.5s ease",
      }}>

        <Button variant="secondary" onClick={onBack} icon="←" style={{ marginBottom: 28 }}>
          Back
        </Button>

        <h2 style={{ 
          margin: "0 0 8px", 
          fontSize: 36, 
          fontFamily: BRAND.fonts.heading, 
          fontWeight: 700,
          color: BRAND.colors.text,
        }}>
          Add Profile
        </h2>
        <p style={{ color: BRAND.colors.textMuted, fontSize: 15, marginBottom: 32 }}>
          Start tracking her cycle with Luna
        </p>

        {/* Progress steps */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {[1, 2].map(i => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= step ? BRAND.colors.primary : "rgba(255,255,255,0.1)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        {step === 1 ? (
          <Card color={BRAND.colors.primary} style={{ padding: 28 }}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                fontSize: 12, 
                fontWeight: 600, 
                color: BRAND.colors.textMuted, 
                display: "block", 
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}>
                Choose Avatar
              </label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {AVATARS.map(a => (
                  <button
                    key={a}
                    onClick={() => setForm({ ...form, avatar: a })}
                    style={{
                      width: 52, height: 52, fontSize: 26, borderRadius: 18,
                      background: form.avatar === a ? `${BRAND.colors.primary}30` : "rgba(255,255,255,0.05)",
                      border: `2px solid ${form.avatar === a ? BRAND.colors.primary : "rgba(255,255,255,0.1)"}`,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      transform: form.avatar === a ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ 
                fontSize: 12, 
                fontWeight: 600, 
                color: BRAND.colors.textMuted, 
                display: "block", 
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}>
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Her name..."
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${BRAND.colors.primary}40`,
                  borderRadius: 16,
                  padding: "14px 18px",
                  color: BRAND.colors.text,
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </div>
          </Card>
        ) : (
          <Card color={BRAND.colors.primary} style={{ padding: 28 }}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ 
                fontSize: 12, 
                fontWeight: 600, 
                color: BRAND.colors.textMuted, 
                display: "block", 
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}>
                Last Period Start
              </label>
              <input
                type="date"
                value={form.lastPeriodStart}
                onChange={e => setForm({ ...form, lastPeriodStart: e.target.value })}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${BRAND.colors.primary}40`,
                  borderRadius: 16,
                  padding: "14px 18px",
                  color: BRAND.colors.text,
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ 
                fontSize: 12, 
                fontWeight: 600, 
                color: BRAND.colors.textMuted, 
                display: "block", 
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}>
                Cycle Length (days)
              </label>
              <input
                type="number"
                value={form.cycleLength}
                onChange={e => setForm({ ...form, cycleLength: parseInt(e.target.value) || 28 })}
                min={21}
                max={35}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${BRAND.colors.primary}40`,
                  borderRadius: 16,
                  padding: "14px 18px",
                  color: BRAND.colors.text,
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </div>
          </Card>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          {step > 1 && (
            <Button variant="secondary" onClick={() => setStep(1)} fullWidth>
              Back
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => {
              if (step === 1) {
                if (form.name.trim()) setStep(2);
              } else {
                onAdd({ ...form, id: Date.now().toString(), symptoms: [], intimacyLog: [], notes: "", hidden: false });
              }
            }}
            disabled={step === 1 ? !form.name.trim() : false}
            fullWidth
          >
            {step === 1 ? "Continue" : "Add Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ user, profiles, onSelect, onAdd, onLogout }) {
  const [showHidden, setShowHidden] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const visible = profiles.filter(p => showHidden ? p.hidden : !p.hidden);
  const hiddenCount = profiles.filter(p => p.hidden).length;

  const stats = [
    { 
      label: "Profiles", 
      value: profiles.filter(p => !p.hidden).length,
      icon: <Icons.Heart />,
      color: BRAND.colors.primary,
    },
    { 
      label: "Safe Now", 
      value: profiles.filter(p => !p.hidden && CYCLE_TIPS[getPhaseFromDay(getDayOfCycle(p.lastPeriodStart, p.cycleLength))].safe).length,
      icon: <Icons.Sparkles />,
      color: BRAND.colors.accent,
    },
    { 
      label: "Ovulating", 
      value: profiles.filter(p => !p.hidden && getPhaseFromDay(getDayOfCycle(p.lastPeriodStart, p.cycleLength)) === "ovulation").length,
      icon: <Icons.Sprout />,
      color: "#fbbf24",
    },
  ];

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: BRAND.colors.background, 
      color: BRAND.colors.text, 
      fontFamily: BRAND.fonts.body,
      position: "relative",
    }}>
      <style>{animations}</style>
      <BgDecor phase="luteal" />
      
      <div style={{ 
        position: "relative", 
        zIndex: 2, 
        maxWidth: 480, 
        margin: "0 auto", 
        padding: "0 16px 100px",
        animation: "fadeIn 0.5s ease",
      }}>

        {/* Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "28px 0 24px",
        }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 14, color: BRAND.colors.textMuted }}>
              Welcome back,
            </p>
            <h1 style={{ 
              margin: 0, 
              fontSize: 32, 
              fontFamily: BRAND.fonts.heading, 
              fontWeight: 700,
              color: BRAND.colors.text,
            }}>
              {user?.username}
            </h1>
          </div>
          
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="primary" onClick={onAdd} icon="+">
              Add
            </Button>
            <Button variant="secondary" onClick={onLogout}>
              Sign out
            </Button>
          </div>
        </div>

        {/* Stats */}
        {profiles.filter(p => !p.hidden).length > 0 && (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: 12, 
            marginBottom: 24 
          }}>
            {stats.map(stat => (
              <Card key={stat.label} color={stat.color} style={{ padding: 16, textAlign: "center" }}>
                <div style={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: 12, 
                  background: `${stat.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  color: stat.color,
                }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: stat.color, fontFamily: BRAND.fonts.heading }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: BRAND.colors.textMuted, marginTop: 4 }}>
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Hidden toggle */}
        {hiddenCount > 0 && (
          <Button
            variant="secondary"
            onClick={() => setShowHidden(h => !h)}
            fullWidth
            style={{ marginBottom: 16 }}
          >
            {showHidden ? `👁 Showing ${hiddenCount} hidden` : `🙈 ${hiddenCount} hidden profiles`}
          </Button>
        )}

        {/* Profile list */}
        {visible.length === 0 ? (
          <Card color={BRAND.colors.primary} style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🌙</div>
            <h2 style={{ fontFamily: BRAND.fonts.heading, margin: "0 0 12px", fontSize: 24 }}>
              {showHidden ? "No hidden profiles" : "No profiles yet"}
            </h2>
            <p style={{ color: BRAND.colors.textMuted, marginBottom: 24 }}>
              {showHidden ? "All profiles are visible" : "Add your first profile to start tracking"}
            </p>
            {!showHidden && (
              <Button variant="primary" onClick={onAdd} fullWidth>
                Add Profile
              </Button>
            )}
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {visible.map((profile, idx) => {
              const day = getDayOfCycle(profile.lastPeriodStart, profile.cycleLength);
              const phase = getPhaseFromDay(day);
              const PD = PHASES[phase];
              const tips = CYCLE_TIPS[phase];
              const isHovered = hoveredId === profile.id;
              
              return (
                <div
                  key={profile.id}
                  onMouseEnter={() => setHoveredId(profile.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onSelect(profile)}
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    transform: isHovered ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
                  }}
                >
                  <Card color={PD.color} style={{ padding: 0, overflow: "hidden" }}>
                    {/* Gradient top bar */}
                    <div style={{
                      height: 6,
                      background: `linear-gradient(90deg, ${PD.color}, ${BRAND.colors.secondary})`,
                    }} />
                    
                    <div style={{ padding: 20 }}>
                      {/* Header */}
                      <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: 18,
                          background: `${PD.color}30`,
                          border: `2px solid ${PD.color}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 26,
                        }}>
                          {profile.avatar}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            margin: "0 0 4px", 
                            fontSize: 20, 
                            fontFamily: BRAND.fonts.heading, 
                            fontWeight: 700,
                            color: BRAND.colors.text,
                          }}>
                            {profile.name}
                          </h3>
                          <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: `${PD.color}20`,
                            borderRadius: 30,
                            padding: "4px 12px",
                            border: `1px solid ${PD.color}40`,
                          }}>
                            <span style={{ fontSize: 12 }}>{PD.emoji}</span>
                            <span style={{ fontSize: 12, color: PD.color, fontWeight: 600 }}>
                              {PD.label} · Day {day}
                            </span>
                          </div>
                        </div>
                        
                        <div style={{
                          background: tips.safe ? BRAND.colors.accent : PD.color,
                          borderRadius: 30,
                          padding: "6px 14px",
                          color: "#111",
                          fontSize: 12,
                          fontWeight: 700,
                        }}>
                          {tips.safe ? "✓ Safe" : "⚠️ Risk"}
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div style={{
                        display: "flex",
                        height: 6,
                        borderRadius: 3,
                        overflow: "hidden",
                        gap: 2,
                        marginBottom: 16,
                      }}>
                        {Object.entries(PHASES).map(([k, v]) => {
                          const width = ((v.days[1] - v.days[0] + 1) / profile.cycleLength) * 100;
                          return (
                            <div
                              key={k}
                              style={{
                                width: `${width}%`,
                                background: phase === k ? v.color : `${v.color}30`,
                                transition: "all 0.3s ease",
                              }}
                            />
                          );
                        })}
                      </div>
                      
                      {/* Mini stats */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div style={{
                          background: "#f8717120",
                          borderRadius: 12,
                          padding: "10px",
                          border: "1px solid #f8717140",
                        }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#f87171", fontFamily: BRAND.fonts.heading }}>
                            {daysUntil(getNextPeriod(profile.lastPeriodStart, profile.cycleLength))}d
                          </div>
                          <div style={{ fontSize: 11, color: BRAND.colors.textMuted }}>to period</div>
                        </div>
                        
                        <div style={{
                          background: "#34d39920",
                          borderRadius: 12,
                          padding: "10px",
                          border: "1px solid #34d39940",
                        }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#34d399", fontFamily: BRAND.fonts.heading }}>
                            {daysUntil(getOvulation(profile.lastPeriodStart, profile.cycleLength))}d
                          </div>
                          <div style={{ fontSize: 11, color: BRAND.colors.textMuted }}>to ovulation</div>
                        </div>
                      </div>
                      
                      {/* Symptom preview */}
                      {(profile.symptoms || []).length > 0 && (
                        <div style={{ 
                          display: "flex", 
                          gap: 6, 
                          flexWrap: "wrap", 
                          marginTop: 12,
                          opacity: isHovered ? 1 : 0.8,
                          transition: "opacity 0.3s ease",
                        }}>
                          {(profile.symptoms || []).slice(0, 3).map(s => (
                            <span
                              key={s}
                              style={{
                                background: `${PD.color}20`,
                                border: `1px solid ${PD.color}40`,
                                borderRadius: 30,
                                padding: "4px 10px",
                                fontSize: 11,
                                color: PD.color,
                              }}
                            >
                              {s}
                            </span>
                          ))}
                          {(profile.symptoms || []).length > 3 && (
                            <span style={{ fontSize: 11, color: BRAND.colors.textMuted }}>
                              +{(profile.symptoms || []).length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: BRAND.colors.background, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      fontFamily: BRAND.fonts.body, 
      position: "relative", 
      padding: 20,
    }}>
      <style>{animations}</style>
      <BgDecor phase="luteal" />
      
      <div style={{ 
        position: "relative", 
        zIndex: 2, 
        width: "100%", 
        maxWidth: 400,
        animation: "fadeIn 0.5s ease",
      }}>
        <Card color={BRAND.colors.primary} style={{ textAlign: "center", padding: 40 }}>
          <div style={{ 
            fontSize: 72, 
            marginBottom: 16,
            animation: "float 6s infinite ease-in-out",
          }}>
            🌙
          </div>
          
          <h1 style={{ 
            margin: "0 0 8px", 
            fontSize: 48, 
            fontFamily: BRAND.fonts.heading, 
            fontWeight: 700,
            color: BRAND.colors.text,
            background: `linear-gradient(135deg, ${BRAND.colors.primary}, ${BRAND.colors.secondary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Luna
          </h1>
          
          <p style={{ color: BRAND.colors.textMuted, fontSize: 15, marginBottom: 32 }}>
            Understand her rhythm
          </p>

          <input
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            placeholder="Username"
            onKeyDown={e => e.key === "Enter" && form.username && onLogin(form.username)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${BRAND.colors.primary}40`,
              borderRadius: 16,
              padding: "16px 20px",
              color: BRAND.colors.text,
              fontSize: 15,
              outline: "none",
              marginBottom: 12,
            }}
          />
          
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="Password (optional)"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${BRAND.colors.primary}40`,
              borderRadius: 16,
              padding: "16px 20px",
              color: BRAND.colors.text,
              fontSize: 15,
              outline: "none",
              marginBottom: 24,
            }}
          />
          
          <Button
            variant="primary"
            onClick={() => form.username && onLogin(form.username)}
            disabled={!form.username}
            fullWidth
            style={{ padding: "16px" }}
          >
            Enter Luna
          </Button>
          
          <p style={{ color: BRAND.colors.textMuted, fontSize: 12, marginTop: 24, marginBottom: 0 }}>
            All data stored locally on your device
          </p>
        </Card>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("luna_user") || "null");
      const p = JSON.parse(localStorage.getItem("luna_profiles") || "[]");
      if (u) { setUser(u); setScreen("dashboard"); }
      setProfiles(p);
    } catch {}
  }, []);

  function save(p) {
    setProfiles(p);
    localStorage.setItem("luna_profiles", JSON.stringify(p));
  }

  function handleLogin(username) {
    const u = { username };
    setUser(u);
    localStorage.setItem("luna_user", JSON.stringify(u));
    setScreen("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("luna_user");
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

  if (screen === "login") return <Login onLogin={handleLogin} />;
  if (screen === "add") return <AddProfile onAdd={handleAdd} onBack={() => setScreen("dashboard")} />;
  if (screen === "profile" && selected) return <ProfileDetail profile={selected} onUpdate={handleUpdate} onBack={() => setScreen("dashboard")} onDelete={handleDelete} />;
  return <Dashboard user={user} profiles={profiles} onSelect={handleSelect} onAdd={() => setScreen("add")} onLogout={handleLogout} />;
}
