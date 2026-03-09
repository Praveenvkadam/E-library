"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import useAuthStore from "@/apis/auth/authstore";

const GOOGLE_OAUTH_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080") +
  "/oauth2/authorization/google";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, clearError, isAuthenticated } = useAuthStore();
  const [mounted, setMounted]       = useState(false);
  const [showPassword, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated()) router.replace("/");
  }, []);

  const onSubmit = async ({ usernameOrEmail, password }) => {
    clearError();
    const toastId = toast.loading("Signing in...");
    const result = await login({ usernameOrEmail, password });
    if (result.success) {
      toast.success("Welcome back! 👋", { id: toastId });
      router.push("/");
    } else {
      toast.error(result.error || "Login failed. Please try again.", { id: toastId });
    }
  };

  if (!mounted) return (
    <div style={pageStyle}>
      <Loader2 style={{ width: 32, height: 32, color: "#0d9488", animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        {/* Icon header */}
        <div style={{ padding: "36px 36px 24px", display: "flex", flexDirection: "column", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ width: 56, height: 56, background: "#f0fdfa", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", margin: 0, letterSpacing: "-.4px" }}>Sign In</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Access your books and account</p>
        </div>

        {/* Form */}
        <div style={{ padding: "28px 36px 32px" }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Username or Email */}
            <div style={fieldWrap}>
              <label style={labelStyle}>Username or Email</label>
              <div style={{ position: "relative" }}>
                <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input type="text" placeholder="username or name@example.com"
                  {...register("usernameOrEmail", { required: "Username or email is required" })}
                  style={{ ...inputStyle, paddingLeft: 40 }}
                  onFocus={e => e.target.style.borderColor = "#0d9488"}
                  onBlur={e => e.target.style.borderColor = errors.usernameOrEmail ? "#ef4444" : "#e2e8f0"}
                />
              </div>
              {errors.usernameOrEmail && <p style={errStyle}>{errors.usernameOrEmail.message}</p>}
            </div>

            {/* Password */}
            <div style={fieldWrap}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type={showPassword ? "text" : "password"} placeholder="••••••••"
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
                  style={{ ...inputStyle, paddingLeft: 40, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = "#0d9488"}
                  onBlur={e => e.target.style.borderColor = errors.password ? "#ef4444" : "#e2e8f0"}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={eyeBtn}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={errStyle}>{errors.password.message}</p>}
            </div>

            {/* Remember + Forgot */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", cursor: "pointer" }}>
                <input type="checkbox" {...register("remember")} style={{ accentColor: "#0d9488", width: 15, height: 15 }} />
                Remember me
              </label>
              <Link href="/reset-password" style={{ fontSize: 13, fontWeight: 600, color: "#0d9488", textDecoration: "none" }}>
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} style={{ ...submitBtn, background: isLoading ? "#fdba74" : "#f97316", cursor: isLoading ? "not-allowed" : "pointer", marginTop: 4 }}>
              {isLoading ? <><Loader2 size={16} style={{ marginRight: 8, animation: "spin 1s linear infinite" }} />Signing in...</> : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: ".08em" }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
          </div>

          {/* Google */}
          <button onClick={() => window.location.href = GOOGLE_OAUTH_URL} style={googleBtn}>
            <GoogleIcon />
            Sign in with Google
          </button>

          <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 20 }}>
            New to the library?{" "}
            <Link href="/signup" style={{ color: "#0d9488", fontWeight: 700, textDecoration: "none" }}>Create an Account</Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy Policy", "Terms of Service", "Contact Support"].map(t => (
            <Link key={t} href="#" style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none" }}>{t}</Link>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "#94a3b8" }}>© 2024 CITY PUBLIC LIBRARY SYSTEM</p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 10 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const ff = "'Inter', sans-serif";

const pageStyle = {
  minHeight: "100vh", width: "100%",
  background: "#f0f4f8",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  fontFamily: ff, padding: "24px 16px",
};

const cardStyle = {
  width: "100%", maxWidth: 420,
  background: "#fff", borderRadius: 20,
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 32px rgba(0,0,0,.10)",
  overflow: "hidden",
};

const fieldWrap = { display: "flex", flexDirection: "column", gap: 6 };

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
  background: "none", border: "none", cursor: "pointer", color: "#94a3b8",
  display: "flex", alignItems: "center", padding: 0,
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

const googleBtn = {
  width: "100%", padding: "12px",
  background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12,
  fontSize: 13, fontWeight: 600, color: "#1e293b",
  cursor: "pointer", fontFamily: ff,
  display: "flex", alignItems: "center", justifyContent: "center",
  transition: "border-color .15s, box-shadow .15s",
};