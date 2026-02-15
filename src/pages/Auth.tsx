import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import logo from "@/assets/dr-claw-logo-transparent.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "signin") {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      } else {
        navigate("/dashboard");
      }
    } else {
      if (!fullName.trim()) {
        toast({ title: "Name required", description: "Please enter your full name to create an account.", variant: "destructive" });
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Welcome to Dr. Claw!", description: "Check your email for a confirmation link." });
      }
    }

    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    } catch {
      toast({ title: "Error", description: "Google sign-in failed.", variant: "destructive" });
    } finally {
      setGoogleLoading(false);
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
        Back
      </Link>

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="glass-card rounded-2xl border border-white/[0.06] p-8 shadow-glow">
          {/* Logo & heading */}
          <div className="flex flex-col items-center text-center mb-6">
            <img src={logo} alt="Dr. Claw" className="h-14 w-14 mb-4" />
            <h1 className="text-2xl font-bold font-heading gradient-hero-text">
              {mode === "signin" ? "Welcome Back" : "Create Your Account"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {mode === "signin"
                ? "Sign in to access your AI agent dashboard"
                : "Get started with your 14-day free trial"}
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
              Sign In
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
              Sign Up
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
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <Separator className="bg-white/[0.06]" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              or continue with email
            </span>
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm text-muted-foreground">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Dr. Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 bg-white/[0.03] border-white/10 focus:border-primary/50 transition-colors"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-white/[0.03] border-white/10 focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11 bg-white/[0.03] border-white/10 focus:border-primary/50 transition-colors"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 gradient-primary text-white font-semibold text-sm shadow-glow-sm hover:opacity-90 transition-opacity mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Switch mode prompt */}
          <p className="text-sm text-muted-foreground text-center mt-5">
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <Shield className="h-3.5 w-3.5 text-primary/70" />
              HIPAA Compliant
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <Lock className="h-3.5 w-3.5 text-primary/70" />
              Encrypted
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <CheckCircle className="h-3.5 w-3.5 text-primary/70" />
              14-Day Free Trial
            </div>
          </div>

          {/* Terms */}
          <p className="text-[11px] text-muted-foreground/40 text-center mt-5 leading-relaxed">
            By continuing, you agree to Dr. Claw's{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-muted-foreground/60 transition-colors">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-muted-foreground/60 transition-colors">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
