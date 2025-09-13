import { authOptions } from "@/lib/auth";
import BuyerTable from "@/lib/components/BuyerTable";
import ImportCSV from "@/lib/components/ImportCSV";
import ExportCSVLink from "@/lib/components/ExportCSVLink";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ErrorBoundary from "@/lib/components/ErrorBoundary"; // � import error boundary

type BuyersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BuyersPage({ searchParams }: BuyersPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Server-side fetch initial page respecting filters/search/sort
  const params = new URLSearchParams();
  const sp = await searchParams;
  const getParam = (k: string) => {
    const v = sp?.[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const keys = ["search", "city", "propertyType", "status", "timeline", "page"] as const;
  keys.forEach((k) => {
    const v = getParam(k);
    if (v) params.set(k, v);
  });

  const res = await fetch(`/api/buyers?${params.toString()}`, { cache: "no-store" }).catch(() => null);

  let initialItems: any[] = [];
  let initialTotal = 0;
  let page = Number(getParam("page") || 1);
  const limit = 10;
  if (res && res.ok) {
    const data = await res.json();
    initialItems = data.items ?? [];
    initialTotal = data.total ?? 0;
    page = data.page ?? page;
  }

  return (
    <ErrorBoundary>
      <div className="page-wrap space-y-6">
        <div className="card p-4 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Buyer Leads</span>
            <span className="text-sm text-gray-500">Manage, filter and export</span>
          </div>
          <div className="flex items-center gap-2">
            <ExportCSVLink className="btn btn-secondary" />
            <ImportCSV />
          </div>
        </div>

        <div className="card p-2">
          <BuyerTable initialItems={initialItems} initialTotal={initialTotal} initialPage={page} limit={limit} />
        </div>
      </div>
    </ErrorBoundary>
  );
}
