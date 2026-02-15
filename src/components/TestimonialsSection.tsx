import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Chief Medical Officer, Pacific Health Group",
    specialty: "Internal Medicine",
    quote:
      "Dr. Claw cut our patient no-show rate by 40% in the first month. The AI follow-up agents handle what used to take our staff 3 hours a day.",
    stars: 5,
  },
  {
    name: "Dr. Marcus Williams",
    role: "Practice Owner, Williams Family Medicine",
    specialty: "Family Medicine",
    quote:
      "The one-step setup is no joke — I had AI agents handling scheduling and insurance verification within 15 minutes. HIPAA compliance built-in was the dealbreaker for us.",
    stars: 5,
  },
  {
    name: "Jennifer Torres, RN",
    role: "Director of Operations, Sunrise Surgical Center",
    specialty: "Surgical Center",
    quote:
      "We went from missing 30% of referral follow-ups to catching 98% of them. The clinical documentation agent alone justified the investment.",
    stars: 5,
  },
  {
    name: "Dr. Rajesh Patel",
    role: "Managing Partner, Metro Orthopedic Associates",
    specialty: "Orthopedics",
    quote:
      "Our 6-provider practice was drowning in admin work. Dr. Claw's multi-agent system handles patient intake, post-op follow-ups, and insurance pre-auths simultaneously.",
    stars: 5,
  },
  {
    name: "Amanda Brooks",
    role: "Practice Manager, Lakeside Pediatrics",
    specialty: "Pediatrics",
    quote:
      "Parents love the AI appointment reminders. Our front desk can actually focus on patients now instead of being glued to the phone all day.",
    stars: 5,
  },
  {
    name: "Dr. Michael Okafor",
    role: "CEO, HealthBridge Multi-Specialty Clinic",
    specialty: "Multi-Specialty",
    quote:
      "We deployed across 4 locations in a single afternoon. The white-label option lets each office feel customized while we manage everything centrally.",
    stars: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-32 relative">
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">
            Trusted by Healthcare Professionals
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Real Results from{" "}
            <span className="gradient-hero-text">Real Practices</span>
          </h2>
          <p className="mt-5 text-muted-foreground max-w-lg mx-auto text-lg">
            See how clinics, hospitals, and medical groups are transforming
            patient care with AI agents.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-card rounded-xl border border-border p-6 hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-primary text-primary"
                  />
                ))}
              </div>
              <div className="relative mb-5">
                <Quote className="absolute -top-1 -left-1 h-6 w-6 text-primary/20" />
                <p className="text-sm text-foreground/80 leading-relaxed pl-5">
                  {t.quote}
                </p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="font-display font-semibold text-foreground text-sm">
                  {t.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.role}
                </p>
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {t.specialty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
