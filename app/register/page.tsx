"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleRegister = async () => {
  try {
    console.log("=== STARTING REGISTRATION ===");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      alert("ERROR: " + error.message);
      return;
    }

    alert(
      "Registration finished.\n\nCheck the browser console (F12) for DATA and ERROR."
    );
  } catch (err) {
    console.error(err);
    alert("Unexpected error.");
  }
};


return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-green-500 mb-6">
          Register
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 rounded bg-zinc-800 text-white"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 rounded bg-zinc-800 text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

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
            onClick={handleRegister}
            className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-bold"
          >
            Create Account
          </button>
        </div>
      </div>
    </main>
  );
}