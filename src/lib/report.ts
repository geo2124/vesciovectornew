/**
 * Report exports. CSV for spreadsheets, PDF through the browser's own print
 * engine (no extra library, and the user picks "Save as PDF").
 */
export function downloadCsv(filename: string, columns: string[], rows: string[][]) {
  const all = [columns, ...rows];
  const csv = all
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const esc = (v: string) =>
  String(v ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c);

export function exportPdf(options: {
  title: string;
  subtitle?: string;
  academy?: string;
  logo?: string | null;
  columns: string[];
  rows: string[][];
  summary?: { label: string; value: string }[];
}) {
  const { title, subtitle, academy, logo, columns, rows, summary = [] } = options;
  const printed = new Date().toLocaleString();
  const html = `<!doctype html><html><head><meta charset="utf-8" />
<title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; color: #14232a; margin: 32px; }
  header { display: flex; align-items: center; gap: 14px; border-bottom: 2px solid #127d75; padding-bottom: 12px; }
  header img { height: 40px; }
  h1 { font-size: 18px; margin: 0; }
  .meta { font-size: 11px; color: #5b7078; margin-top: 2px; }
  .summary { display: flex; flex-wrap: wrap; gap: 10px; margin: 16px 0; }
  .card { border: 1px solid #dde5e6; border-radius: 6px; padding: 8px 12px; min-width: 130px; }
  .card span { display: block; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: #5b7078; }
  .card strong { font-size: 15px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { text-align: left; background: #f1f6f6; border-bottom: 1px solid #cfdcdd; padding: 7px 8px; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #40575f; }
  td { padding: 7px 8px; border-bottom: 1px solid #eef3f3; }
  tr:nth-child(even) td { background: #fafcfc; }
  footer { margin-top: 18px; font-size: 10px; color: #7b8b91; }
  @media print { body { margin: 12mm; } }
</style></head><body>
<header>
  ${logo ? `<img src="${logo}" alt="" />` : ""}
  <div><h1>${esc(title)}</h1>
  <div class="meta">${esc(academy ?? "")}${subtitle ? ` · ${esc(subtitle)}` : ""} · generated ${esc(printed)}</div></div>
</header>
${summary.length ? `<div class="summary">${summary.map((s) => `<div class="card"><span>${esc(s.label)}</span><strong>${esc(s.value)}</strong></div>`).join("")}</div>` : ""}
<table><thead><tr>${columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>
<footer>${esc(rows.length.toString())} rows · Vescio Vector</footer>
<script>window.onload = () => { window.focus(); window.print(); };</script>
</body></html>`;

  const win = window.open("", "_blank", "width=980,height=760");
  if (!win) {
    window.alert("Allow pop-ups for this site to export the PDF report.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
