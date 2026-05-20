"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Shield, Sparkles, AlertCircle, Eye, EyeOff } from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const { setUser, setRole, role } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSimulatedPopup, setShowSimulatedPopup] = useState(false);

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const state = useStore.getState();
      const storedAdminPassword = state.adminPassword || "Admin@123456";
      const storedEmployees = state.employeeAccounts || [];
      const language = state.language;
      
      const emailLower = emailInput.trim().toLowerCase();
      
      // 1. Check Admin Credentials
      if ((emailLower === "admin" || emailLower === "anas@store.com") && passwordInput === storedAdminPassword) {
        setRole("admin");
        setUser({
          id: "admin_account",
          name: "Anas Al-Otaibi (Admin)",
          email: "anas@store.com",
          role: "admin",
          createdAt: new Date().toISOString(),
        });
        setLoading(false);
        router.push("/dashboard");
        return;
      }

      // 2. Check Employee Credentials
      const matchingEmployee = storedEmployees.find(
        (emp) => emp.email.trim().toLowerCase() === emailLower && emp.password === passwordInput
      );

      if (matchingEmployee) {
        if (!matchingEmployee.isActive) {
          setError(language === "ar" ? "هذا الحساب معطل حالياً من قبل الإدارة." : "This account is currently disabled by Admin.");
          setLoading(false);
          return;
        }
        setRole("employee");
        setUser({
          id: matchingEmployee.id,
          name: matchingEmployee.name,
          email: matchingEmployee.email,
          role: "employee",
          createdAt: matchingEmployee.createdAt,
        });
        setLoading(false);
        router.push("/dashboard");
        return;
      }

      // 3. Error Fallback
      setError(
        language === "ar"
          ? "اسم المستخدم أو كلمة المرور غير صحيحة!"
          : "Invalid email/username or password!"
      );
      setLoading(false);
    }, 600);
  };

  const handleRealGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("your_firebase")) {
        // Firebase is not configured. Fallback to Simulated Login popup
        setShowSimulatedPopup(true);
        setLoading(false);
        return;
      }
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (user) {
        setUser({
          id: user.uid,
          name: user.displayName || "Google User",
          email: user.email || "",
          photoURL: user.photoURL || undefined,
          role: role, // Use selected role from state
          createdAt: new Date().toISOString(),
        });
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Google authentication error:", err);
      // Fall back to simulated login on failure so app is completely usable
      setShowSimulatedPopup(true);
      setLoading(false);
    }
  };

  const handleSimulatedLogin = (selectedRole: "admin" | "employee") => {
    setLoading(true);
    setRole(selectedRole);
    setTimeout(() => {
      setUser({
        id: `mock_${selectedRole}_${Date.now()}`,
        name: selectedRole === "admin" ? "Anas Al-Otaibi" : "Khaled Salem",
        email: selectedRole === "admin" ? "anas@store.com" : "khaled@store.com",
        role: selectedRole,
        createdAt: new Date().toISOString(),
      });
      setLoading(false);
      setShowSimulatedPopup(false);
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 ${isRTL ? "md:flex-row-reverse" : ""}`}>
      {/* Brand panel with animation */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden min-h-[300px] md:min-h-screen">
        {/* Animated glowing backdrops */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

        <div className="max-w-md text-center md:text-start space-y-6 relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 border border-primary/20 rounded-2xl mb-2 animate-bounce">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-primary bg-clip-text text-transparent">
            {t("login_title")}
          </h1>
          <p className="text-lg text-slate-400 font-light leading-relaxed">
            {t("login_subtitle")}
          </p>
          <div className="hidden md:block pt-6 border-t border-slate-800/80 space-y-4">
            <div className="flex items-center space-x-3 space-x-reverse text-sm text-slate-400">
              <span className="text-primary font-bold">✓</span>
              <span>Bilingual (Arabic / English) Layout</span>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse text-sm text-slate-400">
              <span className="text-primary font-bold">✓</span>
              <span>Advanced Sales & Outstanding Debt calculations</span>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse text-sm text-slate-400">
              <span className="text-primary font-bold">✓</span>
              <span>Instantly downloadable PDF invoice templates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Login Interaction Panel */}
      <div className="w-full md:w-[480px] flex flex-col justify-center p-8 md:p-12 bg-slate-950 relative">
        <div className="w-full max-w-sm mx-auto space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">{t("login_welcome")}</h2>
            <p className="text-sm text-slate-400">{t("login_desc")}</p>
          </div>

          {error && (
            <div className="p-4 bg-destructive/15 border border-destructive/20 rounded-2xl flex items-center space-x-2 space-x-reverse text-sm text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role selector for logging in */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Choose Session Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`py-3 px-4 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${
                  role === "admin"
                    ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                    : "border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Shield className="h-5 w-5" />
                <span className="text-xs font-bold">Administrator</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("employee")}
                className={`py-3 px-4 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${
                  role === "employee"
                    ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                    : "border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Shield className="h-5 w-5 opacity-60" />
                <span className="text-xs font-bold">Employee</span>
              </button>
            </div>
          </div>

          {/* Credentials Login Form */}
          <form onSubmit={handleCredentialLogin} className="space-y-4">
            <div className="space-y-1.5 text-start">
              <label className="text-xs font-semibold text-slate-400 block">
                {isRTL ? "البريد الإلكتروني أو اسم المستخدم" : "Email Address or Username"}
              </label>
              <input
                type="text"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={role === "admin" ? "anas@store.com / admin" : "employee@store.com"}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-primary text-white"
              />
            </div>

            <div className="space-y-1.5 text-start">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400">
                  {isRTL ? "كلمة المرور" : "Password"}
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary/95 text-white font-semibold rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (isRTL ? "جاري تسجيل الدخول..." : "Signing In...") : (isRTL ? "تسجيل الدخول بالبيانات" : "Sign In with Credentials")}
            </button>
          </form>

          {/* Separator */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-[10px] uppercase tracking-wider">{isRTL ? "أو" : "or"}</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleRealGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white text-slate-950 font-semibold rounded-2xl hover:bg-slate-100 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {/* Google SVG Logo */}
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{loading ? t("signing_in") : t("sign_in_google")}</span>
            </button>

            <p className="text-xs text-center text-slate-500">
              By signing in, you agree to secure data collection and system encryption.
            </p>
          </div>
        </div>
      </div>

      {/* Simulated Login Modal Popup */}
      {showSimulatedPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-6 mx-4 shadow-2xl relative animate-fade-in">
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center text-primary font-bold text-lg mb-1">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-white">OAuth Setup & Simulation</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                We detected that your Firebase API Keys in `.env.local` are not configured yet, or you are testing offline. Select a profile to sign in instantly:
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSimulatedLogin("admin")}
                className="w-full flex items-center justify-between p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    AA
                  </div>
                  <div className="text-start">
                    <p className="font-semibold text-sm text-white group-hover:text-primary transition-colors">
                      Anas Al-Otaibi
                    </p>
                    <p className="text-xs text-slate-400">anas@store.com</p>
                  </div>
                </div>
                <span className="text-xs bg-primary/20 text-primary font-bold px-2.5 py-1 rounded-full">
                  Admin
                </span>
              </button>

              <button
                onClick={() => handleSimulatedLogin("employee")}
                className="w-full flex items-center justify-between p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-500">
                    KS
                  </div>
                  <div className="text-start">
                    <p className="font-semibold text-sm text-white group-hover:text-emerald-500 transition-colors">
                      Khaled Salem
                    </p>
                    <p className="text-xs text-slate-400">khaled@store.com</p>
                  </div>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-500 font-bold px-2.5 py-1 rounded-full">
                  Employee
                </span>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowSimulatedPopup(false)}
                className="text-xs text-slate-500 hover:text-slate-300 font-semibold"
              >
                {t("btn_cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
