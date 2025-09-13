"use client";

import Link from "next/link";
import RecentChanges from "./RecentChanges";
import { IconArrowLeft, IconSave, IconTrash } from "./ui/Icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buyerFormValidator, BuyerInput } from "@/lib/validation/buyer";
import TagInput from "@/lib/components/TagInput";

export default function BuyerEditForm({ id }: { id: string }) {
  const router = useRouter();
  const [form, setForm] = useState<BuyerInput | null>(null);
  const [originalUpdatedAt, setOriginalUpdatedAt] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [announce, setAnnounce] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/buyers/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch buyer data");
        }
        
        const data = await res.json();
        setForm(data.buyer);
        setOriginalUpdatedAt(data.buyer.updatedAt);
        setHistory(data.history || []);
        setCanEdit(data.canEdit === true);
      } catch (error) {
        console.error("Fetch error:", error);
        setErrors({ general: "Failed to load buyer data" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Clear BHK when property type changes to non-residential
  useEffect(() => {
    if (form?.propertyType && !["Apartment", "Villa"].includes(form.propertyType)) {
      setForm(prev => prev ? { ...prev, bhk: undefined } : null);
    } else if (form?.propertyType && ["Apartment", "Villa"].includes(form.propertyType) && !form.bhk) {
      setForm(prev => prev ? { ...prev, bhk: "2" } : null);
    }
  }, [form?.propertyType]);

  const handleChange = (field: keyof BuyerInput, value: any) => {
    if (!form) return;
    
    setForm(prev => prev ? { ...prev, [field]: value } : null);
    
    // Clear field-specific error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    // Clear success message on change
    if (success) {
      setSuccess(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return; // guard
    if (!form) return;

    setSaving(true);
    setErrors({});
    setSuccess(null);

    try {
      // Validate form data
      const validatedData = buyerFormValidator.parse(form);

      const res = await fetch(`/api/buyers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validatedData,
          updatedAt: originalUpdatedAt,
        }),
      });

      const result = await res.json();

      if (res.status === 409) {
        setErrors({ general: result.error });
        setAnnounce(result.error);
        return;
      }

      if (!res.ok) {
        throw new Error(result.error || "Failed to update buyer");
      }

  const msg = result.message || "Buyer updated successfully";
  setSuccess(msg);
  setAnnounce(msg);
      
      // Refresh data to get latest timestamp and history
      const refreshRes = await fetch(`/api/buyers/${id}`);
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setOriginalUpdatedAt(refreshData.buyer.updatedAt);
        setHistory(refreshData.history || []);
      }

    } catch (err: any) {
      console.error("Update error:", err);
      if (err.name === "ZodError") {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error: any) => {
          const field = error.path[0];
          fieldErrors[field] = error.message;
        });
        setErrors(fieldErrors);
        const firstField = Object.keys(fieldErrors)[0];
        const el = document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${firstField}"]`);
        el?.focus();
        setAnnounce("There are validation errors in the form");
      } else {
        setErrors({ general: err.message });
        setAnnounce(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canEdit) return;
    if (!confirm("Are you sure you want to delete this buyer? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/buyers/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/buyers");
      } else {
        const error = await res.json();
        setErrors({ general: error.error || "Failed to delete buyer" });
      }
    } catch (error) {
      setErrors({ general: "Failed to delete buyer" });
    }
  };

  const formatHistoryValue = (value: any) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (value === null || value === undefined) {
      return "N/A";
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-600">Loading buyer details...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Buyer not found</p>
        <button 
          onClick={() => router.push("/buyers")}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Buyers List
        </button>
      </div>
    );
  }

  const requiresBhk = form.propertyType && ["Apartment", "Villa"].includes(form.propertyType);

  return (
    <div className="page-wrap">
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/buyers" className="btn btn-link">
              <IconArrowLeft /> Back
            </Link>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Buyer Details</h1>
          </div>
          {canEdit ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" form="buyer-edit-form" className="btn btn-primary">
                <IconSave /> Save Changes
              </button>
              <button onClick={handleDelete} className="btn btn-danger" type="button">
                <IconTrash /> Delete
              </button>
            </div>
          ) : (
            <div className="badge" aria-label="View only">View Only</div>
          )}
        </div>
      </div>

  <div aria-live="polite" className="sr-only">{announce}</div>
  <form id="buyer-edit-form" onSubmit={handleSubmit} className="card">
        {/* Full Name */}
        <div>
          <label className="block text-base font-medium text-sky-600 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.fullName ? "border-red-500" : "border-gray-300"
            }`}
            value={form.fullName || ""}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="Enter full name"
            disabled={!canEdit}
          />
          {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-base font-medium text-sky-600 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            value={form.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Enter email address"
            disabled={!canEdit}
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-base font-medium text-sky-600 mb-1">
            Phone *
          </label>
          <input
            type="tel"
            name="phone"
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            value={form.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="10-15 digits"
            disabled={!canEdit}
          />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
        </div>

        {/* City */}
        <div>
          <label className="block text-base font-medium text-sky-600 mb-1">
            City *
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="city"
            value={form.city || ""}
            onChange={(e) => handleChange("city", e.target.value)}
            disabled={!canEdit}
          >
            <option value="Chandigarh">Chandigarh</option>
            <option value="Mohali">Mohali</option>
            <option value="Zirakpur">Zirakpur</option>
            <option value="Panchkula">Panchkula</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-base font-medium text-sky-600 mb-1">
            Property Type *
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="propertyType"
            value={form.propertyType || ""}
            onChange={(e) => handleChange("propertyType", e.target.value)}
            disabled={!canEdit}
          >
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Plot">Plot</option>
            <option value="Office">Office</option>
            <option value="Retail">Retail</option>
          </select>
        </div>

        {/* BHK (conditional) */}
        {requiresBhk && (
          <div>
            <label className="block text-base font-medium text-sky-600 mb-1">
              BHK *
            </label>
            <select
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bhk ? "border-red-500" : "border-gray-300"
              }`}
              name="bhk"
              value={form.bhk || ""}
              onChange={(e) => handleChange("bhk", e.target.value)}
              disabled={!canEdit}
            >
              <option value="">Select BHK</option>
              <option value="Studio">Studio</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
            </select>
            {errors.bhk && <p className="text-red-600 text-sm mt-1">{errors.bhk}</p>}
          </div>
        )}

        {/* Purpose */}
        <div>
          <label className="block text-base font-medium text-sky-600 mb-1">
            Purpose *
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="purpose"
            value={form.purpose || ""}
            onChange={(e) => handleChange("purpose", e.target.value)}
            disabled={!canEdit}
          >
            <option value="Buy">Buy</option>
            <option value="Rent">Rent</option>
          </select>
        </div>

        {/* Budget Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium text-sky-600 mb-1">
              Budget Min (INR)
            </label>
            <input
              type="number"
              name="budgetMin"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.budgetMin || ""}
              onChange={(e) => handleChange("budgetMin", e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Minimum budget"
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="block text-base font-medium text-sky-600 mb-1">
              Budget Max (INR)
            </label>
            <input
              type="number"
              name="budgetMax"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.budgetMax ? "border-red-500" : "border-gray-300"
              }`}
              value={form.budgetMax || ""}
              onChange={(e) => handleChange("budgetMax", e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Maximum budget"
              disabled={!canEdit}
            />
            {errors.budgetMax && <p className="text-red-600 text-sm mt-1">{errors.budgetMax}</p>}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-base font-medium text-sky-600 mb-1">
            Timeline *
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="timeline"
            value={form.timeline || ""}
            onChange={(e) => handleChange("timeline", e.target.value)}
            disabled={!canEdit}
          >
            <option value="0-3m">0-3 months</option>
            <option value="3-6m">3-6 months</option>
            <option value=">6m">More than 6 months</option>
            <option value="Exploring">Just exploring</option>
          </select>
        </div>

        {/* Source */}
        <div>
          <label className="block text-base font-medium text-sky-600 mb-1">
            Source *
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="source"
            value={form.source || ""}
            onChange={(e) => handleChange("source", e.target.value)}
            disabled={!canEdit}
          >
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Call">Call</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-base font-medium text-sky-600 mb-1">
            Status *
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="status"
            value={form.status || "New"}
            onChange={(e) => handleChange("status", e.target.value)}
            disabled={!canEdit}
          >
            <option value="New">New</option>
            <option value="Qualified">Qualified</option>
            <option value="Contacted">Contacted</option>
            <option value="Visited">Visited</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Converted">Converted</option>
            <option value="Dropped">Dropped</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-base font-medium text-sky-600 mb-1">Notes</label>
          <textarea
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.notes ? "border-red-500" : "border-gray-300"
            }`}
            name="notes"
            rows={3}
            value={form.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Additional notes (max 1000 characters)"
            maxLength={1000}
            disabled={!canEdit}
          />
          {errors.notes && <p className="text-red-600 text-sm mt-1">{errors.notes}</p>}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-base font-medium text-sky-600 mb-1">Tags</label>
          <TagInput value={form.tags || []} onChange={(tags) => handleChange("tags", tags)} />
        </div>
      </form>

      {/* Recent Changes (last 5 provided by API) */}
      <RecentChanges history={history} />
    </div>
  );
}