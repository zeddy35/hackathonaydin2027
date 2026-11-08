import { STATUS_LABEL, STATUS_TONE } from "./labels";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded border px-2 py-0.5 text-[12px] font-semibold ${STATUS_TONE[status] ?? "border-rule"}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function Flag({ children, tone = "warn" }: { children: React.ReactNode; tone?: "warn" | "muted" }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded border px-2 py-0.5 text-[12px] font-semibold ${
        tone === "warn" ? "border-accent/40 bg-accent-tint text-accent" : "border-rule text-muted"
      }`}
    >
      {children}
    </span>
  );
}
