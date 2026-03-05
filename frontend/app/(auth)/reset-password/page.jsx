"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ShieldCheck, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // handle reset
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-800 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-800 text-lg">Library Portal</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Books</Link>
          <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Reservations</Link>
          <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Accounts</Link>
        </div>
        <Button asChild className="bg-blue-800 hover:bg-blue-900 text-white rounded-lg px-5">
          <Link href="/login">Login</Link>
        </Button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
          {/* Icon */}
          <div className="mb-5">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🗝️</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Reset Password</h1>
          <p className="text-gray-500 text-sm mb-7 leading-relaxed">
            Please provide your email and choose a new password for your library account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="librarian@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-gray-200 rounded-lg h-11 focus-visible:ring-blue-400"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-700 font-medium">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-gray-200 rounded-lg h-11 focus-visible:ring-blue-400"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-gray-700 font-medium">Confirm Password</Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-10 border-gray-200 rounded-lg h-11 focus-visible:ring-blue-400"
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-base"
            >
              Reset Password
            </Button>
          </form>

          {/* Back to Login */}
          <div className="flex justify-center mt-6">
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm text-teal-500 hover:text-teal-600 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 px-4">
        <p className="text-center text-xs text-gray-400 tracking-widest">
          SECURE LIBRARY ACCESS • 2024 PORTAL
        </p>
      </footer>
    </div>
  );
}