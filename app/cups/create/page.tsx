'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CreateCupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [cupMode, setCupMode] = useState('standalone');
  const [selectedLeague, setSelectedLeague] = useState('');
  const [season, setSeason] = useState('');
  const [teamsQualified, setTeamsQualified] = useState(8);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leagues, setLeagues] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        router.push('/login');
        return;
      }

      // Load communities
      const { data: communitiesData } = await supabase
        .from('communities')
        .select('id, name')
        .eq('owner_id', user.user.id);
      setCommunities(communitiesData || []);

      // Load leagues
      const { data: leaguesData } = await supabase
        .from('leagues')
        .select('id, name, season')
        .eq('created_by', user.user.id)
        .order('created_at', { ascending: false });
      setLeagues(leaguesData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not logged in');

      // Build cup data
      const cupData: any = {
        name: name,
        community_id: selectedCommunity || null,
        created_by: user.user.id,
        cup_mode: cupMode,
        is_active: isActive,
        teams_qualified: teamsQualified,
        status: 'draft',
        teams_count: 0,
      };

      // Add season/league fields if season cup
      if (cupMode === 'season') {
        if (!selectedLeague) throw new Error('Please select a league');
        cupData.league_id = selectedLeague;
        const league = leagues.find(l => l.id === selectedLeague);
        cupData.season = league?.season || '2026';
      } else {
        // Standalone cup
        if (!season) throw new Error('Please enter a season');
        cupData.season = season;
      }

      const { data, error } = await supabase
        .from('cups')
        .insert(cupData)
        .select()
        .single();

      if (error) throw error;

      router.push(`/cups/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create cup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold text-white mb-6">Create New Cup</h1>

      <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Cup Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-blue-500 focus:outline-none"
            placeholder="e.g., FA Cup 2026"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Community (optional)
          </label>
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">No community</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Cup Mode *
          </label>
          <select
            value={cupMode}
            onChange={(e) => setCupMode(e.target.value)}
            className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="standalone">Standalone Cup (independent)</option>
            <option value="season">Season Cup (linked to league)</option>
          </select>
        </div>

        {cupMode === 'season' ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Select League *
            </label>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="">Select a league...</option>
              {leagues.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.season || 'No season'})
                </option>
              ))}
            </select>
            {leagues.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">Create a league first!</p>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Season *
            </label>
            <input
              type="text"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-blue-500 focus:outline-none"
              placeholder="e.g., 2026"
              required
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Teams Qualify
          </label>
          <select
            value={teamsQualified}
            onChange={(e) => setTeamsQualified(Number(e.target.value))}
            className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="4">4 Teams (Semi-finals + Final)</option>
            <option value="8">8 Teams (Quarter-finals + Semi-finals + Final)</option>
            <option value="16">16 Teams (Round of 16 + ...)</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            Active (enable this cup)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 text-white font-semibold py-2 rounded transition"
        >
          {loading ? 'Creating...' : 'Create Cup'}
        </button>
      </form>
    </div>
  );
}