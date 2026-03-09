"use client";

import { useState, useEffect } from "react";
import { useSearchParams }  from "next/navigation";
import { toast }            from "sonner";
import { Loader2 }          from "lucide-react";
import useAuthStore         from "@/apis/auth/authstore";
import Navbar               from "@/components/Navbar";
import HeroBanner           from "@/components/HeroBanner";
import CategoryFilter       from "@/components/Categoryfilter";
import FeaturedBooks        from "@/components/Featuredbooks";
import ContactSection       from "@/components/Contactsection";
import Footer               from "@/components/Footer";
import UploadSection        from "@/components/Uploadsection";

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f0f4f8; color: #1e293b; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #f1f5f9; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  .main-content { padding: 36px 48px; display: flex; flex-direction: column; gap: 48px; width: 100%; flex: 1; }
  @media (max-width: 1023px) { .main-content { padding: 28px 28px; gap: 36px; } }
  @media (max-width: 767px)  { .main-content { padding: 20px 16px; gap: 28px; } }
  @media (max-width: 479px)  { .main-content { padding: 16px 12px; gap: 20px; } }
`;

export default function HomePage() {
  const searchParams                        = useSearchParams();
  const { loginWithGoogle }                 = useAuthStore();
  const [activePage, setActivePage]         = useState("Home");
  const [activeCategory, setActiveCategory] = useState("Fiction");
  const [processing, setProcessing]         = useState(false);

  // ── Handle ?token= from Spring Boot Google OAuth redirect ─────────────────
  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      const messages = {
        unverified: "Your Google account email is not verified.",
        use_password_login: "This email is already registered. Please sign in with your password.",
      };
      toast.error(messages[error] || "Authentication failed. Please try again.");
      window.history.replaceState({}, "", "/");
      return;
    }

    if (!token) return;

    setProcessing(true);
    try {
      // ✅ Decode JWT directly
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("[OAuth] JWT payload →", payload); // remove after confirming

      const rawRole =
        payload.role ||
        payload.authorities?.[0]?.authority ||
        payload.roles?.[0] ||
        null;

      const normalizedRole = rawRole
        ? rawRole.toUpperCase().includes("ADMIN") ? "ADMIN" : "USER"
        : null;

      loginWithGoogle({
        backendToken: token,
        backendUser: {
          id:       payload.id       || payload.userId,
          username: payload.username,
          name:     payload.name,
          email:    payload.email    || payload.sub,
          provider: "GOOGLE",
          role:     normalizedRole,
        },
      });

      toast.success(`Welcome back! 👋`);
    } catch (err) {
      console.error("[OAuth] Token decode failed:", err);
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      window.history.replaceState({}, "", "/");
      setProcessing(false);
    }
  }, []);

  const handleBorrow = (book) => {
    alert(`You borrowed: ${book.title}`);
  };

  // ── Spinner while processing OAuth token ──────────────────────────────────
  if (processing) {
    return (
      <div style={{
        minHeight: "100vh", background: "#f0f4f8",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, color: "#64748b" }}>
          <Loader2 style={{ width: 40, height: 40, color: "#0d9488" }} className="animate-spin" />
          <p style={{ fontSize: 14, fontWeight: 500 }}>Completing sign-in...</p>
        </div>
      </div>
    );
  }

  // ── Upload page ───────────────────────────────────────────────────────────
  if (activePage === "Uploadsection") {
    return (
      <>
        <style>{BASE_STYLES}</style>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%" }}>
          <Navbar activePage={activePage} setActivePage={setActivePage} />
          <main className="main-content">
            <UploadSection setActivePage={setActivePage} />
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // ── Default Home layout ───────────────────────────────────────────────────
  return (
    <>
      <style>{BASE_STYLES}</style>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%" }}>
        <Navbar activePage={activePage} setActivePage={setActivePage} />
        <main className="main-content">
          <HeroBanner />
          <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
          <FeaturedBooks onBorrow={handleBorrow} />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </>
  );
}