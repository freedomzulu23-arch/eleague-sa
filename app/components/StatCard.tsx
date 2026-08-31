type StatCardProps = {
  title: string;
  value: number | string;
  icon: string;
};

export default function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-green-500 transition">
      <div className="text-4xl mb-3">{icon}</div>

      <h2 className="text-3xl font-bold text-white">
        {value}
      </h2>

      <p className="text-zinc-400 mt-2">
        {title}
      </p>
    </div>
  );
}