"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogOut, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/apis/auth/authstore";

function decodeJwt(jwtToken) {
  try {
    return JSON.parse(atob(jwtToken.split(".")[1]));
  } catch {
    return null;
  }
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ mounted guard — prevents hydration mismatch from Zustand persist
  // Server has no localStorage, so we never render auth-dependent UI until mounted
  const [mounted, setMounted] = useState(false);

  const { user, isAuthenticated, loginWithGoogle, logout } = useAuthStore();

  const urlToken = searchParams.get("token");
  const urlError = searchParams.get("error");

  useEffect(() => {
    setMounted(true);

    if (urlError) {
      const messages = {
        unverified: "Your Google account email is not verified.",
        use_password_login: "Already registered. Please sign in with your password.",
      };
      toast.error(messages[urlError] || "Authentication failed.");
      router.replace("/login");
      return;
    }

    if (urlToken) {
      const payload = decodeJwt(urlToken);
      if (!payload) {
        toast.error("Invalid token. Please try again.");
        router.replace("/login");
        return;
      }

      const email    = payload.sub;
      const username = payload.username ?? email?.split("@")[0] ?? "User";

      loginWithGoogle({
        backendToken: urlToken,
        backendUser: {
          id:       payload.id ?? null,
          username,
          email,
          provider: payload.provider ?? "GOOGLE",
          role:     payload.role ?? "USER",
        },
      });

      toast.success(`Welcome, ${username}! 👋`);
      router.replace("/");
    }
  }, []);

  // Don't render anything until client is mounted (avoids hydration mismatch)
  if (!mounted || urlToken) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {isAuthenticated() ? (
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

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}