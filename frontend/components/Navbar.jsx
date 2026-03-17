"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authstore";

function getDisplayName(user) {
  return user?.username || user?.name || "User";
}

function getAvatarInitial(user) {
  const src = user?.username || user?.name || user?.email || "U";
  return src[0].toUpperCase();
}

export default function Navbar({ activePage, setActivePage }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role?.toUpperCase().includes("ADMIN") ?? false;

  const [search, setSearch]         = useState("");
  const [adminOpen, setAdminOpen]   = useState(false);
  const [userOpen, setUserOpen]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminRef       = useRef(null);
  const userDesktopRef = useRef(null);
  const userMobileRef  = useRef(null);
  const mobileRef      = useRef(null);

  // ✅ FIX: Use router.push instead of window.location.href
  // window.location.href causes a full-page reload and breaks Next.js routing
  function handleLogout() {
    logout();
    router.push("/login");
  }

  useEffect(() => {
    function handleOutside(e) {
      if (adminRef.current && !adminRef.current.contains(e.target))
        setAdminOpen(false);

      // ✅ FIX: The original code had two separate user ref checks.
      // On desktop, clicking logout was INSIDE userDesktopRef (correct),
      // but also NOT inside userMobileRef (hidden but still in DOM),
      // so setUserOpen(false) fired on mousedown — before the click event —
      // closing the dropdown and preventing logout/profile from ever triggering.
      // Fix: only close if the click is outside BOTH refs.
      const clickedInsideUser =
        (userDesktopRef.current && userDesktopRef.current.contains(e.target)) ||
        (userMobileRef.current  && userMobileRef.current.contains(e.target));
      if (!clickedInsideUser) setUserOpen(false);

      if (mobileRef.current && !mobileRef.current.contains(e.target))
        setMobileOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setMobileOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity:0; transform:translateX(-50%) translateY(-6px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        @keyframes fadeSlideDownUser {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes mobileMenuIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .nav-link-mobile:hover { background: #f0fdfa !important; color: #0d9488 !important; }
      `}</style>

      <nav style={{
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 24px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 8px rgba(0,0,0,.06)",
        fontFamily: "'Inter', sans-serif",
      }}>

        {/* ── Logo ── */}
        <div
          onClick={() => {
            if (setActivePage) { setActivePage("Home"); setMobileOpen(false); }
            else { router.push("/"); setMobileOpen(false); }
          }}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0 }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #0d9488, #0891b2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>📚</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#1e293b", letterSpacing: "-.3px" }}>
            LIBRIFLOW
          </span>
        </div>

        {/* ── Desktop Nav links ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="desktop-nav">
          <style>{`
            @media (max-width: 767px) { .desktop-nav { display: none !important; } }
            @media (min-width: 768px) { .mobile-actions { display: none !important; } }
          `}</style>

          {["Home", "Catalog", "My Books", "About"].map((page) => (
            <NavLink
              key={page}
              label={page}
              active={activePage === page}
              onClick={() => {
                if (setActivePage) setActivePage(page);
                else router.push("/");
              }}
            />
          ))}

          {/* Admin dropdown — only visible to ADMIN role */}
          {isAdmin && (
            <div ref={adminRef} style={{ position: "relative" }}>
              <button
                onClick={() => setAdminOpen((p) => !p)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 12px",
                  border: "1.5px solid #0d9488", borderRadius: 20,
                  background: adminOpen ? "#0d9488" : "#f0fdfa",
                  color: adminOpen ? "#fff" : "#0d9488",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Inter', sans-serif", transition: "all .18s",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Admin
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  style={{ transition: "transform .18s", transform: adminOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                  <path d="M2 4l4 4 4-4" />
                </svg>
              </button>

              {adminOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", left: "50%",
                  transform: "translateX(-50%)", minWidth: 190,
                  background: "#fff", border: "1.5px solid #e2e8f0",
                  borderRadius: 12, boxShadow: "0 12px 32px rgba(0,0,0,.12)",
                  padding: "6px", zIndex: 200, animation: "fadeSlideDown .15s ease",
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: "#94a3b8",
                    textTransform: "uppercase", letterSpacing: ".08em", padding: "6px 10px 4px",
                  }}>Admin Panel</div>
                  <AdminMenuItem
                    icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>}
                    label="Dashboard"
                    onClick={() => { setActivePage && setActivePage("Dashboard"); setAdminOpen(false); }}
                  />
                  <AdminMenuItem
                    icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><polyline points="12 12 12 4"/><polyline points="8 8 12 4 16 8"/></svg>}
                    label="Book Upload"
                    active={activePage === "Uploadsection"}
                    onClick={() => { setActivePage && setActivePage("Uploadsection"); setAdminOpen(false); }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#f1f5f9", border: "1.5px solid #e2e8f0",
            borderRadius: 40, padding: "7px 14px",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              suppressHydrationWarning
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search titles, authors…"
              style={{
                border: "none", background: "transparent", outline: "none",
                fontSize: 13, color: "#1e293b", width: 160, fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          {user && (
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 20 }}>
              🔔
            </button>
          )}

          {user ? (
            
            <div ref={userDesktopRef} style={{ position: "relative" }}>
              <div
                onClick={() => { setUserOpen((p) => !p); setAdminOpen(false); }}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg, #0d9488, #0891b2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  outline: userOpen ? "2.5px solid #0d9488" : "2.5px solid transparent",
                  outlineOffset: 2, transition: "outline .15s",
                }}
              >
                {getAvatarInitial(user)}
              </div>

              {userOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  minWidth: 230, background: "#fff", border: "1.5px solid #e2e8f0",
                  borderRadius: 12, boxShadow: "0 12px 32px rgba(0,0,0,.12)",
                  padding: "6px", zIndex: 200, animation: "fadeSlideDownUser .15s ease",
                }}>
                  <UserDropdownHeader user={user} isAdmin={isAdmin} />
                  <AdminMenuItem
                    icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                    label="Profile"
                    onClick={() => { router.push("/Profile"); setUserOpen(false); }}
                  />
                  <div style={{ height: 1, background: "#f1f5f9", margin: "4px 6px" }} />
                  <AdminMenuItem
                    icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>}
                    label="Logout"
                    danger
                    
                    onClick={() => { setUserOpen(false); handleLogout(); }}
                  />
                </div>
              )}
            </div>
          ) : (
            <button
              suppressHydrationWarning
              onClick={() => router.push("/login")}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 18px",
                background: "linear-gradient(135deg, #0d9488, #0891b2)",
                color: "#fff", border: "none", borderRadius: 22,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                boxShadow: "0 2px 8px rgba(13,148,136,.25)",
                transition: "opacity .15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Sign In
            </button>
          )}
        </div>

     
        <div className="mobile-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user && (
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 18 }}>
              🔔
            </button>
          )}

          {user ? (
            <div ref={userMobileRef} style={{ position: "relative" }}>
              <div
                onClick={() => { setUserOpen((p) => !p); setMobileOpen(false); }}
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "linear-gradient(135deg, #0d9488, #0891b2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  outline: userOpen ? "2.5px solid #0d9488" : "2.5px solid transparent",
                  outlineOffset: 2,
                }}
              >
                {getAvatarInitial(user)}
              </div>

              {userOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  minWidth: 220, background: "#fff", border: "1.5px solid #e2e8f0",
                  borderRadius: 12, boxShadow: "0 12px 32px rgba(0,0,0,.12)",
                  padding: "6px", zIndex: 300, animation: "fadeSlideDownUser .15s ease",
                }}>
                  <UserDropdownHeader user={user} isAdmin={isAdmin} />
                  <AdminMenuItem
                    icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                    label="Profile"
                    onClick={() => { router.push("/Profile"); setUserOpen(false); }}
                  />
                  <div style={{ height: 1, background: "#f1f5f9", margin: "4px 6px" }} />
                  <AdminMenuItem
                    icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>}
                    label="Logout"
                    danger
                    onClick={() => { setUserOpen(false); handleLogout(); }}
                  />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 14px",
                background: "linear-gradient(135deg, #0d9488, #0891b2)",
                color: "#fff", border: "none", borderRadius: 20,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                boxShadow: "0 2px 8px rgba(13,148,136,.25)",
              }}
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => { setMobileOpen((p) => !p); setUserOpen(false); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: 6, borderRadius: 8, color: "#475569",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {mobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu Drawer ── */}
      {mobileOpen && (
        <div
          ref={mobileRef}
          style={{
            position: "fixed", top: 64, left: 0, right: 0,
            background: "#fff", borderBottom: "1.5px solid #e2e8f0",
            boxShadow: "0 8px 24px rgba(0,0,0,.1)",
            zIndex: 99, padding: "12px 20px 20px",
            animation: "mobileMenuIn .18s ease",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#f1f5f9", border: "1.5px solid #e2e8f0",
            borderRadius: 40, padding: "9px 16px", marginBottom: 12,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              suppressHydrationWarning
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search titles, authors…"
              style={{
                border: "none", background: "transparent", outline: "none",
                fontSize: 14, color: "#1e293b", width: "100%", fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          {["Home", "Catalog", "My Books", "About"].map((page) => (
            <MobileNavItem
              key={page}
              label={page}
              active={activePage === page}
              onClick={() => {
                if (setActivePage) { setActivePage(page); setMobileOpen(false); }
                else { router.push("/"); setMobileOpen(false); }
              }}
            />
          ))}

          {isAdmin && (
            <>
              <div style={{
                fontSize: 10, fontWeight: 700, color: "#94a3b8",
                textTransform: "uppercase", letterSpacing: ".08em",
                padding: "12px 4px 6px",
              }}>Admin Panel</div>
              <MobileNavItem
                label="Dashboard"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>}
                active={activePage === "Dashboard"}
                onClick={() => { setActivePage && setActivePage("Dashboard"); setMobileOpen(false); }}
              />
              <MobileNavItem
                label="Book Upload"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><polyline points="12 12 12 4"/><polyline points="8 8 12 4 16 8"/></svg>}
                active={activePage === "Uploadsection"}
                onClick={() => { setActivePage && setActivePage("Uploadsection"); setMobileOpen(false); }}
              />
            </>
          )}
        </div>
      )}
    </>
  );
}

function UserDropdownHeader({ user, isAdmin }) {
  return (
    <div style={{ padding: "10px 12px 12px", borderBottom: "1px solid #f1f5f9", marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #0d9488, #0891b2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 700, fontSize: 16,
        }}>
          {getAvatarInitial(user)}
        </div>
        <div style={{ overflow: "hidden" }}>
          <div style={{
            fontWeight: 700, fontSize: 13, color: "#1e293b",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {getDisplayName(user)}
          </div>
          <div style={{
            fontSize: 11, color: "#64748b", marginTop: 2,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {user?.email ?? "—"}
          </div>
        </div>
      </div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 20,
        background: isAdmin ? "#f0fdfa" : "#f8fafc",
        border: `1px solid ${isAdmin ? "#99f6e4" : "#e2e8f0"}`,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: isAdmin ? "#0d9488" : "#94a3b8" }} />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".04em", color: isAdmin ? "#0d9488" : "#64748b" }}>
          {user?.role ?? "USER"}
        </span>
      </div>
    </div>
  );
}

function MobileNavItem({ label, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="nav-link-mobile"
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "11px 12px",
        background: active ? "#f0fdfa" : "transparent",
        border: "none", borderRadius: 10,
        color: active ? "#0d9488" : "#334155",
        fontSize: 14, fontWeight: active ? 600 : 500,
        cursor: "pointer", fontFamily: "'Inter', sans-serif",
        textAlign: "left", transition: "background .15s, color .15s",
        marginBottom: 2,
      }}
    >
      {icon && <span style={{ color: active ? "#0d9488" : "#64748b" }}>{icon}</span>}
      {label}
      {active && (
        <span style={{ marginLeft: "auto" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </span>
      )}
    </button>
  );
}

function NavLink({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        color: active || hovered ? "#0d9488" : "#475569",
        fontSize: 14, fontWeight: 500, cursor: "pointer",
        paddingBottom: 4,
        borderBottom: active ? "2px solid #0d9488" : "2px solid transparent",
        transition: "color .15s", whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function AdminMenuItem({ icon, label, onClick, danger = false, active = false }) {
  const [hovered, setHovered] = useState(false);
  const activeColor   = danger ? "#ef4444" : "#0d9488";
  const activeBg      = danger ? "#fef2f2" : "#f0fdfa";
  const isHighlighted = hovered || active;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "9px 10px",
        background: isHighlighted ? activeBg : "transparent",
        border: "none", borderRadius: 8,
        color: isHighlighted ? activeColor : (danger ? "#ef4444" : "#334155"),
        fontSize: 13, fontWeight: 500, cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        transition: "background .15s, color .15s", textAlign: "left",
      }}
    >
      <span style={{ color: isHighlighted ? activeColor : (danger ? "#ef4444" : "#64748b"), transition: "color .15s" }}>
        {icon}
      </span>
      {label}
    </button>
  );
}