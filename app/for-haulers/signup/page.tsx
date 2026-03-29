"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, ArrowRight, ArrowLeft, Droplets } from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────

const SERVICE_TYPES = [
  { id: "pool", label: "Pool Fill / Top-Off" },
  { id: "construction", label: "Construction / Dust Control" },
  { id: "potable", label: "Potable / Drinking Water" },
  { id: "agricultural", label: "Agricultural / Livestock" },
  { id: "emergency", label: "Emergency" },
  { id: "oil-gas", label: "Oil & Gas" },
  { id: "events", label: "Events" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

const TOTAL_STEPS = 3;

// ── Types ─────────────────────────────────────────────────────────────────────

type Step1 = {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  zip: string;
  yearFounded: string;
  website: string;
};

type Step2 = {
  serviceTypes: string[];
  truckCapacity: string;
  hoseLength: string;
  minFee: string;
  waterSource: string;
  potableCertified: boolean;
  overflowPrevention: boolean;
};

type Step3 = {
  description: string;
  serviceArea: string;
};

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-3">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div key={n} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                  done
                    ? "bg-[#005A9C] text-white"
                    : active
                    ? "bg-[#005A9C] text-white ring-4 ring-[#005A9C]/20"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {done ? <CheckCircle className="w-4 h-4" /> : n}
              </div>
              {i < TOTAL_STEPS - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-colors ${
                    done ? "bg-[#005A9C]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-500 font-medium">
        <span>Business Basics</span>
        <span>Services & Equipment</span>
        <span>About Your Business</span>
      </div>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="font-semibold text-[#333333]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
        checked ? "border-[#005A9C] bg-[#005A9C]/5" : "border-gray-200 bg-white"
      }`}
      onClick={() => onChange(!checked)}
    >
      <div
        className={`w-11 h-6 rounded-full relative flex items-center shrink-0 transition-colors ${
          checked ? "bg-[#005A9C]" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full absolute transition-transform shadow-sm ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </div>
      <div>
        <p className="font-semibold text-[#333333] text-sm">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HaulerSignupPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [step1, setStep1] = useState<Step1>({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    zip: "",
    yearFounded: "",
    website: "",
  });

  const [step2, setStep2] = useState<Step2>({
    serviceTypes: [],
    truckCapacity: "",
    hoseLength: "",
    minFee: "",
    waterSource: "",
    potableCertified: false,
    overflowPrevention: false,
  });

  const [step3, setStep3] = useState<Step3>({
    description: "",
    serviceArea: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Validation ──────────────────────────────────────────────────────────────

  function validateStep1(): boolean {
    const e: Record<string, string> = {};
    if (!step1.businessName.trim()) e.businessName = "Business name is required";
    if (!step1.ownerName.trim()) e.ownerName = "Owner name is required";
    if (!step1.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1.email))
      e.email = "Valid email is required";
    if (!step1.phone.trim()) e.phone = "Phone number is required";
    if (!step1.city.trim()) e.city = "City is required";
    if (!step1.state) e.state = "State is required";
    if (!step1.zip.trim() || !/^\d{5}$/.test(step1.zip)) e.zip = "Valid 5-digit ZIP is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2(): boolean {
    const e: Record<string, string> = {};
    if (step2.serviceTypes.length === 0) e.serviceTypes = "Select at least one service type";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep3(): boolean {
    const e: Record<string, string> = {};
    if (!step3.description.trim()) e.description = "Business description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  function handleNext() {
    setErrors({});
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3) {
      if (!validateStep3()) return;
      handleSubmit();
      return;
    }
    setStep((s) => s + 1);
  }

  function handleBack() {
    setErrors({});
    setStep((s) => s - 1);
  }

  // ── Submission ──────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");

    // Map waterSource to Strapi's waterType enum
    const waterTypeMap: Record<string, string> = {
      Municipal: "potable",
      Well: "non-potable",
      Both: "both",
      Other: "non-potable",
    };

    const payload = {
      name: step1.businessName.trim(),
      email: step1.email.trim(),
      phone: step1.phone.trim(),
      website: step1.website.trim() || null,
      city: step1.city.trim(),
      state: step1.state,
      zip: step1.zip.trim(),
      description: step3.description.trim(),
      serviceArea: step3.serviceArea.trim() || null,
      minFee: step2.minFee ? parseFloat(step2.minFee) : null,
      truckCapacity: step2.truckCapacity ? parseInt(step2.truckCapacity) : null,
      hoseLength: step2.hoseLength ? parseInt(step2.hoseLength) : null,
      waterType: waterTypeMap[step2.waterSource] ?? null,
      industries: {
        serviceTypes: step2.serviceTypes,
        ownerName: step1.ownerName.trim(),
        yearFounded: step1.yearFounded || null,
        waterSource: step2.waterSource || null,
        potableCertified: step2.potableCertified,
        overflowPrevention: step2.overflowPrevention,
      },
    };

    try {
      const res = await fetch("/api/haulers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Confirmation screen ─────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20 px-4 bg-[#F8F9FA]">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="font-montserrat text-3xl font-bold text-[#333333] mb-4">
              Listing Submitted!
            </h1>
            <p className="font-lato text-gray-600 leading-relaxed mb-8">
              Thanks for joining Haulagua,{" "}
              <strong>{step1.ownerName.split(" ")[0]}</strong>! Your listing for{" "}
              <strong>{step1.businessName}</strong> has been submitted. We'll review
              and publish it within 24 hours.
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-5 text-left mb-8 space-y-2 text-sm font-lato text-gray-700">
              <p>
                <strong>Business:</strong> {step1.businessName}
              </p>
              <p>
                <strong>Location:</strong> {step1.city}, {step1.state} {step1.zip}
              </p>
              <p>
                <strong>Services:</strong>{" "}
                {step2.serviceTypes
                  .map((s) => SERVICE_TYPES.find((t) => t.id === s)?.label ?? s)
                  .join(", ")}
              </p>
            </div>
            <Button
              asChild
              className="w-full bg-[#005A9C] hover:bg-[#004a80] text-white font-semibold py-3"
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-[#F8F9FA] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Droplets className="w-7 h-7 text-[#005A9C]" />
              <span className="font-montserrat text-lg font-bold text-[#005A9C] tracking-wide">
                Haulagua
              </span>
            </div>
            <h1 className="font-montserrat text-3xl font-bold text-[#333333]">
              Create Your Free Listing
            </h1>
            <p className="font-lato text-gray-500 mt-2">
              Get in front of customers actively searching for water haulers
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <ProgressBar step={step} />

            {/* ── Step 1: Business Basics ────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="font-montserrat text-xl font-bold text-[#333333]">
                  Business Basics
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Business Name" required error={errors.businessName}>
                    <Input
                      placeholder="Acme Water Hauling"
                      value={step1.businessName}
                      onChange={(e) => setStep1((p) => ({ ...p, businessName: e.target.value }))}
                    />
                  </Field>
                  <Field label="Owner / Contact Name" required error={errors.ownerName}>
                    <Input
                      placeholder="John Smith"
                      value={step1.ownerName}
                      onChange={(e) => setStep1((p) => ({ ...p, ownerName: e.target.value }))}
                    />
                  </Field>
                  <Field label="Email Address" required error={errors.email}>
                    <Input
                      type="email"
                      placeholder="john@acmehauling.com"
                      value={step1.email}
                      onChange={(e) => setStep1((p) => ({ ...p, email: e.target.value }))}
                    />
                  </Field>
                  <Field label="Phone Number" required error={errors.phone}>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={step1.phone}
                      onChange={(e) => setStep1((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </Field>
                  <Field label="City" required error={errors.city}>
                    <Input
                      placeholder="Austin"
                      value={step1.city}
                      onChange={(e) => setStep1((p) => ({ ...p, city: e.target.value }))}
                    />
                  </Field>
                  <Field label="State" required error={errors.state}>
                    <Select
                      value={step1.state}
                      onValueChange={(v) => setStep1((p) => ({ ...p, state: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="ZIP Code" required error={errors.zip}>
                    <Input
                      placeholder="78701"
                      maxLength={5}
                      value={step1.zip}
                      onChange={(e) =>
                        setStep1((p) => ({
                          ...p,
                          zip: e.target.value.replace(/\D/g, "").slice(0, 5),
                        }))
                      }
                    />
                  </Field>
                  <Field label="Year Founded">
                    <Input
                      placeholder="2010"
                      maxLength={4}
                      value={step1.yearFounded}
                      onChange={(e) =>
                        setStep1((p) => ({
                          ...p,
                          yearFounded: e.target.value.replace(/\D/g, "").slice(0, 4),
                        }))
                      }
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Website URL">
                      <Input
                        type="url"
                        placeholder="https://www.acmehauling.com"
                        value={step1.website}
                        onChange={(e) => setStep1((p) => ({ ...p, website: e.target.value }))}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Services & Equipment ──────────────────────────── */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-montserrat text-xl font-bold text-[#333333]">
                  Services & Equipment
                </h2>

                {/* Service types */}
                <div>
                  <Label className="font-semibold text-[#333333] mb-3 block">
                    Service Types <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICE_TYPES.map((type) => {
                      const checked = step2.serviceTypes.includes(type.id);
                      return (
                        <label
                          key={type.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all select-none ${
                            checked
                              ? "border-[#005A9C] bg-[#005A9C]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              setStep2((p) => ({
                                ...p,
                                serviceTypes: v
                                  ? [...p.serviceTypes, type.id]
                                  : p.serviceTypes.filter((s) => s !== type.id),
                              }));
                            }}
                          />
                          <span className="font-lato text-sm text-[#333333]">{type.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.serviceTypes && (
                    <p className="text-red-500 text-xs mt-2">{errors.serviceTypes}</p>
                  )}
                </div>

                {/* Equipment */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <Field label="Truck Capacity (gal)">
                    <Input
                      type="number"
                      placeholder="4000"
                      min={0}
                      value={step2.truckCapacity}
                      onChange={(e) => setStep2((p) => ({ ...p, truckCapacity: e.target.value }))}
                    />
                  </Field>
                  <Field label="Hose Length (ft)">
                    <Input
                      type="number"
                      placeholder="200"
                      min={0}
                      value={step2.hoseLength}
                      onChange={(e) => setStep2((p) => ({ ...p, hoseLength: e.target.value }))}
                    />
                  </Field>
                  <Field label="Minimum Fee ($)">
                    <Input
                      type="number"
                      placeholder="150"
                      min={0}
                      value={step2.minFee}
                      onChange={(e) => setStep2((p) => ({ ...p, minFee: e.target.value }))}
                    />
                  </Field>
                </div>

                {/* Water source */}
                <Field label="Water Source">
                  <Select
                    value={step2.waterSource}
                    onValueChange={(v) => setStep2((p) => ({ ...p, waterSource: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select water source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Municipal">Municipal</SelectItem>
                      <SelectItem value="Well">Well</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {/* Toggles */}
                <div className="space-y-3">
                  <Toggle
                    checked={step2.potableCertified}
                    onChange={(v) => setStep2((p) => ({ ...p, potableCertified: v }))}
                    label="Potable Water Certified"
                    description="You are certified to deliver drinking / potable water"
                  />
                  <Toggle
                    checked={step2.overflowPrevention}
                    onChange={(v) => setStep2((p) => ({ ...p, overflowPrevention: v }))}
                    label="Overflow Prevention Equipment"
                    description="Your truck is equipped with overflow prevention systems"
                  />
                </div>
              </div>
            )}

            {/* ── Step 3: About Your Business ───────────────────────────── */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-montserrat text-xl font-bold text-[#333333]">
                  About Your Business
                </h2>

                <Field
                  label="Business Description"
                  required
                  error={errors.description}
                >
                  <Textarea
                    placeholder="Tell customers about your business — how long you've been hauling, what makes you stand out, your commitment to service..."
                    className="min-h-[140px] resize-none"
                    value={step3.description}
                    onChange={(e) => setStep3((p) => ({ ...p, description: e.target.value }))}
                  />
                  <p className="text-xs text-gray-400 text-right mt-1">
                    {step3.description.length} characters
                  </p>
                </Field>

                <Field label="Service Area Description">
                  <Textarea
                    placeholder="e.g. We serve within 50 miles of Austin, TX — including Travis, Williamson, and Hays counties."
                    className="min-h-[100px] resize-none"
                    value={step3.serviceArea}
                    onChange={(e) => setStep3((p) => ({ ...p, serviceArea: e.target.value }))}
                  />
                </Field>

                {/* Summary preview */}
                <div className="bg-[#F8F9FA] rounded-lg border border-gray-200 p-5 space-y-2 text-sm font-lato text-gray-700">
                  <p className="font-montserrat font-bold text-[#333333] mb-3">
                    Listing Preview
                  </p>
                  <p>
                    <strong>Business:</strong> {step1.businessName}
                  </p>
                  <p>
                    <strong>Location:</strong> {step1.city}, {step1.state} {step1.zip}
                  </p>
                  <p>
                    <strong>Services:</strong>{" "}
                    {step2.serviceTypes.length > 0
                      ? step2.serviceTypes
                          .map((s) => SERVICE_TYPES.find((t) => t.id === s)?.label ?? s)
                          .join(", ")
                      : "—"}
                  </p>
                  {step2.truckCapacity && (
                    <p>
                      <strong>Truck Capacity:</strong>{" "}
                      {parseInt(step2.truckCapacity).toLocaleString()} gal
                    </p>
                  )}
                  {step2.minFee && (
                    <p>
                      <strong>Starting From:</strong> ${step2.minFee}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Navigation buttons ─────────────────────────────────────── */}
            {submitError && (
              <p className="mt-4 text-red-500 text-sm text-center bg-red-50 rounded-lg py-3 px-4">
                {submitError}
              </p>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="gap-2 border-gray-300 text-gray-600 hover:text-[#005A9C] hover:border-[#005A9C]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              <Button
                onClick={handleNext}
                disabled={submitting}
                className="bg-[#005A9C] hover:bg-[#004a80] text-white font-semibold px-8 gap-2"
              >
                {step === TOTAL_STEPS
                  ? submitting
                    ? "Submitting…"
                    : "Submit Listing"
                  : "Continue"}
                {step < TOTAL_STEPS && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 font-lato mt-6">
            Already listed?{" "}
            <Link href="/for-haulers" className="text-[#005A9C] hover:underline">
              Back to For Haulers
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
