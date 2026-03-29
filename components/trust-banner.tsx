const stats = [
  {
    value: "40+",
    label: "Verified Haulers",
  },
  {
    value: "Texas & Arizona",
    label: "Service Areas",
  },
  {
    value: "Free",
    label: "to Search",
  },
];

export function TrustBanner() {
  return (
    <section style={{ backgroundColor: "#F8F9FA" }} className="border-b border-border py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-around gap-8 md:gap-4 items-center">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="text-3xl md:text-4xl font-bold font-sans"
                style={{ color: "#005A9C" }}
              >
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground font-medium uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
