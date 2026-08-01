"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 const handleLogin = async () => {
  console.log("Starting login...");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Login successful!");

  router.push("/dashboard");
};

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-xl w-full max-w-md">

        <h1 className="text-4xl font-bold text-center text-green-500 mb-6">
          Login
        </h1>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 rounded bg-zinc-800 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded bg-zinc-800 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-bold"
          >
            Login
          </button>

        </div>
      </div>
    </main>
  );
}