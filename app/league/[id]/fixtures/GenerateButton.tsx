"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateLeagueFixtures } from "../../../../services/fixtureService";

type Props = {
  leagueId: string;
  fixturesGenerated: boolean;
  onGenerate?: () => void; // <-- NEW prop
};

export default function GenerateButton({
  leagueId,
  fixturesGenerated,
  onGenerate, // <-- NEW
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (fixturesGenerated) {
      alert("Fixtures have already been generated.");
      return;
    }

    const confirmGenerate = confirm(
      "Generate all fixtures for this league?"
    );

    if (!confirmGenerate) return;

    try {
      setLoading(true);

      await generateLeagueFixtures(leagueId);

      alert("✅ Fixtures generated successfully!");

      // Call onGenerate to refresh the parent page
      if (onGenerate) {
        onGenerate();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fixturesGenerated) {
    return (
      <div className="bg-green-700 text-white px-6 py-3 rounded-xl font-bold text-center">
        ✅ Fixtures Already Generated
      </div>
    );
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 px-6 py-3 rounded-xl font-bold transition"
    >
      {loading ? "Generating Fixtures..." : "⚽ Generate Fixtures"}
    </button>
  );
}