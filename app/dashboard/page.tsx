"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email || "");
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold text-green-500 mb-4">
          Welcome to eLeague SA
        </h1>

        <p className="text-lg mb-6">
          Logged in as: <span className="text-green-400">{email}</span>
        </p>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold"
        >
          Logout
        </button>

      </div>
    </main>
  );
}