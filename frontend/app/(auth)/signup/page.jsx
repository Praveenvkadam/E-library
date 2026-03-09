"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, HelpCircle, MessageSquare } from "lucide-react";
import useAuthStore from "@/apis/auth/authstore";

const GOOGLE_OAUTH_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080") +
  "/oauth2/authorization/google";

export default function SignUpPage() {
  const router = useRouter();
  const { register: registerUser, isLoading, clearError, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirmPassword, setShowConfirmPass] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password");

  useEffect(() => { if (isAuthenticated()) router.replace("/"); }, []);

  const onSubmit = async ({ username, email, password }) => {
    clearError();
    const toastId = toast.loading("Creating your account...");
    const result = await registerUser({ username, email, password });
    if (result.success) {
      toast.success("Account created! Please sign in. 🎉", { id: toastId });
      router.push("/login");
    } else {
      toast.error(result.error || "Registration failed. Please try again.", { id: toastId });
    }
  };

  return (
    <div style={pageStyle}>
      <style>{`
        .signup-card   { width: 100%; max-width: 900px; background: #fff; border-radius: 20px; box-shadow: 0 4px 32px rgba(0,0,0,.10); border: 1px solid #e2e8f0; overflow: hidden; display: flex; }
        .signup-hero   { width: 40%; min-height: 600px; flex-shrink: 0; position: relative; display: flex; flex-direction: column; justify-content: flex-end; background: #1e3a5f; padding: 36px; }
        .signup-form   { flex: 1; padding: 36px 40px; overflow-y: auto; }
        @media (max-width: 767px) {
          .signup-hero { display: none; }
          .signup-card { max-width: 480px; }
          .signup-form { padding: 28px 20px; }
        }
        @media (max-width: 479px) {
          .signup-form { padding: 24px 16px; }
        }
      `}</style>
      <div className="signup-card">

        {/* ── Left hero panel ──────────────────────────────── */}
        <div className="signup-hero">
          {/* BG image */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&auto=format&fit=crop&q=80')`,
            backgroundSize: "cover", backgroundPosition: "center",
          }} />
          {/* Gradient overlay */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,30,60,.92) 40%, rgba(15,30,60,.4) 100%)" }} />

          <div style={{ position: "relative", zIndex: 2 }}>
            <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 800, lineHeight: 1.25, marginBottom: 12, fontFamily: ff }}>
              Unlock a World of Knowledge
            </h2>
            <p style={{ color: "#bfdbfe", fontSize: 13, lineHeight: 1.7, marginBottom: 24, fontFamily: ff }}>
              Join our community to access over 2 million digital and physical titles, reserve study spaces, and join exclusive academic workshops.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex" }}>
                {["A", "B", "C"].map((l, i) => (
                  <div key={l} style={{
                    width: 34, height: 34, borderRadius: "50%",
                    border: "2px solid #fff", background: "#3b82f6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 12, fontWeight: 700,
                    marginLeft: i === 0 ? 0 : -8, fontFamily: ff,
                  }}>{l}</div>
                ))}
              </div>
              <span style={{ color: "#bfdbfe", fontSize: 12, fontFamily: ff }}>Joined by 12,000+ members this month</span>
            </div>
          </div>
        </div>

        {/* ── Right form panel ─────────────────────────────── */}
        <div className="signup-form" style={{ fontFamily: ff }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: "0 0 4px", letterSpacing: "-.3px" }}>Create Your Account</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Enter your details to register for your library account.</p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Username */}
            <Field label="Username" error={errors.username?.message}>
              <IconInput icon={<UserIcon />}>
                <input type="text" placeholder="e.g. john_doe"
                  {...register("username", {
                    required: "Username is required",
                    minLength: { value: 3, message: "Minimum 3 characters" },
                    maxLength: { value: 20, message: "Maximum 20 characters" },
                    pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Only letters, numbers and underscores" },
                  })}
                  style={{ ...inputStyle, paddingLeft: 40 }}
                  onFocus={e => e.target.style.borderColor = "#0d9488"}
                  onBlur={e => e.target.style.borderColor = errors.username ? "#ef4444" : "#e2e8f0"}
                />
              </IconInput>
            </Field>

            {/* Email */}
            <Field label="Email Address" error={errors.email?.message}>
              <IconInput icon={<MailIcon />}>
                <input type="email" placeholder="e.g. name@university.edu"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                  })}
                  style={{ ...inputStyle, paddingLeft: 40 }}
                  onFocus={e => e.target.style.borderColor = "#0d9488"}
                  onBlur={e => e.target.style.borderColor = errors.email ? "#ef4444" : "#e2e8f0"}
                />
              </IconInput>
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password?.message}>
              <IconInput icon={<LockIcon />} rightSlot={
                <button type="button" onClick={() => setShowPassword(p => !p)} style={eyeBtn}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }>
                <input type={showPassword ? "text" : "password"} placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Minimum 8 characters" },
                  })}
                  style={{ ...inputStyle, paddingLeft: 40, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = "#0d9488"}
                  onBlur={e => e.target.style.borderColor = errors.password ? "#ef4444" : "#e2e8f0"}
                />
              </IconInput>
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm Password" error={errors.confirm?.message}>
              <IconInput icon={<RefreshIcon />} rightSlot={
                <button type="button" onClick={() => setShowConfirmPass(p => !p)} style={eyeBtn}>
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }>
                <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••"
                  {...register("confirm", {
                    required: "Please confirm your password",
                    validate: val => val === password || "Passwords do not match",
                  })}
                  style={{ ...inputStyle, paddingLeft: 40, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = "#0d9488"}
                  onBlur={e => e.target.style.borderColor = errors.confirm ? "#ef4444" : "#e2e8f0"}
                />
              </IconInput>
            </Field>

            {/* Terms */}
            <div>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input type="checkbox"
                  {...register("terms", { required: "You must accept the terms" })}
                  style={{ accentColor: "#0d9488", width: 15, height: 15, marginTop: 2, flexShrink: 0 }}
                />
                <span style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                  I agree to the{" "}
                  <Link href="#" style={{ color: "#0d9488", textDecoration: "none", fontWeight: 600 }}>Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="#" style={{ color: "#0d9488", textDecoration: "none", fontWeight: 600 }}>Privacy Policy</Link>.
                </span>
              </label>
              {errors.terms && <p style={errStyle}>{errors.terms.message}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} style={{ ...submitBtn, background: isLoading ? "#fdba74" : "#f97316", cursor: isLoading ? "not-allowed" : "pointer" }}>
              {isLoading
                ? <><Loader2 size={16} style={{ marginRight: 8, animation: "spin 1s linear infinite" }} />Creating account...</>
                : "Sign Up →"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: ".08em" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
          </div>

          {/* Google */}
          <button onClick={() => window.location.href = GOOGLE_OAUTH_URL} style={googleBtn}>
            <GoogleIcon />
            Sign up with Google
          </button>

          <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 16 }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#0d9488", fontWeight: 700, textDecoration: "none" }}>Sign In</Link>
          </p>

          <div style={{ height: 1, background: "#f1f5f9", margin: "18px 0" }} />
          <p style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: ".1em", marginBottom: 12 }}>HELP & SUPPORT</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
            <Link href="#" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", textDecoration: "none" }}>
              <HelpCircle size={14} /> FAQ
            </Link>
            <Link href="#" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", textDecoration: "none" }}>
              <MessageSquare size={14} /> Support
            </Link>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 24, fontFamily: ff }}>© 2024 University Library Portal. All rights reserved.</p>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────

