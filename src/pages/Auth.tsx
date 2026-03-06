import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2, Loader2, Eye, EyeOff, CheckCircle2, BarChart3, TrendingUp } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({
          title: "Login failed",
          description: error.message === "Invalid login credentials"
            ? "Incorrect email or password. Please try again."
            : error.message,
          variant: "destructive",
        });
      } else {
        navigate("/");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
  const isExisting = 
    error.message.includes("already registered") ||
    error.message.includes("already been registered") ||
    error.status === 500;
  
  toast({
    title: "Signup failed",
    description: isExisting
      ? "This email is already registered. Please sign in instead."
      : error.message,
    variant: "destructive",
  });
} else {
        setSignupDone(true);
      }
    }
    setLoading(false);
  };

  // ── Post-signup confirmation screen ─────────────────────────────────────────
  if (signupDone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white shadow-xl p-8 text-center space-y-6">
            {/* Success Badge */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-100 rounded-full blur-lg opacity-60" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-400">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
              <p className="text-gray-600 text-sm">
                We've sent a verification link to <span className="font-semibold text-gray-900">{email}</span>
              </p>
            </div>

            <Button
              onClick={() => { setSignupDone(false); setIsLogin(true); }}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements - Light and soft */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />

      {/* Main card container */}
      <div className="relative z-10 w-full max-w-6xl">
        <div className="rounded-3xl bg-white shadow-2xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left side - Light gradient with illustration */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 via-blue-50 to-emerald-50 p-12 relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-300/15 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                {/* Headline */}
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                    Tax Operations
                  </h1>
                  <p className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                    Made Simple
                  </p>
                  <p className="text-gray-600 text-sm font-light pt-2">
                    Unified platform for managing leads, filing taxes, and tracking operations
                  </p>
                </div>

                {/* Illustration area - Character with dashboard */}
                <div className="relative w-full max-w-sm h-64">
                  <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    {/* Desk */}
                    <rect x="30" y="200" width="340" height="80" fill="rgba(59, 130, 246, 0.08)" rx="8" />
                    <rect x="30" y="180" width="340" height="20" fill="rgba(59, 130, 246, 0.15)" rx="4" />

                    {/* Chair back */}
                    <circle cx="120" cy="180" r="35" fill="rgba(139, 92, 246, 0.15)" />
                    <rect x="105" y="210" width="30" height="40" fill="rgba(139, 92, 246, 0.15)" rx="4" />

                    {/* Person - simplified with warmer tones */}
                    <circle cx="120" cy="110" r="25" fill="rgba(251, 146, 60, 0.3)" />
                    <rect x="100" y="135" width="40" height="50" fill="rgba(59, 130, 246, 0.2)" rx="4" />
                    <rect x="75" y="145" width="20" height="45" fill="rgba(251, 146, 60, 0.25)" rx="8" />
                    <rect x="145" y="145" width="20" height="45" fill="rgba(251, 146, 60, 0.25)" rx="8" />

                    {/* Laptop screen */}
                    <rect x="200" y="100" width="150" height="100" fill="rgba(30, 144, 255, 0.1)" rx="8" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" />
                    
                    {/* Dashboard bars inside laptop - bright green */}
                    <rect x="220" y="120" width="20" height="30" fill="rgba(34, 197, 94, 0.6)" rx="2" />
                    <rect x="250" y="115" width="20" height="35" fill="rgba(34, 197, 94, 0.6)" rx="2" />
                    <rect x="280" y="125" width="20" height="25" fill="rgba(34, 197, 94, 0.6)" rx="2" />
                    <rect x="310" y="120" width="20" height="30" fill="rgba(34, 197, 94, 0.6)" rx="2" />

                    {/* Chart line */}
                    <polyline 
                      points="220,140 240,125 260,135 280,110 300,120 320,105" 
                      fill="none" 
                      stroke="rgba(59, 130, 246, 0.5)" 
                      strokeWidth="2"
                    />

                    {/* Floating chart icon */}
                    <g transform="translate(280, 60)">
                      <rect x="0" y="0" width="60" height="50" fill="rgba(96, 165, 250, 0.15)" rx="4" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" />
                      <rect x="10" y="30" width="8" height="12" fill="rgba(34, 197, 94, 0.7)" />
                      <rect x="22" y="22" width="8" height="20" fill="rgba(34, 197, 94, 0.7)" />
                      <rect x="34" y="26" width="8" height="16" fill="rgba(34, 197, 94, 0.7)" />
                      <rect x="46" y="20" width="8" height="22" fill="rgba(34, 197, 94, 0.7)" />
                    </g>

                    {/* Stats badge - vibrant */}
                    <g transform="translate(50, 40)">
                      <rect x="0" y="0" width="70" height="40" fill="rgba(226, 232, 240, 0.8)" rx="6" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1" />
                      <text x="35" y="15" fontSize="11" fill="rgba(37, 99, 235, 0.9)" textAnchor="middle" fontWeight="bold">+128%</text>
                      <text x="35" y="28" fontSize="8" fill="rgba(96, 125, 139, 0.7)" textAnchor="middle">Growth</text>
                    </g>
                  </svg>
                </div>

                {/* Benefits list */}
                <div className="space-y-3 pt-4">
                  {[
                    "Real-time collaboration tools",
                    "Automated tax workflows",
                    "Bank-level security"
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - White card with form */}
            <div className="flex flex-col justify-between p-8 sm:p-12 bg-white">
              {/* Form section */}
              <div className="space-y-8">
                {/* Header */}
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                  <p className="text-gray-600">Sign in to your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name (signup only) */}
                  {!isLogin && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label className="text-sm font-semibold text-gray-700">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Smith"
                        required={!isLogin}
                        className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-400 focus:ring-blue-500/10 rounded-lg transition-all"
                      />
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@uniontax.com"
                      required
                      autoComplete="email"
                      className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-400 focus:ring-blue-500/10 rounded-lg transition-all"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-400 focus:ring-blue-500/10 rounded-lg transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {!isLogin && (
                      <p className="text-xs text-gray-500">At least 6 characters</p>
                    )}
                  </div>

                  {/* Remember me & Forgot password */}
                  {isLogin && (
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-600">Remember me</span>
                      </label>
                      <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                        Forgot Password?
                      </a>
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 mt-8 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 shadow-md hover:shadow-lg"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLogin ? "Sign In" : "Create Account"}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-500">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Toggle auth mode */}
                <div className="text-center text-sm space-y-2">
                  <p className="text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setIsLogin(!isLogin); setPassword(""); }}
                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {isLogin ? "Sign up here" : "Sign in instead"}
                  </button>
                </div>
              </div>

              {/* Testimonial section */}
              <div className="pt-8 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 flex items-center justify-center text-white font-bold text-sm">
                      SC
                    </div>
                  </div>
                  {/* Testimonial text */}
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700 font-medium">
                      "Streamlined our tax operations by 60% in the first month."
                    </p>
                    <p className="text-xs text-gray-500">
                      Sarah Chen, Operations Director
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}