import { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  DollarSign,
  FileText,
  Settings,
  Palette,
  Save,
  Lightbulb,
  Eye,
  EyeOff,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "dr-claw-company-profile";

const defaultCompanyData = {
  // Basic Information
  companyName: "",
  legalEntityName: "",
  industry: "",
  companySize: "",
  foundedYear: "",
  website: "",
  companyEmail: "",
  phoneNumber: "",

  // Address
  streetAddress: "",
  suiteUnit: "",
  city: "",
  stateProvince: "",
  postalCode: "",
  country: "",

  // Financial Information
  annualRevenue: "",
  revenueGrowthYoY: "",
  fundingStage: "",
  totalFundingRaised: "",
  fiscalYearEnd: "",
  taxIdEin: "",

  // Company Description
  missionStatement: "",
  companyDescription: "",
  productsAndServices: "",
  targetMarket: "",
  competitiveAdvantages: "",

  // Operational Details
  numberOfLocations: "",
  primaryEhrEmrSystem: "",
  keyTechnologiesUsed: "",
  complianceRequirements: "",
  insurancePayerMix: "",

  // Brand & Culture
  brandVoiceTone: "",
  coreValues: "",
  keyDifferentiators: "",
};

function loadCompanyData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultCompanyData, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return defaultCompanyData;
}