function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <p style={errStyle}>{error}</p>}
    </div>
  );
}

function IconInput({ icon, rightSlot, children }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex", color: "#94a3b8" }}>{icon}</span>
      {children}
      {rightSlot && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>{rightSlot}</span>}
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

function MailIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function LockIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function UserIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function RefreshIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>; }

// ── Shared styles ─────────────────────────────────────────────────────────────
const ff = "'Inter', sans-serif";

const pageStyle = {
  minHeight: "100vh", width: "100%",
  background: "#f0f4f8",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  fontFamily: ff, padding: "32px 16px",
};

const labelStyle = { fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: ff };

const inputStyle = {
  width: "100%", padding: "10px 14px",
  border: "1.5px solid #e2e8f0", borderRadius: 10,
  fontSize: 13, color: "#1e293b", background: "#fff",
  outline: "none", fontFamily: ff, transition: "border-color .15s",
};

const eyeBtn = {
  background: "none", border: "none", cursor: "pointer",
  color: "#94a3b8", display: "flex", alignItems: "center", padding: 0,
};

const errStyle = { fontSize: 11, color: "#ef4444", marginTop: 2 };

const submitBtn = {
  width: "100%", padding: "13px",
  color: "#fff", border: "none", borderRadius: 12,
  fontSize: 14, fontWeight: 700, fontFamily: ff,
  boxShadow: "0 4px 14px rgba(249,115,22,.3)",
  display: "flex", alignItems: "center", justifyContent: "center",
  transition: "background .2s",
};

const googleBtn = {
  width: "100%", padding: "11px",
  background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12,
  fontSize: 13, fontWeight: 600, color: "#1e293b",
  cursor: "pointer", fontFamily: ff,
  display: "flex", alignItems: "center", justifyContent: "center",
};