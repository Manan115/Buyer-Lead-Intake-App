import { describe, it, expect } from "vitest";
import { buyerFormValidator } from "@/lib/validation/buyer";

describe("Buyer Validation", () => {
  it("should fail if budgetMax < budgetMin", () => {
    const invalidData = {
      fullName: "John Doe",
      phone: "9876543210",
      city: "Chandigarh",
      propertyType: "Apartment",
      purpose: "Buy",
      timeline: "0-3m",
      source: "Website",
      budgetMin: 5000000,
      budgetMax: 3000000,
    };

    expect(() => buyerFormValidator.parse(invalidData)).toThrow();
  });

  it("should pass for valid data", () => {
    const validData = {
    fullName: "Jane Doe",
    phone: "9876543210",
    city: "Chandigarh",
    propertyType: "Villa",
    bhk: "3", // ✅ required for Apartment or Villa
    purpose: "Buy",
    timeline: "0-3m",
    source: "Website",
    budgetMin: 3000000,
    budgetMax: 5000000,
    status: "New",
    };
    expect(buyerFormValidator.parse(validData)).toEqual(validData);
  });
});
