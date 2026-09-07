import { useCallback, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Stroke = { color: string; width: number; dashed: boolean; points: Point[] };

const W = 640;
const H = 400;

const PENS = [
  { key: "offense", label: "Offense", color: "#22d3ee", dashed: false },
  { key: "defense", label: "Defense", color: "#f87171", dashed: false },
  { key: "ball", label: "Pass", color: "#fbbf24", dashed: true },
  { key: "movement", label: "Movement", color: "#e2e8f0", dashed: true },
] as const;

function drawCourt(ctx: CanvasRenderingContext2D, sport: string) {
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(148,163,184,0.55)";
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.strokeRect(24, 24, W - 48, H - 48);
  ctx.beginPath();
  ctx.moveTo(W / 2, 24);
  ctx.lineTo(W / 2, H - 24);
  ctx.stroke();

  if (sport === "Volleyball") {
    ctx.setLineDash([6, 6]);
    [W / 2 - 90, W / 2 + 90].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, 24);
      ctx.lineTo(x, H - 24);
      ctx.stroke();
    });
    ctx.setLineDash([]);
    return;
  }

  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 46, 0, Math.PI * 2);
  ctx.stroke();

  if (sport === "Football") {
    [24, W - 24].forEach((x, i) => {
      const dir = i === 0 ? 1 : -1;
      ctx.strokeRect(x, H / 2 - 80, dir * 90, 160);
      ctx.strokeRect(x, H / 2 - 40, dir * 36, 80);
    });
    return;
  }

  // Basketball: keys, free-throw circles, three-point arcs
  [24, W - 24].forEach((x, i) => {
    const dir = i === 0 ? 1 : -1;
    ctx.strokeRect(x, H / 2 - 60, dir * 110, 120);
    ctx.beginPath();
    ctx.arc(x + dir * 110, H / 2, 40, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + dir * 34, H / 2, 150, i === 0 ? -Math.PI / 2.3 : Math.PI / 1.78, i === 0 ? Math.PI / 2.3 : Math.PI * 1.44);
    ctx.stroke();
  });
}

export function DrawingBoard({
  value,
  onChange,
  sport = "Basketball",
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  sport?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [pen, setPen] = useState<(typeof PENS)[number]>(PENS[0]);
  const drawing = useRef(false);
  const loaded = useRef(false);

  const redraw = useCallback(
    (list: Stroke[]) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;
      drawCourt(ctx, sport);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      list.forEach((s) => {
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width;
        ctx.setLineDash(s.dashed ? [10, 8] : []);
        ctx.beginPath();
        s.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
      });
      ctx.setLineDash([]);
    },
    [sport],
  );

  // Restore a saved drawing once, as a background image behind new strokes.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    if (value && !loaded.current) {
      loaded.current = true;
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, W, H);
      img.src = value;
      return;
    }
    if (!value) redraw(strokes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, redraw]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    setStrokes((prev) => [
      ...prev,
      { color: pen.color, width: 3, dashed: pen.dashed, points: [pos(e)] },
    ]);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const p = pos(e);
    setStrokes((prev) => {
      const next = prev.slice();
      const last = next[next.length - 1];
      if (last) next[next.length - 1] = { ...last, points: [...last.points, p] };
      redrawWithBase(next);
      return next;
    });
  }

  function redrawWithBase(list: Stroke[]) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    if (value) {
      const img = new Image();
      img.src = value;
      drawCourt(ctx, sport);
      if (img.complete) ctx.drawImage(img, 0, 0, W, H);
    } else {
      drawCourt(ctx, sport);
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    list.forEach((s) => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.setLineDash(s.dashed ? [10, 8] : []);
      ctx.beginPath();
      s.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  }

  function undo() {
    setStrokes((prev) => {
      const next = prev.slice(0, -1);
      redrawWithBase(next);
      const canvas = canvasRef.current;
      if (canvas) onChange(next.length || value ? canvas.toDataURL("image/png") : null);
      return next;
    });
  }

  function clear() {
    loaded.current = true;
    setStrokes([]);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawCourt(ctx, sport);
    onChange(null);
  }

  return (
    <div className="rounded-md bg-ink-850 p-2 ring-1 ring-ink-700">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {PENS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPen(p)}
            className={`flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest ring-1 ${
              pen.key === p.key ? "bg-ink-900 text-ink-100 ring-court-500" : "text-ink-300 ring-ink-700"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.label}
          </button>
        ))}
        <span className="ml-auto flex gap-1.5">
          <button
            type="button"
            onClick={undo}
            className="rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-300 ring-1 ring-ink-700"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={clear}
            className="rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-bad ring-1 ring-ink-700"
          >
            Clear
          </button>
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="w-full touch-none rounded bg-[#0b1220]"
        style={{ aspectRatio: `${W} / ${H}` }}
      />
      <div className="mt-1.5 font-mono text-[10px] text-ink-400">
        Draw the drill with your finger or mouse — it saves automatically.
      </div>
    </div>
  );
}
