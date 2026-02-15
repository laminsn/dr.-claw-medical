import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import logo from "@/assets/dr-claw-logo-transparent.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, CheckCircle } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Try sign-in first; if user doesn't exist, auto-register
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      // If sign-in fails, try to create a new account
      if (fullName.trim()) {
        const { error: signUpError } = await signUp(email, password, fullName);
        if (signUpError) {
          toast({ title: "Error", description: signUpError.message, variant: "destructive" });
        } else {
          toast({
            title: "Welcome to Dr. Claw!",
            description: "Check your email for a confirmation link to get started.",
          });
        }
      } else {
        toast({
          title: "Enter your name to register",
          description: "Add your full name above to create a new account, or check your credentials to sign in.",
          variant: "destructive",
        });
      }
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Google sign-in failed. Please try again.", variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Ambient effects */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(hsl(217 100% 59% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(217 100% 59% / 0.3) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="w-full max-w-md mx-auto px-6 relative z-10">
        <div className="text-center mb-10">
          <img src={logo} alt="Dr. Claw" className="h-16 w-16 mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold text-foreground">
            Get Started in One Step
          </h1>
          <p className="text-muted-foreground mt-2">
            Sign in or create your account — it's that simple
          </p>
        </div>

        {/* Google Sign In */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleAuth}
          disabled={googleLoading}
          className="w-full h-12 border-border text-foreground font-medium rounded-xl mb-6 gap-3"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </Button>

        <div className="flex items-center gap-4 mb-6">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or use email</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-foreground/80 text-sm">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Jane Smith"
              className="bg-secondary border-border h-12 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground">Required for new accounts, optional for returning users</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground/80 text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@practice.com"
              required
              className="bg-secondary border-border h-12 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground/80 text-sm">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              className="bg-secondary border-border h-12 focus:border-primary"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 gradient-primary text-primary-foreground font-semibold text-base hover:opacity-90 shadow-glow rounded-xl"
          >
            {loading ? "Loading..." : "Continue"}
          </Button>
        </form>

        {/* Trust signals */}
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" /> HIPAA Compliant
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-primary" /> End-to-End Encrypted
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5 text-primary" /> 14-Day Free Trial
          </span>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
          <br />All data is HIPAA & BAA secured.
        </p>
      </div>
    </div>
  );
};

export default Auth;
