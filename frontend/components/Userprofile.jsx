"use client";

import { Pencil, User, BookOpen, Heart, RotateCcw, Flame } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { icon: User, label: "Profile Details", active: true },
  { icon: BookOpen, label: "My Bookshelf" },
  { icon: Heart, label: "Favorites" },
  { icon: RotateCcw, label: "History" },
];

export default function UserProfile() {
  return (
    <aside className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-cyan-100 shadow-md">
            <img
              src="https://api.dicebear.com/7.x/adventurer/svg?seed=Alex&backgroundColor=b6e3f4"
              alt="Alex Johnson"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-cyan-400 border-2 border-white rounded-full" />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-800 font-serif">Alex Johnson</h2>
          <Badge className="bg-cyan-50 text-cyan-600 border border-cyan-200 text-xs font-medium mt-1 rounded-full px-3">
            Premium Member
          </Badge>
        </div>

        {/* Stats */}
        <div className="flex w-full justify-around border-y border-gray-100 py-3 mt-1">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Books Read</p>
            <p className="text-2xl font-extrabold text-gray-800 font-serif leading-tight">128</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Reviews</p>
            <p className="text-2xl font-extrabold text-gray-800 font-serif leading-tight">42</p>
          </div>
        </div>

        {/* Phone */}
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Phone</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">+1 (555) 123-4567</p>
        </div>

        {/* Edit Button */}
        <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600 text-white text-sm font-semibold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 mt-1">
          <Pencil size={14} />
          EDIT PROFILE
        </button>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-2xl shadow-sm p-3 flex flex-col gap-1">
        {navItems.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left
              ${active
                ? "bg-cyan-50 text-cyan-600 font-semibold"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
          >
            <Icon size={16} className={active ? "text-cyan-500" : "text-gray-400"} />
            {label}
          </button>
        ))}
      </div>

      {/* Reading Streak Card */}
      <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #1a3a3a 0%, #0d2b2b 100%)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Flame size={16} className="text-orange-400" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-300">Reading Streak</p>
        </div>
        <p className="text-5xl font-extrabold font-serif leading-none">
          15
          <span className="text-base font-semibold text-gray-300 ml-2">Days in a row</span>
        </p>
        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          You're in the top 5% of readers this month. Keep it up!
        </p>
      </div>
    </aside>
  );
}