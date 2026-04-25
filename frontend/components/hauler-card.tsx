import Link from "next/link";
import Image from "next/image";
import { Shield, Medal } from "lucide-react";
import { getPlaceholderImage } from "@/src/lib/placeholders";
import { CityWave } from "@/components/city-wave";

export type StrapiHauler = {
  id: number;
  attributes: {
    name: string;
    slug: string;
    city: string | null;
    state: string;
    zip?: string | null;
    phone?: string | null;
    website?: string | null;
    description?: string | null;
    certification?: string | null;
    veteranOwned?: boolean | null;
    serviceArea?: string | null;
    minFee?: number | null;
    truckCapacity?: number | null;
    hoseLength?: number | null;
    waterType?: "potable" | "non-potable" | "both" | null;
    isVerifiedPro: boolean;
    isClaimed: boolean;
    isActive?: boolean;
    services?: {
      data: { id: number; attributes: { type: string } }[];
    };
  };
};

export function HaulerCard({ hauler, refPath }: { hauler: StrapiHauler; refPath?: string }) {
  const a = hauler.attributes;
  const href = refPath ? `/haulers/${a.slug}?ref=${encodeURIComponent(refPath)}` : `/haulers/${a.slug}`;

  const trustBadge = a.certification
    ? { icon: Shield, label: a.certification }
    : a.veteranOwned
    ? { icon: Medal, label: "Veteran-Owned" }
    : null;

  return (
    <div
      className="rounded-xl border border-border shadow-sm hover:shadow-md hover:border-[#005A9C]/30 transition-all overflow-hidden flex flex-col"
      style={{ backgroundColor: "#0461AA" }}
    >
      <Link href={href} className="block">
        <div className="relative h-36 w-full bg-gray-100">
          <Image
            src={getPlaceholderImage(a.slug)}
            alt={`${a.name} - bulk water hauling`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <CityWave className="absolute bottom-0 left-0 pointer-events-none" />
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1" style={{ backgroundColor: "#0461AA" }}>
        <h3 className="font-semibold text-lg text-white leading-snug">
          {a.name}
        </h3>
        <p className="text-sm text-white/70 mt-0.5">
          {a.city && `${a.city}, `}{a.state}
        </p>

        {trustBadge && (
          <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-white/15 text-white self-start">
            <trustBadge.icon className="h-3 w-3 shrink-0" />
            {trustBadge.label}
          </span>
        )}

        {a.truckCapacity != null && (
          <p className="mt-2 text-sm text-white/70 flex items-center gap-1">
            <i className="fa-solid fa-truck-droplet" style={{ fontSize: "13px" }} />
            {a.truckCapacity.toLocaleString()} gal capacity
          </p>
        )}

        {a.description && (
          <p className="mt-2 text-sm text-white/75 line-clamp-1 leading-relaxed">
            {a.description}
          </p>
        )}

        <div className="mt-auto pt-4">
          <Link
            href={href}
            className="block w-full text-center py-2 px-4 rounded-lg text-sm font-semibold transition-colors hover:opacity-90"
            style={{ backgroundColor: "#F2A900", color: "#1a1a1a" }}
          >
            View Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}
