"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, CheckCircle2, Droplets, Truck, Ruler, DollarSign, SlidersHorizontal, X, Info } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type StrapiHauler = {
  id: number;
  attributes: {
    name: string;
    slug: string;
    city: string;
    state: string;
    minFee: number;
    truckCapacity: number;
    hoseLength: number;
    waterType: "potable" | "non-potable" | "both";
    isVerifiedPro: boolean;
    description: string;
    industries: string[] | null;
    services?: {
      data: { id: number; attributes: { type: string } }[];
    };
  };
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICE_TYPES: { value: string; label: string; tooltip?: string }[] = [
  { value: "pool", label: "Swimming Pool" },
  { value: "construction", label: "Construction" },
  {
    value: "potable",
    label: "Potable Water",
    tooltip: "Safe drinking water for cisterns, tanks, and livestock",
  },
  { value: "agricultural", label: "Agricultural" },
  { value: "emergency", label: "Emergency" },
  { value: "events", label: "Events" },
];

const WATER_TYPES = [
  { value: "potable", label: "Potable" },
  { value: "non-potable", label: "Non-Potable" },
  { value: "both", label: "Both" },
];

const INDUSTRY_TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "agricultural", label: "Agricultural" },
  { value: "oil-gas", label: "Oil & Gas" },
  { value: "municipal", label: "Municipal" },
  { value: "emergency-management", label: "Emergency Mgmt" },
];

const SERVICE_LABEL: Record<string, string> = {
  pool: "Pool",
  construction: "Construction",
  potable: "Potable",
  agricultural: "Agricultural",
  emergency: "Emergency",
  events: "Events",
};

const INDUSTRY_LABEL: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  agricultural: "Agricultural",
  "oil-gas": "Oil & Gas",
  municipal: "Municipal",
  "emergency-management": "Emergency Mgmt",
};

const SERVICE_COLOR: Record<string, string> = {
  pool: "bg-blue-100 text-blue-800",
  construction: "bg-orange-100 text-orange-800",
  potable: "bg-green-100 text-green-800",
  agricultural: "bg-lime-100 text-lime-800",
  emergency: "bg-red-100 text-red-800",
  events: "bg-purple-100 text-purple-800",
};

// ─── Hauler Card ─────────────────────────────────────────────────────────────

