type LeagueHeaderProps = {
  name: string;
  season: string;
};

export default function LeagueHeader({
  name,
  season,
}: LeagueHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-2xl p-8 mb-8 shadow-lg">
      <h1 className="text-4xl font-bold text-white">
        🏆 {name}
      </h1>

      <p className="text-green-100 text-lg mt-2">
        Season {season}
      </p>
    </div>
  );
}