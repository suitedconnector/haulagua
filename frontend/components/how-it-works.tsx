import { Search, Users, CalendarCheck } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Search Your Needs",
    description: "Enter your service type and location to find available water haulers in your area.",
  },
  {
    icon: Users,
    step: "02",
    title: "Compare Verified Pros",
    description: "Review detailed profiles, services offered, pricing information, and customer reviews.",
  },
  {
    icon: CalendarCheck,
    step: "03",
    title: "Contact & Schedule",
    description: "Reach out directly to your chosen hauler and schedule your water delivery.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Finding reliable bulk water delivery has never been easier
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-border" />
          
          {steps.map((step, index) => (
            <div key={step.step} className="relative text-center">
              {/* Step number badge */}
              <div className="relative inline-flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4 relative z-10">
                  <step.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center z-20">
                  {index + 1}
                </span>
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mt-2">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
