interface Props {
  code: number;
  isDay?: boolean;
  className?: string;
  animate?: boolean;
}

function Sun({ className, animate }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <circle cx="32" cy="32" r="11" fill="url(#sunGrad)" className={animate ? "animate-float" : undefined} />
      <g
        stroke="#F59E0B"
        strokeWidth="3.2"
        strokeLinecap="round"
        className={animate ? "animate-spin-slow" : undefined}
        style={{ transformOrigin: "32px 32px" }}
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="32"
            y1="12"
            x2="32"
            y2="18"
            transform={`rotate(${deg} 32 32)`}
          />
        ))}
      </g>
      <defs>
        <linearGradient id="sunGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Moon({ className, animate }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <path
        d="M40 44a17 17 0 0 1-14.6-25.6A18 18 0 1 0 46 41.5c-1.9 1.6-3.9 2.5-6 2.5z"
        fill="url(#moonGrad)"
        className={animate ? "animate-float" : undefined}
      />
      <circle cx="46" cy="18" r="1.6" fill="#E2E8F0" className="animate-twinkle" />
      <circle cx="52" cy="26" r="1.2" fill="#CBD5E1" className="animate-twinkle" style={{ animationDelay: "1.2s" }} />
      <circle cx="41" cy="10" r="1" fill="#CBD5E1" className="animate-twinkle" style={{ animationDelay: "2.1s" }} />
      <defs>
        <linearGradient id="moonGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#C7D2FE" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Cloud({ className, animate, tint }: { className?: string; animate?: boolean; tint?: "light" | "grey" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <path
        d="M18 46h28a9.5 9.5 0 0 0 1.8-18.8A14 14 0 0 0 20.5 24 9 9 0 0 0 18 46z"
        fill={tint === "grey" ? "url(#cloudGrey)" : "url(#cloudWhite)"}
        className={animate ? "animate-float-slow" : undefined}
      />
      <defs>
        <linearGradient id="cloudWhite" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        <linearGradient id="cloudGrey" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function CloudSun({ className, animate }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <circle cx="40" cy="20" r="8" fill="url(#sunGrad2)" />
      <g stroke="#F59E0B" strokeWidth="2.6" strokeLinecap="round" className={animate ? "animate-spin-slow" : undefined} style={{ transformOrigin: "40px 20px" }}>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <line key={deg} x1="40" y1="5" x2="40" y2="9" transform={`rotate(${deg} 40 20)`} />
        ))}
      </g>
      <path d="M14 50h26a8.5 8.5 0 0 0 1.6-16.9A12.5 12.5 0 0 0 18.5 30 8 8 0 0 0 14 50z" fill="url(#cloudWhite2)" className={animate ? "animate-float" : undefined} />
      <defs>
        <linearGradient id="sunGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="cloudWhite2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Rain({ className, animate, heavy }: { className?: string; animate?: boolean; heavy?: boolean }) {
  const drops = heavy ? [22, 32, 42] : [26, 38];
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <path d="M16 38h30a9 9 0 0 0 1.7-17.9A13.5 13.5 0 0 0 21.5 17 8.6 8.6 0 0 0 16 38z" fill="url(#cloudGrey2)" className={animate ? "animate-float" : undefined} />
      {drops.map((x, i) => (
        <line
          key={x}
          x1={x}
          y1="42"
          x2={x - 2}
          y2="52"
          stroke="#38BDF8"
          strokeWidth="3"
          strokeLinecap="round"
          className={animate ? "animate-bounce" : undefined}
          style={{ animationDelay: `${i * 0.18}s`, animationDuration: "1.1s" }}
        />
      ))}
      <defs>
        <linearGradient id="cloudGrey2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Snow({ className, animate }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <path d="M16 38h30a9 9 0 0 0 1.7-17.9A13.5 13.5 0 0 0 21.5 17 8.6 8.6 0 0 0 16 38z" fill="#E2E8F0" className={animate ? "animate-float" : undefined} />
      {[
        [24, 46],
        [36, 50],
        [44, 44],
      ].map(([x, y], i) => (
        <g key={`${x}-${y}`} className={animate ? "animate-twinkle" : undefined} style={{ animationDelay: `${i * 0.5}s` }}>
          <circle cx={x} cy={y} r="2.4" fill="#93C5FD" />
        </g>
      ))}
    </svg>
  );
}

function Storm({ className, animate }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <path d="M16 36h30a9 9 0 0 0 1.7-17.9A13.5 13.5 0 0 0 21.5 15 8.6 8.6 0 0 0 16 36z" fill="#64748B" className={animate ? "animate-float" : undefined} />
      <path d="M34 36l-8 12h6l-4 10 12-14h-7l5-8z" fill="#FBBF24" className={animate ? "animate-twinkle" : undefined} />
    </svg>
  );
}

function Fog({ className, animate }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <path d="M16 32h30a9 9 0 0 0 1.7-17.9A13.5 13.5 0 0 0 21.5 11 8.6 8.6 0 0 0 16 32z" fill="url(#cloudGrey3)" />
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1="14"
          y1={40 + i * 7}
          x2="50"
          y2={40 + i * 7}
          stroke="#94A3B8"
          strokeWidth="3.4"
          strokeLinecap="round"
          opacity={0.85 - i * 0.2}
          className={animate ? "animate-float" : undefined}
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
      <defs>
        <linearGradient id="cloudGrey3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Drizzle({ className, animate }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <path d="M16 38h30a9 9 0 0 0 1.7-17.9A13.5 13.5 0 0 0 21.5 17 8.6 8.6 0 0 0 16 38z" fill="url(#cloudGrey4)" className={animate ? "animate-float" : undefined} />
      {[25, 34, 43].map((x, i) => (
        <circle key={x} cx={x} cy={45 + (i % 2) * 4} r="1.8" fill="#38BDF8" className={animate ? "animate-twinkle" : undefined} style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
      <defs>
        <linearGradient id="cloudGrey4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function IconFor({ code, isDay, className, animate }: Props) {
  const a = animate ?? true;
  if (code === 0 || code === 1) return isDay ? <Sun className={className} animate={a} /> : <Moon className={className} animate={a} />;
  if (code === 2) return <CloudSun className={className} animate={a} />;
  if (code === 3) return <Cloud className={className} animate={a} tint="grey" />;
  if (code === 45 || code === 48) return <Fog className={className} animate={a} />;
  if (code >= 51 && code <= 57) return <Drizzle className={className} animate={a} />;
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return <Rain className={className} animate={a} heavy={code >= 63} />;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return <Snow className={className} animate={a} />;
  if (code >= 95) return <Storm className={className} animate={a} />;
  return <Cloud className={className} animate={a} />;
}

export default function WeatherIcon(props: Props) {
  return <IconFor {...props} />;
}
