"use client";

import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

// Maps URL pathnames to their nav label.
// Add entries here as new pages are created.
const PATH_TO_PAGE = {
  "/Home":    "Home",
  "/Catalog": "Catalog",
  "/Books":   "My Books",
  "/About":   "About",
};

// Maps nav labels to their routes.
// Only include pages that actually exist — others are simply not navigated.
const PAGE_TO_ROUTE = {
  Home:       "/Home",
  // Uncomment each line once the corresponding page file exists:
  // Catalog:    "/Catalog",
  // "My Books": "/Books",
  // About:      "/About",
};

export default function PagesLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();

  // Derive the active page directly from the URL so it stays correct
  // on refresh, direct navigation, and browser back/forward.
  const activePage =
    Object.entries(PATH_TO_PAGE).find(([path]) =>
      pathname.startsWith(path)
    )?.[1] ?? "Home";

  function handleSetActivePage(page) {
    const route = PAGE_TO_ROUTE[page];

    // Only navigate if a real route is registered for this page.
    // Clicking an unregistered nav item highlights it visually but
    // doesn't push a broken URL.
    if (route) router.push(route);
  }

  return (
    <div>
      {/*
        Navbar is rendered at layout level so it persists across all pages
        in the (pages) route group without remounting between navigations.
        activePage is URL-derived, so it's always in sync.
      */}
      <Navbar activePage={activePage} setActivePage={handleSetActivePage} />

      {children}
    </div>
  );
}