"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import useAuthStore from "@/apis/auth/authstore";
import { authApi } from "@/lib/authapi";

/**
 * Root page — handles the redirect from Spring Boot OAuth2:
 *   http://localhost:3000/?token=<JWT>
 *
 * Extracts the token, fetches user info from the backend,
 * stores everything in Zustand, then redirects to /dashboard.
 *
 * Also handles error redirects:
 *   ?error=unverified
 *   ?error=use_password_login
 */
export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGoogle, isAuthenticated } = useAuthStore();

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

    // If no token and already authenticated, go to dashboard
    if (!token) {
      if (isAuthenticated()) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
      return;
    }

    // Exchange token for full user info
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
        router.replace("/dashboard");
      } catch (err) {
        toast.error(err.message || "Google sign-in failed.", { id: toastId });
        router.replace("/login");
      }
    };

    handleToken();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
        <p className="text-sm font-medium">Completing sign-in...</p>
      </div>
    </div>
  );
}