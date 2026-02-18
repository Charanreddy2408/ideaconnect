"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    direction?: "up" | "down" | "left" | "right" | "scale";
    delay?: number;
    className?: string;
    threshold?: number;
}

export default function ScrollReveal({ 
    children, 
    direction = "up", 
    delay = 0, 
    className = "",
    threshold = 0.15 
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add("revealed");
                        }, delay);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [delay, threshold]);

    const dirClass = {
        up: "scroll-reveal",
        down: "scroll-reveal",
        left: "scroll-reveal-left",
        right: "scroll-reveal-right",
        scale: "scroll-reveal-scale",
    }[direction];

    return (
        <div ref={ref} className={`${dirClass} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
}
