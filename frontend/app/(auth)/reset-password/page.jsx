"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import useAuthStore from "@/store/authstore";

export default function ResetPasswordPage() {
  const { resetPassword, isLoading, clearError } = useAuthStore();
  const [success, setSuccess]                   = useState(false);
  const [showNew, setShowNew]                   = useState(false);
  const [showConfirm, setShowConfirm]           = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const newPassword = watch("newPassword");

  const onSubmit = async ({ email, newPassword }) => {
    clearError();
    const toastId = toast.loading("Resetting your password...");
    const result = await resetPassword({ email, newPassword });
    if (result.success) {
      toast.success("Password reset successfully! ✅", { id: toastId });
      setSuccess(true);
    } else {
      toast.error(result.error || "Reset failed. Please try again.", { id: toastId });
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        {success ? (
          /* ── Success state ── */
          <div style={{ padding: "48px 36px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
            <CheckCircle2 size={64} style={{ color: "#0d9488" }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0, fontFamily: ff }}>Password Reset!</h2>
            <p style={{ fontSize: 13, color: "#64748b", fontFamily: ff }}>You can now sign in with your new password.</p>
            <Link href="/login" style={{
              display: "inline-block", marginTop: 8, padding: "12px 32px",
              background: "#f97316", color: "#fff", borderRadius: 12,
              fontSize: 14, fontWeight: 700, textDecoration: "none", fontFamily: ff,
              boxShadow: "0 4px 14px rgba(249,115,22,.3)",
            }}>
              Go to Sign In
            </Link>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div style={{ padding: "32px 36px 24px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ width: 48, height: 48, background: "#fef9c3", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 24 }}>
                🗝️
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e3a5f", margin: "0 0 6px", letterSpacing: "-.3px", fontFamily: ff }}>Reset Password</h1>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0, fontFamily: ff }}>
                Please provide your email and choose a new password for your library account.
              </p>
            </div>

            {/* ── Form ── */}
            <div style={{ padding: "28px 36px 36px" }}>
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Email */}
                <div style={fieldWrap}>
                  <label style={labelStyle}>Email Address</label>
                  <div style={{ position: "relative" }}>
                    <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input type="email" placeholder="librarian@example.com"
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                      })}
                      style={{ ...inputStyle, paddingLeft: 40 }}
                      onFocus={e => e.target.style.borderColor = "#0d9488"}
                      onBlur={e => e.target.style.borderColor = errors.email ? "#ef4444" : "#e2e8f0"}
                    />
                  </div>
                  {errors.email && <p style={errStyle}>{errors.email.message}</p>}
                </div>

                {/* New Password */}
                <div style={fieldWrap}>
                  <label style={labelStyle}>New Password</label>
                  <div style={{ position: "relative" }}>
                    <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input type={showNew ? "text" : "password"} placeholder="••••••••"
                      {...register("newPassword", {
                        required: "New password is required",
                        minLength: { value: 8, message: "Minimum 8 characters" },
                      })}
                      style={{ ...inputStyle, paddingLeft: 40, paddingRight: 44 }}
                      onFocus={e => e.target.style.borderColor = "#0d9488"}
                      onBlur={e => e.target.style.borderColor = errors.newPassword ? "#ef4444" : "#e2e8f0"}
                    />
                    <button type="button" onClick={() => setShowNew(p => !p)} style={eyeBtn}>
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.newPassword && <p style={errStyle}>{errors.newPassword.message}</p>}
                </div>

                {/* Confirm Password */}
                <div style={fieldWrap}>
                  <label style={labelStyle}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <input type={showConfirm ? "text" : "password"} placeholder="••••••••"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: val => val === newPassword || "Passwords do not match",
                      })}
                      style={{ ...inputStyle, paddingLeft: 40, paddingRight: 44 }}
                      onFocus={e => e.target.style.borderColor = "#0d9488"}
                      onBlur={e => e.target.style.borderColor = errors.confirmPassword ? "#ef4444" : "#e2e8f0"}
                    />
                    <button type="button" onClick={() => setShowConfirm(p => !p)} style={eyeBtn}>
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p style={errStyle}>{errors.confirmPassword.message}</p>}
                </div>

                {/* Submit */}
                <button type="submit" disabled={isLoading} style={{ ...submitBtn, background: isLoading ? "#fdba74" : "#f97316", cursor: isLoading ? "not-allowed" : "pointer", marginTop: 4 }}>
                  {isLoading
                    ? <><Loader2 size={16} style={{ marginRight: 8, animation: "spin 1s linear infinite" }} />Resetting...</>
                    : "Reset Password"}
                </button>
              </form>

              <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
                <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#0d9488", textDecoration: "none", fontFamily: ff }}>
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 24, letterSpacing: ".08em", fontFamily: ff }}>
        SECURE LIBRARY ACCESS • 2024 PORTAL
      </p>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const ff = "'Inter', sans-serif";

const pageStyle = {
  minHeight: "100vh", width: "100%",
  background: "#f0f4f8",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  fontFamily: ff, padding: "32px 16px",
};

const cardStyle = {
  width: "100%", maxWidth: 440,
  background: "#fff", borderRadius: 20,
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 32px rgba(0,0,0,.10)",
  overflow: "hidden",
};

const fieldWrap  = { display: "flex", flexDirection: "column", gap: 6 };
const labelStyle = { fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: ff };

const inputStyle = {
  width: "100%", padding: "11px 14px",
  border: "1.5px solid #e2e8f0", borderRadius: 10,
  fontSize: 13, color: "#1e293b", background: "#fff",
  outline: "none", fontFamily: ff, transition: "border-color .15s",
};

const iconStyle = {
  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
  width: 16, height: 16, pointerEvents: "none",
};

const eyeBtn = {
  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
  background: "none", border: "none", cursor: "pointer",
  color: "#94a3b8", display: "flex", alignItems: "center", padding: 0,
};

const errStyle = { fontSize: 11, color: "#ef4444", marginTop: 2 };

const submitBtn = {
  width: "100%", padding: "13px",
  color: "#fff", border: "none", borderRadius: 12,
  fontSize: 15, fontWeight: 700, fontFamily: ff,
  boxShadow: "0 4px 14px rgba(249,115,22,.3)",
  display: "flex", alignItems: "center", justifyContent: "center",
  transition: "background .2s",
};