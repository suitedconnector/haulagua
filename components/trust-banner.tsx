import { ShieldCheck, FileText, Droplets } from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Verified Pros",
    description: "All haulers are vetted and verified",
  },
  {
    icon: FileText,
    title: "Detailed Profiles",
    description: "Compare services, pricing & reviews",
  },
  {
    icon: Droplets,
    title: "All Services",
    description: "Pool fills, construction, emergencies & more",
  },
];

export function TrustBanner() {
  return (
    <section className="bg-card border-b border-border py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {trustItems.map((item) => (
            <div key={item.title} className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
