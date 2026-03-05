"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogOut, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/apis/auth/authstore";
import { authApi } from "@/lib/authapi";

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

    // Handle Google OAuth token from Spring Boot redirect
    if (token) {
      const handleToken = async () => {
        const toastId = toast.loading("Completing Google sign-in...");
        try {
          const data = await authApi.processToken(token);
          loginWithGoogle({
            backendToken: token,
            backendUser: {
              id: data.id,
              username: data.username,
              email: data.email,
              provider: data.provider,
              role: data.role,
            },
          });
          toast.success(`Welcome, ${data.username}! 👋`, { id: toastId });
          // Clean the token from the URL after storing
          router.replace("/");
        } catch (err) {
          toast.error(err.message || "Google sign-in failed.", { id: toastId });
          router.replace("/login");
        }
      };
      handleToken();
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
  };

  // Show a loading spinner while processing the token
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