import { useEffect, useRef, useState } from "react";
import { api, type ContentItem } from "./api.ts";
import { Card } from "./components/Card.tsx";

interface WatchPageProps {
  id: string;
  onOpen: (id: string) => void;
  onBack: () => void;
}

export function WatchPage({ id, onOpen, onBack }: WatchPageProps) {
  const [item, setItem] = useState<(ContentItem & { related: ContentItem[] }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sound, setSound] = useState(false);
  const [inList, setInList] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .content(id)
      .then((r) => alive && setItem(r.data))
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)));
    api
      .watchlist()
      .then((r) => alive && setInList(r.data.some((x) => x.id === id)))
      .catch(() => {});
    api
      .favorites()
      .then((r) => alive && setFavorite(r.data.some((x) => x.id === id)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id]);

  // tiny ambient synth soundtrack (Web Audio, zero assets)
  function toggleSound() {
    if (sound) {
      audioRef.current?.close();
      audioRef.current = null;
      setSound(false);
      return;
    }
    const ctx = new AudioContext();
    audioRef.current = ctx;
    const dur = 8;
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * dur);
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    const pon = (freq: number, t0: number, l: number, a: number) => {
      const s = Math.floor(t0 * sr), e = Math.min(len, s + Math.floor(l * sr));
      for (let i = s; i < e; i++) {
        const t = (i - s) / sr;
        data[i]! += Math.sin(2 * Math.PI * freq * (t + t0)) * Math.exp(-3 * t) * a;
      }
    };
    for (let i = 0; i < len; i++) {
      data[i]! += Math.sin(2 * Math.PI * 130.81 * (i / sr)) * 0.05;
    }
    const arp = [261.63, 329.63, 392.0, 523.25];
    for (let i = 0; i < arp.length * 4; i++) pon(arp[i % arp.length]!, (i * 0.25) % dur, 0.35, 0.09);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(ctx.destination);
    src.start();
    setSound(true);
  }

  if (error) return <div className="error">{error}</div>;
  if (!item) return <div className="spinner">Loading…</div>;

  async function toggleList() {
    if (inList) await api.removeWatchlist(id).catch(() => {});
    else await api.addWatchlist(id).catch(() => {});
    setInList(!inList);
  }

  async function toggleFavorite() {
    if (favorite) await api.removeFavorite(id).catch(() => {});
    else await api.addFavorite(id).catch(() => {});
    setFavorite(!favorite);
  }

  return (
    <div className="watch">
      <div className="watch-top">
        <button className="back" onClick={onBack}>← Back</button>
        <span className="nav-brand" onClick={onBack} style={{ cursor: "pointer" }}>StreamForge</span>
      </div>
      <div className="watch-stage">
        <h1>{item.title}</h1>
        <div className="detail-actions">
          <button className="btn btn-ghost" onClick={toggleList}>{inList ? "✕ Remove from My List" : "+ Add to My List"}</button>
          <button className="btn btn-ghost" onClick={toggleFavorite}>{favorite ? "♥ Favorited" : "♡ Favorite"}</button>
        </div>
        <div className="meta">
          {item.year && <span className="pill-badge">{item.year}</span>}
          {item.rating != null && <span className="pill-badge">★ {item.rating.toFixed(1)}</span>}
          {item.maturity && <span className="pill-badge">{item.maturity}</span>}
          {item.duration_min && <span className="pill-badge">{item.duration_min} min</span>}
        </div>
        <div className="player">
          {item.video_url ? (
            <>
              <img src={item.video_url} alt={item.title} />
              <button className="btn btn-ghost" onClick={toggleSound} style={{ position: "absolute", bottom: "1rem", right: "1rem", background: "rgba(0,0,0,0.7)" }}>
                {sound ? "🔇 Mute soundtrack" : "🔊 Play soundtrack"}
              </button>
            </>
          ) : (
            <span style={{ color: "var(--muted)" }}>Preview not generated</span>
          )}
        </div>
        <p style={{ maxWidth: 640, lineHeight: 1.6, color: "var(--muted)" }}>{item.synopsis}</p>
        <div className="detail-actions">
          {item.genres.map((g) => (
            <span key={g} className="pill-badge">{g}</span>
          ))}
        </div>
        {item.related.length > 0 && (
          <>
            <h2 className="row-title">More Like This</h2>
            <div className="related">
              {item.related.map((r) => (
                <Card key={r.id} item={r} onOpen={onOpen} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}