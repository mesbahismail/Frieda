/** Client-side file helpers so demo "Download" buttons produce real files. */

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadCsv(rows: (string | number)[][], filename: string) {
  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), filename)
}

/** Builds a one-page PDF with plain text lines (no dependencies). */
export function makePdf(title: string, lines: string[]) {
  const escape = (s: string) => s.replace(/[\\()]/g, (c) => `\\${c}`).replace(/[^\x20-\x7e]/g, "-")
  const body = [
    "BT",
    "/F1 20 Tf",
    "56 780 Td",
    `(${escape(title)}) Tj`,
    "/F1 11 Tf",
    "0 -32 Td",
    ...lines.flatMap((line) => [`(${escape(line)}) Tj`, "0 -18 Td"]),
    "ET",
  ].join("\n")

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${body.length} >>\nstream\n${body}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ]

  let pdf = "%PDF-1.4\n"
  const offsets: number[] = []
  objects.forEach((obj, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new Blob([pdf], { type: "application/pdf" })
}
