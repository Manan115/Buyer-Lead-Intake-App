import React from "react";

type HistoryRow = {
  id: string;
  changedAt: string | Date;
  changedBy: string | null;
  diff: string | Record<string, { old: any; new: any }>;
};

const labels: Record<string, string> = {
  fullName: "Name",
  email: "Email",
  phone: "Phone",
  city: "City",
  propertyType: "Property Type",
  bhk: "BHK",
  purpose: "Purpose",
  budgetMin: "Budget Min",
  budgetMax: "Budget Max",
  timeline: "Timeline",
  source: "Source",
  status: "Status",
  notes: "Notes",
  tags: "Tags",
};

function formatINR(n: any) {
  if (n === null || n === undefined || n === "" || isNaN(Number(n))) return "—";
  try {
    return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(n))}`;
  } catch {
    return `₹${n}`;
  }
}

function formatValue(field: string, v: any): string {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  if (typeof v === "object") return JSON.stringify(v);
  if (["budgetMin", "budgetMax"].includes(field)) return formatINR(v);
  return String(v);
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

export default function RecentChanges({ history }: { history: HistoryRow[] }) {
  if (!Array.isArray(history) || history.length === 0) {
    return (
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ color: "var(--muted)", fontSize: 14 }}>No recent changes</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
      {history.map((h) => {
        const diffObj =
          typeof h.diff === "string" ? safeJson(h.diff) : (h.diff as Record<string, { old: any; new: any }>);
        const entries = Object.entries(diffObj || {});
        const when = new Date(h.changedAt);
        return (
          <div className="card" key={h.id}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Recent Change</div>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>
                {when.toLocaleString()}
                {h.changedBy ? ` · by ${h.changedBy}` : ""}
              </div>
            </div>
            {entries.length === 0 ? (
              <div style={{ color: "var(--muted)", fontSize: 14 }}>No field-level changes</div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {entries.length > 8 ? (
                  <li style={{ marginBottom: 4, fontWeight: 600 }}>
                    Lead created
                  </li>
                ) : (
                  entries.map(([field, change]) => {
                    // Skip noisy diffs where old and new are effectively the same stringified value
                    const oldV = (change as any).old;
                    const newV = (change as any).new;
                    if (JSON.stringify(oldV) === JSON.stringify(newV)) return null;
                    return (
                      <li key={field} style={{ marginBottom: 6 }}>
                        <strong>{labels[field] ?? field}:</strong>{" "}
                        <span>{formatValue(field, oldV)}</span>{" "}
                        <span style={{ color: "var(--muted)", fontWeight: 700 }}>→</span>{" "}
                        <span style={{ fontWeight: 600 }}>{formatValue(field, newV)}</span>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}