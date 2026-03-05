"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    return (
        <div className="flex items-center justify-center h-screen">
            <h1>Home</h1>
            <Link href="/signup">
                <Button>Signup</Button>
            </Link>
        </div>
    );
}