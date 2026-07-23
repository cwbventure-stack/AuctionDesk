// Maps a vehicle to the exact fields Facebook Marketplace and Craigslist ask
// for, in the order each site presents them.
//
// Neither site lets us pre-fill its form from the outside — no URL params, no
// API — so the fastest honest experience is: open their form, then copy each
// field across one tap at a time. This turns ~4 minutes of retyping per car into
// a walk down a list. Pure functions so the mapping is testable and the same
// values feed the compliance checks.

export interface MarketplaceField {
  label: string;
  value: string;
  /** True when we have no data for it — the dealer fills it in themselves. */
  empty?: boolean;
  /** A short aside shown under the field (e.g. "your call"). */
  hint?: string;
}

export interface FieldVehicle {
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  price: number;
  vin: string;
  bodyStyle: string;
  exteriorColor: string;
  transmission: string;
  fuelType: string;
}

const titleOf = (v: FieldVehicle) =>
  `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ""}`;

// Our stored codes → the option label each site actually shows in its dropdown.
const FB_BODY_STYLE: Record<string, string> = {
  SEDAN: "Sedan",
  SUV: "SUV",
  TRUCK: "Truck",
  COUPE: "Coupe",
  HATCHBACK: "Hatchback",
  CONVERTIBLE: "Convertible",
  WAGON: "Wagon",
  MINIVAN: "Minivan",
  VAN: "Minivan",
};

const FUEL: Record<string, string> = {
  GASOLINE: "Gasoline",
  DIESEL: "Diesel",
  HYBRID: "Hybrid",
  ELECTRIC: "Electric",
  FLEX: "Flex",
};

const TRANSMISSION: Record<string, string> = {
  AUTOMATIC: "Automatic transmission",
  MANUAL: "Manual transmission",
};

const pretty = (map: Record<string, string>, code: string) =>
  map[code.toUpperCase()] ?? code;

/**
 * Facebook Marketplace's vehicle form, field by field, in its on-screen order.
 * Empty structured fields are still listed so the dealer knows the form wants
 * them — with a nudge to fill them in on the vehicle's Details tab, which also
 * feeds the automatic catalog feed.
 */
export function facebookFields(v: FieldVehicle): MarketplaceField[] {
  const orEmpty = (raw: string, mapped: string): Pick<MarketplaceField, "value" | "empty" | "hint"> =>
    raw
      ? { value: mapped }
      : { value: "—", empty: true, hint: "Add it on the Details tab so it fills automatically next time." };

  return [
    { label: "Vehicle type", value: "Car/Truck" },
    { label: "Year", value: String(v.year) },
    { label: "Make", value: v.make },
    { label: "Model", value: v.model },
    { label: "Mileage", value: String(v.mileage) },
    { label: "Price", value: String(v.price) },
    { label: "Body style", ...orEmpty(v.bodyStyle, pretty(FB_BODY_STYLE, v.bodyStyle)) },
    { label: "Exterior color", ...orEmpty(v.exteriorColor, v.exteriorColor) },
    { label: "Fuel type", ...orEmpty(v.fuelType, pretty(FUEL, v.fuelType)) },
    { label: "Transmission", ...orEmpty(v.transmission, pretty(TRANSMISSION, v.transmission)) },
    { label: "Vehicle condition", value: "Good", hint: "Your call — bump to Excellent/Very good if it earns it." },
  ];
}

/**
 * Craigslist's "cars & trucks – by dealer" form. Title and price up top, then
 * the structured attributes it offers as optional dropdowns. Postal code is the
 * one thing only the dealer knows, so it's flagged rather than guessed.
 */
export function craigslistFields(v: FieldVehicle): MarketplaceField[] {
  return [
    { label: "Posting title", value: `${titleOf(v)} - $${v.price.toLocaleString()}` },
    { label: "Price", value: String(v.price) },
    {
      label: "Postal code",
      value: "—",
      empty: true,
      hint: "Enter your lot's ZIP code.",
    },
    { label: "Odometer", value: String(v.mileage) },
    { label: "Year", value: String(v.year) },
    { label: "Make / manufacturer", value: v.make },
    { label: "Model / make", value: `${v.model}${v.trim ? ` ${v.trim}` : ""}`.trim() },
    { label: "VIN", value: v.vin },
    ...(v.exteriorColor ? [{ label: "Paint color", value: v.exteriorColor }] : []),
    ...(v.fuelType ? [{ label: "Fuel", value: pretty(FUEL, v.fuelType) }] : []),
    ...(v.transmission
      ? [{ label: "Transmission", value: pretty(TRANSMISSION, v.transmission).replace(" transmission", "") }]
      : []),
    { label: "Condition", value: "excellent", hint: "Your call." },
  ];
}
