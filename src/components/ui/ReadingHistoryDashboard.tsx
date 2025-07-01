/**
 * Reading History Dashboard Component
 * 
 * Comprehensive dashboard for managing and viewing reading history
 * with search, filtering, favorites, and statistics.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useReadingHistory, type Reading } from '@/hooks/useReadingHistory';

interface ReadingHistoryDashboardProps {
  userId: string;
  className?: string;
}

export function ReadingHistoryDashboard({ userId, className = '' }: ReadingHistoryDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);

  const {
    readings,
    loading,
    error,
    total,
    hasReadings,
    isEmpty,
    favoriteCount,
    saveReading,
    deleteReading,
    toggleFavorite,
    refreshReadings,
    searchReadings,
    getFavoriteReadings,
    getReadingsByEngine,
    getStatistics
  } = useReadingHistory({
    userId,
    limit: 50,
    timeRange: selectedTimeRange,
    autoRefresh: true,
    refreshInterval: 60000 // 1 minute
  });

  // Filter readings based on current filters
  const filteredReadings = useMemo(() => {
    let filtered = readings;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchReadings(searchQuery);
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(r => r.favorite);
    }

    // Apply engine filter
    if (selectedEngine) {
      filtered = filtered.filter(r => r.engines.includes(selectedEngine));
    }

    return filtered;
  }, [readings, searchQuery, showFavoritesOnly, selectedEngine, searchReadings]);

  const statistics = getStatistics();
  const availableEngines = Object.keys(statistics.byEngine);

  const handleDeleteReading = async (readingId: string) => {
    if (confirm('Are you sure you want to delete this reading?')) {
      await deleteReading(readingId);
    }
  };

  const handleToggleFavorite = async (readingId: string) => {
    await toggleFavorite(readingId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEngineColor = (engine: string) => {
    const colors = {
      numerology: 'bg-blue-100 text-blue-800',
      'human-design': 'bg-purple-100 text-purple-800',
      tarot: 'bg-yellow-100 text-yellow-800',
      iching: 'bg-green-100 text-green-800',
      enneagram: 'bg-red-100 text-red-800',
      'sacred-geometry': 'bg-indigo-100 text-indigo-800',
      biorhythm: 'bg-pink-100 text-pink-800',
      vimshottari: 'bg-orange-100 text-orange-800',
      'gene-keys': 'bg-teal-100 text-teal-800',
      'sigil-forge': 'bg-gray-100 text-gray-800'
    };
    return colors[engine as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`reading-history-dashboard ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Reading History</h2>
          <p className="text-gray-400 mt-1">
            {total} total readings • {favoriteCount} favorites • {statistics.recentActivity} this week
          </p>
        </div>
        <button
          onClick={refreshReadings}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400">Total Readings</h3>
          <p className="text-2xl font-bold text-white">{statistics.total}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400">Favorites</h3>
          <p className="text-2xl font-bold text-yellow-400">{statistics.favorites}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400">Recent Activity</h3>
          <p className="text-2xl font-bold text-green-400">{statistics.recentActivity}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400">Most Used Engine</h3>
          <p className="text-lg font-bold text-blue-400">
            {Object.entries(statistics.byEngine).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search readings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Time Range */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="365d">Last year</option>
          </select>

          {/* Engine Filter */}
          <select
            value={selectedEngine || ''}
            onChange={(e) => setSelectedEngine(e.target.value || null)}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Engines</option>
            {availableEngines.map(engine => (
              <option key={engine} value={engine}>
                {engine.charAt(0).toUpperCase() + engine.slice(1)}
              </option>
            ))}
          </select>

          {/* Favorites Toggle */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-4 py-2 rounded-lg font-medium ${
              showFavoritesOnly 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ⭐ Favorites Only
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-200">Error: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-gray-400 mt-2">Loading readings...</p>
        </div>
      )}

      {/* Empty State */}
      {isEmpty && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔮</div>
          <h3 className="text-xl font-semibold text-white mb-2">No readings yet</h3>
          <p className="text-gray-400">Start exploring consciousness to build your reading history!</p>
        </div>
      )}

      {/* Readings List */}
      {hasReadings && !loading && (
        <div className="space-y-4">
          {filteredReadings.map((reading) => (
            <div key={reading.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {reading.type} Reading
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {formatDate(reading.timestamp)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleFavorite(reading.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      reading.favorite 
                        ? 'text-yellow-400 hover:text-yellow-300'
                        : 'text-gray-500 hover:text-yellow-400'
                    }`}
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => handleDeleteReading(reading.id)}
                    className="p-2 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Engines Used */}
              <div className="flex flex-wrap gap-2 mb-4">
                {reading.engines.map((engine) => (
                  <span
                    key={engine}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getEngineColor(engine)}`}
                  >
                    {engine}
                  </span>
                ))}
              </div>

              {/* Results Preview */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Results Preview</h4>
                <div className="text-sm text-gray-400 max-h-20 overflow-hidden">
                  {typeof reading.results === 'object' 
                    ? JSON.stringify(reading.results, null, 2).slice(0, 200) + '...'
                    : String(reading.results).slice(0, 200) + '...'
                  }
                </div>
              </div>

              {/* Notes */}
              {reading.notes && (
                <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                  <h4 className="text-sm font-medium text-blue-300 mb-1">Notes</h4>
                  <p className="text-sm text-blue-200">{reading.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Results After Filtering */}
      {hasReadings && filteredReadings.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-white mb-2">No matching readings</h3>
          <p className="text-gray-400">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
} 