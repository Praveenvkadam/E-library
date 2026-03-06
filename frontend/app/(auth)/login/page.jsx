"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import useAuthStore from "@/apis/auth/authstore";

const GOOGLE_OAUTH_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080") +
  "/oauth2/authorization/google";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, clearError, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setMounted(true);
    // ✅ redirect to "/" not "/dashboard"
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

  const handleGoogleSignIn = () => {
    window.location.href = GOOGLE_OAUTH_URL;
  };

  // Wait for client mount before rendering (prevents hydration mismatch)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-teal-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 mb-1">Sign In</h1>
          <p className="text-center text-gray-500 text-sm mb-7">Access your books and account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username or Email */}
            <div className="space-y-1.5">
              <Label htmlFor="usernameOrEmail" className="text-gray-700 font-medium">
                Username or Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="usernameOrEmail"
                  type="text"
                  placeholder="username or name@example.com"
                  {...register("usernameOrEmail", { required: "Username or email is required" })}
                  className="pl-10 border-gray-200 rounded-lg h-11 focus-visible:ring-teal-400"
                />
              </div>
              {errors.usernameOrEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.usernameOrEmail.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                  className="pl-10 pr-10 border-gray-200 rounded-lg h-11 focus-visible:ring-teal-400"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" {...register("remember")} className="border-gray-300" />
                <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link href="/reset-password" className="text-sm text-teal-500 hover:text-teal-600 font-medium">
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-base"
            >
              {isLoading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
                : "Sign In"}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <Separator className="flex-1" />
            <span className="text-xs text-gray-400 font-medium tracking-widest">OR CONTINUE WITH</span>
            <Separator className="flex-1" />
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full h-12 border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </Button>

          <p className="text-center text-sm text-gray-500 mt-6">
            New to the library?{" "}
            <Link href="/signup" className="text-teal-500 hover:text-teal-600 font-semibold">
              Create an Account
            </Link>
          </p>
        </div>
      </main>

      <footer className="py-6 px-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400 mb-2">
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Service</Link>
          <Link href="#">Contact Support</Link>
        </div>
        <p className="text-center text-xs text-gray-400">© 2024 CITY PUBLIC LIBRARY SYSTEM</p>
      </footer>
    </div>
  );
}