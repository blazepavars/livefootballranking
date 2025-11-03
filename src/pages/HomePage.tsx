import React, { useState, useEffect } from 'react'
import { Search, TrendingUp, TrendingDown, Minus, History, RefreshCw } from 'lucide-react'
import { supabase, HistoricalFIFARanking } from '../lib/supabase'
import { getCountryFlag } from '../lib/countryFlags'

interface RankingItem {
  historicalRank: number
  team: string
  currentRank: number
  rankChange: number
}

const HomePage: React.FC = () => {
  const [rankings, setRankings] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'currentRank' | 'points' | 'change'>('currentRank')
  const [isHistoricalOpen, setIsHistoricalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('2023-12-31')
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [historicalData, setHistoricalData] = useState<RankingItem[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Fetch available historical dates
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const { data, error } = await supabase.rpc('get_distinct_historical_dates')
        if (error) throw error
        if (data) {
          setAvailableDates(data.map((item: any) => item.rank_date).sort())
          if (data.length > 0) {
            setSelectedDate(data[data.length - 1].rank_date) // Most recent date
          }
        }
      } catch (err) {
        console.error('Error fetching dates:', err)
      }
    }

    fetchAvailableDates()
  }, [])

  // Fetch current FIFA rankings
  useEffect(() => {
    const fetchCurrentRankings = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('fifa_rankings_current')
          .select(`
            rank,
            country_name,
            total_points,
            previous_rank,
            confederation_code
          `)
          .order('rank', { ascending: true })
          .limit(50) // Limit to top 50 for performance

        if (error) throw error

        if (data) {
          const formattedRankings: RankingItem[] = data.map(item => ({
            historicalRank: item.rank,
            team: item.country_name,
            currentRank: item.rank,
            rankChange: item.previous_rank 
              ? item.previous_rank - item.rank 
              : 0
          }))
          setRankings(formattedRankings)
          setLastUpdated(new Date().toLocaleString())
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rankings')
        console.error('Error fetching rankings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentRankings()
  }, [])

  // Fetch historical data when date changes
  useEffect(() => {
    if (selectedDate && isHistoricalOpen) {
      const fetchHistoricalData = async () => {
        try {
          const { data, error } = await supabase
            .from('historical_fifa_rankings')
            .select(`
              rank_position,
              country_full,
              total_points,
              previous_points,
              rank_change
            `)
            .eq('rank_date', selectedDate)
            .order('rank_position', { ascending: true })
            .limit(50)

          if (error) throw error

          if (data) {
            const formattedHistorical: RankingItem[] = data.map(item => ({
              historicalRank: item.rank_position,
              team: item.country_full,
              currentRank: item.rank_position,
              rankChange: item.rank_change || 0
            }))
            setHistoricalData(formattedHistorical)
          }
        } catch (err) {
          console.error('Error fetching historical data:', err)
        }
      }

      fetchHistoricalData()
    }
  }, [selectedDate, isHistoricalOpen])

  // Filter and sort rankings
  const filteredAndSortedRankings = React.useMemo(() => {
    let filtered = rankings.filter(item =>
      item.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.currentRank.toString().includes(searchTerm)
    )

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'points':
          // Note: We'd need to add points to the interface if available
          return b.currentRank - a.currentRank // Fallback to rank
        case 'change':
          return Math.abs(b.rankChange) - Math.abs(a.rankChange)
        case 'currentRank':
        default:
          return a.currentRank - b.currentRank
      }
    })

    return filtered
  }, [rankings, searchTerm, sortBy])

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-accent-green" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-accent-red" />
    return <Minus className="w-4 h-4 text-text-tertiary" />
  }

  const getRankChangeClass = (change: number) => {
    if (change > 0) return 'text-accent-green'
    if (change < 0) return 'text-accent-red'
    return 'text-text-tertiary'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-pure-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-accent-blue animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Loading FIFA rankings...</p>
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
                <TrendingDown className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">Error Loading Rankings</h2>
              <p className="text-text-secondary mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
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
            FIFA World Rankings
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Real-time FIFA rankings for {rankings.length}+ countries with historical data analysis and live updates.
          </p>
          {lastUpdated && (
            <p className="text-text-tertiary text-sm mt-2">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
            />
          </div>

          {/* Sort and Historical Controls */}
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'currentRank' | 'points' | 'change')}
              className="px-4 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
            >
              <option value="currentRank">Sort by Rank</option>
              <option value="change">Sort by Change</option>
            </select>

            <button
              onClick={() => setIsHistoricalOpen(!isHistoricalOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-accent-orange/10 border border-accent-orange/20 text-accent-orange rounded-lg hover:bg-accent-orange/20 transition-colors"
            >
              <History className="w-4 h-4" />
              Historical Data
            </button>
          </div>
        </div>

        {/* Historical Rankings Modal */}
        {isHistoricalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-bg-elevated border border-border-subtle rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-text-primary">Historical Rankings</h3>
                <button
                  onClick={() => setIsHistoricalOpen(false)}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>

              {/* Date Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Select Date:
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-near-black border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-blue"
                >
                  {availableDates.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Historical Rankings Table */}
              <div className="overflow-auto max-h-96">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="text-left py-3 px-4 text-text-secondary font-semibold uppercase text-xs">Rank</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-semibold uppercase text-xs">Country</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-semibold uppercase text-xs">Current Rank</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-semibold uppercase text-xs">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.map((item, index) => (
                      <tr key={index} className="border-b border-border-subtle/50 hover:bg-bg-elevated-hover">
                        <td className="py-3 px-4">
                          <span className="font-mono text-lg font-semibold text-text-primary">
                            {item.historicalRank}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getCountryFlag(item.team)}</span>
                            <span className="font-medium text-text-primary">{item.team}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-text-secondary">
                            {item.currentRank}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getRankChangeIcon(item.rankChange)}
                            <span className={`font-medium ${getRankChangeClass(item.rankChange)}`}>
                              {Math.abs(item.rankChange) > 0 ? `${item.rankChange > 0 ? '+' : ''}${item.rankChange}` : '—'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Rankings Table */}
        <div className="bg-bg-elevated border border-border-subtle rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border-subtle">
            <h2 className="text-xl font-semibold text-text-primary">
              Current FIFA World Rankings
              <span className="ml-2 text-text-tertiary font-normal">
                ({filteredAndSortedRankings.length} teams)
              </span>
            </h2>
          </div>

          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-near-black">
                  <th className="text-left py-4 px-6 text-text-secondary font-semibold uppercase text-xs">Rank</th>
                  <th className="text-left py-4 px-6 text-text-secondary font-semibold uppercase text-xs">Country</th>
                  <th className="text-left py-4 px-6 text-text-secondary font-semibold uppercase text-xs">Points</th>
                  <th className="text-left py-4 px-6 text-text-secondary font-semibold uppercase text-xs">Change</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedRankings.map((item, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-border-subtle/50 hover:bg-bg-elevated-hover transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span className="font-mono text-lg font-semibold text-text-primary">
                        #{item.currentRank}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCountryFlag(item.team)}</span>
                        <span className="font-medium text-text-primary">{item.team}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-accent-blue">
                        {item.currentRank === 1 ? '0.00' : '—'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {getRankChangeIcon(item.rankChange)}
                        <span className={`font-medium ${getRankChangeClass(item.rankChange)}`}>
                          {Math.abs(item.rankChange) > 0 ? `${item.rankChange > 0 ? '+' : ''}${item.rankChange}` : '—'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedRankings.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">No teams found matching your search.</p>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-12 text-center">
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">About FIFA Rankings</h3>
            <p className="text-text-secondary text-sm max-w-3xl mx-auto">
              Rankings are calculated using the official FIFA SUM formula, considering match results, 
              opponent strength, tournament importance, and regional confederation multipliers. 
              Data updates daily at 6:00 AM UTC with live match integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage