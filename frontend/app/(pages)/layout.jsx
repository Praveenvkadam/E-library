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
  "/Uploadsection":"BookUpload",
};


const PAGE_TO_ROUTE = {
  Home:       "/Home",
  Catalog:    "/Catalog",
  "My Books": "/Books",
  About:      "/About",
  Uploadsection: "/BookUpload",
};

export default function PagesLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();

  const activePage =
    Object.entries(PATH_TO_PAGE).find(([path]) =>
      pathname.startsWith(path)
    )?.[1] ?? "Home";

  function handleSetActivePage(page) {
    const route = PAGE_TO_ROUTE[page];

    if (route) router.push(route);
  }

  return (
    <div>
     
      <Navbar activePage={activePage} setActivePage={handleSetActivePage} />

      {children}
    </div>
  );
}