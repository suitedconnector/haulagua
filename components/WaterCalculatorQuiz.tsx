"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Droplet } from "lucide-react";

// ============================================================================
// SHADCN/UI COMPONENT STUBS
// In a real project, import these from your shadcn/ui library
// ============================================================================

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" }
>(({ className, variant = "default", ...props }, ref) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyles =
    variant === "outline"
      ? "border-2 border-current bg-transparent hover:bg-current/10"
      : "bg-[#005A9C] text-white hover:bg-[#004a80]";
  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    className={`flex h-10 w-full rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-[#005A9C] focus-visible:ring-2 focus-visible:ring-[#005A9C]/20 ${className}`}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: number }
>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
    {...props}
  >
    <div
      className="h-full bg-[#005A9C] transition-all duration-500"
      style={{ width: `${value}%` }}
    />
  </div>
));
Progress.displayName = "Progress";

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    type="checkbox"
    className={`h-5 w-5 rounded border-2 border-gray-300 bg-white cursor-pointer accent-[#005A9C] ${className}`}
    ref={ref}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type ServiceType = "pool" | "construction" | "drinking" | "agricultural" | "emergency" | "event";

type Answers = {
  // Pool
  poolType?: "new" | "top-off";
  poolSize?: "small" | "medium" | "large" | "xl";
  // Construction
  constructionSize?: "small" | "medium" | "large";
  constructionDuration?: "single" | "weekly" | "ongoing";
  // Drinking Water
  tankSize?: "under500" | "500-2500" | "2500-5000" | "over5000";
  deliveryFrequency?: "one-time" | "monthly" | "weekly";
  // Agricultural
  agriUse?: "livestock" | "crops" | "both";
  agriAcreage?: "under10" | "10-50" | "over50";
  // Emergency
  emergencyType?: "dry-well" | "wildfire-prep" | "flood-recovery" | "other";
  emergencyUrgency?: "today" | "48-hours" | "this-week";
  // Event
  eventType?: "mud-bog" | "festival" | "sporting" | "other";
  eventAttendance?: "under500" | "500-2000" | "over2000";
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const QuizStep = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className="w-full"
  >
    {children}
  </motion.div>
);

const OptionCard = ({
  icon,
  label,
  isSelected,
  onClick,
}: {
  icon: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full p-6 border-2 rounded-lg transition-all duration-200 text-center ${
      isSelected
        ? "border-[#005A9C] bg-[#005A9C]/10 ring-2 ring-[#005A9C]"
        : "border-gray-300 bg-white hover:border-[#005A9C]/50 hover:shadow-md"
    }`}
  >
    <span className="text-4xl mb-3">{icon}</span>
    <span className="font-lato text-base text-[#333333] font-medium">{label}</span>
  </button>
);

const TextOptionCard = ({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full p-4 border-2 rounded-lg transition-all duration-200 text-center font-lato text-base ${
      isSelected
        ? "border-[#005A9C] bg-[#005A9C] text-white ring-2 ring-[#005A9C]"
        : "border-gray-300 bg-white text-[#333333] hover:border-[#005A9C]/50 hover:shadow-md"
    }`}
  >
    {label}
  </button>
);

// ============================================================================
// MAIN QUIZ COMPONENT
// ============================================================================

