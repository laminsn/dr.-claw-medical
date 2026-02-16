import { Link } from "react-router-dom";
import { Shield, Lock, FileText, ArrowLeft, AlertTriangle } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold font-heading gradient-hero-text mb-3">
            Terms of Service & Conditions
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: February 2026
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <Shield className="h-3.5 w-3.5 text-primary/70" />
              HIPAA Compliant
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <FileText className="h-3.5 w-3.5 text-primary/70" />
              SOC 2
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <Lock className="h-3.5 w-3.5 text-primary/70" />
              Encrypted
            </div>
          </div>
        </div>

        {/* Section 1: Acceptance of Terms */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            1. Acceptance of Terms
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            By accessing or using the Dr. Claw platform, including any associated services, features, content, or applications (collectively, the "Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service & Conditions ("Terms"). If you do not agree to these Terms, you must not access or use the Service. These Terms constitute a legally binding agreement between you ("User," "you," or "your") and Dr. Claw ("Company," "we," "us," or "our"). Your continued use of the platform following the posting of any changes to these Terms constitutes acceptance of those changes.
          </p>
        </div>

        {/* Section 2: Service Description */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            2. Service Description
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Dr. Claw provides an AI agent platform designed to streamline and automate business operations, with specialized capabilities for healthcare settings. The Service enables users to deploy, configure, and manage AI-powered agents that assist with tasks including but not limited to scheduling, patient communication, data management, workflow automation, and operational analytics. The platform is intended to augment human decision-making and operational efficiency, not to replace professional judgment. Features, functionality, and availability of the Service may change at any time without prior notice at the sole discretion of Dr. Claw.
          </p>
        </div>

        {/* Section 3: User Responsibilities */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            3. User Responsibilities
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            As a user of the Service, you agree to: (a) provide accurate, current, and complete information during registration and throughout your use of the platform; (b) maintain the security and confidentiality of your account credentials, including passwords, API keys, and access tokens; (c) promptly notify Dr. Claw of any unauthorized use of your account or any other breach of security; (d) not use the Service for any unlawful purpose or in any way that could damage, disable, overburden, or impair the platform; (e) not attempt to gain unauthorized access to any portion of the Service, other accounts, computer systems, or networks connected to the Service; (f) not use the Service to transmit any viruses, malware, or other harmful code; and (g) comply with all applicable local, state, national, and international laws and regulations in connection with your use of the Service.
          </p>
        </div>

        {/* Section 4: Data Protection & Privacy */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            4. Data Protection & Privacy
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            Dr. Claw implements industry-standard security measures to protect user data, including AES-256 encryption for data at rest, TLS 1.3 for data in transit, and SOC 2 Type II compliance across our infrastructure. We maintain rigorous access controls, regular security audits, continuous monitoring, and multi-layered defense protocols to safeguard the integrity and confidentiality of your information.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">
            Notwithstanding the foregoing, Dr. Claw shall NOT be held liable for data breaches caused by:
          </p>
          <ul className="list-disc list-inside text-sm text-foreground/80 leading-relaxed space-y-2 ml-2">
            <li>User negligence, including but not limited to weak passwords, sharing credentials, or failure to enable multi-factor authentication;</li>
            <li>Third-party integrations, services, or applications that the user connects to the platform;</li>
            <li>Unauthorized sharing of account credentials, API keys, or access tokens by the user or the user's personnel;</li>
            <li>Force majeure events, including but not limited to natural disasters, acts of war, terrorism, cyberattacks by nation-state actors, pandemics, or other events beyond Dr. Claw's reasonable control.</li>
          </ul>
        </div>

        {/* Section 5: HIPAA Compliance */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            5. HIPAA Compliance
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            Dr. Claw provides HIPAA-eligible infrastructure designed to support the handling of Protected Health Information (PHI) in compliance with the Health Insurance Portability and Accountability Act of 1996, as amended, and its implementing regulations. Users who handle PHI through the platform are required to execute a Business Associate Agreement (BAA) with Dr. Claw prior to processing, storing, or transmitting any PHI through the Service.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Dr. Claw is not responsible for PHI exposure, unauthorized disclosure, or data breaches caused by user misconfiguration of AI agents, workflows, or integrations. It is the user's sole responsibility to ensure that their agent configurations, access controls, and data handling practices comply with HIPAA requirements. Users must conduct their own risk assessments and implement appropriate administrative, physical, and technical safeguards in conjunction with the platform's built-in security features.
          </p>
        </div>

        {/* Section 6: Limitation of Liability */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500/80" />
            6. Limitation of Liability
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, DR. CLAW'S MAXIMUM AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL BE LIMITED TO THE TOTAL FEES PAID BY YOU TO DR. CLAW DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">
            In no event shall Dr. Claw be liable for:
          </p>
          <ul className="list-disc list-inside text-sm text-foreground/80 leading-relaxed space-y-2 ml-2">
            <li>Any indirect, incidental, consequential, special, exemplary, or punitive damages, including but not limited to loss of profits, revenue, goodwill, or data;</li>
            <li>Loss of data due to third-party services, integrations, or infrastructure providers;</li>
            <li>AI agent outputs, recommendations, or decisions made without appropriate human oversight and review;</li>
            <li>Data breaches resulting from the user's failure to implement recommended security practices, configurations, or updates provided by Dr. Claw.</li>
          </ul>
        </div>

        {/* Section 7: AI Agent Disclaimer */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            7. AI Agent Disclaimer
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            AI agents deployed through the Dr. Claw platform are tools designed to assist and augment human decision-making. They are not intended to replace professional human judgment in any capacity. Users are solely responsible for reviewing, verifying, and approving all agent outputs, recommendations, and actions before relying upon or implementing them.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            Dr. Claw does not guarantee the accuracy, completeness, reliability, or timeliness of any AI-generated content, analysis, or recommendations. AI agents may produce incorrect, incomplete, or outdated information, and users should exercise independent judgment and professional expertise when evaluating agent outputs.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Healthcare-related AI agents available through the platform do not provide medical advice, diagnoses, or treatment recommendations. They are administrative and operational tools only. Any health-related information generated by the platform should not be considered a substitute for professional medical advice, diagnosis, or treatment from a qualified healthcare provider.
          </p>
        </div>

        {/* Section 8: Indemnification */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            8. Indemnification
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">
            You agree to indemnify, defend, and hold harmless Dr. Claw, its officers, directors, employees, agents, affiliates, successors, and assigns from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to:
          </p>
          <ul className="list-disc list-inside text-sm text-foreground/80 leading-relaxed space-y-2 ml-2">
            <li>Your use or misuse of the Service;</li>
            <li>Your violation of these Terms or any applicable law or regulation;</li>
            <li>Your violation of any third-party rights, including intellectual property rights, privacy rights, or contractual obligations;</li>
            <li>Data breaches resulting from your negligence, misconfiguration, or failure to implement adequate security measures.</li>
          </ul>
        </div>

        {/* Section 9: Data Breach Notification */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            9. Data Breach Notification
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            In the event of a confirmed data breach affecting user data, Dr. Claw will notify affected users within seventy-two (72) hours of discovering the breach, in accordance with applicable data breach notification laws and regulations, including but not limited to HIPAA breach notification requirements and state-level data breach notification statutes.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            Dr. Claw maintains comprehensive incident response procedures, including a dedicated security incident response team, documented escalation protocols, forensic investigation capabilities, and remediation processes designed to contain, assess, and resolve security incidents promptly and effectively.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Dr. Claw will cooperate fully with law enforcement investigations related to data breaches or security incidents affecting the platform or its users, to the extent permitted by applicable law and consistent with our obligations to protect user privacy.
          </p>
        </div>

        {/* Section 10: Intellectual Property */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            10. Intellectual Property
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            All intellectual property rights in and to the Dr. Claw platform, including but not limited to software, algorithms, models, user interfaces, designs, trademarks, trade names, logos, and documentation, are and shall remain the exclusive property of Dr. Claw. Nothing in these Terms grants you any right, title, or interest in the platform's intellectual property except for the limited right to use the Service in accordance with these Terms.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            All data that you upload, input, or generate through the Service ("User Data") remains your sole property. Dr. Claw does not claim ownership of your User Data and will not use it for purposes other than providing and improving the Service, except as otherwise described in our Privacy Policy.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Agent configurations, custom workflows, skill definitions, and other customizations created by you through the platform ("Custom Configurations") are your property. You retain full ownership of and rights to your Custom Configurations.
          </p>
        </div>

        {/* Section 11: Termination */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            11. Termination
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            Either party may terminate this agreement at any time by providing written notice to the other party. You may terminate your account at any time through your account settings or by contacting our support team. Dr. Claw may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            Upon termination, a data export period of thirty (30) days will be provided, during which you may download and export your User Data and Custom Configurations. After this 30-day period, Dr. Claw reserves the right to permanently delete your data from its systems, except as required by law or legitimate business purposes.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Dr. Claw reserves the right to suspend or restrict access to accounts that violate these Terms, engage in fraudulent activity, pose a security risk to the platform or other users, or fail to pay applicable fees.
          </p>
        </div>

        {/* Section 12: Governing Law */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            12. Governing Law
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States of America, without regard to its conflict of law provisions. Any legal action or proceeding arising out of or relating to these Terms or the Service shall be brought exclusively in the federal or state courts located in the State of Delaware, and you hereby consent to the personal jurisdiction and venue of such courts. You waive any objection to the exercise of jurisdiction over you by such courts and to venue in such courts.
          </p>
        </div>

        {/* Section 13: Changes to Terms */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            13. Changes to Terms
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Dr. Claw reserves the right to modify, amend, or update these Terms at any time at its sole discretion. We will provide at least thirty (30) days' advance notice of any material changes by posting the updated Terms on the platform, sending an email notification to the address associated with your account, or through other reasonable means of communication. Your continued use of the Service after the effective date of the revised Terms constitutes your acceptance of and agreement to the updated Terms. If you do not agree to the modified Terms, you must discontinue use of the Service before the changes take effect.
          </p>
        </div>

        {/* Contact section */}
        <div className="text-center mt-10 mb-8">
          <p className="text-sm text-muted-foreground">
            Questions about these terms? Contact{" "}
            <a
              href="mailto:legal@drclaw.ai"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              legal@drclaw.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
