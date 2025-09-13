import { z } from "zod";

export const buyerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^\d{10,15}$/),
  city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
  propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  bhk: z.enum(["1", "2", "3", "4", "Studio"]).optional(),
  purpose: z.enum(["Buy", "Rent"]),
  budgetMin: z.coerce.number().int().positive().optional(),
  budgetMax: z.coerce.number().int().positive().optional(),
  timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),
  source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
  status: z.enum([
    "New",
    "Qualified",
    "Contacted",
    "Visited",
    "Negotiation",
    "Converted",
    "Dropped",
  ]).default("New"),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
});

// refinement: budgetMax ≥ budgetMin
export const buyerValidator = buyerSchema.refine(
  (data) =>
    !data.budgetMin || !data.budgetMax || data.budgetMax >= data.budgetMin,
  {
    message: "budgetMax must be greater than or equal to budgetMin",
    path: ["budgetMax"],
  }
);

// refinement: bhk required if propertyType is Apartment or Villa
export const buyerFormValidator = buyerValidator.refine(
  (data) => {
    if (["Apartment", "Villa"].includes(data.propertyType)) {
      return !!data.bhk;
    }
    return true;
  },
  {
    message: "BHK is required for Apartment/Villa",
    path: ["bhk"],
  }
);

export type BuyerInput = z.infer<typeof buyerFormValidator>;