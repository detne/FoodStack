const restaurants = ["L'Opera", "Crust & Co", "Artisan Baker", "Tokyo Bowl", "Daily Brew"];

const TrustedBy = () => (
  <section className="py-10 border-b border-border">
    <div className="container mx-auto px-4 text-center">
      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-6">
        Trusted by 500+ innovative restaurants
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
        {restaurants.map((name) => (
          <span key={name} className="text-base font-heading font-semibold text-muted-foreground/50 hover:text-foreground transition-colors">
            ✦ {name}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default TrustedBy;
