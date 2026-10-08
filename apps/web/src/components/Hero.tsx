import type { ContentItem } from "../api.ts";

interface HeroProps {
  title: ContentItem;
  onOpen: (id: string) => void;
}

export function Hero({ title, onOpen }: HeroProps) {
  return (
    <div className="hero">
      <img className="hero-bg" src={title.video_url ?? undefined} alt={title.title} />
      <div className="hero-vignette" />
      <div className="hero-content">
        <span className="pill">{title.kind === "series" ? "StreamForge Original Series" : "StreamForge Original Film"}</span>
        <h1>
          <em>{title.title.split(" ")[0]}</em> {title.title.split(" ").slice(1).join(" ")}
        </h1>
        <div className="meta">
          <span className="pill-badge">{title.year ?? ""}</span>
          {(title.genres ?? []).map((g) => (
            <span key={g} className="pill-badge">{g}</span>
          ))}
          {title.rating != null && <span className="pill-badge">★ {title.rating.toFixed(1)}</span>}
          {title.maturity && <span className="pill-badge">{title.maturity}</span>}
        </div>
        <p style={{ color: "var(--muted)", maxWidth: 520, lineHeight: 1.5 }}>
          {title.synopsis}
        </p>
        <div className="actions">
          <button className="btn btn-brand" onClick={() => onOpen(title.id)}>▶ Play</button>
        </div>
      </div>
    </div>
  );
}