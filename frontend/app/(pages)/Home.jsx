"use client";

import { useState } from "react";
import Navbar         from "@/components/Navbar";
import HeroBanner     from "@/components/HeroBanner";
import CategoryFilter from "@/components/Categoryfilter";
import FeaturedBooks  from "@/components/Featuredbooks";
import ContactSection from "@/components/Contactsection";
import Footer         from "@/components/Footer";

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f0f4f8; color: #1e293b; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #f1f5f9; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
`;

export default function HomePage() {
  const [activePage, setActivePage]         = useState("Home");
  const [activeCategory, setActiveCategory] = useState("Fiction");

  const handleBorrow = (book) => {
    alert(`You borrowed: ${book.title}`);
  };

  return (
    <>
      <style>{BASE_STYLES}</style>

      {/* Full-width wrapper — NO max-width, NO centering margin */}
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%" }}>

        <Navbar activePage={activePage} setActivePage={setActivePage} />

        {/* Padding matches Navbar's 48px horizontal padding exactly */}
        <main style={{
          flex: 1,
          padding: "36px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 48,
          width: "100%",
        }}>
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