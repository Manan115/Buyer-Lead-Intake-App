"use client";

import Link from "next/link";
import { IconArrowLeft, IconSave } from "./ui/Icons";
import { useState, useEffect } from "react";
import { buyerFormValidator, BuyerInput } from "@/lib/validation/buyer";
import TagInput from "@/lib/components/TagInput";

export default function BuyerForm() {
  const [form, setForm] = useState<Partial<BuyerInput>>({
    fullName: "",
    email: "",
    phone: "",
    city: "Chandigarh",
    propertyType: "Apartment",
    bhk: "2",
    purpose: "Buy",
    budgetMin: undefined,
    budgetMax: undefined,
    timeline: "0-3m",
    source: "Website",
    status: "New",
    notes: "",
    tags: [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [announce, setAnnounce] = useState<string>("");

  // Clear BHK when property type changes to non-residential
  useEffect(() => {
    if (form.propertyType && !["Apartment", "Villa"].includes(form.propertyType)) {
      setForm(prev => ({ ...prev, bhk: undefined }));
    } else if (form.propertyType && ["Apartment", "Villa"].includes(form.propertyType) && !form.bhk) {
      setForm(prev => ({ ...prev, bhk: "2" }));
    }
  }, [form.propertyType]);

  const handleChange = (field: keyof BuyerInput, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      // Validate with Zod
      const validatedData = buyerFormValidator.parse(form);

      const res = await fetch("/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save");
      }

  setSuccess(true);
  setAnnounce("Buyer lead saved successfully");
      // Reset form
      setForm({
        fullName: "",
        email: "",
        phone: "",
        city: "Chandigarh",
        propertyType: "Apartment",
        bhk: "2",
        purpose: "Buy",
        budgetMin: undefined,
        budgetMax: undefined,
        timeline: "0-3m",
        source: "Website",
        status: "New",
        notes: "",
        tags: [],
      });
    } catch (err: any) {
      console.error("Form submission error:", err);
      if (err.name === "ZodError") {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error: any) => {
          const field = error.path[0];
          fieldErrors[field] = error.message;
        });
        setErrors(fieldErrors);
        // Focus first error field
        const firstField = Object.keys(fieldErrors)[0];
        const el = document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${firstField}"]`);
        el?.focus();
        setAnnounce("There are validation errors in the form");
      } else {
        setErrors({ general: err.message });
        setAnnounce(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const requiresBhk = form.propertyType && ["Apartment", "Villa"].includes(form.propertyType);

  return (
    <div className="page-wrap">
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/buyers" className="btn btn-link">
            <IconArrowLeft /> Back
          </Link>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Create Buyer</h1>
        </div>
      </div>

  <div aria-live="polite" className="sr-only">{announce}</div>
  <form onSubmit={handleSubmit} className="card">
        {/* Use className="input"/"select"/"textarea" on all controls */}
        {errors.general && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
            {errors.general}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded">
            Buyer lead saved successfully! ✅
          </div>
        )}

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
          >
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Call">Call</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-base font-medium text-sky-600 mb-1">
            Notes
          </label>
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
          />
          {errors.notes && <p className="text-red-600 text-sm mt-1">{errors.notes}</p>}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-base font-medium text-sky-600 mb-1">Tags</label>
          <TagInput value={form.tags || []} onChange={(tags) => handleChange("tags", tags)} />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button type="submit" className="btn btn-primary">
            <IconSave /> Save Lead
          </button>
        </div>
      </form>
    </div>
  );
}