const CompanyProfile = () => {
  const { toast } = useToast();
  const [showTaxId, setShowTaxId] = useState(false);
  const [companyData, setCompanyData] = useState(loadCompanyData);

  const updateField = (field: keyof typeof companyData, value: string) => {
    setCompanyData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(companyData));
      toast({
        title: "Company profile saved",
        description:
          "Your company data has been saved and will be used to enhance agent performance.",
      });
    } catch {
      toast({
        title: "Save failed",
        description: "Unable to save company profile. Please try again.",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading gradient-hero-text">
                Practice Profile
              </h1>
              <p className="text-muted-foreground mt-1">
                Provide your practice details to enhance clinical AI agent effectiveness
                across all departments.
              </p>
            </div>
            <Button
              onClick={handleSave}
              className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90 gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>

          {/* Context Impact Info Banner */}
          <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="h-9 w-9 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-300">
                Context Impact
              </h3>
              <p className="text-xs text-blue-300/70 mt-0.5 leading-relaxed">
                The information you provide here is used as contextual knowledge
                for all AI agents. Accurate company details help agents generate
                more relevant responses, tailor communications to your brand
                voice, understand your compliance requirements, and produce
                outputs aligned with your business goals and industry standards.
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <section className="bg-card rounded-xl border border-white/[0.06] p-5 space-y-5">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Basic Information
            </h2>
            <Separator className="bg-white/[0.06]" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Company Name</Label>
                <Input
                  value={companyData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  placeholder="Acme Healthcare Inc."
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Legal Entity Name</Label>
                <Input
                  value={companyData.legalEntityName}
                  onChange={(e) =>
                    updateField("legalEntityName", e.target.value)
                  }
                  placeholder="Acme Healthcare Inc."
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Industry</Label>
                <Input
                  value={companyData.industry}
                  onChange={(e) => updateField("industry", e.target.value)}
                  placeholder="Healthcare, Technology, Finance"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Company Size</Label>
                <Input
                  value={companyData.companySize}
                  onChange={(e) => updateField("companySize", e.target.value)}
                  placeholder="50-100 employees"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Founded Year</Label>
                <Input
                  value={companyData.foundedYear}
                  onChange={(e) => updateField("foundedYear", e.target.value)}
                  placeholder="2018"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Website</Label>
                <Input
                  value={companyData.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://www.example.com"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Company Email</Label>
                <Input
                  value={companyData.companyEmail}
                  onChange={(e) => updateField("companyEmail", e.target.value)}
                  placeholder="info@example.com"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Phone Number</Label>
                <Input
                  value={companyData.phoneNumber}
                  onChange={(e) => updateField("phoneNumber", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="bg-card rounded-xl border border-white/[0.06] p-5 space-y-5">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Address
            </h2>
            <Separator className="bg-white/[0.06]" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Street Address</Label>
                <Input
                  value={companyData.streetAddress}
                  onChange={(e) => updateField("streetAddress", e.target.value)}
                  placeholder="123 Main Street"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Suite/Unit</Label>
                <Input
                  value={companyData.suiteUnit}
                  onChange={(e) => updateField("suiteUnit", e.target.value)}
                  placeholder="Suite 200"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">City</Label>
                <Input
                  value={companyData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="San Francisco"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">State/Province</Label>
                <Input
                  value={companyData.stateProvince}
                  onChange={(e) => updateField("stateProvince", e.target.value)}
                  placeholder="California"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Postal Code</Label>
                <Input
                  value={companyData.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  placeholder="94105"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Country</Label>
                <Input
                  value={companyData.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  placeholder="United States"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
            </div>
          </section>

          {/* Financial Information */}
          <section className="bg-card rounded-xl border border-white/[0.06] p-5 space-y-5">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Financial Information
            </h2>
            <Separator className="bg-white/[0.06]" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Annual Revenue</Label>
                <Input
                  value={companyData.annualRevenue}
                  onChange={(e) => updateField("annualRevenue", e.target.value)}
                  placeholder="$5M - $10M"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Revenue Growth YoY</Label>
                <Input
                  value={companyData.revenueGrowthYoY}
                  onChange={(e) =>
                    updateField("revenueGrowthYoY", e.target.value)
                  }
                  placeholder="+22%"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Funding Stage</Label>
                <Input
                  value={companyData.fundingStage}
                  onChange={(e) => updateField("fundingStage", e.target.value)}
                  placeholder="Series B, Bootstrapped, Public"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">
                  Total Funding Raised
                </Label>
                <Input
                  value={companyData.totalFundingRaised}
                  onChange={(e) =>
                    updateField("totalFundingRaised", e.target.value)
                  }
                  placeholder="$25M"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Fiscal Year End</Label>
                <Input
                  value={companyData.fiscalYearEnd}
                  onChange={(e) => updateField("fiscalYearEnd", e.target.value)}
                  placeholder="December"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Tax ID / EIN</Label>
                <div className="relative">
                  <Input
                    type={showTaxId ? "text" : "password"}
                    value={companyData.taxIdEin}
                    onChange={(e) => updateField("taxIdEin", e.target.value)}
                    placeholder="XX-XXXXXXX"
                    className="bg-white/[0.03] border-white/10 focus:border-primary/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTaxId(!showTaxId)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showTaxId ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Company Description */}
          <section className="bg-card rounded-xl border border-white/[0.06] p-5 space-y-5">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Company Description
            </h2>
            <Separator className="bg-white/[0.06]" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Mission Statement</Label>
                <Textarea
                  value={companyData.missionStatement}
                  onChange={(e) =>
                    updateField("missionStatement", e.target.value)
                  }
                  placeholder="Our mission is to..."
                  rows={3}
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50 resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">
                  Company Description
                </Label>
                <Textarea
                  value={companyData.companyDescription}
                  onChange={(e) =>
                    updateField("companyDescription", e.target.value)
                  }
                  placeholder="Describe your company, what you do, and your key offerings..."
                  rows={5}
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50 resize-none"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground/80">
                    Products & Services
                  </Label>
                  <Textarea
                    value={companyData.productsAndServices}
                    onChange={(e) =>
                      updateField("productsAndServices", e.target.value)
                    }
                    placeholder="List your main products and services..."
                    rows={3}
                    className="bg-white/[0.03] border-white/10 focus:border-primary/50 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80">Target Market</Label>
                  <Textarea
                    value={companyData.targetMarket}
                    onChange={(e) =>
                      updateField("targetMarket", e.target.value)
                    }
                    placeholder="Describe your target customers and markets..."
                    rows={3}
                    className="bg-white/[0.03] border-white/10 focus:border-primary/50 resize-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">
                  Competitive Advantages
                </Label>
                <Textarea
                  value={companyData.competitiveAdvantages}
                  onChange={(e) =>
                    updateField("competitiveAdvantages", e.target.value)
                  }
                  placeholder="What sets your company apart from competitors..."
                  rows={3}
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50 resize-none"
                />
              </div>
            </div>
          </section>

          {/* Operational Details */}
          <section className="bg-card rounded-xl border border-white/[0.06] p-5 space-y-5">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Operational Details
            </h2>
            <Separator className="bg-white/[0.06]" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">
                  Number of Locations
                </Label>
                <Input
                  value={companyData.numberOfLocations}
                  onChange={(e) =>
                    updateField("numberOfLocations", e.target.value)
                  }
                  placeholder="5"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">
                  Primary EHR/EMR System
                </Label>
                <Input
                  value={companyData.primaryEhrEmrSystem}
                  onChange={(e) =>
                    updateField("primaryEhrEmrSystem", e.target.value)
                  }
                  placeholder="Epic, Cerner, Athenahealth"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">
                  Key Technologies Used
                </Label>
                <Input
                  value={companyData.keyTechnologiesUsed}
                  onChange={(e) =>
                    updateField("keyTechnologiesUsed", e.target.value)
                  }
                  placeholder="React, AWS, Salesforce"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">
                  Compliance Requirements
                </Label>
                <Input
                  value={companyData.complianceRequirements}
                  onChange={(e) =>
                    updateField("complianceRequirements", e.target.value)
                  }
                  placeholder="HIPAA, SOC 2, GDPR"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">
                Insurance/Payer Mix
              </Label>
              <Textarea
                value={companyData.insurancePayerMix}
                onChange={(e) =>
                  updateField("insurancePayerMix", e.target.value)
                }
                placeholder="Describe your insurance and payer mix..."
                rows={2}
                className="bg-white/[0.03] border-white/10 focus:border-primary/50 resize-none"
              />
            </div>
          </section>

          {/* Brand & Culture */}
          <section className="bg-card rounded-xl border border-white/[0.06] p-5 space-y-5">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              Brand & Culture
            </h2>
            <Separator className="bg-white/[0.06]" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">
                  Brand Voice / Tone
                </Label>
                <Input
                  value={companyData.brandVoiceTone}
                  onChange={(e) =>
                    updateField("brandVoiceTone", e.target.value)
                  }
                  placeholder="Professional, approachable, evidence-based"
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground/80">Core Values</Label>
                  <Textarea
                    value={companyData.coreValues}
                    onChange={(e) =>
                      updateField("coreValues", e.target.value)
                    }
                    placeholder="List your company's core values..."
                    rows={3}
                    className="bg-white/[0.03] border-white/10 focus:border-primary/50 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80">
                    Key Differentiators
                  </Label>
                  <Textarea
                    value={companyData.keyDifferentiators}
                    onChange={(e) =>
                      updateField("keyDifferentiators", e.target.value)
                    }
                    placeholder="What makes your brand unique..."
                    rows={3}
                    className="bg-white/[0.03] border-white/10 focus:border-primary/50 resize-none"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CompanyProfile;
