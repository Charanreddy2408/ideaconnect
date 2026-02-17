"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);
    
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/";

    const switchMode = () => {
        setAnimating(true);
        setError("");
        setTimeout(() => {
            setIsLogin(!isLogin);
            setAnimating(false);
        }, 400);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
            const body = isLogin 
                ? { email, password } 
                : { name, email, password };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok) {
                login({ 
                    id: data.user.id || data.user._id, 
                    email: data.user.email, 
                    name: data.user.name 
                });
                router.push(redirectTo);
            } else {
                setError(data.error || data.message || "Something went wrong");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Floating particles for visual effect
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
    }));

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="absolute rounded-full animate-float-slow"
                        style={{
                            width: p.size,
                            height: p.size,
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            background: `rgba(139, 92, 246, ${Math.random() * 0.25 + 0.08})`,
                            animationDuration: `${p.duration}s`,
                            animationDelay: `${p.delay}s`,
                        }}
                    />
                ))}
            </div>

            <div className="w-full max-w-5xl relative z-10">
                <div className="glass-card rounded-3xl overflow-hidden shadow-2xl" style={{ boxShadow: '0 25px 60px var(--shadow-color)' }}>
                    <div className={`grid grid-cols-1 lg:grid-cols-2 min-h-[600px] transition-all duration-700`}>
                        
                        {/* Illustration / Brand Side */}
                        <div 
                            className={`relative overflow-hidden flex flex-col items-center justify-center p-8 lg:p-12 transition-all duration-700 ${
                                isLogin ? 'order-2 lg:order-2' : 'order-2 lg:order-1'
                            }`}
                            style={{ 
                                background: 'linear-gradient(135deg, #6d28d9, #4338ca, #0891b2)',
                            }}
                        >
                            {/* Animated background shapes */}
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-white/10 animate-float-slow" />
                                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/5 animate-float" />
                                <div className="absolute top-[30%] left-[10%] w-[20%] h-[20%] rounded-full bg-white/10 animate-float-slow stagger-3" />
                                
                                {/* Geometric shapes */}
                                <div className="absolute top-[15%] right-[15%] w-16 h-16 border-2 border-white/20 rounded-2xl rotate-12 animate-spin-slow" />
                                <div className="absolute bottom-[20%] right-[25%] w-10 h-10 border-2 border-white/15 rounded-full animate-float stagger-2" />
                                <div className="absolute top-[50%] left-[5%] w-12 h-12 border-2 border-white/10 rotate-45 animate-float-slow stagger-5" />
                            </div>

                            <div className="relative z-10 text-center space-y-6 max-w-sm">
                                {/* Large icon */}
                                <div className="w-20 h-20 mx-auto rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center animate-bounce-in">
                                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>

                                <div className="space-y-3">
                                    <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                                        {isLogin ? "Welcome Back!" : "Join the Movement"}
                                    </h2>
                                    <p className="text-white/70 text-sm lg:text-base leading-relaxed font-medium">
                                        {isLogin 
                                            ? "Sign in to access your ideas, connect with builders, and continue collaborating." 
                                            : "Create your account and start turning ideas into reality with the best builders."}
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={switchMode}
                                        className="px-8 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 border border-white/20"
                                    >
                                        {isLogin ? "Create an Account" : "I have an Account"}
                                    </button>
                                </div>

                                {/* Trust badges */}
                                <div className="flex items-center justify-center gap-6 pt-4">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Secure</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Fast</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">1.2k+ Users</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Side */}
                        <div 
                            className={`flex items-center justify-center p-6 sm:p-8 lg:p-12 transition-all duration-700 ${
                                isLogin ? 'order-1 lg:order-1' : 'order-1 lg:order-2'
                            }`}
                        >
                            <div className={`w-full max-w-sm space-y-6 transition-all duration-400 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                <div className="space-y-2">
                                    <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight">
                                        {isLogin ? "Sign In" : "Create Account"}
                                    </h1>
                                    <p className="text-theme-secondary text-sm">
                                        {isLogin ? "Enter your credentials to continue" : "Fill in your details to get started"}
                                    </p>
                    </div>

                    {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center font-medium animate-fade-in-up">
                            {error}
                        </div>
                    )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {!isLogin && (
                                        <div className="space-y-1.5 animate-fade-in-up">
                                            <label className="text-xs font-bold text-theme-secondary ml-1 uppercase tracking-wider">Full Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="input-field"
                                                placeholder="John Doe"
                                                required={!isLogin}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-theme-secondary ml-1 uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                            className="input-field"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                                    <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                            <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider">Password</label>
                                            {isLogin && (
                                                <button type="button" className="text-[10px] text-violet-400 hover:text-violet-300 font-bold uppercase tracking-wider transition-colors">
                                                    Forgot?
                                                </button>
                                            )}
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                            className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-violet-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                                        {loading 
                                            ? (isLogin ? "Signing in..." : "Creating account...") 
                                            : (isLogin ? "Sign In" : "Create Account")}
                        </button>
                    </form>

                                {/* Mobile switch */}
                                <p className="text-center text-sm text-theme-secondary lg:hidden">
                                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                                    <button onClick={switchMode} className="text-violet-500 font-bold hover:text-violet-400 transition-colors">
                                        {isLogin ? "Sign up" : "Sign in"}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
