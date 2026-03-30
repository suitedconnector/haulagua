import Link from "next/link";
import { CheckCircle2, ShieldAlert, Truck, Ruler, Droplets } from "lucide-react";

export type StrapiHauler = {
  id: number;
  attributes: {
    name: string;
    slug: string;
    city: string | null;
    state: string;
    zip?: string | null;
    serviceArea?: string | null;
    minFee?: number | null;
    truckCapacity?: number | null;
    hoseLength?: number | null;
    waterType?: "potable" | "non-potable" | "both" | null;
    isVerifiedPro: boolean;
    isClaimed: boolean;
    description?: string | null;
    services?: {
      data: { id: number; attributes: { type: string } }[];
    };
  };
};

const SERVICE_COLOR: Record<string, string> = {
  pool: "bg-blue-100 text-blue-800",
  construction: "bg-orange-100 text-orange-800",
  potable: "bg-green-100 text-green-800",
  agricultural: "bg-lime-100 text-lime-800",
  emergency: "bg-red-100 text-red-800",
  events: "bg-purple-100 text-purple-800",
};

const SERVICE_LABEL: Record<string, string> = {
  pool: "Pool",
  construction: "Construction",
  potable: "Potable",
  agricultural: "Agricultural",
  emergency: "Emergency",
  events: "Events",
};

export function HaulerCard({ hauler }: { hauler: StrapiHauler }) {
  const a = hauler.attributes;
  const services = a.services?.data ?? [];

  return (
    <Link
      href={`/haulers/${a.slug}`}
      className="block bg-white rounded-xl border border-border shadow-sm hover:shadow-md hover:border-[#005A9C]/30 transition-all group"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-[#005A9C] transition-colors truncate">
                {a.name}
              </h3>
              {a.isVerifiedPro && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap text-white"
                  style={{ backgroundColor: "#F2A900" }}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Pro
                </span>
              )}
              {!a.isClaimed && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap bg-gray-100 text-gray-500 border border-gray-200">
                  <ShieldAlert className="h-3 w-3" />
                  Unclaimed
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {a.city && `${a.city}, `}{a.state}
            </p>
          </div>
          {a.minFee != null && (
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Starting at</p>
              <p className="text-xl font-bold" style={{ color: "#005A9C" }}>
                ${a.minFee}
              </p>
            </div>
          )}
        </div>

        {services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {services.map((s) => (
              <span
                key={s.id}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  SERVICE_COLOR[s.attributes.type] ?? "bg-gray-100 text-gray-800"
                }`}
              >
                {SERVICE_LABEL[s.attributes.type] ?? s.attributes.type}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-sm text-muted-foreground">
          {a.truckCapacity != null && (
            <span className="flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" />
              {a.truckCapacity.toLocaleString()} gal
            </span>
          )}
          {a.hoseLength != null && (
            <span className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" />
              {a.hoseLength} ft hose
            </span>
          )}
          {a.waterType && (
            <span className="flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5" />
              {a.waterType === "both"
                ? "Potable & Non-Potable"
                : a.waterType === "potable"
                ? "Potable"
                : "Non-Potable"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
