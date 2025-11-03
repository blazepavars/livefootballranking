import React, { useEffect, useState } from 'react'
import { Calendar, Clock, Trophy, Users, TrendingUp, RefreshCw } from 'lucide-react'
import { supabase, type UpcomingMatch } from '../lib/supabase'
import { getCountryFlag } from '../lib/countryFlags'

export function UpcomingMatchesPage() {
  const [matches, setMatches] = useState<UpcomingMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTournament, setSelectedTournament] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'importance' | 'expected'>('date')

  useEffect(() => {
    fetchUpcomingMatches()
    
    // Set up real-time subscription for live updates
    const subscription = supabase
      .channel('upcoming_matches_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'upcoming_matches' }, () => {
        fetchUpcomingMatches()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchUpcomingMatches = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('upcoming_matches')
        .select('*')
        .order('match_date', { ascending: true })

      if (error) {
        throw error
      }

      if (data) {
        // Filter out matches that have already occurred
        const now = new Date()
        const upcoming = data.filter(match => 
          new Date(match.match_date) > now
        )
        setMatches(upcoming)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch matches')
      console.error('Error fetching upcoming matches:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedMatches = React.useMemo(() => {
    let filtered = matches

    // Filter by tournament
    if (selectedTournament !== 'all') {
      filtered = filtered.filter(match => match.competition === selectedTournament)
    }

    // Sort matches
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
        case 'importance':
          return b.importance_multiplier - a.importance_multiplier
        case 'expected':
          return b.potential_home_win_points + b.potential_away_win_points - 
                 (a.potential_home_win_points + a.potential_away_win_points)
        default:
          return 0
      }
    })

    return filtered
  }, [matches, selectedTournament, sortBy])

  const uniqueTournaments = [...new Set(matches.map(match => match.competition))]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getImportanceColor = (multiplier: number) => {
    if (multiplier >= 40) return 'bg-red-500/20 text-red-400 border-red-500/30'
    if (multiplier >= 25) return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    if (multiplier >= 15) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }

  const getExpectedResultColor = (expected: number) => {
    if (expected >= 0.7) return 'text-green-400'
    if (expected >= 0.5) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-pure-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-accent-blue animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Loading upcoming matches...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-pure-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">Error Loading Matches</h2>
              <p className="text-text-secondary mb-4">{error}</p>
              <button
                onClick={() => fetchUpcomingMatches()}
                className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-pure-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Upcoming Matches
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Live international fixtures with FIFA ranking implications and expected outcome analysis.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-3">
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="px-4 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
            >
              <option value="all">All Tournaments</option>
              {uniqueTournaments.map(tournament => (
                <option key={tournament} value={tournament}>
                  {tournament}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'importance' | 'expected')}
              className="px-4 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
            >
              <option value="date">Sort by Date</option>
              <option value="importance">Sort by Importance</option>
              <option value="expected">Sort by Expected Impact</option>
            </select>
          </div>

          <button
            onClick={() => fetchUpcomingMatches()}
            className="flex items-center gap-2 px-4 py-2 bg-accent-blue/10 border border-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Matches List */}
        {filteredAndSortedMatches.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary">No upcoming matches found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAndSortedMatches.map((match) => (
              <div
                key={match.id}
                className="bg-bg-elevated border border-border-subtle rounded-2xl p-6 hover:border-border-moderate transition-colors"
              >
                {/* Match Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <Trophy className="w-5 h-5 text-accent-blue" />
                    <span className="text-text-secondary font-medium">{match.competition}</span>
                    {match.stage && (
                      <span className="text-xs text-text-tertiary bg-bg-near-black px-2 py-1 rounded">
                        {match.stage}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-text-tertiary text-sm">
                      {formatDate(match.match_date)}
                    </span>
                    <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getImportanceColor(match.importance_multiplier)}`}>
                      Tier {Math.ceil(match.importance_multiplier / 10)}
                    </div>
                  </div>
                </div>

                {/* Teams */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Home Team */}
                  <div className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                      <span className="text-3xl">{getCountryFlag(match.home_team_name)}</span>
                      <h3 className="text-lg font-semibold text-text-primary">
                        {match.home_team_name}
                      </h3>
                    </div>
                    <div className="space-y-1 text-sm text-text-secondary">
                      <p>Current Rank: #{match.home_points_before}</p>
                      <p className={`Expected: ${(match.home_expected_result * 100).toFixed(1)}%`}</p>
                      <div className="flex gap-2 text-xs">
                        <span className={`font-medium ${getExpectedResultColor(match.home_expected_result)}`}>
                          Win: +{match.potential_home_win_points?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-text-tertiary">•</span>
                        <span className="text-text-secondary">
                          Draw: +{match.potential_home_draw_points?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-text-tertiary">•</span>
                        <span className="text-text-secondary">
                          Loss: {match.potential_home_loss_points?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* VS */}
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-bg-near-black border border-border-subtle rounded-full flex items-center justify-center mb-2">
                        <span className="text-xl font-bold text-text-primary">VS</span>
                      </div>
                      <div className="text-xs text-text-tertiary">
                        {match.confederation || 'International'}
                      </div>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="text-center lg:text-right">
                    <div className="flex items-center justify-center lg:justify-end gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {match.away_team_name}
                      </h3>
                      <span className="text-3xl">{getCountryFlag(match.away_team_name)}</span>
                    </div>
                    <div className="space-y-1 text-sm text-text-secondary">
                      <p>Current Rank: #{match.away_points_before}</p>
                      <p className={`Expected: ${(match.away_expected_result * 100).toFixed(1)}%`}</p>
                      <div className="flex gap-2 text-xs justify-center lg:justify-end">
                        <span className={`font-medium ${getExpectedResultColor(match.away_expected_result)}`}>
                          Win: +{match.potential_away_win_points?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-text-tertiary">•</span>
                        <span className="text-text-secondary">
                          Draw: +{match.potential_away_draw_points?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-text-tertiary">•</span>
                        <span className="text-text-secondary">
                          Loss: {match.potential_away_loss_points?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Impact Summary */}
                <div className="mt-6 pt-4 border-t border-border-subtle">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <TrendingUp className="w-4 h-4" />
                      <span>Ranking Impact Potential</span>
                    </div>
                    <div className="text-text-primary font-medium">
                      {((match.potential_home_win_points + match.potential_away_win_points) / 2).toFixed(1)} avg points
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-12 text-center">
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">About Match Predictions</h3>
            <p className="text-text-secondary text-sm max-w-3xl mx-auto">
              Expected results are calculated using FIFA's official ranking difference methodology. 
              Points changes consider match importance, opponent strength, and confederation multipliers. 
              Data updates in real-time as matches are confirmed and results processed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpcomingMatchesPage