import { layoutFormForPdf } from "./formPdfLayout.js";

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * HTML להדפסה / "שמירה כ־PDF" מהדפדפן — עברית RTL, ללא ספריית PDF.
 */
export function buildPrintHtml(schema, data) {
  const layout = layoutFormForPdf(schema, data);
  if (layout.error) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>${escapeHtml(layout.error)}</body></html>`;
  }
  const chunks = [];
  for (const s of layout.sections || []) {
    if (s.type === "title") {
      chunks.push(`<h1 style="font-size:18px">${escapeHtml(s.text)}</h1>`);
    } else if (s.type === "meta") {
      chunks.push(`<div class="meta">${escapeHtml(s.text)}</div>`);
    } else if (s.type === "note") {
      chunks.push(`<p class="note">${escapeHtml(s.text)}</p>`);
    } else if (s.type === "field") {
      chunks.push(
        `<p><strong>${escapeHtml(s.label)}</strong> ${escapeHtml(s.value)}</p>`
      );
    } else if (s.type === "table") {
      const rows = s.rows || [];
      chunks.push("<table>");
      for (let i = 0; i < rows.length; i++) {
        chunks.push("<tr>");
        const tag = i === 0 ? "th" : "td";
        for (const cell of rows[i]) {
          chunks.push(
            `<${tag} style="vertical-align:top">${escapeHtml(cell)}</${tag}>`
          );
        }
        chunks.push("</tr>");
      }
      chunks.push("</table>");
    } else if (s.type === "signature" && s.dataUrl) {
      const src = /^data:image\/(png|jpeg);base64,/i.test(s.dataUrl)
        ? s.dataUrl
        : "";
      if (src) {
        chunks.push(
          `<p><strong>${escapeHtml(s.label)}</strong></p><img src="${src}" alt="" style="max-height:120px;border:1px solid #ccc"/>`
        );
      }
    }
  }
  const body = chunks.join("\n");
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(schema.title || "טופס")}</title>
  <style>
    body { font-family: Arial, "Segoe UI", Tahoma, sans-serif; padding: 16px; }
    table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 11px; }
    th, td { border: 1px solid #333; padding: 6px; text-align: right; }
    th { background: #f0f0f0; }
    .meta { color: #444; font-size: 13px; }
    .note { font-size: 12px; color: #333; }
  </style>
</head>
<body>
${body}
<script>window.onload=function(){/* window.print(); */}</script>
</body>
</html>`;
}
