import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is Dr. Claw HIPAA compliant?",
    answer:
      "Yes. Dr. Claw is fully HIPAA compliant with end-to-end encryption, PHI protection, and we offer Business Associate Agreements (BAAs) on Professional plans and above. All data is processed in SOC 2 certified infrastructure.",
  },
  {
    question: "How do custom agents work?",
    answer:
      "You create an agent by giving it a name, selecting one or more skills (like CEO, CMO, Grant Writer, or Clinical Documentation), and choosing which AI model powers it. Each agent operates independently and can be customized with specific instructions and workflows.",
  },
  {
    question: "Can I switch between AI models?",
    answer:
      "Absolutely. On Professional plans and above, you can assign different LLM providers to each agent — OpenAI, Claude, Gemini, MiniMax, Kimi, or Mistral. Switch models anytime to find the best fit for each task.",
  },
  {
    question: "What skills are available?",
    answer:
      "We offer 30+ skills including C-suite roles (CEO, CFO, CMO, CAIO, CIO, COO, CHRO), Professional Copywriter, Grant Writer, Researcher, and 20+ healthcare-specific skills covering clinical documentation, patient management, billing, referrals, and more.",
  },
  {
    question: "Does Dr. Claw integrate with my EHR/EMR system?",
    answer:
      "Yes. We integrate with major EHR/EMR platforms and also support connections to AWS Healthcare, Notion, Airtable, Slack, and other productivity tools. On Advanced and Enterprise plans, we can build custom integrations for your specific systems.",
  },
  {
    question: "How quickly can I deploy an agent?",
    answer:
      "Most users deploy their first agent in under 5 minutes. We provide 16 pre-built templates that work out of the box — just select a template, connect your API key, and your agent is live. Custom agents take only a few minutes more.",
  },
  {
    question: "How is my data secured?",
    answer:
      "All data is encrypted at rest and in transit using AES-256 and TLS 1.3. We maintain SOC 2 Type II certification, conduct regular penetration testing, and follow the principle of least privilege. Your API keys are stored in encrypted vaults and never shared across accounts.",
  },
  {
    question: "What does the free trial include?",
    answer:
      "The 14-day free trial gives you full access to the Professional plan — 10 agents, unlimited skills, multi-LLM support, and all integrations. No credit card required to start. At the end of the trial, choose the plan that fits your needs.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-3 block">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-4">
            Frequently Asked{" "}
            <span className="gradient-hero-text">Questions</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about Dr. Claw.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="glass-card rounded-xl overflow-hidden animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-sm font-semibold text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
