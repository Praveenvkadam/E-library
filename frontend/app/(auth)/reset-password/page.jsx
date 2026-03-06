"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ShieldCheck, ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuthStore from "@/apis/auth/authstore";

export default function ResetPasswordPage() {
  const { resetPassword, isLoading, clearError } = useAuthStore();
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
          {/* Icon */}
          <div className="mb-5">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🗝️</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-blue-900 mb-2">Reset Password</h1>
          <p className="text-gray-500 text-sm mb-7 leading-relaxed">
            Please provide your email and choose a new password for your library account.
          </p>

          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-teal-500" />
              </div>
              <p className="text-gray-700 font-medium">Password reset successfully!</p>
              <p className="text-gray-500 text-sm">You can now sign in with your new password.</p>
              <Button asChild className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-lg mt-2">
                <Link href="/login">Go to Sign In</Link>
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="librarian@example.com"
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                      })}
                      className="pl-10 border-gray-200 rounded-lg h-11 focus-visible:ring-blue-400"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-gray-700 font-medium">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("newPassword", {
                        required: "New password is required",
                        minLength: { value: 8, message: "Minimum 8 characters" },
                      })}
                      className="pl-10 pr-10 border-gray-200 rounded-lg h-11 focus-visible:ring-blue-400"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (val) => val === newPassword || "Passwords do not match",
                      })}
                      className="pl-10 pr-10 border-gray-200 rounded-lg h-11 focus-visible:ring-blue-400"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-base"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resetting...</>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>

              <div className="flex justify-center mt-6">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-sm text-teal-500 hover:text-teal-600 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="py-5 px-4">
        <p className="text-center text-xs text-gray-400 tracking-widest">
          SECURE LIBRARY ACCESS • 2024 PORTAL
        </p>
      </footer>
    </div>
  );
}