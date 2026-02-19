"use client";

import React, { useEffect } from "react";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.removeItem("ic-theme");
    }, []);

    return <>{children}</>;
};
