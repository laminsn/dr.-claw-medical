import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Dr. Claw's AI front desk agent reduced our no-show rate by 34% in the first month. The voice follow-ups feel completely natural to our patients.",
    name: "Dr. Sarah Chen",
    title: "CMO, Pacific Health Network",
    rating: 5,
  },
  {
    quote:
      "The CAIO skill gave us a complete AI adoption roadmap in hours. It would have taken our team weeks to produce the same strategic analysis.",
    name: "Marcus Williams",
    title: "CEO, TechStart Inc",
    rating: 5,
  },
  {
    quote:
      "Referral tracking used to be a nightmare. Now our AI agent handles the entire loop — from sending referrals to confirming appointments to follow-up.",
    name: "Jennifer Torres",
    title: "Dir. of Operations, Sunrise Surgical Center",
    rating: 5,
  },
  {
    quote:
      "We replaced three separate content tools with one Dr. Claw marketing agent. Blog posts, email campaigns, social media — all from a single dashboard.",
    name: "Amanda Brooks",
    title: "VP Marketing, Lakeside Group",
    rating: 5,
  },
  {
    quote:
      "Running five agents across our practice — front desk, billing, clinical docs, patient outreach, and research. The multi-agent system is a game changer.",
    name: "Dr. Rajesh Patel",
    title: "Managing Partner, Metro Orthopedics",
    rating: 5,
  },
  {
    quote:
      "Our grant writer agent drafted a $2.4M NIH proposal that reviewers praised for its clarity. The research skill pulled supporting data we would have missed.",
    name: "Michael Okafor",
    title: "Grant Director, HealthBridge Foundation",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-3 block">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-4">
            Trusted by{" "}
            <span className="gradient-hero-text">Industry Leaders</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            See how organizations across healthcare, tech, and nonprofits are
            deploying AI agents with Dr. Claw.
          </p>
        </div>

        {/* Testimonial Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <div
              key={item.name}
              className="glass-card rounded-xl p-6 card-hover animate-fade-up flex flex-col"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-blue-500/30 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-slate-300 leading-relaxed flex-1 mb-6">
                "{item.quote}"
              </p>

              {/* Author */}
              <div>
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="text-xs text-slate-500">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
