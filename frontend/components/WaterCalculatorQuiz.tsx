// WaterCalculatorQuiz.tsx
// A multi-step quiz component for HaulAgua.com to help users estimate their bulk water needs.
// Built with React, TypeScript, Tailwind CSS, and shadcn/ui. Compatible with Next.js App Router.

"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation"; // Use Next.js App Router for navigation
import { motion, AnimatePresence } from "framer-motion"; // For smooth transitions

// --- SHADCN/UI COMPONENT IMPORTS ---
// In a real project, these would be imported from your actual component library, e.g., "@/components/ui/button"
// For this self-contained example, we'll define basic stubs for them.

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => (
  <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`} ref={ref} {...props} />
));
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} ref={ref} {...props} />
));
Input.displayName = "Input";

const Progress = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: number }>(({ className, value, ...props }, ref) => (
    <div ref={ref} className={`relative h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB] ${className}`} {...props}>
        <div className="h-full w-full flex-1 bg-[#005A9C] transition-all" style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
    </div>
));
Progress.displayName = "Progress";

const Checkbox = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { checked: boolean }>(({ className, checked, ...props }, ref) => (
    <button ref={ref} role="checkbox" aria-checked={checked} className={`peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground ${checked ? 'bg-[#005A9C]' : 'bg-transparent'} ${className}`} {...props}>
        {checked && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
    </button>
 ));
Checkbox.displayName = "Checkbox";

// --- TYPE DEFINITIONS ---
// Defines the structure for quiz answers and lead data.

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

// --- HELPER COMPONENTS ---
// Reusable components for quiz layout and options.

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

const OptionCard = ({ icon, label, isSelected, onClick }: { icon: string; label: string; isSelected: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full p-4 sm:p-6 border-2 rounded-lg transition-all duration-200 text-center ${
      isSelected ? 'border-[#005A9C] bg-[#005A9C]/10 ring-2 ring-[#005A9C]' : 'border-gray-300 bg-white hover:border-[#005A9C]/50'
    }`}
  >
    <span className="text-3xl sm:text-4xl mb-2">{icon}</span>
    <span className="font-lato text-sm sm:text-base text-[#333333]">{label}</span>
  </button>
);

