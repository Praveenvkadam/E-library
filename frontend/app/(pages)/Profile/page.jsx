"use client";
import UserProfile from "@/components/Userprofile";
import CurrentlyReading from "@/components/Currentlyreading";
import ReadingHistory from "@/components/Readinghistory";

export default function Profile() {
 return (
    <main className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="w-full flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <UserProfile />
 
        {/* Right Content */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          <CurrentlyReading />
          <ReadingHistory />
        </div>
      </div>
    </main>
  );
}