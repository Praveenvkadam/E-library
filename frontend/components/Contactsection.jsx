"use client";

import { useState } from "react";

export default function ContactSection() {
  const [message,   setMessage]   = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused,   setFocused]   = useState(false);

  const handleSubmit = () => {
    if (!message.trim()) return;
    console.log("Message:", message);
    setSubmitted(true);
    setMessage("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={{
      background:"#fff", borderRadius:20, padding:"40px 48px",
      boxShadow:"0 2px 20px rgba(0,0,0,.07)", fontFamily:"'Inter', sans-serif",
    }}>
      <h2 style={{ fontSize:22, fontWeight:800, color:"#1e293b", marginBottom:6 }}>
        We'd love to hear from you
      </h2>
      <p style={{ fontSize:14, color:"#64748b", lineHeight:1.65, marginBottom:20 }}>
        Have a suggestion or need help? Drop us a message.
      </p>

      <label style={{ fontSize:11, fontWeight:700, color:"#64748b", letterSpacing:".8px", display:"block", marginBottom:8 }}>
        MESSAGE
      </label>
      <textarea
        placeholder="How can we help?"
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:"100%", border:`1.5px solid ${focused ? "#0d9488" : "#e2e8f0"}`,
          borderRadius:10, padding:"12px 14px", fontSize:14, color:"#1e293b",
          outline:"none", resize:"vertical", fontFamily:"'Inter', sans-serif",
          boxSizing:"border-box", marginBottom:16, display:"block",
        }}
      />

      <button
        onClick={handleSubmit}
        style={{
          background: submitted ? "#0d9488" : "#1e293b",
          color:"#fff", border:"none", borderRadius:12,
          padding:"13px 32px", fontWeight:700, fontSize:14, cursor:"pointer",
          display:"inline-flex", alignItems:"center", gap:8,
          transition:"background .2s", fontFamily:"'Inter', sans-serif",
        }}
      >
        {submitted ? "✅ Sent!" : "✈️ Send Feedback"}
      </button>
    </div>
  );
}