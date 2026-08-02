"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function CreateCommunityPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");

  const handleCreate = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    const { data, error } = await supabase
  .from("communities")
  .insert({
    name,
    description,
    logo,
    owner_id: user.id,
  })
  .select()
  .single();

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }
    const { error: memberError } = await supabase
  .from("community_members")
  .insert({
    community_id: data.id,
    user_id: user.id,
    role: "owner",
  });

if (memberError) {
  console.error(memberError);
}

    alert("🎉 Community created successfully!");

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex justify-center items-center p-6">
      <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-lg">

        <h1 className="text-4xl font-bold text-green-500 mb-6">
          Create Community
        </h1>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Community Name"
            className="w-full p-3 rounded bg-zinc-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            placeholder="Description"
            className="w-full p-3 rounded bg-zinc-800"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="text"
            placeholder="Logo URL (optional)"
            className="w-full p-3 rounded bg-zinc-800"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
          />

          <button
            onClick={handleCreate}
            className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-bold"
          >
            Create Community
          </button>

        </div>
      </div>
    </main>
  );
}