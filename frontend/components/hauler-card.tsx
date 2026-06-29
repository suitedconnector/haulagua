import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ShieldAlert, Ruler, Droplets } from "lucide-react";
import { getPlaceholderImage } from "@/src/lib/placeholders";
import { CityWave } from "@/components/city-wave";

export type StrapiHauler = {
  id?: number;
  name: string;
  slug: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city: string | null;
  state: string;
  zip?: string | null;
  serviceArea?: string | null;
  minFee?: number | null;
  truckCapacity?: number | null | string;
  hoseLength?: number | null;
  waterType?: "potable" | "non-potable" | "both" | null;
  isVerifiedPro: boolean;
  isClaimed: boolean;
  isActive?: boolean;
  description?: string | null;
  certification?: string;
  services?: {
    data: { id: number; attributes: { type: string } }[];
  };
};

const SERVICE_COLOR: Record<string, string> = {
  pool: "bg-white/20 text-white",
  construction: "bg-white/20 text-white",
  potable: "bg-white/20 text-white",
  agricultural: "bg-white/20 text-white",
  emergency: "bg-white/20 text-white",
  events: "bg-white/20 text-white",
};

const SERVICE_LABEL: Record<string, string> = {
  pool: "Pool",
  construction: "Construction",
  potable: "Potable",
  agricultural: "Agricultural",
  emergency: "Emergency",
  events: "Events",
};

export function HaulerCard({ hauler, refPath }: { hauler: StrapiHauler; refPath?: string }) {
  const services = hauler.services?.data ?? [];
  const href = refPath ? `/haulers/${hauler.slug}?ref=${encodeURIComponent(refPath)}` : `/haulers/${hauler.slug}`;

  return (
    <Link
      href={href}
      className="block rounded-xl border border-border shadow-sm hover:shadow-md hover:border-[#005A9C]/30 transition-all group overflow-hidden" style={{ backgroundColor: "#0461AA" }}
    >
      <div className="relative h-36 w-full bg-gray-100">
        <Image
          src={getPlaceholderImage(hauler.slug)}
          alt={`${hauler.name} - bulk water hauling`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <CityWave className="absolute bottom-0 left-0 pointer-events-none" />
      </div>
      <div className="p-5" style={{ backgroundColor: "#0461AA" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg text-white truncate">
                {hauler.name}
              </h3>
              {hauler.isVerifiedPro && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap text-white"
                  style={{ backgroundColor: "#F2A900" }}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Pro
                </span>
              )}
              {!hauler.isClaimed && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap bg-white/20 text-white">
                  <ShieldAlert className="h-3 w-3" />
                  Unclaimed
                </span>
              )}
            </div>
            <p className="text-sm text-white/70 mt-0.5">
              {hauler.city && `${hauler.city}, `}{hauler.state}
            </p>
          </div>
          {hauler.minFee != null && (
            <div className="text-right shrink-0">
              <p className="text-xs text-white/70">Starting at</p>
              <p className="text-xl font-bold text-white">
                ${hauler.minFee}
              </p>
            </div>
          )}
        </div>

        {services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {services.map((s: any) => (
              <span
                key={s.id}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  SERVICE_COLOR[s.type ?? s.attributes?.type] ?? "bg-gray-100 text-gray-800"
                }`}
              >
                {SERVICE_LABEL[s.type ?? s.attributes?.type] ?? s.type ?? s.attributes?.type}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-sm text-white/70">
          {hauler.truckCapacity != null && hauler.truckCapacity !== "" && (
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-truck-droplet" style={{ fontSize: "13px" }} />
              {typeof hauler.truckCapacity === "string" ? hauler.truckCapacity : hauler.truckCapacity.toLocaleString()} gal
            </span>
          )}
          {hauler.hoseLength != null && (
            <span className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" />
              {hauler.hoseLength} ft hose
            </span>
          )}
          {hauler.waterType && (
            <span className="flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5" />
              {hauler.waterType === "both"
                ? "Potable & Non-Potable"
                : hauler.waterType === "potable"
                ? "Potable"
                : "Non-Potable"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
