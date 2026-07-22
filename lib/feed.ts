// Meta vehicle catalog feed.
//
// This is the one genuinely automatic path onto Facebook for a dealer our size.
// Organic Marketplace listings need an approved Inventory Partner — a closed
// list — but a catalog is self-serve: the dealer points Commerce Manager at a
// feed URL and Meta re-fetches it on a schedule, so inventory, prices, and sold
// vehicles sync without anyone touching it. It drives paid Automotive Inventory
// Ads rather than free listings.
//
// Column names follow Meta's vehicle feed spec; unknown columns are ignored by
// their importer, but missing required ones drop the row.
import "server-only";

export interface FeedVehicle {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  price: number;
  status: string;
  bodyStyle: string;
  exteriorColor: string;
  transmission: string;
  fuelType: string;
  description: string | null;
  photos: { url: string }[];
}

export interface FeedDealership {
  name: string;
  slug: string;
  city: string;
  state: string;
}

/** A vehicle Meta would reject, and the reason, so Settings can explain it. */
export interface FeedExclusion {
  vehicleId: string;
  label: string;
  missing: string[];
}

export interface FeedResult {
  csv: string;
  included: number;
  excluded: FeedExclusion[];
}

const REQUIRED_COLUMNS = [
  "vehicle_id",
  "title",
  "description",
  "url",
  "image[0].url",
  "make",
  "model",
  "year",
  "mileage.value",
  "mileage.unit",
  "price",
  "state_of_vehicle",
  "vin",
  "body_style",
  "exterior_color",
  "transmission",
  "fuel_type",
  "condition",
  "availability",
  "dealer_name",
  "address.city",
  "address.region",
  "address.country",
] as const;

/** RFC 4180: wrap in quotes and double any embedded quote. */
function csvCell(value: string | number): string {
  const s = String(value ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Meta wants a flat single-line description; newlines inside a quoted CSV field
 * are legal but their importer has historically been fussy about them.
 */
const flatten = (text: string) => text.replace(/\s*\n+\s*/g, " ").trim();

function missingFields(v: FeedVehicle): string[] {
  const missing: string[] = [];
  if (!v.bodyStyle) missing.push("body style");
  if (!v.exteriorColor) missing.push("color");
  if (!v.transmission) missing.push("transmission");
  if (!v.fuelType) missing.push("fuel type");
  if (v.photos.length === 0) missing.push("at least one photo");
  if (!v.price) missing.push("price");
  return missing;
}

/**
 * Builds the CSV. Only vehicles that are actually for sale and have every
 * required field are included — a row Meta rejects is worse than an absent one,
 * because rejections count against the catalog's health.
 *
 * `baseUrl` must be absolute (Meta fetches images and landing pages itself).
 */
export function buildVehicleFeed(
  dealership: FeedDealership,
  vehicles: FeedVehicle[],
  baseUrl: string,
): FeedResult {
  const origin = baseUrl.replace(/\/+$/, "");
  const rows: string[] = [REQUIRED_COLUMNS.join(",")];
  const excluded: FeedExclusion[] = [];

  for (const v of vehicles) {
    const label = `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ""}`;

    // Sold and in-recon vehicles simply leave the feed; that's how a sold car
    // stops being advertised.
    if (v.status !== "available") continue;

    const missing = missingFields(v);
    if (missing.length > 0) {
      excluded.push({ vehicleId: v.id, label, missing });
      continue;
    }

    const title = label;
    const description = flatten(
      v.description ||
        `${label} with ${v.mileage.toLocaleString()} miles. Serviced and inspected before listing. Available now at ${dealership.name}.`,
    );

    rows.push(
      [
        csvCell(v.id),
        csvCell(title),
        csvCell(description),
        csvCell(`${origin}/lot/${dealership.slug}/${v.id}`),
        csvCell(v.photos[0].url.startsWith("http") ? v.photos[0].url : `${origin}${v.photos[0].url}`),
        csvCell(v.make),
        csvCell(v.model),
        csvCell(v.year),
        csvCell(v.mileage),
        csvCell("MI"),
        csvCell(`${v.price} USD`),
        // Marketplace/AIA only accept used inventory from independent lots.
        csvCell("USED"),
        csvCell(v.vin),
        csvCell(v.bodyStyle.toUpperCase()),
        csvCell(v.exteriorColor),
        csvCell(v.transmission.toUpperCase()),
        csvCell(v.fuelType.toUpperCase()),
        csvCell("USED"),
        csvCell("available"),
        csvCell(dealership.name),
        csvCell(dealership.city),
        csvCell(dealership.state),
        csvCell("US"),
      ].join(","),
    );
  }

  return { csv: rows.join("\n"), included: rows.length - 1, excluded };
}
