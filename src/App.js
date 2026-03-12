import { useState, useEffect, useCallback } from "react";

// ─── Brand Identity & Constants ─────────────────────────────────────────────

const BRAND = {
  name: "Luna",
  tagline: "Understand her rhythm",
  colors: {
    primary: "#9b87f5",      // Soft lavender
    secondary: "#f9a8d4",    // Warm pink
    accent: "#6ee7b7",       // Mint
    background: "#0a0a14",   // Deeper, richer dark
    surface: "#14141f",      // Slightly lighter surface
    surfaceElevated: "#1e1e2c",
    text: "#ffffff",
    textSoft: "rgba(255,255,255,0.85)",
    textSecondary: "rgba(255,255,255,0.6)",
    textTertiary: "rgba(255,255,255,0.3)",
    divider: "rgba(255,255,255,0.08)",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    title1: { fontSize: 34, lineHeight: 41, fontWeight: "700" },      // Large title
    title2: { fontSize: 28, lineHeight: 34, fontWeight: "700" },      // Title 1
    title3: { fontSize: 22, lineHeight: 28, fontWeight: "600" },      // Title 2
    headline: { fontSize: 17, lineHeight: 22, fontWeight: "600" },    // Headline
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" },        // Body
    callout: { fontSize: 15, lineHeight: 20, fontWeight: "400" },     // Callout
    subhead: { fontSize: 14, lineHeight: 18, fontWeight: "500" },     // Subhead
    footnote: { fontSize: 13, lineHeight: 18, fontWeight: "400" },    // Footnote
    caption1: { fontSize: 12, lineHeight: 16, fontWeight: "400" },    // Caption 1
    caption2: { fontSize: 11, lineHeight: 13, fontWeight: "400" },    // Caption 2
  },
  fonts: {
    heading: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Playfair Display', serif",
    body: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif",
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    pill: 9999,
  },
  shadows: {
    sm: "0 2px 8px rgba(0,0,0,0.2)",
    md: "0 4px 12px rgba(0,0,0,0.3)",
    lg: "0 8px 24px rgba(0,0,0,0.4)",
  },
  animation: {
    spring: "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  }
};

const PHASES = {
  menstruation: {
    label: "Menstruation", short: "Period",
    color: "#f87171", bg: "#2a151f", emoji: "🩸", icon: "Drop",
    days: [1, 5], description: "Rest & recharge",
  },
  follicular: {
    label: "Follicular", short: "Follicular",
    color: "#fbbf24", bg: "#2a2015", emoji: "🌱", icon: "Sprout",
    days: [6, 13], description: "Energy rising",
  },
  ovulation: {
    label: "Ovulation", short: "Ovulation",
    color: "#34d399", bg: "#0f2a1f", emoji: "✨", icon: "Sparkles",
    days: [14, 16], description: "Peak vitality",
  },
  luteal: {
    label: "Luteal", short: "Luteal",
    color: "#c084fc", bg: "#1a152a", emoji: "🌙", icon: "Moon",
    days: [17, 28], description: "Wind down",
  },
};

// ─── Professional Icons ─────────────────────────────────────────────────────

const Icons = {
  Drop: (props) => (
    <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 3L12 19M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth={props.strokeWidth || 1.5} strokeLinecap="round"/>
      <path d="M12 19C9 19 6.5 16.5 6.5 13.5C6.5 10.5 9 8 12 8C15 8 17.5 10.5 17.5 13.5C17.5 16.5 15 19 12 19Z" stroke="currentColor" strokeWidth={props.strokeWidth || 1.5}/>
    </svg>
  ),
  Sprout: (props) => (
    <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 20V12M12 12C12 9 14.5 6.5 18 6.5C18 10 15.5 12.5 12 12.5ZM12 12C12 9 9.5 6.5 6 6.5C6 10 8.5 12.5 12 12.5Z" stroke="currentColor" strokeWidth={props.strokeWidth || 1.5} strokeLinecap="round"/>
    </svg>
  ),
  Sparkles: (props) => (
    <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 4L13.5 9L18 10.5L13.5 12L12 17L10.5 12L6 10.5L10.5 9L12 4Z" fill="currentColor" fillOpacity="0.8"/>
      <path d="M19 14L20 17L23 18L20 19L19 22L18 19L15 18L18 17L19 14Z" fill="currentColor" fillOpacity="0.6"/>
    </svg>
  ),
  Moon: (props) => (
    <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M21 12.5C21 16.5 18 20 13 20C8 20 4 16 4 11C4 6.5 7.5 3.5 11.5 3.5C12 3.5 12 3.5 12 3.5C10 6.5 10.5 9.5 13 12C15.5 14.5 19 15 21 12.5Z" stroke="currentColor" strokeWidth={props.strokeWidth || 1.5}/>
    </svg>
  ),
  Calendar: (props) => (
    <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth={props.strokeWidth || 1.5}/>
      <path d="M8 4V8" stroke="currentColor" strokeWidth={props.strokeWidth || 1.5} strokeLinecap="round"/>
      <path d="M16 4V8" stroke="currentColor" strokeWidth={props.strokeWidth || 1.5} strokeLinecap="round"/>
      <path d="M4 10H20" stroke="currentColor" strokeWidth={props.strokeWidth || 1.5}/>
    </svg>
  ),
  Heart: (props) => (
    <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 21C12 21 4 16 4 10C4 6.5 7 4 10 4C12 4 14 5.5 15 7C16 5.5 18 4 20 4C23 4 24 6.5 24 10C24 16 16 21 16 21" stroke="currentColor" strokeWidth={props.strokeWidth || 1.5}/>
    </svg>
  ),
  Chart: (props) => (
    <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 4V20H20" stroke="currentColor" strokeWidth={props.strokeWidth || 1.5} strokeLinecap="round"/>
      <path d="M8 16L12 11L15 14L20 8" stroke="currentColor" strokeWidth={props.strokeWidth || 1.5} strokeLinecap="round"/>
    </svg>
  ),
  ChevronLeft: (props) => (
    <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ChevronRight: (props) => (
    <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Plus: (props) => (
    <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round"/>
    </svg>
  ),
  X: (props) => (
    <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round"/>
    </svg>
  ),
};

// ─── Animations ─────────────────────────────────────────────────────────────

const animations = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideDown {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  .fade-in {
    animation: fadeIn 0.3s ease;
  }
  
  .slide-up {
    animation: slideUp 0.4s ${BRAND.animation.spring};
  }
  
  .slide-down {
    animation: slideDown 0.4s ${BRAND.animation.spring};
  }
  
  .scale-in {
    animation: scaleIn 0.3s ${BRAND.animation.spring};
  }
  
  .hover-scale {
    transition: transform 0.2s ${BRAND.animation.spring};
  }
  
  .hover-scale:active {
    transform: scale(0.97);
  }
  
  .tap-feedback {
    transition: all 0.1s ease;
  }
  
  .tap-feedback:active {
    opacity: 0.7;
    transform: scale(0.98);
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

// ─── Safe Area Context ───────────────────────────────────────────────────────

function useSafeArea() {
  const [safeArea, setSafeArea] = useState({ top: 0, bottom: 0 });
  
  useEffect(() => {
    // This would ideally use react-native-safe-area-context, but for web we'll use env()
    const checkSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('--sat') || '0'),
        bottom: parseInt(style.getPropertyValue('--sab') || '0'),
      });
    };
    
    checkSafeArea();
    window.addEventListener('resize', checkSafeArea);
    return () => window.removeEventListener('resize', checkSafeArea);
  }, []);
  
  return safeArea;
}

// ─── Background Decor (Optimized for Mobile) ───────────────────────────────

function BgDecor({ phase }) {
  const c = PHASES[phase || "luteal"].color;
  
  return (
    <div style={{ 
      position: "fixed", 
      inset: 0, 
      overflow: "hidden", 
      pointerEvents: "none", 
      zIndex: 0,
      opacity: 0.2, // Reduced opacity for mobile
    }}>
      <div style={{
        position: "absolute", 
        top: "-20vh", 
        right: "-10vw", 
        width: "60vmax", 
        height: "60vmax",
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, ${c}20, transparent 70%)`,
        transform: "rotate(45deg)",
      }} />
      <div style={{
        position: "absolute", 
        bottom: "-20vh", 
        left: "-10vw", 
        width: "50vmax", 
        height: "50vmax",
        borderRadius: "50%",
        background: `radial-gradient(circle at 70% 70%, ${c}15, transparent 70%)`,
      }} />
    </div>
  );
}

// ─── Card Component (Mobile Optimized) ─────────────────────────────────────

function Card({ children, color, onClick, elevated = false, style = {} }) {
  const [isPressed, setIsPressed] = useState(false);
  
  const baseStyle = {
    background: elevated ? BRAND.colors.surfaceElevated : BRAND.colors.surface,
    borderRadius: BRAND.radius.lg,
    padding: BRAND.spacing.md,
    border: `1px solid ${color || BRAND.colors.divider}`,
    transition: "all 0.2s ease",
    cursor: onClick ? "pointer" : "default",
    WebkitTapHighlightColor: "transparent",
    transform: isPressed && onClick ? "scale(0.98)" : "scale(1)",
    opacity: isPressed && onClick ? 0.9 : 1,
    boxShadow: elevated ? BRAND.shadows.md : "none",
    ...style,
  };

  return (
    <div
      onTouchStart={() => onClick && setIsPressed(true)}
      onTouchEnd={() => onClick && setIsPressed(false)}
      onTouchCancel={() => onClick && setIsPressed(false)}
      onMouseDown={() => onClick && setIsPressed(true)}
      onMouseUp={() => onClick && setIsPressed(false)}
      onMouseLeave={() => onClick && setIsPressed(false)}
      onClick={onClick}
      style={baseStyle}
    >
      {children}
    </div>
  );
}

// ─── Button Component (Mobile Optimized) ───────────────────────────────────

function Button({ 
  children, 
  variant = "primary", 
  onClick, 
  disabled, 
  icon, 
  fullWidth,
  size = "md",
  style = {} 
}) {
  const [isPressed, setIsPressed] = useState(false);
  
  const variants = {
    primary: {
      background: BRAND.colors.primary,
      color: "#ffffff",
      border: "none",
      pressedBg: "#8a75f0",
    },
    secondary: {
      background: "transparent",
      color: BRAND.colors.text,
      border: `1px solid ${BRAND.colors.primary}40`,
      pressedBg: `${BRAND.colors.primary}20`,
    },
    accent: {
      background: BRAND.colors.secondary,
      color: "#1a1a2e",
      border: "none",
      pressedBg: "#e594c4",
    },
    danger: {
      background: "rgba(248, 113, 113, 0.1)",
      color: "#f87171",
      border: "1px solid #f8717140",
      pressedBg: "rgba(248, 113, 113, 0.2)",
    },
    ghost: {
      background: "transparent",
      color: BRAND.colors.textSecondary,
      border: "none",
      pressedBg: "rgba(255,255,255,0.05)",
    },
  };
  
  const sizes = {
    sm: { padding: `${BRAND.spacing.xs}px ${BRAND.spacing.sm}px`, fontSize: BRAND.typography.caption1.fontSize },
    md: { padding: `${BRAND.spacing.sm}px ${BRAND.spacing.md}px`, fontSize: BRAND.typography.subhead.fontSize },
    lg: { padding: `${BRAND.spacing.md}px ${BRAND.spacing.lg}px`, fontSize: BRAND.typography.body.fontSize },
  };
  
  const v = variants[variant];
  const s = sizes[size];
  
  return (
    <button
      onTouchStart={() => !disabled && setIsPressed(true)}
      onTouchEnd={() => !disabled && setIsPressed(false)}
      onTouchCancel={() => !disabled && setIsPressed(false)}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => !disabled && setIsPressed(false)}
      onMouseLeave={() => !disabled && setIsPressed(false)}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: BRAND.spacing.xs,
        padding: s.padding,
        borderRadius: BRAND.radius.pill,
        fontSize: s.fontSize,
        fontWeight: "600",
        lineHeight: 1.2,
        fontFamily: BRAND.fonts.body,
        cursor: disabled ? "default" : "pointer",
        transition: "all 0.1s ease",
        background: isPressed && !disabled ? v.pressedBg : v.background,
        color: v.color,
        border: v.border,
        opacity: disabled ? 0.4 : 1,
        width: fullWidth ? "100%" : "auto",
        minHeight: size === "lg" ? 48 : size === "md" ? 40 : 32,
        WebkitTapHighlightColor: "transparent",
        transform: isPressed && !disabled ? "scale(0.98)" : "scale(1)",
        ...style,
      }}
    >
      {icon && <span style={{ width: 20, height: 20 }}>{icon}</span>}
      {children}
    </button>
  );
}

// ─── Segmented Control (iOS-style) ─────────────────────────────────────────

function SegmentedControl({ options, value, onChange, color }) {
  return (
    <div style={{
      display: "flex",
      background: BRAND.colors.surface,
      borderRadius: BRAND.radius.pill,
      padding: 4,
      border: `1px solid ${BRAND.colors.divider}`,
    }}>
      {options.map(option => {
        const isSelected = value === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            style={{
              flex: 1,
              border: "none",
              background: isSelected ? color || BRAND.colors.primary : "transparent",
              borderRadius: BRAND.radius.pill - 2,
              padding: `${BRAND.spacing.sm}px ${BRAND.spacing.md}px`,
              color: isSelected ? "#ffffff" : BRAND.colors.textSecondary,
              fontSize: BRAND.typography.subhead.fontSize,
              fontWeight: isSelected ? "600" : "400",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: BRAND.spacing.xs,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {option.icon && <span style={{ width: 18, height: 18 }}>{option.icon}</span>}
            {option.label}
          </button>
        );
      })}
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
    
    // Simulate AI response
    setTimeout(() => {
      setText(`Day ${day} of her cycle. ${CYCLE_TIPS[phase].note} ${CYCLE_TIPS[phase].safe ? '✅ Safe for unprotected intimacy.' : '⚠️ Caution - fertile window.'}`);
      setLoading(false);
    }, 800);
  }, [profile, day, phase]);

  return (
    <Card color={PD.color} elevated style={{ marginTop: BRAND.spacing.md }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: BRAND.spacing.sm 
      }}>
        <span style={{ 
          ...BRAND.typography.caption1,
          fontWeight: "600",
          color: BRAND.colors.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}>
          AI Insight
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={generate}
          disabled={loading}
          icon={loading ? <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent", animation: "pulse 1s infinite" }} /> : null}
        >
          {loading ? "Thinking" : "Generate"}
        </Button>
      </div>
      
      <div style={{ minHeight: 48 }}>
        {text ? (
          <p style={{ 
            ...BRAND.typography.footnote,
            color: BRAND.colors.textSecondary,
            margin: 0,
            lineHeight: 1.5,
          }}>
            {text}
          </p>
        ) : (
          <p style={{ 
            ...BRAND.typography.caption1,
            color: BRAND.colors.textTertiary,
            margin: 0,
            fontStyle: "italic",
          }}>
            Tap Generate for personalized insights
          </p>
        )}
      </div>
    </Card>
  );
}

// ─── Cycle Ring (Mobile Optimized) ─────────────────────────────────────────

function CycleRing({ day, cycleLength, size = 160 }) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.36;
  const strokeW = size * 0.1;
  const circ = 2 * Math.PI * r;
  const phase = getPhaseFromDay(day);

  const segments = [
    { name: "menstruation", start: 0, end: 5, color: "#f87171" },
    { name: "follicular", start: 5, end: 13, color: "#fbbf24" },
    { name: "ovulation", start: 13, end: 16, color: "#34d399" },
    { name: "luteal", start: 16, end: cycleLength, color: "#c084fc" },
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
    <svg width={size} height={size} style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>
      {/* Track */}
      <circle 
        cx={cx} cy={cy} r={r} 
        fill="none" 
        stroke={BRAND.colors.divider} 
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
            strokeDashoffset={offset}
            strokeLinecap="round"
            opacity={isCurrent ? 1 : 0.3}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        );
      })}
      
      {/* Current day dot */}
      <circle 
        cx={dotX} cy={dotY} r={size * 0.055} 
        fill="#ffffff"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
      />
      <circle 
        cx={dotX} cy={dotY} r={size * 0.03} 
        fill={PHASES[phase].color}
      />
      
      {/* Center text */}
      <text x={cx} y={cy - 6} textAnchor="middle" fill={BRAND.colors.text} fontSize={size * 0.16} fontWeight="700" fontFamily={BRAND.fonts.heading}>
        {day}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill={BRAND.colors.textTertiary} fontSize={size * 0.07} fontFamily={BRAND.fonts.body}>
        of {cycleLength}
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill={PHASES[phase].color} fontSize={size * 0.07} fontWeight="600" fontFamily={BRAND.fonts.body}>
        {PHASES[phase].short}
      </text>
    </svg>
  );
}

// ─── Month Calendar (Mobile Optimized) ─────────────────────────────────────

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

  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(7, 1fr)", 
        gap: 2, 
        marginBottom: BRAND.spacing.sm 
      }}>
        {weekdays.map(d => (
          <div key={d} style={{ 
            textAlign: "center", 
            ...BRAND.typography.caption2,
            color: BRAND.colors.textTertiary, 
            fontWeight: "500",
            padding: BRAND.spacing.xs,
          }}>
            {d}
          </div>
        ))}
      </div>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(7, 1fr)", 
        gap: 2 
      }}>
        {Array(firstDay).fill(null).map((_, i) => (
          <div key={"empty" + i} style={{ aspectRatio: "1" }} />
        ))}
        
        {Array(daysInMonth).fill(null).map((_, i) => {
          const d = i + 1;
          const ph = phaseForDay(d);
          const col = PHASES[ph].color;
          const isToday = isCurrentMonth && d === today.getDate();
          const hasIntimacy = isIntimacyDay(d);
          
          return (
            <div
              key={d}
              style={{
                aspectRatio: "1",
                borderRadius: BRAND.radius.sm,
                position: "relative",
                background: isToday ? col : "transparent",
                border: isToday ? "none" : `1px solid ${col}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.1s ease",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ 
                ...BRAND.typography.caption1,
                color: isToday ? "#111" : BRAND.colors.text, 
                fontWeight: isToday ? "600" : "400",
              }}>
                {d}
              </span>
              {hasIntimacy && (
                <span style={{ 
                  position: "absolute", 
                  bottom: 2, 
                  right: 2, 
                  fontSize: 8,
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

// ─── Profile Detail (Mobile First) ─────────────────────────────────────────

function ProfileDetail({ profile, onUpdate, onBack, onDelete }) {
  const [tab, setTab] = useState("overview");
  const [monthOffset, setMonthOffset] = useState(0);
  const [editingSymptoms, setEditingSymptoms] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logDate, setLogDate] = useState(todayStr());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const safeArea = useSafeArea();

  const day = getDayOfCycle(profile.lastPeriodStart, profile.cycleLength);
  const phase = getPhaseFromDay(day);
  const PD = PHASES[phase];
  const tips = CYCLE_TIPS[phase];
  const nextPeriod = getNextPeriod(profile.lastPeriodStart, profile.cycleLength);
  const nextOvulation = getOvulation(profile.lastPeriodStart, profile.cycleLength);
  const daysToNextPeriod = daysUntil(nextPeriod);
  const daysToOvulation = daysUntil(nextOvulation);

  const tabs = [
    { id: "overview", label: "Overview", icon: <Icons.Chart size={18} /> },
    { id: "calendar", label: "Calendar", icon: <Icons.Calendar size={18} /> },
    { id: "insights", label: "Insights", icon: <Icons.Sparkles size={18} /> },
  ];

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: BRAND.colors.background, 
      color: BRAND.colors.text, 
      fontFamily: BRAND.fonts.body,
      position: "relative",
      paddingBottom: safeArea.bottom,
    }}>
      <style>{animations}</style>
      <BgDecor phase={phase} />
      
      <div style={{ 
        position: "relative", 
        zIndex: 2,
        padding: `${safeArea.top + BRAND.spacing.md}px ${BRAND.spacing.md}px ${BRAND.spacing.xl}px`,
        maxWidth: 480,
        margin: "0 auto",
      }}>

        {/* Top Bar */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: BRAND.spacing.lg,
        }}>
          <Button variant="ghost" size="sm" onClick={onBack} icon={<Icons.ChevronLeft size={20} />}>
            Back
          </Button>
          
          <div style={{ display: "flex", gap: BRAND.spacing.xs }}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onUpdate({ ...profile, hidden: !profile.hidden })}
            >
              {profile.hidden ? "Show" : "Hide"}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card color={PD.color} elevated style={{ marginBottom: BRAND.spacing.lg }}>
          <div style={{ display: "flex", gap: BRAND.spacing.md, marginBottom: BRAND.spacing.md }}>
            <div style={{
              width: 72, height: 72, borderRadius: BRAND.radius.lg,
              background: `linear-gradient(135deg, ${PD.color}40, ${PD.color}10)`,
              border: `2px solid ${PD.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32,
            }}>
              {profile.avatar}
            </div>
            
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                ...BRAND.typography.title3,
                margin: 0,
                color: BRAND.colors.text,
              }}>
                {profile.name}
              </h1>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: BRAND.spacing.xs,
                background: `${PD.color}20`,
                borderRadius: BRAND.radius.pill,
                padding: `${BRAND.spacing.xs}px ${BRAND.spacing.sm}px`,
                border: `1px solid ${PD.color}40`,
                marginTop: BRAND.spacing.xs,
              }}>
                <span style={{ fontSize: 14 }}>{PD.emoji}</span>
                <span style={{ 
                  ...BRAND.typography.caption1,
                  color: PD.color, 
                  fontWeight: "600" 
                }}>
                  {PD.label} · Day {day}
                </span>
              </div>
            </div>
            
            <CycleRing day={day} cycleLength={profile.cycleLength} size={72} />
          </div>

          {/* Risk Banner */}
          <div style={{
            background: tips.safe ? `${BRAND.colors.accent}15` : `${PD.color}15`,
            borderRadius: BRAND.radius.md,
            padding: BRAND.spacing.md,
            display: "flex",
            gap: BRAND.spacing.sm,
            alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 20 }}>{tips.safe ? "✅" : "⚠️"}</span>
            <div>
              <div style={{ 
                ...BRAND.typography.caption1,
                fontWeight: "700", 
                color: tips.safe ? BRAND.colors.accent : PD.color,
                marginBottom: 2,
              }}>
                {tips.risk}
              </div>
              <div style={{ 
                ...BRAND.typography.footnote,
                color: BRAND.colors.textSecondary, 
                lineHeight: 1.4,
              }}>
                {tips.note}
              </div>
            </div>
          </div>
        </Card>

        {/* Segmented Control */}
        <SegmentedControl
          options={tabs}
          value={tab}
          onChange={setTab}
          color={PD.color}
        />

        {/* Tab Content */}
        <div style={{ marginTop: BRAND.spacing.lg }}>
          {tab === "overview" && (
            <div className="slide-up">
              {/* Stats Grid */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: BRAND.spacing.sm, 
                marginBottom: BRAND.spacing.md 
              }}>
                {[
                  { label: "Period in", val: daysToNextPeriod <= 0 ? "Today" : `${daysToNextPeriod}d`, sub: fmtDate(nextPeriod), color: "#f87171" },
                  { label: "Ovulation", val: daysToOvulation <= 0 ? "Now" : `${daysToOvulation}d`, sub: fmtDate(nextOvulation), color: "#34d399" },
                  { label: "Energy", val: tips.energy, sub: "Current phase", color: "#fbbf24" },
                  { label: "Mood", val: tips.mood, sub: "Expected", color: "#c084fc" },
                ].map(s => (
                  <Card key={s.label} color={s.color} style={{ padding: BRAND.spacing.md }}>
                    <div style={{ 
                      ...BRAND.typography.caption2,
                      fontWeight: "600", 
                      color: BRAND.colors.textTertiary, 
                      marginBottom: BRAND.spacing.xs,
                      textTransform: "uppercase",
                    }}>
                      {s.label}
                    </div>
                    <div style={{ 
                      ...BRAND.typography.title3,
                      color: s.color, 
                      marginBottom: 2,
                    }}>
                      {s.val}
                    </div>
                    <div style={{ 
                      ...BRAND.typography.caption2,
                      color: BRAND.colors.textTertiary 
                    }}>
                      {s.sub}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Libido Card */}
              <Card color={PD.color} style={{ marginBottom: BRAND.spacing.md }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ 
                    ...BRAND.typography.caption1,
                    fontWeight: "600",
                    color: BRAND.colors.textSecondary,
                    textTransform: "uppercase",
                  }}>
                    Libido
                  </span>
                  <span style={{ 
                    ...BRAND.typography.subhead,
                    fontWeight: "700",
                    color: PD.color 
                  }}>
                    {tips.libido}
                  </span>
                </div>
              </Card>

              {/* Symptoms Section */}
              <Card color={PD.color} style={{ marginBottom: BRAND.spacing.md }}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  marginBottom: BRAND.spacing.md 
                }}>
                  <span style={{ 
                    ...BRAND.typography.caption1,
                    fontWeight: "600",
                    color: BRAND.colors.textSecondary,
                    textTransform: "uppercase",
                  }}>
                    Symptoms
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setEditingSymptoms(!editingSymptoms)}>
                    {editingSymptoms ? "Done" : "Edit"}
                  </Button>
                </div>
                
                {editingSymptoms ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: BRAND.spacing.xs }}>
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
                          className="tap-feedback"
                          style={{
                            background: active ? `${PD.color}30` : "rgba(255,255,255,0.05)",
                            border: `1px solid ${active ? PD.color : "rgba(255,255,255,0.1)"}`,
                            borderRadius: BRAND.radius.pill,
                            padding: `${BRAND.spacing.xs}px ${BRAND.spacing.md}px`,
                            color: active ? PD.color : BRAND.colors.textSecondary,
                            ...BRAND.typography.caption1,
                            cursor: "pointer",
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: BRAND.spacing.xs }}>
                    {(profile.symptoms || []).length === 0 ? (
                      <span style={{ 
                        ...BRAND.typography.caption1,
                        color: BRAND.colors.textTertiary, 
                        fontStyle: "italic" 
                      }}>
                        No symptoms logged
                      </span>
                    ) : (
                      (profile.symptoms || []).map(s => (
                        <span
                          key={s}
                          style={{
                            background: `${PD.color}20`,
                            border: `1px solid ${PD.color}40`,
                            borderRadius: BRAND.radius.pill,
                            padding: `${BRAND.spacing.xs}px ${BRAND.spacing.md}px`,
                            ...BRAND.typography.caption1,
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

              {/* Quick Actions */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: BRAND.spacing.sm, 
                marginBottom: BRAND.spacing.md 
              }}>
                <Button
                  variant="accent"
                  onClick={() => onUpdate({ ...profile, lastPeriodStart: todayStr() })}
                  icon="🩸"
                  fullWidth
                  size="lg"
                >
                  Period Started
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowLogModal(true)}
                  icon="❤️"
                  fullWidth
                  size="lg"
                >
                  Log Intimacy
                </Button>
              </div>

              <AIInsight profile={profile} />
            </div>
          )}

          {tab === "calendar" && (
            <div className="slide-up">
              {/* Calendar Card */}
              <Card color={PD.color} elevated style={{ marginBottom: BRAND.spacing.md }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  marginBottom: BRAND.spacing.lg 
                }}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setMonthOffset(m => m - 1)}
                    icon={<Icons.ChevronLeft size={20} />}
                  />
                  <span style={{ 
                    ...BRAND.typography.subhead,
                    fontWeight: "600",
                  }}>
                    {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setMonthOffset(m => m + 1)}
                    icon={<Icons.ChevronRight size={20} />}
                  />
                </div>
                
                <MonthCalendar profile={profile} monthOffset={monthOffset} />
              </Card>

              {/* Upcoming Events */}
              <Card color={PD.color} elevated>
                <div style={{ 
                  ...BRAND.typography.caption1,
                  fontWeight: "600",
                  color: BRAND.colors.textSecondary, 
                  marginBottom: BRAND.spacing.md,
                  textTransform: "uppercase",
                }}>
                  Upcoming
                </div>
                
                {[
                  { label: "Next Period", date: nextPeriod, color: "#f87171", icon: "🩸", days: daysToNextPeriod },
                  { label: "Ovulation", date: nextOvulation, color: "#34d399", icon: "✨", days: daysToOvulation },
                ].map(ev => (
                  <div key={ev.label} style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: `${BRAND.spacing.sm}px 0`,
                    borderBottom: `1px solid ${BRAND.colors.divider}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: BRAND.spacing.sm }}>
                      <span style={{ fontSize: 20 }}>{ev.icon}</span>
                      <span style={{ 
                        ...BRAND.typography.subhead,
                        color: ev.color, 
                        fontWeight: "600" 
                      }}>
                        {ev.label}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ 
                        ...BRAND.typography.footnote,
                        color: BRAND.colors.text 
                      }}>
                        {fmtDate(ev.date)}
                      </div>
                      <div style={{ 
                        ...BRAND.typography.caption2,
                        color: BRAND.colors.textTertiary 
                      }}>
                        {ev.days} days away
                      </div>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {tab === "insights" && (
            <div className="slide-up">
              {Object.entries(PHASES).map(([key, val]) => {
                const t = CYCLE_TIPS[key];
                const isCurrent = phase === key;
                
                return (
                  <Card
                    key={key}
                    color={val.color}
                    elevated={isCurrent}
                    style={{ 
                      marginBottom: BRAND.spacing.sm,
                      border: isCurrent ? `2px solid ${val.color}` : `1px solid ${val.color}30`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: BRAND.spacing.sm }}>
                      <div style={{ display: "flex", alignItems: "center", gap: BRAND.spacing.sm }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: BRAND.radius.md,
                          background: `${val.color}20`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 20,
                        }}>
                          {val.emoji}
                        </div>
                        <div>
                          <div style={{ 
                            ...BRAND.typography.subhead,
                            fontWeight: "700",
                            color: val.color 
                          }}>
                            {val.label}
                          </div>
                          <div style={{ 
                            ...BRAND.typography.caption2,
                            color: BRAND.colors.textTertiary 
                          }}>
                            Day {val.days[0]}–{val.days[1]}
                          </div>
                        </div>
                      </div>
                      {isCurrent && (
                        <span style={{
                          background: val.color,
                          borderRadius: BRAND.radius.pill,
                          padding: `${BRAND.spacing.xs}px ${BRAND.spacing.sm}px`,
                          ...BRAND.typography.caption2,
                          fontWeight: "700",
                          color: "#111",
                        }}>
                          Current
                        </span>
                      )}
                    </div>
                    
                    <p style={{ 
                      ...BRAND.typography.footnote,
                      color: BRAND.colors.textSecondary, 
                      lineHeight: 1.5, 
                      marginBottom: BRAND.spacing.md 
                    }}>
                      {t.note}
                    </p>
                    
                    <div style={{ display: "flex", gap: BRAND.spacing.xs, flexWrap: "wrap" }}>
                      <span style={{
                        background: `${val.color}20`,
                        border: `1px solid ${val.color}40`,
                        borderRadius: BRAND.radius.pill,
                        padding: `${BRAND.spacing.xs}px ${BRAND.spacing.sm}px`,
                        ...BRAND.typography.caption2,
                        color: val.color,
                      }}>
                        ⚡ {t.energy}
                      </span>
                      <span style={{
                        background: `${val.color}20`,
                        border: `1px solid ${val.color}40`,
                        borderRadius: BRAND.radius.pill,
                        padding: `${BRAND.spacing.xs}px ${BRAND.spacing.sm}px`,
                        ...BRAND.typography.caption2,
                        color: val.color,
                      }}>
                        🧠 {t.mood}
                      </span>
                      <span style={{
                        background: `${val.color}20`,
                        border: `1px solid ${val.color}40`,
                        borderRadius: BRAND.radius.pill,
                        padding: `${BRAND.spacing.xs}px ${BRAND.spacing.sm}px`,
                        ...BRAND.typography.caption2,
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
      </div>

      {/* Log Intimacy Modal (Bottom Sheet) */}
      {showLogModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "flex-end",
          zIndex: 200,
          animation: "fadeIn 0.2s ease",
        }}>
          <div style={{
            background: BRAND.colors.surfaceElevated,
            borderTopLeftRadius: BRAND.radius.xl,
            borderTopRightRadius: BRAND.radius.xl,
            padding: BRAND.spacing.xl,
            width: "100%",
            animation: "slideUp 0.3s ease",
          }}>
            {/* Grabber */}
            <div style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: BRAND.colors.divider,
              margin: `0 auto ${BRAND.spacing.lg}px`,
            }} />
            
            <h2 style={{ 
              ...BRAND.typography.title3,
              margin: `0 0 ${BRAND.spacing.lg}px 0`,
            }}>
              Log Intimacy
            </h2>
            
            <label style={{ 
              ...BRAND.typography.caption1,
              fontWeight: "600",
              color: BRAND.colors.textSecondary, 
              display: "block", 
              marginBottom: BRAND.spacing.xs,
            }}>
              Date
            </label>
            <input
              type="date"
              value={logDate}
              onChange={e => setLogDate(e.target.value)}
              style={{
                width: "100%",
                background: BRAND.colors.background,
                border: `1px solid ${BRAND.colors.divider}`,
                borderRadius: BRAND.radius.md,
                padding: BRAND.spacing.md,
                color: BRAND.colors.text,
                ...BRAND.typography.body,
                outline: "none",
                marginBottom: BRAND.spacing.lg,
              }}
            />
            
            <div style={{ display: "flex", gap: BRAND.spacing.sm }}>
              <Button variant="secondary" onClick={() => setShowLogModal(false)} fullWidth size="lg">
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
                size="lg"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          animation: "fadeIn 0.2s ease",
          padding: BRAND.spacing.lg,
        }}>
          <Card color="#f87171" elevated style={{ maxWidth: 340, padding: BRAND.spacing.xl }}>
            <div style={{ fontSize: 48, textAlign: "center", marginBottom: BRAND.spacing.md }}>⚠️</div>
            <h3 style={{ 
              ...BRAND.typography.title3,
              textAlign: "center",
              margin: `0 0 ${BRAND.spacing.sm}px`,
            }}>
              Delete {profile.name}?
            </h3>
            <p style={{ 
              ...BRAND.typography.footnote,
              color: BRAND.colors.textSecondary, 
              textAlign: "center",
              marginBottom: BRAND.spacing.lg,
            }}>
              All her data will be permanently removed.
            </p>
            <div style={{ display: "flex", gap: BRAND.spacing.sm }}>
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

// ─── Add Profile (Mobile First) ──────────────────────────────────────────────

function AddProfile({ onAdd, onBack }) {
  const [form, setForm] = useState({
    name: "", lastPeriodStart: todayStr(),
    cycleLength: 28, periodLength: 5, avatar: "🌸",
  });
  const [step, setStep] = useState(1);
  const safeArea = useSafeArea();

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: BRAND.colors.background, 
      color: BRAND.colors.text, 
      fontFamily: BRAND.fonts.body,
      position: "relative",
      paddingBottom: safeArea.bottom,
    }}>
      <style>{animations}</style>
      <BgDecor phase="luteal" />
      
      <div style={{ 
        position: "relative", 
        zIndex: 2,
        padding: `${safeArea.top + BRAND.spacing.md}px ${BRAND.spacing.md}px ${BRAND.spacing.xl}px`,
        maxWidth: 480,
        margin: "0 auto",
      }}>

        <Button variant="ghost" size="sm" onClick={onBack} icon={<Icons.ChevronLeft size={20} />} style={{ marginBottom: BRAND.spacing.lg }}>
          Back
        </Button>

        <h1 style={{ 
          ...BRAND.typography.title2,
          margin: `0 0 ${BRAND.spacing.xs}px`,
        }}>
          Add Profile
        </h1>
        <p style={{ 
          ...BRAND.typography.body,
          color: BRAND.colors.textSecondary, 
          marginBottom: BRAND.spacing.xl,
        }}>
          Start tracking her cycle with Luna
        </p>

        {/* Progress Steps */}
        <div style={{ display: "flex", gap: BRAND.spacing.xs, marginBottom: BRAND.spacing.xl }}>
          {[1, 2].map(i => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= step ? BRAND.colors.primary : BRAND.colors.divider,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        {step === 1 ? (
          <Card color={BRAND.colors.primary} elevated style={{ padding: BRAND.spacing.lg }}>
            <div style={{ marginBottom: BRAND.spacing.lg }}>
              <label style={{ 
                ...BRAND.typography.caption1,
                fontWeight: "600",
                color: BRAND.colors.textSecondary, 
                display: "block", 
                marginBottom: BRAND.spacing.sm,
              }}>
                Choose Avatar
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: BRAND.spacing.sm }}>
                {AVATARS.map(a => (
                  <button
                    key={a}
                    onClick={() => setForm({ ...form, avatar: a })}
                    className="tap-feedback"
                    style={{
                      aspectRatio: "1",
                      fontSize: 28,
                      borderRadius: BRAND.radius.md,
                      background: form.avatar === a ? `${BRAND.colors.primary}30` : "rgba(255,255,255,0.05)",
                      border: `2px solid ${form.avatar === a ? BRAND.colors.primary : "rgba(255,255,255,0.1)"}`,
                      cursor: "pointer",
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ 
                ...BRAND.typography.caption1,
                fontWeight: "600",
                color: BRAND.colors.textSecondary, 
                display: "block", 
                marginBottom: BRAND.spacing.xs,
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
                  background: BRAND.colors.background,
                  border: `1px solid ${BRAND.colors.divider}`,
                  borderRadius: BRAND.radius.md,
                  padding: BRAND.spacing.md,
                  color: BRAND.colors.text,
                  ...BRAND.typography.body,
                  outline: "none",
                }}
              />
            </div>
          </Card>
        ) : (
          <Card color={BRAND.colors.primary} elevated style={{ padding: BRAND.spacing.lg }}>
            <div style={{ marginBottom: BRAND.spacing.lg }}>
              <label style={{ 
                ...BRAND.typography.caption1,
                fontWeight: "600",
                color: BRAND.colors.textSecondary, 
                display: "block", 
                marginBottom: BRAND.spacing.xs,
              }}>
                Last Period Start
              </label>
              <input
                type="date"
                value={form.lastPeriodStart}
                onChange={e => setForm({ ...form, lastPeriodStart: e.target.value })}
                style={{
                  width: "100%",
                  background: BRAND.colors.background,
                  border: `1px solid ${BRAND.colors.divider}`,
                  borderRadius: BRAND.radius.md,
                  padding: BRAND.spacing.md,
                  color: BRAND.colors.text,
                  ...BRAND.typography.body,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ 
                ...BRAND.typography.caption1,
                fontWeight: "600",
                color: BRAND.colors.textSecondary, 
                display: "block", 
                marginBottom: BRAND.spacing.xs,
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
                  background: BRAND.colors.background,
                  border: `1px solid ${BRAND.colors.divider}`,
                  borderRadius: BRAND.radius.md,
                  padding: BRAND.spacing.md,
                  color: BRAND.colors.text,
                  ...BRAND.typography.body,
                  outline: "none",
                }}
              />
            </div>
          </Card>
        )}

        <div style={{ display: "flex", gap: BRAND.spacing.sm, marginTop: BRAND.spacing.lg }}>
          {step > 1 && (
            <Button variant="secondary" onClick={() => setStep(1)} fullWidth size="lg">
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
            size="lg"
          >
            {step === 1 ? "Continue" : "Add Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard (Mobile First) ─────────────────────────────────────────────

function Dashboard({ user, profiles, onSelect, onAdd, onLogout }) {
  const [showHidden, setShowHidden] = useState(false);
  const safeArea = useSafeArea();
  const visible = profiles.filter(p => showHidden ? p.hidden : !p.hidden);
  const hiddenCount = profiles.filter(p => p.hidden).length;

  const stats = [
    { 
      label: "Profiles", 
      value: profiles.filter(p => !p.hidden).length,
      icon: <Icons.Heart size={20} />,
      color: BRAND.colors.primary,
    },
    { 
      label: "Safe Now", 
      value: profiles.filter(p => !p.hidden && CYCLE_TIPS[getPhaseFromDay(getDayOfCycle(p.lastPeriodStart, p.cycleLength))].safe).length,
      icon: <Icons.Sparkles size={20} />,
      color: BRAND.colors.accent,
    },
    { 
      label: "Ovulating", 
      value: profiles.filter(p => !p.hidden && getPhaseFromDay(getDayOfCycle(p.lastPeriodStart, p.cycleLength)) === "ovulation").length,
      icon: <Icons.Sprout size={20} />,
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
      paddingBottom: safeArea.bottom,
    }}>
      <style>{animations}</style>
      <BgDecor phase="luteal" />
      
      <div style={{ 
        position: "relative", 
        zIndex: 2,
        padding: `${safeArea.top + BRAND.spacing.md}px ${BRAND.spacing.md}px ${BRAND.spacing.xl}px`,
        maxWidth: 480,
        margin: "0 auto",
      }}>

        {/* Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: BRAND.spacing.xl,
        }}>
          <div>
            <p style={{ 
              ...BRAND.typography.caption1,
              color: BRAND.colors.textTertiary,
              margin: 0,
            }}>
              Welcome back,
            </p>
            <h1 style={{ 
              ...BRAND.typography.title2,
              margin: 0,
            }}>
              {user?.username}
            </h1>
          </div>
          
          <div style={{ display: "flex", gap: BRAND.spacing.xs }}>
            <Button variant="primary" onClick={onAdd} icon={<Icons.Plus size={18} />}>
              Add
            </Button>
            <Button variant="ghost" onClick={onLogout}>
              Log out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {profiles.filter(p => !p.hidden).length > 0 && (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: BRAND.spacing.sm, 
            marginBottom: BRAND.spacing.lg 
          }}>
            {stats.map(stat => (
              <Card key={stat.label} color={stat.color} style={{ padding: BRAND.spacing.md }}>
                <div style={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: BRAND.radius.sm, 
                  background: `${stat.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: `0 auto ${BRAND.spacing.sm}px`,
                  color: stat.color,
                }}>
                  {stat.icon}
                </div>
                <div style={{ 
                  ...BRAND.typography.title3,
                  color: stat.color, 
                  textAlign: "center",
                }}>
                  {stat.value}
                </div>
                <div style={{ 
                  ...BRAND.typography.caption2,
                  color: BRAND.colors.textTertiary, 
                  textAlign: "center",
                }}>
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Hidden Profiles Toggle */}
        {hiddenCount > 0 && (
          <Button
            variant="secondary"
            onClick={() => setShowHidden(h => !h)}
            fullWidth
            style={{ marginBottom: BRAND.spacing.md }}
          >
            {showHidden ? `Hide hidden (${hiddenCount})` : `Show hidden (${hiddenCount})`}
          </Button>
        )}

        {/* Profile List */}
        {visible.length === 0 ? (
          <Card color={BRAND.colors.primary} elevated style={{ padding: BRAND.spacing.xl, textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: BRAND.spacing.md }}>🌙</div>
            <h2 style={{ 
              ...BRAND.typography.title3,
              margin: `0 0 ${BRAND.spacing.xs}px`,
            }}>
              {showHidden ? "No hidden profiles" : "No profiles yet"}
            </h2>
            <p style={{ 
              ...BRAND.typography.footnote,
              color: BRAND.colors.textSecondary, 
              marginBottom: BRAND.spacing.lg,
            }}>
              {showHidden ? "All profiles are visible" : "Add your first profile to start tracking"}
            </p>
            {!showHidden && (
              <Button variant="primary" onClick={onAdd} fullWidth size="lg">
                Add Profile
              </Button>
            )}
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: BRAND.spacing.md }}>
            {visible.map((profile) => {
              const day = getDayOfCycle(profile.lastPeriodStart, profile.cycleLength);
              const phase = getPhaseFromDay(day);
              const PD = PHASES[phase];
              const tips = CYCLE_TIPS[phase];
              
              return (
                <Card
                  key={profile.id}
                  color={PD.color}
                  onClick={() => onSelect(profile)}
                  elevated
                >
                  {/* Header */}
                  <div style={{ display: "flex", gap: BRAND.spacing.md, marginBottom: BRAND.spacing.md }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: BRAND.radius.md,
                      background: `${PD.color}30`,
                      border: `2px solid ${PD.color}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 24,
                    }}>
                      {profile.avatar}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        ...BRAND.typography.subhead,
                        fontWeight: "700",
                        margin: 0,
                      }}>
                        {profile.name}
                      </h3>
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: BRAND.spacing.xs,
                        background: `${PD.color}20`,
                        borderRadius: BRAND.radius.pill,
                        padding: `${BRAND.spacing.xs}px ${BRAND.spacing.sm}px`,
                        border: `1px solid ${PD.color}40`,
                        marginTop: BRAND.spacing.xs,
                      }}>
                        <span style={{ fontSize: 12 }}>{PD.emoji}</span>
                        <span style={{ 
                          ...BRAND.typography.caption2,
                          color: PD.color, 
                          fontWeight: "600" 
                        }}>
                          {PD.label} · Day {day}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{
                      background: tips.safe ? BRAND.colors.accent : PD.color,
                      borderRadius: BRAND.radius.pill,
                      padding: `${BRAND.spacing.xs}px ${BRAND.spacing.sm}px`,
                      ...BRAND.typography.caption2,
                      fontWeight: "700",
                      color: "#111",
                    }}>
                      {tips.safe ? "✓ Safe" : "⚠️ Risk"}
                    </div>
                  </div>
                  
                  {/* Phase Progress */}
                  <div style={{
                    display: "flex",
                    height: 4,
                    borderRadius: 2,
                    overflow: "hidden",
                    gap: 2,
                    marginBottom: BRAND.spacing.md,
                  }}>
                    {Object.entries(PHASES).map(([k, v]) => {
                      const width = ((v.days[1] - v.days[0] + 1) / profile.cycleLength) * 100;
                      return (
                        <div
                          key={k}
                          style={{
                            width: `${width}%`,
                            background: phase === k ? v.color : `${v.color}30`,
                          }}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Mini Stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: BRAND.spacing.sm }}>
                    <div style={{
                      background: "#f8717120",
                      borderRadius: BRAND.radius.sm,
                      padding: BRAND.spacing.sm,
                      border: "1px solid #f8717140",
                    }}>
                      <div style={{ 
                        ...BRAND.typography.subhead,
                        fontWeight: "700", 
                        color: "#f87171",
                      }}>
                        {daysUntil(getNextPeriod(profile.lastPeriodStart, profile.cycleLength))}d
                      </div>
                      <div style={{ 
                        ...BRAND.typography.caption2,
                        color: BRAND.colors.textTertiary 
                      }}>
                        to period
                      </div>
                    </div>
                    
                    <div style={{
                      background: "#34d39920",
                      borderRadius: BRAND.radius.sm,
                      padding: BRAND.spacing.sm,
                      border: "1px solid #34d39940",
                    }}>
                      <div style={{ 
                        ...BRAND.typography.subhead,
                        fontWeight: "700", 
                        color: "#34d399",
                      }}>
                        {daysUntil(getOvulation(profile.lastPeriodStart, profile.cycleLength))}d
                      </div>
                      <div style={{ 
                        ...BRAND.typography.caption2,
                        color: BRAND.colors.textTertiary 
                      }}>
                        to ovulation
                      </div>
                    </div>
                  </div>
                  
                  {/* Symptom Preview */}
                  {(profile.symptoms || []).length > 0 && (
                    <div style={{ 
                      display: "flex", 
                      gap: BRAND.spacing.xs, 
                      flexWrap: "wrap", 
                      marginTop: BRAND.spacing.sm,
                    }}>
                      {(profile.symptoms || []).slice(0, 3).map(s => (
                        <span
                          key={s}
                          style={{
                            background: `${PD.color}20`,
                            border: `1px solid ${PD.color}40`,
                            borderRadius: BRAND.radius.pill,
                            padding: `${BRAND.spacing.xs}px ${BRAND.spacing.sm}px`,
                            ...BRAND.typography.caption2,
                            color: PD.color,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                      {(profile.symptoms || []).length > 3 && (
                        <span style={{ 
                          ...BRAND.typography.caption2,
                          color: BRAND.colors.textTertiary 
                        }}>
                          +{(profile.symptoms || []).length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Login (Mobile First) ──────────────────────────────────────────────────

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const safeArea = useSafeArea();

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: BRAND.colors.background, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      fontFamily: BRAND.fonts.body, 
      position: "relative", 
      padding: `${safeArea.top}px ${BRAND.spacing.md}px ${safeArea.bottom}px`,
    }}>
      <style>{animations}</style>
      <BgDecor phase="luteal" />
      
      <Card color={BRAND.colors.primary} elevated style={{ 
        width: "100%", 
        maxWidth: 400, 
        padding: BRAND.spacing.xl,
        textAlign: "center",
      }}>
        <div style={{ 
          fontSize: 72, 
          marginBottom: BRAND.spacing.md,
          animation: "slideDown 0.5s ease",
        }}>
          🌙
        </div>
        
        <h1 style={{ 
          ...BRAND.typography.title1,
          margin: `0 0 ${BRAND.spacing.xs}px`,
          background: `linear-gradient(135deg, ${BRAND.colors.primary}, ${BRAND.colors.secondary})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Luna
        </h1>
        
        <p style={{ 
          ...BRAND.typography.body,
          color: BRAND.colors.textSecondary, 
          marginBottom: BRAND.spacing.xl,
        }}>
          Understand her rhythm
        </p>

        <input
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
          placeholder="Username"
          onKeyDown={e => e.key === "Enter" && form.username && onLogin(form.username)}
          style={{
            width: "100%",
            background: BRAND.colors.background,
            border: `1px solid ${BRAND.colors.divider}`,
            borderRadius: BRAND.radius.md,
            padding: BRAND.spacing.md,
            color: BRAND.colors.text,
            ...BRAND.typography.body,
            outline: "none",
            marginBottom: BRAND.spacing.sm,
          }}
        />
        
        <input
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          placeholder="Password (optional)"
          style={{
            width: "100%",
            background: BRAND.colors.background,
            border: `1px solid ${BRAND.colors.divider}`,
            borderRadius: BRAND.radius.md,
            padding: BRAND.spacing.md,
            color: BRAND.colors.text,
            ...BRAND.typography.body,
            outline: "none",
            marginBottom: BRAND.spacing.lg,
          }}
        />
        
        <Button
          variant="primary"
          onClick={() => form.username && onLogin(form.username)}
          disabled={!form.username}
          fullWidth
          size="lg"
        >
          Enter Luna
        </Button>
        
        <p style={{ 
          ...BRAND.typography.caption2,
          color: BRAND.colors.textTertiary, 
          marginTop: BRAND.spacing.lg, 
          marginBottom: 0,
        }}>
          All data stored locally on your device
        </p>
      </Card>
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
