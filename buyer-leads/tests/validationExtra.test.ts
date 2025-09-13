import { describe, it, expect } from "vitest";
import { buyerFormValidator } from "@/lib/validation/buyer";

describe("Buyer form extra validation", () => {
  it("requires bhk for Apartment/Villa", () => {
    const base: any = {
      fullName: "Test",
      phone: "9999999999",
      city: "Chandigarh",
      propertyType: "Apartment",
      purpose: "Buy",
      timeline: "0-3m",
      source: "Website",
    };
    expect(() => buyerFormValidator.parse(base)).toThrow();
    expect(() => buyerFormValidator.parse({ ...base, propertyType: "Villa" })).toThrow();
  });

  it("accepts 10–15 digit phone only", () => {
    const base: any = {
      fullName: "Ok",
      phone: "1234567890",
      city: "Chandigarh",
      propertyType: "Plot",
      purpose: "Buy",
      timeline: "0-3m",
      source: "Website",
    };
    expect(() => buyerFormValidator.parse({ ...base, phone: "12345" })).toThrow();
    expect(buyerFormValidator.parse(base)).toBeTruthy();
  });

  it("allows budgetMax equal to budgetMin", () => {
    const data: any = {
      fullName: "Budget",
      phone: "1234567890",
      city: "Chandigarh",
      propertyType: "Plot",
      purpose: "Buy",
      timeline: "0-3m",
      source: "Website",
      budgetMin: 100,
      budgetMax: 100,
    };
    expect(buyerFormValidator.parse(data)).toBeTruthy();
  });
});