/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils"
import type { DocumentItem } from "@/registry/frieda/lib/data"

const ink = "#2b2b2b"
const soft = "#6b6b6b"

function Row({ y, label, value, x = 14 }: { y: number; label: string; value: string; x?: number }) {
  return (
    <>
      <text x={x} y={y} fontSize="3.3" fill={ink}>
        {label}
      </text>
      <text x={x + 34} y={y} fontSize="3.3" fill={ink}>
        {value}
      </text>
    </>
  )
}

function Table({ y, title, rows }: { y: number; title: string; rows: [string, string][] }) {
  return (
    <g>
      <rect x="14" y={y} width="182" height="5.5" fill="#d9d9d9" stroke={ink} strokeWidth="0.3" />
      <text x="90" y={y + 3.9} fontSize="3.3" fontWeight="600" fill={ink} textAnchor="middle">
        {title}
      </text>
      <line x1="180" x2="180" y1={y} y2={y + 5.5 + rows.length * 5 + 6} stroke={ink} strokeWidth="0.3" />
      <text x="188" y={y + 3.9} fontSize="3.3" fontWeight="600" fill={ink} textAnchor="middle">
        Amount
      </text>
      <rect x="14" y={y + 5.5} width="182" height={rows.length * 5 + 6} fill="none" stroke={ink} strokeWidth="0.3" />
      {rows.map(([label, value], i) => (
        <g key={label}>
          <text x="16" y={y + 10 + i * 5} fontSize="3.1" fill={ink}>
            {label}
          </text>
          <text x="194" y={y + 10 + i * 5} fontSize="3.1" fill={ink} textAnchor="end">
            {value}
          </text>
        </g>
      ))}
    </g>
  )
}

function Payslip({ title }: { title: string }) {
  return (
    <>
      <text x="105" y="10" fontSize="4.4" fontWeight="600" fill={ink} textAnchor="middle">
        {title}
      </text>
      {["Frieda Inc", "21023 Pearson Point Road", "Gateway Avenue"].map((line, i) => (
        <text key={line} x="105" y={16 + i * 4.4} fontSize="3.2" fill={ink} textAnchor="middle">
          {line}
        </text>
      ))}
      <Row y={38} label="Date of Joining" value=": 2018-06-23" />
      <Row y={42.5} label="Pay Period" value=": August 2021" />
      <Row y={47} label="Worked Days" value=": 26" />
      <Row y={38} x={112} label="Employee name" value=": Sally Harley" />
      <Row y={42.5} x={112} label="Designation" value=": Marketing Executive" />
      <Row y={47} x={112} label="Department" value=": Marketing" />
      <Table
        y={57}
        title="Earnings"
        rows={[
          ["Basic", "10000"],
          ["Incentive Pay", "1000"],
          ["House Rent Allowance", "400"],
          ["Meal Allowance", "200"],
        ]}
      />
      <text x="176" y="88.5" fontSize="3" fill={ink} textAnchor="end">
        Total Earnings
      </text>
      <text x="194" y="88.5" fontSize="3" fill={ink} textAnchor="end">
        11600
      </text>
      <Table
        y={95}
        title="Deductions"
        rows={[
          ["Provident Fund", "1200"],
          ["Professional Tax", "500"],
          ["Loan", "400"],
        ]}
      />
    </>
  )
}

function Agreement({ title }: { title: string }) {
  const widths = [178, 182, 170, 182, 176, 158, 182, 174, 182, 166, 180, 182, 150, 182, 176, 182, 164]
  return (
    <>
      <text x="105" y="13" fontSize="5.4" fontWeight="700" fontFamily="Georgia, serif" fill={ink} textAnchor="middle">
        {title}
      </text>
      {widths.map((w, i) => (
        <rect
          key={i}
          x="14"
          y={22 + i * 7.2 + (i > 5 ? 4 : 0) + (i > 11 ? 4 : 0)}
          width={w}
          height="1.9"
          rx="0.6"
          fill={i % 6 === 0 ? soft : "#9a9a9a"}
        />
      ))}
    </>
  )
}

function GenericFile({ name }: { name: string }) {
  const ext = name.split(".").pop()?.slice(0, 4).toUpperCase() ?? "FILE"
  return (
    <>
      <rect x="85" y="30" width="40" height="50" rx="4" fill="#efefef" stroke="#cfcfcf" />
      <text x="105" y="60" fontSize="9" fontWeight="700" fill="#0a8f81" textAnchor="middle">
        {ext}
      </text>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="40" y={96 + i * 8} width={130 - i * 18} height="2.4" rx="1" fill="#c4c4c4" />
      ))}
    </>
  )
}

/** White paper preview used for document cards. Crops at the bottom like a scan. */
export function DocThumb({ doc, className }: { doc: Pick<DocumentItem, "kind" | "name" | "url" | "mime">; className?: string }) {
  if (doc.url && doc.mime?.startsWith("image/")) {
    return <img src={doc.url} alt="" className={cn("aspect-[210/150] w-full bg-white object-cover object-top", className)} />
  }
  return (
    <svg viewBox="0 0 210 150" className={cn("w-full bg-white", className)} aria-hidden>
      {doc.kind === "payslip" && <Payslip title="Payslip" />}
      {doc.kind === "invoice" && <Payslip title="Salary Invoice" />}
      {doc.kind === "agreement" && <Agreement title={doc.name} />}
      {doc.kind === "file" && <GenericFile name={doc.name} />}
    </svg>
  )
}
