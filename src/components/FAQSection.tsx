import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is Dr. Claw really HIPAA compliant?",
    answer:
      "Yes. Every component of Dr. Claw is designed for HIPAA compliance from the ground up. We provide Business Associate Agreements (BAA) with all plans, end-to-end encryption for all patient data, and our infrastructure never stores PHI in unencrypted environments. We undergo regular third-party security audits.",
  },
  {
    question: "How does one-step registration work?",
    answer:
      "Simply enter your name, email, and password — or click 'Continue with Google.' That's it. No specialty verification forms, no fax-in credentialing. Your secure, HIPAA-compliant workspace is provisioned immediately and you can start deploying AI agents in minutes.",
  },
  {
    question: "Can I switch between AI models (OpenAI, Claude, Gemini)?",
    answer:
      "Absolutely. Each AI agent can use a different LLM. You might use Claude for nuanced patient follow-up conversations and OpenAI for clinical documentation. Switch models anytime without reconfiguring your agents or skills.",
  },
  {
    question: "What healthcare skills are available?",
    answer:
      "We offer 20+ pre-built healthcare skills including Appointment Scheduling, Insurance Verification, Patient Follow-Up, Clinical Documentation, HIPAA Compliance Monitoring, Referral Management, No-Show Recovery, Prescription Refill Coordination, Lab Result Communication, and many more. New skills are added regularly from our open-source community.",
  },
  {
    question: "Does Dr. Claw integrate with my existing EHR/EMR system?",
    answer:
      "Our Professional plan and above include integrations with major practice management tools. The Enterprise plan supports custom EHR/EMR integrations including HL7 FHIR and SMART on FHIR standards. We work with Epic, Cerner, Athenahealth, and other major platforms through our API.",
  },
  {
    question: "How quickly can I deploy an AI agent?",
    answer:
      "Most practices have their first AI agent live in under 5 minutes using our Quick Start Templates. Choose from pre-configured agents like Front Desk, Patient Follow-Up, Insurance Verifier, or Clinical Coordinator — each comes with relevant skills pre-installed.",
  },
  {
    question: "What happens to my patient data?",
    answer:
      "Patient data is encrypted end-to-end and never leaves your secure environment. We don't train our models on your data. All integrations include BAA agreements, and you retain full ownership and control of all data at all times. PHI is processed in SOC 2 Type II certified infrastructure.",
  },
  {
    question: "Can I try Dr. Claw before committing?",
    answer:
      "Yes! Every plan includes a 14-day free trial with full access to all features. No credit card required to start. You can deploy agents, install skills, and see real results before making any payment decision.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-32 relative" id="faq">
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">
            FAQ
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Common Questions
          </h2>
          <p className="mt-5 text-muted-foreground max-w-lg mx-auto text-lg">
            Everything healthcare professionals need to know before getting
            started.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-xl border transition-all ${
                  isOpen
                    ? "border-primary/20 bg-primary/[0.02]"
                    : "border-border bg-card"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-display font-semibold text-foreground text-sm pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
