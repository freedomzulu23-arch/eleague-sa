'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CupsPage() {
  const router = useRouter();
  const [cups, setCups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCups();
  }, []);

  const loadCups = async () => {
    try {
      const { data, error } = await supabase
        .from('cups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCups(data || []);
    } catch (error) {
      console.error('Error loading cups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-white">Loading cups...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-white flex-1">🏆 Cups</h1>
          <Link
            href="/cups/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Cup
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{cups.length}</div>
            <div className="text-sm text-gray-400">Total Cups</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {cups.filter((c) => c.status === 'draft' || c.status === 'active').length}
            </div>
            <div className="text-sm text-gray-400">Active Cups</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">
              {cups.filter((c) => c.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
        </div>

        {/* Cup Cards Grid */}
        {cups.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-xl text-gray-300 mb-2">No cups yet</p>
            <p className="text-gray-500 mb-6">Create your first cup tournament!</p>
            <Link
              href="/cups/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition inline-block"
            >
              + Create Cup
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cups.map((cup) => {
              const isCompleted = cup.status === 'completed';
              const isActive = cup.status === 'draft' || cup.status === 'active';
              
              return (
                <Link
                  key={cup.id}
                  href={`/cups/${cup.id}`}
                  className={`group bg-zinc-900 border rounded-xl p-5 transition-all hover:scale-[1.02] hover:shadow-xl ${
                    isCompleted 
                      ? 'border-green-700 hover:border-green-500' 
                      : isActive 
                      ? 'border-yellow-700 hover:border-yellow-500' 
                      : 'border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white group-hover:text-blue-400 transition line-clamp-1">
                      {cup.name}
                    </h2>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${
                      isCompleted 
                        ? 'bg-green-900/50 text-green-400 border border-green-700' 
                        : isActive 
                        ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700' 
                        : 'bg-zinc-800 text-gray-400 border border-zinc-700'
                    }`}>
                      {isCompleted ? '✅ Completed' : isActive ? '🔄 Active' : '📝 Draft'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="text-white font-medium">{cup.teams_count || 0}</span> teams
                    </span>
                    {cup.cup_mode === 'season' && (
                      <span className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded text-xs">
                        Season Cup
                      </span>
                    )}
                    {cup.season && (
                      <span className="text-gray-500 text-xs">• {cup.season}</span>
                    )}
                  </div>

                  {cup.league_id && (
                    <div className="mt-2 text-xs text-gray-500">
                      📋 Linked to league
                    </div>
                  )}

                  {/* Hover arrow */}
                  <div className="mt-3 text-right text-gray-600 group-hover:text-blue-400 transition">
                    <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}