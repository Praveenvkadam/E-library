"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogOut, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/apis/auth/authstore";

/**
 * Decode JWT payload without any API call.
 * Avoids the CORS redirect issue caused by calling /api/auth/{token}
 * which Spring Security redirects to Google OAuth.
 */
function decodeJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loginWithGoogle, logout } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    // Handle backend error redirects
    if (error) {
      const messages = {
        unverified: "Your Google account email is not verified.",
        use_password_login: "This email is already registered. Please sign in with your password.",
      };
      toast.error(messages[error] || "Authentication failed. Please try again.");
      router.replace("/login");
      return;
    }

    // Handle Google OAuth token — decode JWT directly, no Axios call
    if (token) {
      const payload = decodeJwt(token);
      if (!payload) {
        toast.error("Invalid token. Please try again.");
        router.replace("/login");
        return;
      }

      // Spring Boot JWT claims: sub=email, role, provider, iat, exp
      // There is no username claim — derive it from the email (before @)
      const email = payload.sub;
      const username = payload.username ?? email?.split("@")[0] ?? "User";

      loginWithGoogle({
        backendToken: token,
        backendUser: {
          id: payload.id ?? null,
          username,
          email,
          provider: payload.provider ?? "GOOGLE",
          role: payload.role ?? "USER",
        },
      });

      toast.success(`Welcome, ${username}! 👋`);
      router.replace("/");
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
  };

  // Show spinner while token is being processed
  const token = searchParams.get("token");
  if (token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
          <p className="text-sm font-medium">Completing Google sign-in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {isAuthenticated() ? (
        // ── Authenticated view ──────────────────────────────────
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-5 w-full max-w-sm">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
            <User className="w-8 h-8 text-teal-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">{user?.username}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-2 text-xs font-medium px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-600">
              {user?.role}
            </span>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      ) : (
        // ── Guest view ──────────────────────────────────────────
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Welcome to Library Portal</h1>
          <div className="flex gap-3">
            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
              <Link href="/signup">Sign Up</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}