export default function WaterCalculatorQuiz() {
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [zipCode, setZipCode] = useState("");
  const [contactInfo, setContactInfo] = useState({ name: "", email: "", phone: "" });
  const [optIn, setOptIn] = useState(true);
  const [zipError, setZipError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const totalSteps = 5;

  // ========================================================================
  // NAVIGATION LOGIC
  // ========================================================================

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleServiceSelect = (type: ServiceType) => {
    setServiceType(type);
    setAnswers({}); // Reset answers when service type changes
    handleNext();
  };

  const handleAnswerSelect = (key: keyof Answers, value: any) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleZipSubmit = () => {
    const zipRegex = /^\d{5}$/;
    if (zipRegex.test(zipCode)) {
      setZipError("");
      handleNext();
    } else {
      setZipError("Please enter a valid 5-digit US ZIP code.");
    }
  };

  const canProceedFromStep2 = () => {
    if (!serviceType) return false;
    switch (serviceType) {
      case "pool":
        return answers.poolType && answers.poolSize;
      case "construction":
        return answers.constructionSize && answers.constructionDuration;
      case "drinking":
        return answers.tankSize && answers.deliveryFrequency;
      case "agricultural":
        return answers.agriUse && answers.agriAcreage;
      case "emergency":
        return answers.emergencyType && answers.emergencyUrgency;
      case "event":
        return answers.eventType && answers.eventAttendance;
      default:
        return false;
    }
  };

  // ========================================================================
  // CALCULATION LOGIC
  // Estimates water needs based on user answers
  // ========================================================================

  const estimatedGallons = useMemo(() => {
    switch (serviceType) {
      case "pool": {
        const poolEstimates = {
          new: { small: 8000, medium: 15000, large: 25000, xl: 40000 },
          "top-off": { small: 1000, medium: 2500, large: 4000, xl: 6000 },
        };
        const fillType = answers.poolType || "new";
        const size = answers.poolSize || "medium";
        return poolEstimates[fillType][size as keyof typeof poolEstimates.new];
      }
      case "construction": {
        const dailyRates = { small: 2000, medium: 5000, large: 10000 };
        const baseRate = dailyRates[answers.constructionSize as keyof typeof dailyRates] || 5000;
        const duration = answers.constructionDuration;
        if (duration === "single") return baseRate;
        if (duration === "weekly") return baseRate * 5;
        if (duration === "ongoing") return baseRate * 20; // Monthly estimate
        return baseRate;
      }
      case "drinking": {
        const tankSizes = {
          under500: 400,
          "500-2500": 1500,
          "2500-5000": 3500,
          over5000: 7500,
        };
        return tankSizes[answers.tankSize as keyof typeof tankSizes] || 1500;
      }
      case "agricultural": {
        const acreageEstimates = { under10: 1000, "10-50": 5000, over50: 15000 };
        return acreageEstimates[answers.agriAcreage as keyof typeof acreageEstimates] || 5000;
      }
      case "emergency":
        return 5000; // Standard emergency estimate
      case "event": {
        const attendanceEstimates = { under500: 2000, "500-2000": 5000, over2000: 10000 };
        return attendanceEstimates[answers.eventAttendance as keyof typeof attendanceEstimates] || 5000;
      }
      default:
        return 5000;
    }
  }, [serviceType, answers]);

  // ========================================================================
  // SUBMISSION LOGIC
  // Captures lead data and logs it
  // ========================================================================

  const handleSubmit = async () => {
    if (!contactInfo.name || !contactInfo.email) {
      alert("Please fill in your name and email.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone,
          zipCode,
          serviceType,
          estimatedGallons,
          optIn,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError((data as { error?: string }).error ?? "Submission failed. Please try again.");
        return;
      }

      handleNext();
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================================
  // RENDER LOGIC
  // Renders the current step of the quiz
  // ========================================================================

  const renderStep = () => {
    switch (step) {
      // ====================================================================
      // STEP 1: SERVICE TYPE SELECTION
      // ====================================================================
      case 1:
        return (
          <QuizStep>
            <h2 className="font-montserrat text-3xl font-bold text-center text-[#333333] mb-8">
              What do you need water for?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <OptionCard
                icon="🏊"
                label="Swimming Pool"
                isSelected={serviceType === "pool"}
                onClick={() => handleServiceSelect("pool")}
              />
              <OptionCard
                icon="🏗️"
                label="Construction / Dust Control"
                isSelected={serviceType === "construction"}
                onClick={() => handleServiceSelect("construction")}
              />
              <OptionCard
                icon="🚰"
                label="Drinking Water / Cistern"
                isSelected={serviceType === "drinking"}
                onClick={() => handleServiceSelect("drinking")}
              />
              <OptionCard
                icon="🌾"
                label="Agricultural / Livestock"
                isSelected={serviceType === "agricultural"}
                onClick={() => handleServiceSelect("agricultural")}
              />
              <OptionCard
                icon="🚨"
                label="Emergency"
                isSelected={serviceType === "emergency"}
                onClick={() => handleServiceSelect("emergency")}
              />
              <OptionCard
                icon="🎪"
                label="Event"
                isSelected={serviceType === "event"}
                onClick={() => handleServiceSelect("event")}
              />
            </div>
          </QuizStep>
        );

      // ====================================================================
      // STEP 2: CONDITIONAL QUESTIONS BASED ON SERVICE TYPE
      // ====================================================================
      case 2:
        return (
          <QuizStep>
            <h2 className="font-montserrat text-3xl font-bold text-center text-[#333333] mb-8">
              Tell us more...
            </h2>
            <div className="space-y-8">
              {/* POOL */}
              {serviceType === "pool" && (
                <>
                  <div>
                    <h3 className="font-montserrat text-xl font-semibold text-center text-[#333333] mb-4">
                      Is this a new fill or a top-off?
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <TextOptionCard
                        label="New Fill"
                        isSelected={answers.poolType === "new"}
                        onClick={() => handleAnswerSelect("poolType", "new")}
                      />
                      <TextOptionCard
                        label="Top-Off"
                        isSelected={answers.poolType === "top-off"}
                        onClick={() => handleAnswerSelect("poolType", "top-off")}
                      />
                    </div>
                  </div>

                  {answers.poolType && (
                    <div>
                      <h3 className="font-montserrat text-xl font-semibold text-center text-[#333333] mb-4">
                        What is your approximate pool size?
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <TextOptionCard
                          label="Small (&lt;10k gal)"
                          isSelected={answers.poolSize === "small"}
                          onClick={() => handleAnswerSelect("poolSize", "small")}
                        />
                        <TextOptionCard
                          label="Medium (10-20k gal)"
                          isSelected={answers.poolSize === "medium"}
                          onClick={() => handleAnswerSelect("poolSize", "medium")}
                        />
                        <TextOptionCard
                          label="Large (20-30k gal)"
                          isSelected={answers.poolSize === "large"}
                          onClick={() => handleAnswerSelect("poolSize", "large")}
                        />
                        <TextOptionCard
                          label="XL (30k+ gal)"
                          isSelected={answers.poolSize === "xl"}
                          onClick={() => handleAnswerSelect("poolSize", "xl")}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* CONSTRUCTION */}
              {serviceType === "construction" && (
                <>
                  <div>
                    <h3 className="font-montserrat text-xl font-semibold text-center text-[#333333] mb-4">
                      What is the job site size?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <TextOptionCard
                        label="Small (&lt;1 acre)"
                        isSelected={answers.constructionSize === "small"}
                        onClick={() => handleAnswerSelect("constructionSize", "small")}
                      />
                      <TextOptionCard
                        label="Medium (1-5 acres)"
                        isSelected={answers.constructionSize === "medium"}
                        onClick={() => handleAnswerSelect("constructionSize", "medium")}
                      />
                      <TextOptionCard
                        label="Large (5+ acres)"
                        isSelected={answers.constructionSize === "large"}
                        onClick={() => handleAnswerSelect("constructionSize", "large")}
                      />
                    </div>
                  </div>

                  {answers.constructionSize && (
                    <div>
                      <h3 className="font-montserrat text-xl font-semibold text-center text-[#333333] mb-4">
                        How many days do you need water?
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TextOptionCard
                          label="Single Delivery"
                          isSelected={answers.constructionDuration === "single"}
                          onClick={() => handleAnswerSelect("constructionDuration", "single")}
                        />
                        <TextOptionCard
                          label="Weekly"
                          isSelected={answers.constructionDuration === "weekly"}
                          onClick={() => handleAnswerSelect("constructionDuration", "weekly")}
                        />
                        <TextOptionCard
                          label="Ongoing"
                          isSelected={answers.constructionDuration === "ongoing"}
                          onClick={() => handleAnswerSelect("constructionDuration", "ongoing")}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* DRINKING WATER / CISTERN */}
              {serviceType === "drinking" && (
                <>
                  <div>
                    <h3 className="font-montserrat text-xl font-semibold text-center text-[#333333] mb-4">
                      What is your tank size?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <TextOptionCard
                        label="Under 500 gal"
                        isSelected={answers.tankSize === "under500"}
                        onClick={() => handleAnswerSelect("tankSize", "under500")}
                      />
                      <TextOptionCard
                        label="500 - 2,500 gal"
                        isSelected={answers.tankSize === "500-2500"}
                        onClick={() => handleAnswerSelect("tankSize", "500-2500")}
                      />
                      <TextOptionCard
                        label="2,500 - 5,000 gal"
                        isSelected={answers.tankSize === "2500-5000"}
                        onClick={() => handleAnswerSelect("tankSize", "2500-5000")}
                      />
                      <TextOptionCard
                        label="5,000+ gal"
                        isSelected={answers.tankSize === "over5000"}
                        onClick={() => handleAnswerSelect("tankSize", "over5000")}
                      />
                    </div>
                  </div>

                  {answers.tankSize && (
                    <div>
                      <h3 className="font-montserrat text-xl font-semibold text-center text-[#333333] mb-4">
                        How often do you need delivery?
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TextOptionCard
                          label="One Time"
                          isSelected={answers.deliveryFrequency === "one-time"}
                          onClick={() => handleAnswerSelect("deliveryFrequency", "one-time")}
                        />
                        <TextOptionCard
                          label="Monthly"
                          isSelected={answers.deliveryFrequency === "monthly"}
                          onClick={() => handleAnswerSelect("deliveryFrequency", "monthly")}
                        />
                        <TextOptionCard
                          label="Weekly"
                          isSelected={answers.deliveryFrequency === "weekly"}
                          onClick={() => handleAnswerSelect("deliveryFrequency", "weekly")}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* AGRICULTURAL */}
              {serviceType === "agricultural" && (
                <>
                  <div>
                    <h3 className="font-montserrat text-xl font-semibold text-center text-[#333333] mb-4">
                      What are you watering?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <TextOptionCard
                        label="Livestock"
                        isSelected={answers.agriUse === "livestock"}
                        onClick={() => handleAnswerSelect("agriUse", "livestock")}
                      />
                      <TextOptionCard
                        label="Crops"
                        isSelected={answers.agriUse === "crops"}
                        onClick={() => handleAnswerSelect("agriUse", "crops")}
                      />
                      <TextOptionCard
                        label="Both"
                        isSelected={answers.agriUse === "both"}
                        onClick={() => handleAnswerSelect("agriUse", "both")}
                      />
                    </div>
                  </div>

                  {answers.agriUse && (
                    <div>
                      <h3 className="font-montserrat text-xl font-semibold text-center text-[#333333] mb-4">
                        Approximate acreage?
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TextOptionCard
                          label="Under 10 acres"
                          isSelected={answers.agriAcreage === "under10"}
                          onClick={() => handleAnswerSelect("agriAcreage", "under10")}
                        />
                        <TextOptionCard
                          label="10-50 acres"
                          isSelected={answers.agriAcreage === "10-50"}
                          onClick={() => handleAnswerSelect("agriAcreage", "10-50")}
                        />
                        <TextOptionCard
                          label="50+ acres"
                          isSelected={answers.agriAcreage === "over50"}
                          onClick={() => handleAnswerSelect("agriAcreage", "over50")}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* EMERGENCY */}
              {serviceType === "emergency" && (
                <>
                  <div>
                    <h3 className="font-montserrat text-xl font-semibold text-center text-[#333333] mb-4">
                      What is the emergency?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <TextOptionCard
                        label="Dry Well"
                        isSelected={answers.emergencyType === "dry-well"}
                        onClick={() => handleAnswerSelect("emergencyType", "dry-well")}
                      />
                      <TextOptionCard
                        label="Wildfire Prep"
                        isSelected={answers.emergencyType === "wildfire-prep"}
                        onClick={() => handleAnswerSelect("emergencyType", "wildfire-prep")}
                      />
                      <TextOptionCard
                        label="Flood Recovery"
                        isSelected={answers.emergencyType === "flood-recovery"}
                        onClick={() => handleAnswerSelect("emergencyType", "flood-recovery")}
                      />
                      <TextOptionCard
                        label="Other"
                        isSelected={answers.emergencyType === "other"}
                        onClick={() => handleAnswerSelect("emergencyType", "other")}
                      />
                    </div>
                  </div>

                  {answers.emergencyType && (
                    <div>
                      <h3 className="font-montserrat text-xl font-semibold text-center text-[#333333] mb-4">
                        How urgent?
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TextOptionCard
                          label="Today"
                          isSelected={answers.emergencyUrgency === "today"}
                          onClick={() => handleAnswerSelect("emergencyUrgency", "today")}
                        />
                        <TextOptionCard
                          label="Within 48 Hours"
                          isSelected={answers.emergencyUrgency === "48-hours"}
                          onClick={() => handleAnswerSelect("emergencyUrgency", "48-hours")}
                        />
                        <TextOptionCard
                          label="This Week"
                          isSelected={answers.emergencyUrgency === "this-week"}
                          onClick={() => handleAnswerSelect("emergencyUrgency", "this-week")}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* EVENT */}
              {serviceType === "event" && (
                <>
                  <div>
                    <h3 className="font-montserrat text-xl font-semibold text-center text-[#333333] mb-4">
                      What type of event?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <TextOptionCard
                        label="Mud Bog"
                        isSelected={answers.eventType === "mud-bog"}
                        onClick={() => handleAnswerSelect("eventType", "mud-bog")}
                      />
                      <TextOptionCard
                        label="Festival"
                        isSelected={answers.eventType === "festival"}
                        onClick={() => handleAnswerSelect("eventType", "festival")}
                      />
                      <TextOptionCard
                        label="Sporting Event"
                        isSelected={answers.eventType === "sporting"}
                        onClick={() => handleAnswerSelect("eventType", "sporting")}
                      />
                      <TextOptionCard
                        label="Other"
                        isSelected={answers.eventType === "other"}
                        onClick={() => handleAnswerSelect("eventType", "other")}
                      />
                    </div>
                  </div>

                  {answers.eventType && (
                    <div>
                      <h3 className="font-montserrat text-xl font-semibold text-center text-[#333333] mb-4">
                        Expected attendance?
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TextOptionCard
                          label="Under 500"
                          isSelected={answers.eventAttendance === "under500"}
                          onClick={() => handleAnswerSelect("eventAttendance", "under500")}
                        />
                        <TextOptionCard
                          label="500-2,000"
                          isSelected={answers.eventAttendance === "500-2000"}
                          onClick={() => handleAnswerSelect("eventAttendance", "500-2000")}
                        />
                        <TextOptionCard
                          label="2,000+"
                          isSelected={answers.eventAttendance === "over2000"}
                          onClick={() => handleAnswerSelect("eventAttendance", "over2000")}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Proceed Button */}
            {canProceedFromStep2() && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <Button
                  onClick={handleNext}
                  className="w-full py-3 text-lg font-semibold"
                >
                  Continue
                </Button>
              </motion.div>
            )}
          </QuizStep>
        );

      // ====================================================================
      // STEP 3: ZIP CODE INPUT
      // ====================================================================
      case 3:
        return (
          <QuizStep>
            <h2 className="font-montserrat text-3xl font-bold text-center text-[#333333] mb-8">
              Where are you located?
            </h2>
            <div className="max-w-sm mx-auto space-y-4">
              <Input
                type="text"
                placeholder="Enter your 5-digit ZIP code"
                value={zipCode}
                onChange={(e) => {
                  setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5));
                  setZipError("");
                }}
                maxLength={5}
                className="text-center text-lg font-lato"
              />
              {zipError && (
                <p className="text-red-600 text-sm text-center font-lato">{zipError}</p>
              )}
              <Button
                onClick={handleZipSubmit}
                className="w-full py-3 text-lg font-semibold"
              >
                Continue
              </Button>
            </div>
          </QuizStep>
        );

      // ====================================================================
      // STEP 4: LEAD CAPTURE FORM
      // ====================================================================
      case 4:
        return (
          <QuizStep>
            <h2 className="font-montserrat text-3xl font-bold text-center text-[#333333] mb-2">
              Almost there!
            </h2>
            <p className="text-center font-lato text-gray-600 mb-8">
              Enter your info to see your results and get connected with local haulers.
            </p>
            <div className="max-w-sm mx-auto space-y-5">
              <div>
                <label className="block text-sm font-lato font-semibold text-[#333333] mb-2">
                  First Name *
                </label>
                <Input
                  type="text"
                  placeholder="John"
                  value={contactInfo.name}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-lato font-semibold text-[#333333] mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={contactInfo.email}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-lato font-semibold text-[#333333] mb-2">
                  Phone (optional)
                </label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={contactInfo.phone}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <Checkbox
                  id="opt-in"
                  checked={optIn}
                  onChange={(e) => setOptIn((e.target as HTMLInputElement).checked)}
                />
                <label
                  htmlFor="opt-in"
                  className="text-sm font-lato text-gray-700 cursor-pointer"
                >
                  Contact me with quotes from local haulers
                </label>
              </div>
              {submitError && (
                <p className="text-red-600 text-sm text-center font-lato">{submitError}</p>
              )}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3 text-lg font-semibold mt-6"
              >
                {isSubmitting ? "Submitting..." : "See My Results"}
              </Button>
            </div>
          </QuizStep>
        );

      // ====================================================================
      // STEP 5: RESULTS SCREEN
      // ====================================================================
      case 5:
        return (
          <QuizStep>
            <div className="text-center">
              <h2 className="font-montserrat text-3xl font-bold text-[#333333] mb-8">
                Here's Your Estimate!
              </h2>

              {/* Water Drop Icon & Gallon Estimate */}
              <div className="flex flex-col items-center justify-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto mb-8">
                <Droplet className="w-20 h-20 text-[#005A9C] mb-4" />
                <p className="font-lato text-lg text-gray-600 mb-2">Estimated Water Needed:</p>
                <p className="font-montserrat font-extrabold text-5xl text-[#333333]">
                  {estimatedGallons.toLocaleString()}
                </p>
                <p className="font-lato text-lg text-gray-600 mt-2">gallons</p>
              </div>

              {/* Summary Box */}
              <div className="max-w-md mx-auto bg-[#F8F9FA] p-6 rounded-lg mb-8 text-left">
                <h4 className="font-montserrat font-bold text-lg text-[#333333] mb-4">
                  Your Project Summary:
                </h4>
                <div className="space-y-3 font-lato text-gray-700">
                  <p>
                    <strong>Service Type:</strong>{" "}
                    <span className="capitalize">
                      {serviceType?.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </p>
                  <p>
                    <strong>Location (ZIP):</strong> {zipCode}
                  </p>
                  <p>
                    <strong>Name:</strong> {contactInfo.name}
                  </p>
                  {contactInfo.phone && (
                    <p>
                      <strong>Phone:</strong> {contactInfo.phone}
                    </p>
                  )}
                  <p>
                    <strong>Opt-In to Quotes:</strong> {optIn ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="max-w-md mx-auto space-y-4">
                <Button
                  onClick={() =>
                    router.push(
                      `/search?zip=${zipCode}&serviceType=${serviceType}`
                    )
                  }
                  className="w-full py-4 text-lg font-semibold"
                >
                  Find Haulers Near Me →
                </Button>
                <Button
                  variant="outline"
                  className="w-full py-4 text-lg font-semibold border-[#F2A900] text-[#F2A900] hover:bg-[#F2A900]/10"
                >
                  Get Free Quotes by Email
                </Button>
              </div>
            </div>
          </QuizStep>
        );

      default:
        return null;
    }
  };

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8 bg-[#F8F9FA] rounded-lg shadow-lg font-lato">
      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={(step / totalSteps) * 100} />
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs font-lato text-gray-600">
            Step {step} of {totalSteps}
          </span>
          {step > 1 && step !== totalSteps && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm font-lato text-[#005A9C] hover:text-[#004a80] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
    </div>
  );
}
