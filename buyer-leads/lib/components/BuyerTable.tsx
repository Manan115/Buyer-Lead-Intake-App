"use client";

import Link from "next/link";
import { IconPlus, IconSearch, IconChevronLeft, IconChevronRight, IconEdit, IconEye } from "./ui/Icons";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ErrorBoundary from "@/lib/components/ErrorBoundary";
import TagInput from "@/lib/components/TagInput"; // ✅ Import tag input

type Buyer = {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  city: string;
  propertyType: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  status: string;
  updatedAt: string;
  tags: string[];
  ownerId: string;
};

const STATUSES = [
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
];

// 🔹 Inline status dropdown
function StatusDropdown({ buyer }: { buyer: Buyer }) {
  const [status, setStatus] = useState(buyer.status);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    try {
      await fetch(`/api/buyers/${buyer.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      // rollback if API fails
      setStatus(buyer.status);
    }
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      className="border rounded px-2 py-1 text-sm bg-white"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

export default function BuyerTable({
  initialItems = [],
  initialTotal = 0,
  initialPage = 1,
  limit = 10,
}: {
  initialItems?: Buyer[];
  initialTotal?: number;
  initialPage?: number;
  limit?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  const [buyers, setBuyers] = useState<Buyer[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    propertyType: searchParams.get("propertyType") || "",
    status: searchParams.get("status") || "",
    timeline: searchParams.get("timeline") || "",
  });
  const [page, setPage] = useState<number>(() => {
    const p = parseInt(searchParams.get("page") || String(initialPage), 10);
    return Number.isNaN(p) || p < 1 ? 1 : p;
  });
  const [total, setTotal] = useState<number>(initialTotal);

  // 🔹 Manage tags for new buyer form
  const [tags, setTags] = useState<string[]>([]);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filters.city) params.set("city", filters.city);
    if (filters.propertyType) params.set("propertyType", filters.propertyType);
    if (filters.status) params.set("status", filters.status);
    if (filters.timeline) params.set("timeline", filters.timeline);
    if (page && page > 1) params.set("page", String(page));
    return params.toString();
  }, [search, filters, page]);

  const fetchBuyers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryString = buildQueryParams();
      const res = await fetch(`/api/buyers?${queryString}`);
      if (!res.ok) throw new Error("Failed to fetch buyers");
      const data = await res.json();
      setBuyers(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching buyers:", error);
      setError("Failed to load buyers");
      setBuyers([]);
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  // Debounce URL sync and fetch
  useEffect(() => {
    const t = setTimeout(() => {
      const queryString = buildQueryParams();
      const newUrl = queryString ? `/buyers?${queryString}` : "/buyers";
      router.replace(newUrl);
      fetchBuyers();
    }, 300);
    return () => clearTimeout(t);
  }, [buildQueryParams, router, fetchBuyers]);

  // When search or filters change, reset to page 1
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filters.city, filters.propertyType, filters.status, filters.timeline]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return "-";
    if (min && max)
      return `₹${min.toLocaleString("en-IN")} - ₹${max.toLocaleString("en-IN")}`;
    if (min) return `₹${min.toLocaleString("en-IN")}+`;
    if (max) return `Up to ₹${max.toLocaleString("en-IN")}`;
    return "-";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Demo User",
          phone: "9999999999",
          city: "Chandigarh",
          propertyType: "Apartment",
          timeline: "0-3m",
          status: "New",
          tags, // ✅ ensure tags included
        }),
      });

      if (res.ok) {
        fetchBuyers();
        setTags([]);
      }
    } catch (err) {
      console.error("Failed to submit buyer:", err);
    }
  };

  if (sessionStatus === "loading") {
    return <p className="p-6 text-center">Loading session...</p>;
  }

  return (
    <div className="page-wrap">
      <div className="card" style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Buyers</h1>
        <Link href="/buyers/new" className="btn btn-primary">
          <IconPlus /> Add New Lead
        </Link>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        {/* Search + Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 240px", minWidth: 220 }}>
            <IconSearch style={{ position: "absolute", left: 10, top: 10, opacity: 0.6 }} />
            <input
              className="input"
              style={{ paddingLeft: 32 }}
              placeholder="Search name, phone, email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Ensure selects use unified class */}
          <select className="select" value={filters.city} onChange={(e) => handleFilterChange("city", e.target.value)}>
            <option value="">All Cities</option>
            <option value="Chandigarh">Chandigarh</option>
            <option value="Mohali">Mohali</option>
            <option value="Zirakpur">Zirakpur</option>
            <option value="Panchkula">Panchkula</option>
            <option value="Other">Other</option>
          </select>
          <select className="select" value={filters.propertyType} onChange={(e) => handleFilterChange("propertyType", e.target.value)}>
            <option value="">All Property Types</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Plot">Plot</option>
            <option value="Office">Office</option>
            <option value="Retail">Retail</option>
          </select>
          <select className="select" value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select className="select" value={filters.timeline} onChange={(e) => handleFilterChange("timeline", e.target.value)}>
            <option value="">All Timelines</option>
            <option value="0-3m">0-3 months</option>
            <option value="3-6m">3-6 months</option>
            <option value=">6m">6+ months</option>
            <option value="Exploring">Exploring</option>
          </select>

          {/* Export button already wired elsewhere; keep class consistent if rendered here */}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {error && (
          <div className="mb-2 bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}
        {!loading && buyers.length === 0 && !error && (
          <div className="p-4 text-center text-gray-600">No buyers found. Try adjusting filters or add a new lead.</div>
        )}
  <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>City</th>
              <th>Property</th>
              <th>Budget</th>
              <th>Timeline</th>
              <th>Status</th>
              <th>Tags</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buyers.map((buyer) => (
              <tr key={buyer.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <div>
                    <p className="font-medium">{buyer.fullName}</p>
                    {buyer.email && (
                      <p className="text-sm text-gray-500">{buyer.email}</p>
                    )}
                  </div>
                </td>
                <td className="p-3">{buyer.phone}</td>
                <td className="p-3">{buyer.city}</td>
                <td className="p-3">{buyer.propertyType}</td>
                <td className="p-3">
                  {formatBudget(buyer.budgetMin, buyer.budgetMax)}
                </td>
                <td className="p-3">{buyer.timeline}</td>
                <td className="p-3">
                  {buyer.ownerId === session?.user?.id?.toString() ? (
                    <StatusDropdown buyer={buyer} />
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {buyer.status}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {buyer.tags && buyer.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {buyer.tags.map((tag) => (
                        <span key={tag} className="badge badge-blue">{tag}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">No tags</span>
                  )}
                </td>
                <td className="p-3 text-sm text-gray-500">
                  {formatDate(buyer.updatedAt)}
                </td>
                <td className="p-3">
                  {buyer.ownerId === session?.user?.id?.toString() ? (
                    <Link href={`/buyers/${buyer.id}`} className="btn btn-link"><IconEdit /> Edit</Link>
                  ) : (
                    <Link href={`/buyers/${buyer.id}`} className="btn btn-link"><IconEye /> View</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination controls (if you render them here) */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>
            <IconChevronLeft /> Prev
          </button>
          <div className="text-sm text-gray-600">Page {page} of {Math.max(1, Math.ceil(total / limit))}</div>
          <button className="btn btn-secondary" onClick={() => setPage((p) => p + 1)} disabled={loading || page >= Math.ceil(total / limit)}>
            Next <IconChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
