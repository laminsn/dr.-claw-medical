import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { Zap as BrandIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, CheckCircle, ArrowRight, ArrowLeft, Check, Star, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { checkClientRateLimit, resetClientRateLimit, sanitizeInput, isValidEmail } from "@/lib/security";

/* ---------- Password strength ---------- */
function getPasswordStrength(pw: string, t: (k: string) => string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: t("auth.passwordWeak"), color: "bg-red-500" };
  if (score <= 2) return { score, label: t("auth.passwordFair"), color: "bg-yellow-500" };
  if (score <= 3) return { score, label: t("auth.passwordGood"), color: "bg-blue-500" };
  return { score, label: t("auth.passwordStrong"), color: "bg-green-500" };
}

/* ---------- Rate limiting via security module ---------- */

const PLANS = [
  { id: "starter", name: "Starter", price: "$147", agents: "2 Agents", skills: "5 Skills" },
  { id: "professional", name: "Professional", price: "$297", agents: "10 Agents", skills: "Unlimited", popular: true },
  { id: "advanced", name: "Advanced", price: "$447", agents: "25 Agents", skills: "Unlimited + Custom" },
  { id: "enterprise", name: "Enterprise", price: "Custom", agents: "Unlimited", skills: "Unlimited" },
];

const Auth = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate email format
    if (!isValidEmail(email)) {
      toast({ title: t("auth.errors.error"), description: "Please enter a valid email address.", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Rate limit check (client-side first layer — server enforces via edge function)
    const action = mode === "signin" ? "auth_login" : "auth_signup";
    const rateCheck = checkClientRateLimit(action);
    if (!rateCheck.allowed) {
      const remaining = Math.ceil(rateCheck.retryAfterMs / 1000);
      toast({
        title: t("auth.errors.tooManyAttempts"),
        description: t("auth.errors.tooManyAttemptsDesc", { remaining }),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (mode === "signin") {
      const { error } = await signIn(sanitizeInput(email), password);
      if (error) {
        toast({ title: t("auth.errors.signInFailed"), description: error.message, variant: "destructive" });
      } else {
        resetClientRateLimit("auth_login");
        navigate("/dashboard");
      }
    } else {
      if (!fullName.trim()) {
        toast({ title: t("auth.errors.nameRequired"), description: t("auth.errors.nameRequiredDesc"), variant: "destructive" });
        setLoading(false);
        return;
      }
      if (!selectedPlan) {
        toast({ title: t("auth.errors.planRequired"), description: t("auth.errors.planRequiredDesc"), variant: "destructive" });
        setLoading(false);
        return;
      }
      if (!agreedToTerms) {
        toast({ title: t("auth.errors.termsRequired"), description: t("auth.errors.termsRequiredDesc"), variant: "destructive" });
        setLoading(false);
        return;
      }
      const strength = getPasswordStrength(password, t);
      if (strength.score < 3) {
        toast({ title: t("auth.errors.weakPassword"), description: t("auth.errors.weakPasswordDesc"), variant: "destructive" });
        setLoading(false);
        return;
      }
      const { error } = await signUp(sanitizeInput(email), password, sanitizeInput(fullName));
      if (error) {
        toast({ title: t("auth.errors.signUpFailed"), description: error.message, variant: "destructive" });
      } else {
        resetClientRateLimit("auth_signup");
        toast({ title: t("auth.success.welcomeTitle"), description: t("auth.success.welcomeDesc") });
      }
    }

    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (error) toast({ title: t("auth.errors.error"), description: error.message, variant: "destructive" });
    } catch {
      toast({ title: t("auth.errors.error"), description: t("auth.errors.googleFailed"), variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setAppleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin });
      if (error) toast({ title: t("auth.errors.error"), description: error.message, variant: "destructive" });
    } catch {
      toast({ title: t("auth.errors.error"), description: t("auth.errors.appleFailed"), variant: "destructive" });
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/8 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-[128px] pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Back to home */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("auth.backHome")}
      </Link>

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="glass-card rounded-2xl border border-white/[0.06] p-8 shadow-glow">
          {/* Logo & heading */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm mb-4">
              <BrandIcon className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold font-heading gradient-hero-text">
              {mode === "signin" ? t("auth.welcomeBack") : t("auth.createAccount")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {mode === "signin" ? t("auth.signInSubtitle") : t("auth.signUpSubtitle")}
            </p>
          </div>

          {/* Mode toggle tabs */}
          <div className="flex rounded-lg bg-white/[0.04] border border-white/[0.06] p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "signin"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("auth.signIn")}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "signup"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("auth.signUp")}
            </button>
          </div>

          {/* Google OAuth */}
          <Button
            variant="outline"
            className="w-full h-12 text-sm font-medium gap-3 border-white/10 hover:bg-white/5 transition-colors"
            onClick={handleGoogleAuth}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <div className="h-5 w-5 border-2 border-muted-foreground/40 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {t("auth.continueWithGoogle")}
          </Button>

          {/* Apple ID OAuth */}
          <Button
            variant="outline"
            className="w-full h-12 text-sm font-medium gap-3 border-white/10 hover:bg-white/5 transition-colors mt-2"
            onClick={handleAppleAuth}
            disabled={appleLoading}
          >
            {appleLoading ? (
              <div className="h-5 w-5 border-2 border-muted-foreground/40 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            )}
            {t("auth.continueWithApple")}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <Separator className="bg-white/[0.06]" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              {t("auth.orContinueWithEmail")}
            </span>
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm text-muted-foreground">
                  {t("auth.fullName")}
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={t("auth.fullNamePlaceholder")}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 bg-white/[0.03] border-white/10 focus:border-primary/50 transition-colors"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">
                {t("auth.email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-white/[0.03] border-white/10 focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground">
                {t("auth.password")}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="h-11 bg-white/[0.03] border-white/10 focus:border-primary/50 transition-colors"
              />
              {/* Password strength meter (signup) */}
              {mode === "signup" && password.length > 0 && (() => {
                const s = getPasswordStrength(password, t);
                return (
                  <div className="space-y-1.5 mt-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= s.score ? s.color : "bg-white/10"}`} />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {s.score < 3 && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                      <p className="text-[10px] text-muted-foreground">
                        {s.label} — {s.score < 3 ? t("auth.passwordHint") : t("auth.passwordMeetsReqs")}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Package Selection (signup only) */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {t("auth.selectPlan")} <span className="text-red-400">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative text-left rounded-lg border p-3 transition-all ${
                        selectedPlan === plan.id
                          ? "border-primary bg-primary/10 shadow-glow-sm"
                          : "border-white/10 bg-white/[0.02] hover:border-primary/30"
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold gradient-primary text-white rounded-full flex items-center gap-0.5">
                          <Star className="h-2 w-2 fill-white" /> {t("auth.planPopular")}
                        </span>
                      )}
                      {selectedPlan === plan.id && (
                        <span className="absolute top-2 right-2">
                          <Check className="h-3.5 w-3.5 text-primary" />
                        </span>
                      )}
                      <p className="text-xs font-semibold text-foreground">{plan.name}</p>
                      <p className="text-sm font-bold gradient-hero-text">
                        {plan.price}
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {plan.price !== "Custom" ? t("auth.perMonth") : ""}
                        </span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{plan.agents} &middot; {plan.skills}</p>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">{t("auth.allPlansInclude")}</p>
              </div>
            )}

            {/* Terms checkbox (signup only) */}
            {mode === "signup" && (
              <div className="flex items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                    agreedToTerms ? "bg-primary border-primary" : "border-white/20 hover:border-primary/50"
                  }`}
                >
                  {agreedToTerms && <Check className="h-3 w-3 text-white" />}
                </button>
                <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                  {t("auth.agreeToTerms")}{" "}
                  <Link to="/terms" className="text-primary hover:text-primary/80 underline underline-offset-2" target="_blank">
                    {t("auth.termsOfService")}
                  </Link>{" "}
                  {t("auth.and")}{" "}
                  <Link to="/terms" className="text-primary hover:text-primary/80 underline underline-offset-2" target="_blank">
                    {t("auth.privacyPolicy")}
                  </Link>
                  {t("auth.includingData")}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || (mode === "signup" && (!agreedToTerms || !selectedPlan))}
              className="w-full h-12 gradient-primary text-white font-semibold text-sm shadow-glow-sm hover:opacity-90 transition-opacity mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? t("auth.signIn") : t("auth.createAccountBtn")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Switch mode prompt */}
          <p className="text-sm text-muted-foreground text-center mt-5">
            {mode === "signin" ? (
              <>
                {t("auth.noAccount")}{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {t("auth.signUpFree")}
                </button>
              </>
            ) : (
              <>
                {t("auth.alreadyHaveAccount")}{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {t("auth.signIn")}
                </button>
              </>
            )}
          </p>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <Shield className="h-3.5 w-3.5 text-primary/70" />
              {t("auth.hipaaCompliant")}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <Lock className="h-3.5 w-3.5 text-primary/70" />
              {t("auth.encrypted")}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <CheckCircle className="h-3.5 w-3.5 text-primary/70" />
              {t("auth.freeTrial")}
            </div>
          </div>

          {/* Bottom terms */}
          <p className="text-[11px] text-muted-foreground/40 text-center mt-5 leading-relaxed">
            {t("auth.byContinuing")}{" "}
            <Link to="/terms" className="underline underline-offset-2 cursor-pointer hover:text-muted-foreground/60 transition-colors" target="_blank">
              {t("auth.termsOfService")}
            </Link>{" "}
            {t("auth.and")}{" "}
            <Link to="/terms" className="underline underline-offset-2 cursor-pointer hover:text-muted-foreground/60 transition-colors" target="_blank">
              {t("auth.privacyPolicy")}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