const TextOptionCard = ({ label, isSelected, onClick }: { label: string; isSelected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-full p-4 border-2 rounded-lg transition-all duration-200 text-center font-lato text-base sm:text-lg ${
        isSelected ? 'border-[#005A9C] bg-[#005A9C] text-white ring-2 ring-[#005A9C]' : 'border-gray-300 bg-white text-[#333333] hover:border-[#005A9C]/50'
      }`}
    >
      {label}
    </button>
  );

// --- MAIN QUIZ COMPONENT ---

export default function WaterCalculatorQuiz() {
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [zipCode, setZipCode] = useState("");
  const [contactInfo, setContactInfo] = useState({ name: "", email: "", phone: "" });
  const [optIn, setOptIn] = useState(true);
  const [zipError, setZipError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const totalSteps = 5;

  // --- NAVIGATION LOGIC ---
  // Handles moving between steps and validating inputs.

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleServiceSelect = (type: ServiceType) => {
    setServiceType(type);
    setAnswers({}); // Reset answers when service type changes
    handleNext();
  };

  const handleAnswerSelect = (key: keyof Answers, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    handleNext();
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

  // --- CALCULATION LOGIC ---
  // Calculates estimated water needs based on user answers.
  
  const estimatedGallons = useMemo(() => {
    switch (serviceType) {
      case "pool":
        if (answers.poolType === "new") {
          return { small: 8000, medium: 15000, large: 25000, xl: 40000 }[answers.poolSize || "medium"];
        }
        return { small: 1000, medium: 2500, large: 4000, xl: 6000 }[answers.poolSize || "medium"];
      case "construction":
        const dailyRate = { small: 2000, medium: 5000, large: 10000 }[answers.constructionSize || "medium"];
        return answers.constructionDuration === "single" ? dailyRate : dailyRate * 5; // Simplified estimate for weekly/ongoing
      case "drinking":
        return { under500: 400, "500-2500": 1500, "2500-5000": 3500, over5000: 7500 }[answers.tankSize || "500-2500"];
      case "agricultural":
        return { under10: 1000, "10-50": 5000, over50: 15000 }[answers.agriAcreage || "10-50"];
      default:
        return 5000; // Default/Emergency/Event estimate
    }
  }, [serviceType, answers]);

  // --- SUBMISSION LOGIC ---
  // Gathers all data and logs it to the console. In a real app, this would call an API.

  const handleSubmit = async () => {
    if (!contactInfo.name || !contactInfo.email) {
      alert("Please fill in your name and email.");
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          estimatedGallons,
          zipCode,
          name: contactInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone,
          optIn,
        }),
      });
    } catch (err) {
      console.error('Lead submission error:', err);
    } finally {
      setIsSubmitting(false);
    }

    handleNext(); // Move to results screen
  };

  // --- RENDER LOGIC ---
  // Renders the current step of the quiz.

  const renderStep = () => {
    switch (step) {
      case 1: // Service Type
        return (
          <QuizStep>
            <h2 className="font-montserrat text-2xl sm:text-3xl font-bold text-center text-[#333333] mb-6">What do you need water for?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <OptionCard icon="🏊" label="Swimming Pool" isSelected={serviceType === "pool"} onClick={() => handleServiceSelect("pool")} />
              <OptionCard icon="🏗️" label="Construction" isSelected={serviceType === "construction"} onClick={() => handleServiceSelect("construction")} />
              <OptionCard icon="🚰" label="Drinking Water / Cistern" isSelected={serviceType === "drinking"} onClick={() => handleServiceSelect("drinking")} />
              <OptionCard icon="🌾" label="Agricultural / Livestock" isSelected={serviceType === "agricultural"} onClick={() => handleServiceSelect("agricultural")} />
              <OptionCard icon="🚨" label="Emergency" isSelected={serviceType === "emergency"} onClick={() => handleServiceSelect("emergency")} />
              <OptionCard icon="🎪" label="Event" isSelected={serviceType === "event"} onClick={() => handleServiceSelect("event")} />
            </div>
          </QuizStep>
        );

      case 2: // Conditional Questions
        return (
          <QuizStep>
            <h2 className="font-montserrat text-2xl sm:text-3xl font-bold text-center text-[#333333] mb-6">Tell us more...</h2>
            <div className="space-y-6">
              {serviceType === 'pool' && (
                <>
                  <h3 className="font-montserrat text-lg font-semibold text-center text-[#333333]">Is this a new fill or a top-off?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextOptionCard label="New Fill" isSelected={answers.poolType === 'new'} onClick={() => setAnswers(prev => ({...prev, poolType: 'new'}))} />
                    <TextOptionCard label="Top-Off" isSelected={answers.poolType === 'top-off'} onClick={() => setAnswers(prev => ({...prev, poolType: 'top-off'}))} />
                  </div>
                  {answers.poolType && (
                    <>
                      <h3 className="font-montserrat text-lg font-semibold text-center text-[#333333] pt-4">What is your approximate pool size?</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <TextOptionCard label="Small (<10k gal)" isSelected={answers.poolSize === 'small'} onClick={() => handleAnswerSelect('poolSize', 'small')} />
                        <TextOptionCard label="Medium (10-20k gal)" isSelected={answers.poolSize === 'medium'} onClick={() => handleAnswerSelect('poolSize', 'medium')} />
                        <TextOptionCard label="Large (20-30k gal)" isSelected={answers.poolSize === 'large'} onClick={() => handleAnswerSelect('poolSize', 'large')} />
                        <TextOptionCard label="XL (>30k gal)" isSelected={answers.poolSize === 'xl'} onClick={() => handleAnswerSelect('poolSize', 'xl')} />
                      </div>
                    </>
                  )}
                </>
              )}
              {/* Add other service type questions here following the same pattern */}
              {serviceType === 'construction' && (
                 <>
                    <h3 className="font-montserrat text-lg font-semibold text-center text-[#333333]">What is the job site size?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <TextOptionCard label="Small (<1 acre)" isSelected={answers.constructionSize === 'small'} onClick={() => setAnswers(prev => ({...prev, constructionSize: 'small'}))} />
                        <TextOptionCard label="Medium (1-5 acres)" isSelected={answers.constructionSize === 'medium'} onClick={() => setAnswers(prev => ({...prev, constructionSize: 'medium'}))} />
                        <TextOptionCard label="Large (5+ acres)" isSelected={answers.constructionSize === 'large'} onClick={() => setAnswers(prev => ({...prev, constructionSize: 'large'}))} />
                    </div>
                    {answers.constructionSize && (
                        <>
                            <h3 className="font-montserrat text-lg font-semibold text-center text-[#333333] pt-4">How many days do you need water?</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <TextOptionCard label="Single Delivery" isSelected={answers.constructionDuration === 'single'} onClick={() => handleAnswerSelect('constructionDuration', 'single')} />
                                <TextOptionCard label="Weekly" isSelected={answers.constructionDuration === 'weekly'} onClick={() => handleAnswerSelect('constructionDuration', 'weekly')} />
                                <TextOptionCard label="Ongoing" isSelected={answers.constructionDuration === 'ongoing'} onClick={() => handleAnswerSelect('constructionDuration', 'ongoing')} />
                            </div>
                        </>
                    )}
                 </>
              )}
              {/* Add more conditional steps for other service types */}
            </div>
          </QuizStep>
        );

      case 3: // ZIP Code
        return (
          <QuizStep>
            <h2 className="font-montserrat text-2xl sm:text-3xl font-bold text-center text-[#333333] mb-6">Where are you located?</h2>
            <div className="max-w-sm mx-auto">
              <Input
                type="text"
                placeholder="Enter your 5-digit ZIP code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                maxLength={5}
                className="text-center text-lg"
              />
              {zipError && <p className="text-red-500 text-sm mt-2 text-center">{zipError}</p>}
              <Button onClick={handleZipSubmit} className="w-full mt-4 bg-[#005A9C] text-white hover:bg-[#004a80]">Continue</Button>
            </div>
          </QuizStep>
        );

      case 4: // Contact Info
        return (
          <QuizStep>
            <h2 className="font-montserrat text-2xl sm:text-3xl font-bold text-center text-[#333333] mb-6">Almost there!</h2>
            <p className="text-center font-lato text-gray-600 mb-6">Enter your info to see your results and get connected.</p>
            <div className="max-w-sm mx-auto space-y-4">
              <Input type="text" placeholder="First Name (required)" value={contactInfo.name} onChange={(e) => setContactInfo(prev => ({...prev, name: e.target.value}))} />
              <Input type="email" placeholder="Email (required)" value={contactInfo.email} onChange={(e) => setContactInfo(prev => ({...prev, email: e.target.value}))} />
              <Input type="tel" placeholder="Phone (optional)" value={contactInfo.phone} onChange={(e) => setContactInfo(prev => ({...prev, phone: e.target.value}))} />
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="terms" checked={optIn} onClick={() => setOptIn(!optIn)} />
                <label htmlFor="terms" className="text-sm font-lato text-gray-600 leading-none">Contact me with quotes from local haulers</label>
              </div>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full mt-4 bg-[#005A9C] text-white hover:bg-[#004a80]">{isSubmitting ? "Submitting…" : "See My Results"}</Button>
            </div>
          </QuizStep>
        );

      case 5: // Results
        return (
          <QuizStep>
            <h2 className="font-montserrat text-2xl sm:text-3xl font-bold text-center text-[#333333] mb-2">Here's Your Estimate!</h2>
            <div className="flex flex-col items-center justify-center bg-white p-8 rounded-lg shadow-md max-w-md mx-auto mt-6">
                <svg className="w-16 h-16 text-[#005A9C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.8 10.2c0-2.8 2.3-5.1 5.1-5.1s5.1 2.3 5.1 5.1c0 2.8-2.3 5.1-5.1 5.1s-5.1-2.3-5.1-5.1z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.7C12 21.7 6.9 16.6 6.9 12.3c0-2.8 2.3-5.1 5.1-5.1s5.1 2.3 5.1 5.1c0 4.3-5.1 9.4-5.1 9.4z"></path></svg>
                <p className="font-lato text-lg text-gray-600 mt-4">Estimated Water Needed:</p>
                <p className="font-montserrat font-extrabold text-5xl text-[#333333] my-2">{estimatedGallons.toLocaleString( )} gal</p>
                <div className="text-left w-full bg-[#F8F9FA] p-4 rounded-md mt-6 font-lato text-sm text-gray-700">
                    <h4 className="font-montserrat font-bold mb-2">Your Project Summary:</h4>
                    <p><strong>Service:</strong> <span className="capitalize">{serviceType}</span></p>
                    <p><strong>Location (ZIP):</strong> {zipCode}</p>
                    {/* Add more summary details here */}
                </div>
            </div>
            <div className="max-w-md mx-auto mt-6 space-y-4">
                <Button onClick={() => router.push(`/search?q=${zipCode}&serviceType=${serviceType}`)} className="w-full bg-[#005A9C] text-white text-lg py-6 hover:bg-[#004a80]">Find Haulers Near Me →</Button>
                <Button variant="outline" className="w-full bg-transparent border-[#F2A900] text-[#F2A900] hover:bg-[#F2A900]/10">Get Free Quotes by Email</Button>
            </div>
          </QuizStep>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-[#F8F9FA] rounded-lg shadow-lg font-lato">
      <div className="mb-6">
        <Progress value={(step / totalSteps) * 100} />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Step {step} of {totalSteps}</span>
          {step > 1 && step < totalSteps && (
            <button onClick={handleBack} className="hover:text-[#005A9C] font-semibold">&larr; Back</button>
          )}
        </div>
      </div>
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}
