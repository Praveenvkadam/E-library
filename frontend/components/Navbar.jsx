"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/apis/auth/authstore";


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

  const [search, setSearch]       = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const adminRef = useRef(null);
  const userRef  = useRef(null);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  useEffect(() => {
    function handleOutside(e) {
      if (adminRef.current && !adminRef.current.contains(e.target)) setAdminOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setUserOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <nav style={{
      background: "#fff",
      borderBottom: "1px solid #e2e8f0",
      padding: "0 48px",
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

      
      <div
        onClick={() => setActivePage && setActivePage("Home")}
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
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

    
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        {["Home", "Catalog", "My Books", "About"].map((page) => (
          <NavLink
            key={page}
            label={page}
            active={activePage === page}
            onClick={() => setActivePage && setActivePage(page)}
          />
        ))}

        

        {isAdmin && (
          <div ref={adminRef} style={{ position: "relative" }}>
            <button
              onClick={() => setAdminOpen((p) => !p)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 12px",
                border: "1.5px solid #0d9488",
                borderRadius: 20,
                background: adminOpen ? "#0d9488" : "#f0fdfa",
                color: adminOpen ? "#fff" : "#0d9488",
                fontSize: 13, fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                transition: "all .18s",
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
                <style>{`
                  @keyframes fadeSlideDown {
                    from { opacity:0; transform:translateX(-50%) translateY(-6px); }
                    to   { opacity:1; transform:translateX(-50%) translateY(0); }
                  }
                `}</style>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#94a3b8",
                  textTransform: "uppercase", letterSpacing: ".08em",
                  padding: "6px 10px 4px",
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

     
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#f1f5f9", border: "1.5px solid #e2e8f0",
          borderRadius: 40, padding: "8px 16px",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, authors…"
            style={{
              border: "none", background: "transparent", outline: "none",
              fontSize: 13, color: "#1e293b", width: 200, fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>

        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 20 }}>
          🔔
        </button>

     
        <div ref={userRef} style={{ position: "relative" }}>
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
              <style>{`
                @keyframes fadeSlideDownUser {
                  from { opacity:0; transform:translateY(-6px); }
                  to   { opacity:1; transform:translateY(0); }
                }
              `}</style>

            
              <div style={{
                padding: "10px 12px 12px",
                borderBottom: "1px solid #f1f5f9",
                marginBottom: 4,
              }}>
             
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
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: isAdmin ? "#0d9488" : "#94a3b8",
                  }} />
                  <span style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: ".04em",
                    color: isAdmin ? "#0d9488" : "#64748b",
                  }}>
                    {user?.role ?? "USER"}
                  </span>
                </div>
              </div>

              <AdminMenuItem
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                label="Profile"
                onClick={() => { setActivePage && setActivePage("Profile"); setUserOpen(false); }}
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
      </div>
    </nav>
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
        transition: "color .15s",
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
        fontSize: 13, fontWeight: 500,
        cursor: "pointer", fontFamily: "'Inter', sans-serif",
        transition: "background .15s, color .15s",
        textAlign: "left",
      }}
    >
      <span style={{ color: isHighlighted ? activeColor : (danger ? "#ef4444" : "#64748b"), transition: "color .15s" }}>
        {icon}
      </span>
      {label}
    </button>
  );
}