"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Pencil,
  User,
  BookOpen,
  Heart,
  History,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";


function ProfileCard({ name, role, phone, avatarUrl }) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      {/* Avatar with gradient ring */}
      <div className="relative">
        <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-br from-cyan-400 via-teal-400 to-blue-500 shadow-lg shadow-cyan-200">
          <div className="w-full h-full rounded-full overflow-hidden bg-white">
            <Image
              src={avatarUrl}
              alt={name}
              width={112}
              height={112}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
        </div>
        <span className="absolute bottom-1 right-1 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full p-0.5 shadow-md">
          <CheckCircle2 className="w-5 h-5 text-white fill-white" />
        </span>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800">{name}</h2>
        <Badge className="mt-1 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-600 border border-cyan-200 hover:bg-cyan-50 font-medium text-xs">
          {role}
        </Badge>
      </div>

      <div className="w-full bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-100 rounded-xl py-3 px-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Phone</p>
        <p className="text-sm font-semibold text-gray-700">{phone}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   StatsGrid
───────────────────────────────────────────── */
function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center bg-gradient-to-br from-white to-slate-50 border border-gray-100 rounded-2xl py-4 px-3 shadow-sm"
        >
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
            {stat.label}
          </p>
          <p className="text-2xl font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SidebarNav
───────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Profile Details", icon: User },
  { label: "My Bookshelf",    icon: BookOpen },
  { label: "Favorites",       icon: Heart },
  { label: "History",         icon: History },
];

function SidebarNav() {
  const [active, setActive] = useState("Profile Details");

  return (
    <nav className="flex flex-col gap-1 w-full">
      {NAV_ITEMS.map(({ label, icon: Icon }) => {
        const isActive = active === label;
        return (
          <button
            key={label}
            onClick={() => setActive(label)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left",
              isActive
                ? "bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-600 border border-cyan-100 shadow-sm"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            )}
          >
            <Icon className={cn("w-4 h-4", isActive ? "text-cyan-500" : "text-gray-400")} />
            {label}
            {isActive && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

/* ─────────────────────────────────────────────
   ReadingStreakCard
───────────────────────────────────────────── */
function ReadingStreakCard({ streak, message }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-slate-900 p-5 shadow-xl">
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-blue-600/20 rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-orange-400" />
          <p className="text-white font-semibold text-sm">Reading Streak</p>
        </div>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent leading-none">
            {streak}
          </span>
          <span className="text-gray-300 text-sm mb-1 font-medium">Days in a row</span>
        </div>
        <p className="text-gray-400 text-xs leading-relaxed">{message}</p>
        <div className="mt-4 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full"
            style={{ width: `${Math.min((streak / 30) * 100, 100)}%` }}
          />
        </div>
        <p className="text-gray-500 text-[10px] mt-1">{streak}/30 day goal</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sidebar (default export — composes all above)
───────────────────────────────────────────── */
const USER = {
  name: "Alex Johnson",
  role: "Premium Member",
  phone: "+1 (555) 123-4567",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
};

const STATS = [
  { label: "Books Read", value: "128" },
  { label: "Reviews",    value: "42"  },
];

export default function Sidebar() {
  return (
    <aside className="w-full lg:w-[280px] lg:min-w-[280px] shrink-0 flex flex-col gap-4">
      {/* Main card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white shadow-xl shadow-gray-100/80 p-6 flex flex-col gap-5">
        <ProfileCard {...USER} />
        <StatsGrid stats={STATS} />

        {/* Edit Profile button */}
        <Button className="w-full h-11 font-bold tracking-wider text-sm bg-gradient-to-r from-orange-400 via-rose-400 to-pink-500 hover:from-orange-500 hover:via-rose-500 hover:to-pink-600 text-white border-0 rounded-2xl shadow-lg shadow-orange-200/60 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5">
          <Pencil className="w-4 h-4 mr-2" />
          EDIT PROFILE
        </Button>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <SidebarNav />
      </div>

      {/* Streak card */}
      <ReadingStreakCard
        streak={15}
        message="You're in the top 5% of readers this month. Keep it up!"
      />
    </aside>
  );
}