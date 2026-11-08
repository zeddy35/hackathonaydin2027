import { NextResponse, type NextRequest } from "next/server";
import { assertRole, AuthError, STAFF } from "@/lib/auth";
import { DEFAULT_COLUMNS, EXPORT_COLUMNS, MLH_COLUMNS, toCsv, type ExportRow } from "@/lib/export";

export const dynamic = "force-dynamic";

/**
 * CSV export (admins only).
 *   ?cols=a,b,c&status=accepted,confirmed   chosen columns
 *   ?preset=mlh        MLH registration fields, only people who ticked the MLH sharing box
 *   ?preset=marketing  announcement list, only people who opted in
 */
export async function GET(req: NextRequest) {
  let supabase;
  try {
    ({ supabase } = await assertRole(STAFF));
  } catch (e) {
    if (e instanceof AuthError) return new NextResponse("Forbidden", { status: 403 });
    throw e;
  }
  const sp = req.nextUrl.searchParams;
  const preset = sp.get("preset");
  const list = (k: string) => sp.getAll(k).flatMap((v) => v.split(",")).filter(Boolean);
  const statuses = list("status");

  let q = supabase
    .from("applications")
    .select("id, user_id, status, answers, consents, submitted_at, checked_in_at, is_minor, wants_match")
    .neq("status", "draft")
    .order("submitted_at");
  if (statuses.length) q = q.in("status", statuses);
  const [{ data: apps, error }, { data: profiles }, { data: members }] = await Promise.all([
    q,
    supabase.from("profiles").select("id, email"),
    supabase.from("team_members").select("user_id, teams(name)"),
  ]);
  if (error) return new NextResponse("Export failed", { status: 500 });

  const rows: ExportRow[] = (apps ?? []).map((r) => ({
    id: r.id,
    status: r.status,
    submitted_at: r.submitted_at,
    checked_in_at: r.checked_in_at,
    is_minor: r.is_minor,
    wants_match: r.wants_match,
    email: profiles?.find((p) => p.id === r.user_id)?.email ?? "",
    answers: (r.answers ?? {}) as ExportRow["answers"],
    consents: (r.consents ?? {}) as ExportRow["consents"],
    team: (members?.find((m) => m.user_id === r.user_id)?.teams as unknown as { name: string } | null)?.name ?? "",
  }));

  let csv: string;
  let name: string;
  if (preset === "mlh") {
    const list = rows.filter((r) => r.consents.mlh_share?.accepted);
    csv = toCsv(MLH_COLUMNS.map((c) => c.label), list.map((r) => MLH_COLUMNS.map((c) => c.get(r))));
    name = "mlh-registrations";
  } else if (preset === "marketing") {
    const list = rows.filter((r) => r.consents.marketing?.accepted);
    csv = toCsv(["E-posta", "Ad", "İzin zamanı"], list.map((r) => [r.email, String(r.answers.first_name ?? ""), r.consents.marketing?.at ?? ""]));
    name = "duyuru-listesi";
  } else {
    const wanted = list("cols");
    const cols = EXPORT_COLUMNS.filter((c) => (wanted.length ? wanted : DEFAULT_COLUMNS).includes(c.key));
    csv = toCsv(cols.map((c) => c.label), rows.map((r) => cols.map((c) => c.get(r))));
    name = "basvurular";
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
