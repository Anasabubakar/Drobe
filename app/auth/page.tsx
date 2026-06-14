"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

function AuthForm() {
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) throw error;
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Decorative ambient blobs */}
      <div className="fixed top-1/4 -right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(255,218,218,0.2)" }} />
      <div className="fixed bottom-1/4 -left-20 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(255,212,196,0.2)" }} />

      {/* Header */}
      <header className="w-full sticky top-0 z-50 glass-nav">
        <div className="flex items-center justify-center px-6 py-5 w-full max-w-7xl mx-auto">
          <h1 className="text-display-lg font-display-lg tracking-tighter" style={{ color: "#e75a66" }}>
            DROBE
          </h1>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-16 relative">
        <div className="w-full max-w-[440px] fade-in-up">
          {/* Tab toggle */}
          <div className="flex rounded-2xl bg-surface-container p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className="flex-1 py-2.5 rounded-xl text-label-md font-label-md transition-all duration-200"
              style={isLogin ? { backgroundColor: "#e75a66", color: "#fff" } : { color: "#584141" }}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className="flex-1 py-2.5 rounded-xl text-label-md font-label-md transition-all duration-200"
              style={!isLogin ? { backgroundColor: "#e75a66", color: "#fff" } : { color: "#584141" }}
            >
              Create Account
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 soft-ambient-shadow border border-outline-variant/10">
            <div className="text-center mb-6">
              <h2 className="text-headline-lg font-headline-lg mb-2">
                {isLogin ? "Welcome Back" : "The Art of Dressing"}
              </h2>
              <p className="text-body-md font-body-md text-on-surface-variant">
                {isLogin ? "Sign in to your curated wardrobe." : "Curate your personal style with intelligence and ease."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-label-sm font-label-sm text-on-surface-variant ml-1 uppercase tracking-widest">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full h-14 px-5 bg-surface-container-low border border-transparent focus:border-primary/30 focus:bg-white rounded-2xl outline-none transition-all text-body-md font-body-md placeholder:text-on-surface-variant/40"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-label-sm font-label-sm text-on-surface-variant ml-1 uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 group-focus-within:text-primary transition-colors text-[20px]">
                    mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full h-14 pl-12 pr-4 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-body-md font-body-md"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest">
                    Password
                  </label>
                  {isLogin && (
                    <button type="button" className="text-label-sm font-label-sm hover:opacity-80 transition-opacity" style={{ color: "#e75a66" }}>
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 group-focus-within:text-primary transition-colors text-[20px]">
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-14 pl-12 pr-12 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-body-md font-body-md"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-error text-sm text-center font-medium bg-error-container rounded-xl px-4 py-2">
                  {error}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-white rounded-2xl text-label-md font-label-md tracking-wide hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-primary-glow disabled:opacity-60"
                  style={{ backgroundColor: "#e75a66" }}
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface-container-lowest px-4 text-label-sm font-label-sm text-on-surface-variant/60 uppercase">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center h-12 border border-outline-variant/30 rounded-2xl hover:bg-surface-container transition-colors group">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </button>
              <button className="flex items-center justify-center h-12 border border-outline-variant/30 rounded-2xl hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">fingerprint</span>
              </button>
            </div>
          </div>

          <p className="text-center mt-6 text-body-md font-body-md text-on-surface-variant">
            {isLogin ? "New to DROBE? " : "Already a member? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold hover:underline underline-offset-4 transition-all"
              style={{ color: "#e75a66" }}
            >
              {isLogin ? "Create an account" : "Log In"}
            </button>
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full h-1/3 pointer-events-none -z-10"
        style={{ background: "linear-gradient(to top, rgba(173,47,62,0.04), transparent)" }} />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
