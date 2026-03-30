"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  CheckCircle2,
  ShieldAlert,
  Droplets,
  Truck,
  Ruler,
  DollarSign,
  SlidersHorizontal,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StrapiHauler = {
  id: number;
  attributes: {
    name: string;
    slug: string;
    city: string;
    state: string;
    zip: string;
    serviceArea: string;
    minFee: number;
    truckCapacity: number;
    hoseLength: number;
    waterType: "potable" | "non-potable" | "both";
    isVerifiedPro: boolean;
    isClaimed: boolean;
    description: string;
    industries: string[] | null;
    services?: {
      data: { id: number; attributes: { type: string } }[];
    };
  };
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICE_TYPES: { value: string; label: string }[] = [
  { value: "pool", label: "Swimming Pool" },
  { value: "construction", label: "Construction" },
  { value: "potable", label: "Potable / Drinking" },
  { value: "agricultural", label: "Agricultural" },
  { value: "emergency", label: "Emergency" },
  { value: "events", label: "Events" },
];

const FEE_RANGES = [
  { value: "under300", label: "Under $300", max: 300 },
  { value: "300-500", label: "$300 – $500", min: 300, max: 500 },
  { value: "500plus", label: "$500+", min: 500 },
];

const SERVICE_LABEL: Record<string, string> = {
  pool: "Pool",
  construction: "Construction",
  potable: "Potable",
  agricultural: "Agricultural",
  emergency: "Emergency",
  events: "Events",
};

const SERVICE_COLOR: Record<string, string> = {
  pool: "bg-blue-100 text-blue-800",
  construction: "bg-orange-100 text-orange-800",
  potable: "bg-green-100 text-green-800",
  agricultural: "bg-lime-100 text-lime-800",
  emergency: "bg-red-100 text-red-800",
  events: "bg-purple-100 text-purple-800",
};

const SERVICE_TYPE_LABEL: Record<string, string> = {
  pool: "Swimming Pool",
  construction: "Construction",
  drinking: "Drinking Water",
  potable: "Potable Water",
  agricultural: "Agricultural",
  emergency: "Emergency",
  event: "Events",
  events: "Events",
};

// ─── Hauler Card ──────────────────────────────────────────────────────────────

function HaulerCard({ hauler }: { hauler: StrapiHauler }) {
  const a = hauler.attributes;
  const services = a.services?.data ?? [];

  return (
    <Link
      href={`/haulers/${a.slug}`}
      className="block bg-white rounded-xl border border-border shadow-sm hover:shadow-md hover:border-[#005A9C]/30 transition-all group"
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-[#005A9C] transition-colors truncate">
                {a.name}
              </h3>
              {a.isVerifiedPro && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                  style={{ backgroundColor: "#F2A900", color: "#fff" }}
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
              {a.city}, {a.state}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">Starting at</p>
            <p className="text-xl font-bold" style={{ color: "#005A9C" }}>
              ${a.minFee}
            </p>
          </div>
        </div>

        {/* Services badges */}
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

        {/* Specs row */}
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" />
            {a.truckCapacity?.toLocaleString() ?? "—"} gal
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="h-3.5 w-3.5" />
            {a.hoseLength ?? "—"} ft hose
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="h-3.5 w-3.5" />
            {a.waterType === "both"
              ? "Potable & Non-Potable"
              : a.waterType === "potable"
              ? "Potable"
              : "Non-Potable"}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Filter Sidebar ───────────────────────────────────────────────────────────

function FilterSidebar({
  selectedServices,
  setSelectedServices,
  selectedFeeRange,
  setSelectedFeeRange,
  verifiedOnly,
  setVerifiedOnly,
}: {
  selectedServices: string[];
  setSelectedServices: (v: string[]) => void;
  selectedFeeRange: string | null;
  setSelectedFeeRange: (v: string | null) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (v: boolean) => void;
}) {
  const toggleService = (val: string) =>
    setSelectedServices(
      selectedServices.includes(val)
        ? selectedServices.filter((s) => s !== val)
        : [...selectedServices, val]
    );

  return (
    <aside className="space-y-6">
      {/* Service Type */}
      <div>
        <h3 className="font-semibold text-sm uppercase tracking-wide text-foreground mb-3">
          Service Type
        </h3>
        <div className="space-y-2">
          {SERVICE_TYPES.map((st) => (
            <div key={st.value} className="flex items-center gap-2">
              <Checkbox
                id={`svc-${st.value}`}
                checked={selectedServices.includes(st.value)}
                onCheckedChange={() => toggleService(st.value)}
              />
              <Label htmlFor={`svc-${st.value}`} className="text-sm cursor-pointer">
                {st.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-border" />

      {/* Fee Range */}
      <div>
        <h3 className="font-semibold text-sm uppercase tracking-wide text-foreground mb-3">
          Min Starting Fee
        </h3>
        <div className="space-y-2">
          {FEE_RANGES.map((range) => (
            <div key={range.value} className="flex items-center gap-2">
              <Checkbox
                id={`fee-${range.value}`}
                checked={selectedFeeRange === range.value}
                onCheckedChange={() =>
                  setSelectedFeeRange(
                    selectedFeeRange === range.value ? null : range.value
                  )
                }
              />
              <Label htmlFor={`fee-${range.value}`} className="text-sm cursor-pointer flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                {range.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-border" />

      {/* Verified Pro Toggle */}
      <div>
        <h3 className="font-semibold text-sm uppercase tracking-wide text-foreground mb-3">
          Verified Pro
        </h3>
        <div className="flex items-center gap-3">
          <Switch
            id="verified-toggle"
            checked={verifiedOnly}
            onCheckedChange={setVerifiedOnly}
          />
          <Label htmlFor="verified-toggle" className="text-sm cursor-pointer">
            Show verified only
          </Label>
        </div>
        {verifiedOnly && (
          <p className="text-xs text-muted-foreground mt-2">
            Haulers with verified licenses &amp; insurance
          </p>
        )}
      </div>
    </aside>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  zip,
  hasFilters,
  onClear,
}: {
  zip: string;
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="text-center py-20">
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
        style={{ backgroundColor: "#005A9C10" }}
      >
        <Droplets className="h-8 w-8" style={{ color: "#005A9C" }} />
      </div>
      <h3 className="font-semibold text-xl mb-2 text-foreground">No haulers found</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
        {zip
          ? `We couldn't find haulers matching "${zip}".`
          : "Try searching a city, state, or ZIP code."}{" "}
        {hasFilters && "Try removing some filters to see more results."}
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        )}
        <Button size="sm" asChild style={{ backgroundColor: "#005A9C" }}>
          <Link href="/">Try the calculator</Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Main SearchClient ────────────────────────────────────────────────────────

export function SearchClient({
  initialZip,
  initialServiceType,
}: {
  initialZip: string;
  initialServiceType: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialise filter state from URL params so shared links restore correctly
  const [zip, setZip] = useState(initialZip);
  const [inputValue, setInputValue] = useState(initialZip);
  const [selectedServices, setSelectedServices] = useState<string[]>(() => {
    const urlServices = searchParams.get("services");
    if (urlServices) return urlServices.split(",").filter(Boolean);
    return initialServiceType ? [initialServiceType] : [];
  });
  const [selectedFeeRange, setSelectedFeeRange] = useState<string | null>(
    () => searchParams.get("fee") ?? null
  );
  const [verifiedOnly, setVerifiedOnly] = useState(
    () => searchParams.get("verified") === "1"
  );

  const [allHaulers, setAllHaulers] = useState<StrapiHauler[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const feeRangeObj = FEE_RANGES.find((r) => r.value === selectedFeeRange) ?? null;

  // Fetch all active haulers once — filtering happens client-side
  const fetchHaulers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("populate[services][fields][0]", "type");
      params.set("pagination[pageSize]", "100");
      params.set("filters[isActive][$eq]", "true");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"}/api/haulers?${params.toString()}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to load results");
      const data = await res.json();
      setAllHaulers(data.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHaulers();
  }, [fetchHaulers]);

  // Client-side filtering — instant, no refetch needed
  const filteredHaulers = useMemo(() => {
    let results = allHaulers;

    // Location: match zip, city, state, or serviceArea
    if (zip) {
      const q = zip.toLowerCase();
      results = results.filter((h) => {
        const a = h.attributes;
        return (
          a.city?.toLowerCase().includes(q) ||
          a.state?.toLowerCase().includes(q) ||
          a.zip?.includes(q) ||
          a.serviceArea?.toLowerCase().includes(q)
        );
      });
    }

    // Service type checkboxes
    if (selectedServices.length > 0) {
      results = results.filter((h) =>
        h.attributes.services?.data?.some((s) =>
          selectedServices.includes(s.attributes.type)
        )
      );
    }

    // Min fee range
    if (feeRangeObj) {
      results = results.filter((h) => {
        const fee = h.attributes.minFee;
        if (fee == null) return false;
        if (feeRangeObj.max !== undefined && feeRangeObj.min === undefined)
          return fee < feeRangeObj.max;
        if (feeRangeObj.min !== undefined && feeRangeObj.max !== undefined)
          return fee >= feeRangeObj.min && fee <= feeRangeObj.max;
        if (feeRangeObj.min !== undefined) return fee >= feeRangeObj.min;
        return true;
      });
    }

    // Verified Pro toggle
    if (verifiedOnly) {
      results = results.filter((h) => h.attributes.isVerifiedPro);
    }

    return results;
  }, [allHaulers, zip, selectedServices, feeRangeObj, verifiedOnly]);

  // Keep URL in sync so the page is shareable
  useEffect(() => {
    const p = new URLSearchParams();
    if (zip) p.set("zip", zip);
    if (selectedServices.length > 0) p.set("services", selectedServices.join(","));
    if (selectedFeeRange) p.set("fee", selectedFeeRange);
    if (verifiedOnly) p.set("verified", "1");
    router.replace(`/search?${p.toString()}`, { scroll: false });
  }, [zip, selectedServices, selectedFeeRange, verifiedOnly, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setZip(inputValue.trim());
  };

  const clearFilters = () => {
    setSelectedServices([]);
    setSelectedFeeRange(null);
    setVerifiedOnly(false);
  };

  const hasFilters =
    selectedServices.length > 0 || selectedFeeRange !== null || verifiedOnly;

  const activeFilterCount =
    selectedServices.length + (selectedFeeRange ? 1 : 0) + (verifiedOnly ? 1 : 0);

  // Page heading
  const serviceLabel = SERVICE_TYPE_LABEL[initialServiceType] ?? initialServiceType;
  const heading =
    initialZip && initialServiceType
      ? `Water Haulers near ${initialZip} for ${serviceLabel}`
      : initialZip
      ? `Water Haulers near ${initialZip}`
      : initialServiceType
      ? `${serviceLabel} Water Haulers`
      : "Find Water Haulers";

  const resultCount = loading
    ? null
    : `Showing ${filteredHaulers.length} hauler${filteredHaulers.length !== 1 ? "s" : ""}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Top search bar */}
      <div className="py-5 px-4" style={{ backgroundColor: "#005A9C" }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-white text-2xl font-bold text-center mb-4">{heading}</h1>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search by city, state, or ZIP..."
                className="pl-9 h-11 bg-white border-0 text-foreground"
              />
            </div>
            <Button
              type="submit"
              className="h-11 px-6 font-semibold text-white border-0"
              style={{ backgroundColor: "#F2A900" }}
            >
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile filter toggle */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : resultCount}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasFilters && (
              <span
                className="rounded-full w-4 h-4 text-xs flex items-center justify-center text-white"
                style={{ backgroundColor: "#005A9C" }}
              >
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className={`w-56 shrink-0 ${mobileFiltersOpen ? "block" : "hidden"} lg:block`}>
            <div className="sticky top-4 bg-white rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-base">Filters</h2>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear all
                  </button>
                )}
              </div>
              <FilterSidebar
                selectedServices={selectedServices}
                setSelectedServices={setSelectedServices}
                selectedFeeRange={selectedFeeRange}
                setSelectedFeeRange={setSelectedFeeRange}
                verifiedOnly={verifiedOnly}
                setVerifiedOnly={setVerifiedOnly}
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p className="text-sm text-muted-foreground hidden lg:block">
                {loading ? "Loading…" : resultCount}
              </p>

              {/* Active filter badges */}
              {hasFilters && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedServices.map((s) => (
                    <Badge key={s} variant="secondary" className="gap-1 text-xs">
                      {SERVICE_LABEL[s] ?? s}
                      <button
                        onClick={() =>
                          setSelectedServices(selectedServices.filter((x) => x !== s))
                        }
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                  {selectedFeeRange && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      {FEE_RANGES.find((r) => r.value === selectedFeeRange)?.label}
                      <button onClick={() => setSelectedFeeRange(null)}>
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  )}
                  {verifiedOnly && (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-xs"
                      style={{ backgroundColor: "#F2A90020", color: "#b27f00" }}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Verified Pro
                      <button onClick={() => setVerifiedOnly(false)}>
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-border p-5 animate-pulse"
                  >
                    <div className="flex justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-5 bg-muted rounded w-48" />
                        <div className="h-3 bg-muted rounded w-24" />
                      </div>
                      <div className="h-8 bg-muted rounded w-16" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <div className="h-5 bg-muted rounded-full w-16" />
                      <div className="h-5 bg-muted rounded-full w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredHaulers.length === 0 ? (
              <EmptyState zip={zip} hasFilters={hasFilters} onClear={clearFilters} />
            ) : (
              <div className="grid gap-4">
                {filteredHaulers.map((h) => (
                  <HaulerCard key={h.id} hauler={h} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
