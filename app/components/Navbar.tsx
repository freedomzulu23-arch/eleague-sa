'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationBell from "./NotificationBell";
import MobileNav from "./MobileNav";
import MobileMenu from "./MobileMenu";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <nav className="flex items-center justify-between bg-zinc-900 px-4 md:px-8 py-4 border-b border-zinc-800">
        {/* Logo */}
        <Link href="/" className="text-2xl md:text-3xl font-bold text-green-500">
          ⚽ eLeague SA
        </Link>

        {/* Desktop Navigation - Hidden on Mobile */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/" className="hover:text-green-400">
            Home
          </Link>
          <Link href="/communities" className="hover:text-green-400">
            Communities
          </Link>
          <Link href="/leagues" className="hover:text-green-400">
            Leagues
          </Link>
          <Link href="/cups" className="hover:text-green-400">
            Cups
          </Link>
          <Link href="/rankings" className="hover:text-green-400">
            Rankings
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <NotificationBell />

          {/* Desktop Auth Buttons - Hidden on Mobile */}
          <div className="hidden md:flex gap-3">
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg font-semibold transition"
            >
              Register
            </Link>
          </div>

          {/* Mobile Hamburger Menu */}
          <MobileMenu onLogout={handleLogout} />
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </>
  );
}