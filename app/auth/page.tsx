"use client";

import React from "react";
import GlassContainer from "@/components/ui/GlassContainer";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function AuthPage() {
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      router.push("/wardrobe");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-void relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gold/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold/10 blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <GlassContainer className="p-10 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-chalk tracking-tighter">DROBE.</h1>
            <p className="text-chalk/40 text-sm font-medium uppercase tracking-widest">
              {isLogin ? "Welcome Back" : "Join the Club"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-chalk/40 uppercase tracking-wider ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-chalk focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-chalk/40 uppercase tracking-wider ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-chalk focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs text-center font-medium">
                {error}
              </motion.p>
            )}

            <Button type="submit" className="w-full py-4 text-base" disabled={loading}>
              {loading ? "Verifying..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-chalk/40 hover:text-gold transition-colors"
            >
              {isLogin ? "New to Drobe? Create account" : "Already member? Sign in"}
            </button>
          </div>
        </GlassContainer>
      </motion.div>
    </div>
  );
}
