"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, RefreshCw, HelpCircle, MessageSquare, User, Loader2 } from "lucide-react";
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

export default function SignUpPage() {
  const router = useRouter();
  const { register: registerUser, isLoading, clearError, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  useEffect(() => {
    if (isAuthenticated()) router.replace("/");
  }, []);

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

  const handleGoogleSignUp = () => {
    window.location.href = GOOGLE_OAUTH_URL;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">

          {/* Left – Hero */}
          <div className="relative w-full md:w-5/12 min-h-64 md:min-h-0 bg-blue-900 flex flex-col justify-end p-8">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-900/50 to-transparent z-10" />
            <div className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&auto=format&fit=crop&q=80')` }}
            />
            <div className="relative z-20">
              <h2 className="text-white text-3xl font-bold leading-tight mb-3">Unlock a World of Knowledge</h2>
              <p className="text-blue-100 text-sm leading-relaxed mb-6">
                Join our community to access over 2 million digital and physical titles, reserve study spaces, and join exclusive academic workshops.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["A", "B", "C"].map((l) => (
                    <div key={l} className="w-9 h-9 rounded-full border-2 border-white bg-blue-400 flex items-center justify-center text-white text-xs font-bold">{l}</div>
                  ))}
                </div>
                <span className="text-blue-100 text-sm">Joined by 12,000+ members this month</span>
              </div>
            </div>
          </div>

          {/* Right – Form */}
          <div className="w-full md:w-7/12 p-8 lg:p-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Your Account</h1>
            <p className="text-gray-500 text-sm mb-6">Enter your details to register for your library account.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="username" type="text" placeholder="e.g. john_doe"
                    {...register("username", {
                      required: "Username is required",
                      minLength: { value: 3, message: "Minimum 3 characters" },
                      maxLength: { value: 20, message: "Maximum 20 characters" },
                      pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Only letters, numbers and underscores" },
                    })}
                    className="pl-10 border-gray-200 rounded-lg h-11 focus-visible:ring-teal-400"
                  />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="email" type="email" placeholder="e.g. name@university.edu"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                    })}
                    className="pl-10 border-gray-200 rounded-lg h-11 focus-visible:ring-teal-400"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Minimum 8 characters" },
                    })}
                    className="pl-10 pr-10 border-gray-200 rounded-lg h-11 focus-visible:ring-teal-400"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-gray-700 font-medium">Confirm Password</Label>
                <div className="relative">
                  <RefreshCw className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="confirm" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••"
                    {...register("confirm", {
                      required: "Please confirm your password",
                      validate: (val) => val === password || "Passwords do not match",
                    })}
                    className="pl-10 pr-10 border-gray-200 rounded-lg h-11 focus-visible:ring-teal-400"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <Checkbox id="terms"
                  {...register("terms", { required: "You must accept the terms" })}
                  className="mt-0.5 border-gray-300"
                />
                <div>
                  <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                    I agree to the{" "}
                    <Link href="#" className="text-teal-500 hover:underline">Terms of Service</Link>{" "}and{" "}
                    <Link href="#" className="text-teal-500 hover:underline">Privacy Policy</Link>.
                  </Label>
                  {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms.message}</p>}
                </div>
              </div>

              <Button type="submit" disabled={isLoading}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-base">
                {isLoading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</>
                  : "Sign Up →"}
              </Button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <Separator className="flex-1" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <Separator className="flex-1" />
            </div>

            {/* Google — redirects directly to Spring Boot OAuth2 */}
            <Button variant="outline" onClick={handleGoogleSignUp}
              className="w-full h-12 border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </Button>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{" "}
              <Link href="/login" className="text-teal-500 hover:text-teal-600 font-semibold">Sign In</Link>
            </p>

            <Separator className="my-5" />
            <p className="text-center text-xs text-gray-400 font-semibold tracking-widest mb-3">HELP & SUPPORT</p>
            <div className="flex justify-center gap-6">
              <Link href="#" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                <HelpCircle className="w-4 h-4" /> FAQ
              </Link>
              <Link href="#" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                <MessageSquare className="w-4 h-4" /> Support
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-5 px-4">
        <p className="text-center text-xs text-gray-400">
          © 2024 University Library Portal. All rights reserved.
        </p>
      </footer>
    </div>
  );
}