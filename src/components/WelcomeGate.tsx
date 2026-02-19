"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const WELCOME_KEY = "ideaconnect_welcome_dismissed";

/**
 * Welcome screen: shown only on home (/) when not yet dismissed this session.
 * Used in layout via WelcomeGate — when visible, only this screen is rendered (no Navbar/main).
 * Fully responsive: mobile-first, safe-area aware, touch-friendly.
 */
function WelcomeScreen({ onClose }: { onClose: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [exiting, setExiting] = useState(false);
    const [textVisible, setTextVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setTextVisible(true), 600);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const play = () => {
            v.play().catch(() => {});
        };
        v.addEventListener("canplay", play);
        v.addEventListener("canplaythrough", play);
        v.addEventListener("stalled", play);
        v.addEventListener("waiting", play);
        play();
        return () => {
            v.removeEventListener("canplay", play);
            v.removeEventListener("canplaythrough", play);
            v.removeEventListener("stalled", play);
            v.removeEventListener("waiting", play);
        };
    }, []);

    const handleEnded = () => {
        setExiting(true);
        setTimeout(onClose, 600);
    };

    const handleSkip = () => {
        setExiting(true);
        setTimeout(onClose, 400);
    };

    return (
        <div
            className={`fixed inset-0 z-[10001] flex min-h-[100dvh] min-h-screen items-center justify-center bg-black transition-opacity duration-500 ${exiting ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            style={{ padding: "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)" }}
            aria-label="Welcome to IdeaConnect"
        >
            {/* Video — full bleed, responsive object fit */}
            <video
                ref={videoRef}
                src="/welcome_animation.mp4"
                className="absolute inset-0 h-full w-full object-cover object-center"
                muted
                autoPlay
                playsInline
                preload="auto"
                onEnded={handleEnded}
            />
            {/* Gradient overlay — stronger on small screens for text readability */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 from-20% via-black/50 via-50% to-transparent sm:from-black/85 sm:via-black/35" />
            {/* Centered content — responsive typography and spacing */}
            <div
                className={`relative z-10 w-full max-w-2xl px-4 text-center transition-all duration-700 ease-out sm:px-6 md:px-8 ${textVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
                <h1
                    className="text-3xl font-black tracking-tight drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] sm:text-5xl md:text-6xl lg:text-7xl"
                    style={{ fontFamily: "var(--font-heading), var(--font-sans), sans-serif" }}
                >
                    <span className="bg-gradient-to-r from-white via-violet-100 to-indigo-200 bg-clip-text text-transparent">
                        IdeaConnect
                    </span>
                </h1>
                <p
                    className="mx-auto mt-3 max-w-lg text-base font-medium tracking-tight text-white/95 drop-shadow-[0_1px_10px_rgba(0,0,0,0.4)] sm:mt-5 sm:text-lg md:mt-6 md:text-xl lg:text-2xl"
                    style={{ fontFamily: "var(--font-sans), sans-serif" }}
                >
                    Share your idea. Know where it stands.
                </p>
            </div>
            {/* Skip — safe area, large touch target on mobile */}
            <button
                type="button"
                onClick={handleSkip}
                className="absolute right-4 top-4 z-20 min-h-[44px] min-w-[44px] rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white sm:right-6 sm:top-6 sm:py-2 md:right-8 md:top-8"
                style={{ right: "max(1rem, env(safe-area-inset-right))", top: "max(1rem, env(safe-area-inset-top))" }}
                aria-label="Skip welcome"
            >
                Skip
            </button>
        </div>
    );
}

export default function WelcomeGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [showWelcome, setShowWelcome] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || pathname !== "/") {
            setShowWelcome(false);
            return;
        }
        const dismissed = typeof sessionStorage !== "undefined" && sessionStorage.getItem(WELCOME_KEY);
        setShowWelcome(!dismissed);
    }, [pathname, mounted]);

    const handleClose = () => {
        if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem(WELCOME_KEY, "1");
        }
        setShowWelcome(false);
    };

    // Standalone welcome: only the welcome screen, no navbar or main content
    if (mounted && showWelcome) {
        return <WelcomeScreen onClose={handleClose} />;
    }

    return <>{children}</>;
}
