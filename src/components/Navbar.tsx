"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const navLinks = [
        {
            name: "Marketplace",
            href: "/ideas",
            icon: (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            name: "Messages",
            href: "/messages",
            icon: (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
            ),
        },
        {
            name: "Profile",
            href: "/profile",
            icon: (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
    ];

    return (
        <>
            <nav className={`sticky top-0 z-50 w-full transition-all duration-500 ${
                scrolled 
                    ? "glass shadow-lg" 
                    : "bg-transparent border-b border-transparent"
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-18">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-lg font-black tracking-tighter text-theme-primary group-hover:text-violet-500 transition-colors hidden sm:block font-heading">
                            IdeaConnect
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all flex items-center gap-2 ${
                                    pathname.startsWith(link.href) 
                                        ? "bg-violet-500/10 text-violet-500" 
                                        : "text-theme-secondary hover:text-theme-primary hover:bg-[var(--input-bg)]"
                                }`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Desktop Auth */}
                        <div className="hidden md:flex items-center gap-3">
                            {user ? (
                                <>
                                    <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--input-bg)] hover:bg-[var(--surface-hover)] transition-all group border border-transparent hover:border-[var(--border-color)]">
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white group-hover:scale-110 transition-transform">
                                            {user.name.charAt(0)}
                                        </div>
                                        <span className="text-xs font-bold text-theme-primary">{user.name}</span>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="p-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all text-theme-secondary"
                                        title="Logout"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-sm font-bold text-theme-secondary hover:text-theme-primary transition-colors px-3 py-2"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all shadow-lg shadow-violet-500/25 active:scale-95"
                                    >
                                        Join Free
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--input-bg)] text-theme-secondary transition-all"
                            aria-label="Menu"
                        >
                            <div className="w-5 h-4 flex flex-col justify-between relative">
                                <span className={`block h-0.5 rounded-full bg-current transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                                <span className={`block h-0.5 rounded-full bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-0' : ''}`} />
                                <span className={`block h-0.5 rounded-full bg-current transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-[var(--bg)]/90 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />
                    <div className="absolute top-16 left-0 right-0 p-4 animate-fade-in-down">
                        <div className="glass-card rounded-2xl p-4 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                        pathname.startsWith(link.href) 
                                            ? "bg-violet-500/10 text-violet-500" 
                                            : "text-theme-secondary hover:bg-[var(--input-bg)]"
                                    }`}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ))}

                            <div className="border-t border-[var(--border-color)] my-2" />

                            {user ? (
                                <>
                                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--input-bg)] rounded-xl transition-all">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-black text-white">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-theme-primary">{user.name}</p>
                                            <p className="text-[10px] text-theme-muted uppercase tracking-widest font-bold">Profile</p>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="w-full px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all text-left flex items-center gap-3"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <Link href="/login" className="block px-4 py-3 rounded-xl text-sm font-bold text-theme-secondary hover:bg-[var(--input-bg)] transition-all">
                                        Sign In
                                    </Link>
                                    <Link href="/register" className="block px-4 py-3 rounded-xl text-sm font-bold text-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                                        Join Free
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
