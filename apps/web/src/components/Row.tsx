import type { Row as RowType } from "../api.ts";
import { Card } from "./Card.tsx";

interface RowProps {
  row: RowType;
  onOpen: (id: string) => void;
}

export function Row({ row, onOpen }: RowProps) {
  return (
    <section>
      <h2 className="row-title">{row.title}</h2>
      <div className="row-scroll">
        {row.items.map((item) => (
          <Card key={item.id} item={item} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}