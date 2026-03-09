"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import useAuthStore from "@/store/authstore";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGoogle, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      const messages = {
        unverified: "Your Google account email is not verified.",
        use_password_login: "This email is already registered. Please sign in with your password.",
      };
      toast.error(messages[error] || "Authentication failed. Please try again.");
      router.replace("/login");
      return;
    }

    if (!token) {
      isAuthenticated() ? router.replace("/dashboard") : router.replace("/login");
      return;
    }

    const handleToken = async () => {
      const toastId = toast.loading("Completing Google sign-in...");
      try {
        // ✅ Decode JWT directly — avoids broken processToken URL routing
        let payload = {};
        try {
          payload = JSON.parse(atob(token.split(".")[1]));
        } catch {
          throw new Error("Invalid token received.");
        }

        console.log("[OAuth] JWT payload →", payload); // remove after confirming role shows

        const rawRole =
          payload.role ||
          payload.authorities?.[0]?.authority ||
          payload.roles?.[0] ||
          null;

        const normalizedRole = rawRole
          ? rawRole.toUpperCase().includes("ADMIN") ? "ADMIN" : "USER"
          : null;

        loginWithGoogle({
          backendToken: token,
          backendUser: {
            id:       payload.id       || payload.userId,
            username: payload.username || payload.name,
            email:    payload.email    || payload.sub,
            provider: "GOOGLE",
            role:     normalizedRole,
          },
        });

        toast.success(`Welcome back! 👋`, { id: toastId });
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