import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "IdeaConnect | Where Ideas Find Partners",
  description: "A platform for entrepreneurs, developers, and creators to collaborate on innovative ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} ${sora.variable} font-sans antialiased min-h-screen relative overflow-x-hidden bg-theme text-theme-primary`}>
        {/* Ambient Background Elements */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full animate-float-slow" style={{ background: 'var(--glow-primary)', filter: 'blur(140px)' }} />
            <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] rounded-full animate-float-slow stagger-3" style={{ background: 'var(--glow-secondary)', filter: 'blur(140px)' }} />
            <div className="absolute top-[40%] right-[10%] w-[20%] h-[20%] rounded-full animate-float-slow stagger-5" style={{ background: 'var(--glow-accent)', filter: 'blur(120px)' }} />
        </div>

        <ThemeProvider>
          <AuthProvider>
            <ChatProvider>
              <Navbar />
              <main className="relative z-10">
                {children}
              </main>
            </ChatProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
