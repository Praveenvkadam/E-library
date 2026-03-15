"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar"; // ✅ adjust path if Navbar lives elsewhere

export default function PagesLayout({ children }) {
  const router = useRouter();

  // ✅ activePage tracks which nav link is highlighted
  const [activePage, setActivePage] = useState("Home");

  // ✅ Central routing handler passed into Navbar.
  // Navbar calls setActivePage(page) — this function handles
  // both highlighting the active link AND navigating to the right route.
  function handleSetActivePage(page) {
    setActivePage(page);

    // Map page labels to their actual Next.js routes.
    // Route group folders like (pages) don't affect URLs —
    // only the folder name inside them matters.
    const routes = {
      Home:          "/Home",
      Catalog:       "/Home",        // update when Catalog has its own page
      "My Books":    "/Home",        // update when My Books has its own page
      About:         "/Home",        // update when About has its own page
      Dashboard:     "/Home",        // update when Dashboard has its own page
      Uploadsection: "/Home",        // update when Upload has its own page
    };

    if (routes[page]) router.push(routes[page]);
  }

  return (
    <div>
      {/* ✅ Navbar is rendered here so it's shared across ALL pages
          inside the (pages) route group — Home, Profile, etc.
          This also ensures router.push() inside Navbar works correctly
          because it's within the Next.js app context. */}
      <Navbar activePage={activePage} setActivePage={handleSetActivePage} />

      {/* Page content renders here */}
      {children}
    </div>
  );
}