'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboard() {
  const [pendingFixtures, setPendingFixtures] = useState<any[]>([]);
  const [pendingCupMatches, setPendingCupMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0, pending: 0 });

  useEffect(() => {
    loadPendingResults();
  }, []);

  const loadPendingResults = async () => {
    try {
      setLoading(true);

      // Get all fixtures with status
      const { data: allFixtures } = await supabase
        .from('fixtures')
        .select('status');

      const total = allFixtures?.length || 0;
      const approved = allFixtures?.filter((f: any) => f.status === 'approved').length || 0;
      const rejected = allFixtures?.filter((f: any) => f.status === 'rejected').length || 0;
      const pending = allFixtures?.filter((f: any) => f.status === 'pending' || !f.status).length || 0;

      setStats({ total, approved, rejected, pending });

      // Get pending league fixtures with screenshots
      const { data: fixtures } = await supabase
        .from('fixtures')
        .select(`
          *,
          home_team:league_teams!home_team_id(team_name),
          away_team:league_teams!away_team_id(team_name),
          leagues!inner(name)
        `)
        .in('status', ['pending', null])
        .not('screenshot_url', 'is', null)
        .order('created_at', { ascending: false });

      setPendingFixtures(fixtures || []);

      // Get pending cup matches with screenshots
      const { data: cupMatches } = await supabase
        .from('cup_matches')
        .select(`
          *,
          home_team:cup_teams!home_team_id(team_name),
          away_team:cup_teams!away_team_id(team_name)
        `)
        .in('status', ['pending', null])
        .not('screenshot_url', 'is', null)
        .order('created_at', { ascending: false });

      setPendingCupMatches(cupMatches || []);

    } catch (error) {
      console.error('Error loading pending results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (matchId: string, type: 'league' | 'cup') => {
    const table = type === 'league' ? 'fixtures' : 'cup_matches';
    
    const { error } = await supabase
      .from(table)
      .update({ status: 'approved' })
      .eq('id', matchId);

    if (error) {
      alert('Failed to approve');
      console.error(error);
    } else {
      alert('✅ Result approved!');
      loadPendingResults();
    }
  };

  const handleReject = async (matchId: string, type: 'league' | 'cup') => {
    const table = type === 'league' ? 'fixtures' : 'cup_matches';
    
    const { error } = await supabase
      .from(table)
      .update({ status: 'rejected' })
      .eq('id', matchId);

    if (error) {
      alert('Failed to reject');
      console.error(error);
    } else {
      alert('❌ Result rejected');
      loadPendingResults();
    }
  };

  const totalPending = pendingFixtures.length + pendingCupMatches.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-zinc-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">👑 Admin Dashboard</h1>
            <p className="text-zinc-400 mt-1">Manage and approve match results</p>
          </div>
          <Link
            href="/dashboard"
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Results</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
            <div className="text-sm text-gray-400">Approved</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
            <div className="text-sm text-gray-400">Rejected</div>
          </div>
        </div>

        {/* Pending Results */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">
              📋 Pending Approval ({totalPending})
            </h2>
            <button
              onClick={loadPendingResults}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition"
            >
              🔄 Refresh
            </button>
          </div>

          {totalPending === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🎉</div>
              <p className="text-xl text-gray-400">All caught up!</p>
              <p className="text-sm text-gray-500 mt-1">No pending results to approve.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* League Fixtures */}
              {pendingFixtures.map((match) => (
                <div key={match.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white font-medium">{match.home_team?.team_name || 'TBD'}</span>
                        <span className="text-gray-500 text-sm">vs</span>
                        <span className="text-white font-medium">{match.away_team?.team_name || 'TBD'}</span>
                        <span className="text-yellow-400 font-bold">
                          ({match.home_score} - {match.away_score})
                        </span>
                        <span className="text-xs text-gray-500 bg-zinc-700 px-2 py-0.5 rounded">
                          {match.leagues?.name || 'League'}
                        </span>
                      </div>
                      {match.screenshot_url && (
                        <a
                          href={match.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:underline inline-block mt-1"
                        >
                          📸 View Screenshot
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(match.id, 'league')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm transition"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleReject(match.id, 'league')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm transition"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Cup Matches */}
              {pendingCupMatches.map((match) => (
                <div key={match.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white font-medium">{match.home_team?.team_name || 'TBD'}</span>
                        <span className="text-gray-500 text-sm">vs</span>
                        <span className="text-white font-medium">{match.away_team?.team_name || 'TBD'}</span>
                        <span className="text-yellow-400 font-bold">
                          ({match.home_score} - {match.away_score})
                        </span>
                        <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded">
                          🏆 {match.round || 'Cup'}
                        </span>
                      </div>
                      {match.screenshot_url && (
                        <a
                          href={match.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:underline inline-block mt-1"
                        >
                          📸 View Screenshot
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(match.id, 'cup')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm transition"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleReject(match.id, 'cup')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm transition"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}