function HaulerCard({ hauler }: { hauler: StrapiHauler }) {
  const a = hauler.attributes;
  const services = a.services?.data ?? [];

  return (
    <Link
      href={`/haulers/${a.slug}`}
      className="block bg-white rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {a.name}
              </h3>
              {a.isVerifiedPro && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-accent/20 text-amber-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Pro
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {a.city}, {a.state}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">Starting at</p>
            <p className="text-xl font-bold text-primary">${a.minFee}</p>
          </div>
        </div>

        {/* Services badges */}
        {services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {services.map((s) => (
              <span
                key={s.id}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${SERVICE_COLOR[s.attributes.type] ?? "bg-gray-100 text-gray-800"}`}
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
  selectedWaterTypes,
  setSelectedWaterTypes,
  selectedIndustries,
  setSelectedIndustries,
  maxFee,
  setMaxFee,
}: {
  selectedServices: string[];
  setSelectedServices: (v: string[]) => void;
  selectedWaterTypes: string[];
  setSelectedWaterTypes: (v: string[]) => void;
  selectedIndustries: string[];
  setSelectedIndustries: (v: string[]) => void;
  maxFee: number;
  setMaxFee: (v: number) => void;
}) {
  const toggleService = (val: string) =>
    setSelectedServices(
      selectedServices.includes(val)
        ? selectedServices.filter((s) => s !== val)
        : [...selectedServices, val]
    );

  const toggleWater = (val: string) =>
    setSelectedWaterTypes(
      selectedWaterTypes.includes(val)
        ? selectedWaterTypes.filter((w) => w !== val)
        : [...selectedWaterTypes, val]
    );

  const toggleIndustry = (val: string) =>
    setSelectedIndustries(
      selectedIndustries.includes(val)
        ? selectedIndustries.filter((i) => i !== val)
        : [...selectedIndustries, val]
    );

  return (
    <TooltipProvider delayDuration={200}>
      <aside className="space-y-6">
        {/* Service Type */}
        <div>
          <h3 className="font-serif font-semibold text-sm uppercase tracking-wide text-foreground mb-3">
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
                <Label htmlFor={`svc-${st.value}`} className="text-sm cursor-pointer flex items-center gap-1.5">
                  {st.label}
                  {st.tooltip && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[180px] text-xs">
                        {st.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-border" />

        {/* Industries Served */}
        <div>
          <h3 className="font-serif font-semibold text-sm uppercase tracking-wide text-foreground mb-3">
            Industries Served
          </h3>
          <div className="space-y-2">
            {INDUSTRY_TYPES.map((ind) => (
              <div key={ind.value} className="flex items-center gap-2">
                <Checkbox
                  id={`ind-${ind.value}`}
                  checked={selectedIndustries.includes(ind.value)}
                  onCheckedChange={() => toggleIndustry(ind.value)}
                />
                <Label htmlFor={`ind-${ind.value}`} className="text-sm cursor-pointer">
                  {ind.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-border" />

        {/* Water Type */}
        <div>
          <h3 className="font-serif font-semibold text-sm uppercase tracking-wide text-foreground mb-3">
            Water Type
          </h3>
          <div className="space-y-2">
            {WATER_TYPES.map((wt) => (
              <div key={wt.value} className="flex items-center gap-2">
                <Checkbox
                  id={`wt-${wt.value}`}
                  checked={selectedWaterTypes.includes(wt.value)}
                  onCheckedChange={() => toggleWater(wt.value)}
                />
                <Label htmlFor={`wt-${wt.value}`} className="text-sm cursor-pointer">
                  {wt.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-border" />

        {/* Max Fee Slider */}
        <div>
          <h3 className="font-serif font-semibold text-sm uppercase tracking-wide text-foreground mb-3">
            Max Starting Fee
          </h3>
          <Slider
            min={0}
            max={1000}
            step={25}
            value={[maxFee]}
            onValueChange={([v]) => setMaxFee(v)}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span className="font-medium text-foreground">
              {maxFee === 1000 ? "Any" : `≤ $${maxFee}`}
            </span>
            <span>$1,000+</span>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

// ─── Main SearchClient ────────────────────────────────────────────────────────

export function SearchClient({ initialQ }: { initialQ: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQ);
  const [inputValue, setInputValue] = useState(initialQ);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedWaterTypes, setSelectedWaterTypes] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [maxFee, setMaxFee] = useState(1000);
  const [haulers, setHaulers] = useState<StrapiHauler[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchHaulers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("populate[services][fields][0]", "type");
      params.set("pagination[pageSize]", "50");
      params.set("filters[isActive][$eq]", "true");

      if (query) {
        params.set("filters[$or][0][city][$containsi]", query);
        params.set("filters[$or][1][zip][$containsi]", query);
        params.set("filters[$or][2][serviceArea][$containsi]", query);
        params.set("filters[$or][3][state][$containsi]", query);
      }

      if (selectedWaterTypes.length === 1) {
        params.set("filters[waterType][$eq]", selectedWaterTypes[0]);
      }

      if (maxFee < 1000) {
        params.set("filters[minFee][$lte]", String(maxFee));
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"}/api/haulers?${params.toString()}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to load results");
      const data = await res.json();
      let results: StrapiHauler[] = data.data ?? [];

      // Client-side filter by service type
      if (selectedServices.length > 0) {
        results = results.filter((h) =>
          h.attributes.services?.data?.some((s) =>
            selectedServices.includes(s.attributes.type)
          )
        );
      }

      // Client-side filter by industries
      if (selectedIndustries.length > 0) {
        results = results.filter((h) =>
          h.attributes.industries?.some((ind) =>
            selectedIndustries.includes(ind)
          )
        );
      }

      setHaulers(results);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [query, selectedServices, selectedWaterTypes, selectedIndustries, maxFee]);

  useEffect(() => {
    fetchHaulers();
  }, [fetchHaulers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
    const p = new URLSearchParams(searchParams.toString());
    if (inputValue) p.set("q", inputValue);
    else p.delete("q");
    router.push(`/search?${p.toString()}`);
  };

  const clearFilters = () => {
    setSelectedServices([]);
    setSelectedWaterTypes([]);
    setSelectedIndustries([]);
    setMaxFee(1000);
  };

  const activeFilterCount =
    selectedServices.length +
    selectedWaterTypes.length +
    selectedIndustries.length +
    (maxFee < 1000 ? 1 : 0);
  const hasFilters = activeFilterCount > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Top search bar */}
      <div className="bg-primary py-5 px-4">
        <div className="max-w-7xl mx-auto">
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
              className="h-11 px-6 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
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
            {loading ? "Loading…" : `${haulers.length} hauler${haulers.length !== 1 ? "s" : ""} found`}
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
              <span className="bg-primary text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
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
                <h2 className="font-serif font-bold text-base">Filters</h2>
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
                selectedWaterTypes={selectedWaterTypes}
                setSelectedWaterTypes={setSelectedWaterTypes}
                selectedIndustries={selectedIndustries}
                setSelectedIndustries={setSelectedIndustries}
                maxFee={maxFee}
                setMaxFee={setMaxFee}
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                {query && (
                  <p className="text-sm text-muted-foreground mb-0.5">
                    Results for{" "}
                    <span className="font-medium text-foreground">"{query}"</span>
                  </p>
                )}
                <p className="text-sm text-muted-foreground hidden lg:block">
                  {loading
                    ? "Loading…"
                    : `${haulers.length} hauler${haulers.length !== 1 ? "s" : ""} found`}
                </p>
              </div>
              {hasFilters && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedServices.map((s) => (
                    <Badge key={s} variant="secondary" className="gap-1 text-xs">
                      {SERVICE_LABEL[s]}
                      <button
                        onClick={() =>
                          setSelectedServices(selectedServices.filter((x) => x !== s))
                        }
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                  {selectedIndustries.map((ind) => (
                    <Badge key={ind} variant="secondary" className="gap-1 text-xs">
                      {INDUSTRY_LABEL[ind]}
                      <button
                        onClick={() =>
                          setSelectedIndustries(selectedIndustries.filter((x) => x !== ind))
                        }
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                  {selectedWaterTypes.map((w) => (
                    <Badge key={w} variant="secondary" className="gap-1 text-xs">
                      {WATER_TYPES.find((wt) => wt.value === w)?.label}
                      <button
                        onClick={() =>
                          setSelectedWaterTypes(selectedWaterTypes.filter((x) => x !== w))
                        }
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                  {maxFee < 1000 && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <DollarSign className="h-3 w-3" />≤ ${maxFee}
                      <button onClick={() => setMaxFee(1000)}>
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
            ) : haulers.length === 0 ? (
              <div className="text-center py-16">
                <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                <h3 className="font-serif font-semibold text-lg mb-1">No haulers found</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Try adjusting your filters or searching a different city or ZIP code.
                </p>
                {hasFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {haulers.map((h) => (
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
