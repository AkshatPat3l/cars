import type { ContentItem } from "../api.ts";

interface CardProps {
  item: ContentItem;
  onOpen: (id: string) => void;
}

export function Card({ item, onOpen }: CardProps) {
  return (
    <div className="card" onClick={() => onOpen(item.id)}>
      <img src={item.video_url ?? undefined} alt={item.title} loading="lazy" />
      <div className="card-body">
        <div className="card-title">{item.title}</div>
        <div className="card-meta">
          <span>{item.year ?? "—"}</span>
          <span>{item.rating != null ? "★ " + item.rating.toFixed(1) : ""}</span>
        </div>
      </div>
      <div className="card-hover">
        <span className="badge">{item.kind === "series" ? "SERIES" : "MOVIE"}</span>
        <h4>{item.title}</h4>
        <p>{item.synopsis ?? ""}</p>
      </div>
    </div>
  );
}