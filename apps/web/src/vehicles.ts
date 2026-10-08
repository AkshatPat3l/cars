export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  drivetrain: string;
  fuelType: string;
  pricing: {
    currency: string;
    msrp: number;
    invoicePrice: number;
  };
  incentives?: {
    unadvertisedDealerRebate: number;
    customerCashRebate: number;
    financeRate: number;
    leaseRate: number;
  };
  recommendedDealer?: {
    name: string;
    contactPerson: string;
    address: string;
    guaranteedMarkup: string;
  };
}

export interface VehicleGroup {
  make: string;
  models: VehicleModelGroup[];
}

export interface VehicleModelGroup {
  model: string;
  years: VehicleYearGroup[];
}

export interface VehicleYearGroup {
  year: number;
  trims: Vehicle[];
}

// Load raw data and transform into organized structure
import { MOCK_VEHICLES_RAW } from "./vehiclesRaw";

export const MOCK_VEHICLES: Vehicle[] = MOCK_VEHICLES_RAW.map((raw) => {
  const invoicePrice = raw.pricing.invoice_price;
  const msrp = raw.pricing.msrp;
  return {
    id: raw.id,
    year: raw.year,
    make: raw.make,
    model: raw.model,
    trim: raw.trim,
    drivetrain: raw.drivetrain,
    fuelType: raw.fuel_type,
    pricing: {
      currency: raw.pricing.currency,
      msrp: msrp,
      invoicePrice: invoicePrice,
    },
    // Add realistic incentives for each vehicle
    incentives: {
      unadvertisedDealerRebate: Math.floor(invoicePrice * (0.01 + Math.random() * 0.03)),
      customerCashRebate: Math.floor(msrp * (0.005 + Math.random() * 0.015)),
      financeRate: 2.99 + Math.random() * 2,
      leaseRate: 3.49 + Math.random() * 2,
    },
    recommendedDealer: {
      name: getDealerName(raw.make),
      contactPerson: "Sales Department",
      address: getDealerLocation(raw.make),
      guaranteedMarkup: "3% over Wholesale Invoice",
    },
  };
});


// Helper to get dealer name based on make
function getDealerName(make: string): string {
  const dealerMap: Record<string, string> = {
    Toyota: "Dominion Toyota",
    Honda: "Maple Honda",
    Ford: "Fairview Ford",
    Hyundai: "Central Hyundai",
    Kia: "Northgate Kia",
    Nissan: "Country Nissan",
    Subaru: "Subaru of London",
    Chevrolet: "Bay Chevrolet",
    BMW: "BMW Toronto",
    "Mercedes-Benz": "Mercedes-Benz York",
    Audi: "Audi West",
    Lexus: "Lexus Richmond",
    Mazda: "Mazda Dealership",
    Volkswagen: "VW Centre",
  };
  return dealerMap[make] || `${make} Dealership`;
}

// Helper to get dealer location
function getDealerLocation(make: string): string {
  const locationMap: Record<string, string> = {
    Toyota: "Toronto, ON",
    Honda: "Mississauga, ON",
    Ford: "Brampton, ON",
    Hyundai: "Markham, ON",
    Kia: "Scarborough, ON",
    Nissan: "North York, ON",
    Subaru: "London, ON",
    Chevrolet: "Oakville, ON",
    BMW: "Toronto, ON",
    "Mercedes-Benz": "Toronto, ON",
    Audi: "Etobicoke, ON",
    Lexus: "Richmond Hill, ON",
    Mazda: "Vaughan, ON",
    Volkswagen: "Windsor, ON",
  };
  return locationMap[make] || "Ontario, ON";
}

// Derived data for dropdowns
export const MAKES = [...new Set(MOCK_VEHICLES.map((v) => v.make))].sort();

export function getModelsByMake(make: string): string[] {
  return [...new Set(MOCK_VEHICLES.filter((v) => v.make === make).map((v) => v.model))].sort();
}

export function getYearsByMakeModel(make: string, model: string): number[] {
  return [...new Set(MOCK_VEHICLES.filter((v) => v.make === make && v.model === model).map((v) => v.year))].sort((a, b) => b - a);
}

export function getTrimsByMakeModelYear(make: string, model: string, year: number): Vehicle[] {
  return MOCK_VEHICLES.filter((v) => v.make === make && v.model === model && v.year === year);
}

export function getVehicleById(id: string): Vehicle | undefined {
  return MOCK_VEHICLES.find((v) => v.id === id);
}

// Format currency in CAD
export function formatCAD(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
