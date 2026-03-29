"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ChevronLeft, ShieldCheck } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type PageProps = { params: Promise<{ slug: string }> };

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
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ClaimListingPage({ params }: PageProps) {
  const { slug } = use(params);

  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!ownerName.trim() || ownerName.trim().length < 2) e.ownerName = "Your name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Valid email is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          haulerSlug: slug,
          ownerName: ownerName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          message: message.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Confirmation ─────────────────────────────────────────────────────────────

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
              Claim Submitted!
            </h1>
            <p className="font-lato text-gray-600 leading-relaxed mb-8">
              Your claim request has been submitted! We will review and contact you at{" "}
              <strong>{email}</strong> within 24 hours.
            </p>
            <Button
              asChild
              className="w-full bg-[#005A9C] hover:bg-[#004a80] text-white font-semibold py-3"
            >
              <Link href={`/haulers/${slug}`}>← Back to Profile</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-[#F8F9FA] py-12 px-4">
        <div className="max-w-lg mx-auto">
          {/* Back link */}
          <Link
            href={`/haulers/${slug}`}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#005A9C] mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to listing
          </Link>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#005A9C]/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#005A9C]" />
              </div>
              <div>
                <h1 className="font-montserrat text-2xl font-bold text-[#333333]">
                  Claim This Listing
                </h1>
                <p className="text-sm text-gray-500 font-lato">
                  Verify ownership and take control of your profile
                </p>
              </div>
            </div>

            {/* Info banner */}
            <div className="bg-[#005A9C]/5 border border-[#005A9C]/20 rounded-lg p-4 mb-7">
              <p className="text-sm font-lato text-[#005A9C] leading-relaxed">
                We will verify your ownership and contact you within 24 hours. Once
                approved, you'll be able to edit your listing, add photos, and respond
                to inquiries.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Your Full Name" required error={errors.ownerName}>
                <Input
                  placeholder="Jane Smith"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </Field>

              <Field label="Email Address" required error={errors.email}>
                <Input
                  type="email"
                  placeholder="jane@yourcompany.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field label="Phone Number">
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>

              <Field label="Message (optional)">
                <Textarea
                  placeholder="Tell us anything that helps verify your ownership — e.g. your role, when the business was established, etc."
                  className="min-h-[100px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </Field>

              {submitError && (
                <p className="text-red-500 text-sm bg-red-50 rounded-lg py-3 px-4 text-center">
                  {submitError}
                </p>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#005A9C] hover:bg-[#004a80] text-white font-semibold py-3 mt-2"
              >
                {submitting ? "Submitting…" : "Submit Claim Request"}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
