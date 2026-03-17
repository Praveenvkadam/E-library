"use client";

import { useState } from "react";

const QUICK_LINKS   = ["Our Catalog", "Membership Plans", "Digital Collections", "Authors Corner"];
const SUPPORT_LINKS = ["Help Center", "Borrowing Policy", "Privacy Terms", "System Status"];
const SOCIAL_LINKS  = ["Twitter", "Instagram", "LinkedIn"];

function FooterLink({ children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ fontSize:13, color: hovered ? "#7ec8e3" : "#94a3b8",
        marginBottom:10, cursor:"pointer", transition:"color .15s" }}
    >
      {children}
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer style={{ background:"#1e293b", color:"white", fontFamily:"'Inter', sans-serif" }}>
      <style>{`
        .footer-inner    { padding: 52px 48px 28px; }
        .footer-grid     { display: grid; grid-template-columns: 1.8fr 1fr 1fr 1.4fr; gap: 40px; margin-bottom: 40px; }
        .footer-bottom   { border-top: 1px solid rgba(255,255,255,.1); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; }
        .footer-social   { display: flex; gap: 20px; }
        @media (max-width: 767px) {
          .footer-inner  { padding: 36px 20px 20px; }
          .footer-grid   { grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 28px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
        @media (max-width: 479px) {
          .footer-grid   { grid-template-columns: 1fr; gap: 24px; }
          .footer-inner  { padding: 28px 16px 16px; }
        }
      `}</style>

      <div className="footer-inner">
        <div className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div style={{ width:32, height:32, borderRadius:8,
                background:"linear-gradient(135deg, #0d9488, #0891b2)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>📚</div>
              <span style={{ fontWeight:800, fontSize:16, letterSpacing:"-.2px" }}>LIBRIFLOW</span>
            </div>
            <p style={{ fontSize:13, color:"#94a3b8", lineHeight:1.65, maxWidth:220 }}>
              Making knowledge accessible to everyone, everywhere. Our digital library
              brings millions of books right to your fingertips.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Quick Links</div>
            {QUICK_LINKS.map((l) => <FooterLink key={l}>{l}</FooterLink>)}
          </div>

          {/* Support */}
          <div>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Support</div>
            {SUPPORT_LINKS.map((l) => <FooterLink key={l}>{l}</FooterLink>)}
          </div>

          {/* Newsletter */}
          <div>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>Newsletter</div>
            <p style={{ fontSize:13, color:"#94a3b8", lineHeight:1.6, marginBottom:16 }}>
              Get updates on new releases and library news.
            </p>
            <div style={{ display:"flex" }}>
              <input
                suppressHydrationWarning
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ flex:1, background:"rgba(255,255,255,.08)",
                  border:"1.5px solid rgba(255,255,255,.15)", borderRight:"none",
                  borderRadius:"8px 0 0 8px", padding:"10px 14px",
                  color:"white", fontSize:13, outline:"none",
                  fontFamily:"'Inter', sans-serif" }}
              />
              <button suppressHydrationWarning style={{ background:"linear-gradient(135deg, #0d9488, #0891b2)",
                border:"none", borderRadius:"0 8px 8px 0",
                padding:"10px 16px", cursor:"pointer", color:"white", fontSize:14 }}>
                →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span style={{ fontSize:13, color:"#64748b" }}>
            © 2024 LibriFlow Digital Library. All rights reserved.
          </span>
          <div className="footer-social">
            {SOCIAL_LINKS.map((s) => <FooterLink key={s}>{s}</FooterLink>)}
          </div>
        </div>
      </div>
    </footer>
  );
}