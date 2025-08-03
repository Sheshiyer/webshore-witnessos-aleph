/**
 * Usage Chart Component - WitnessOS Developer Dashboard
 * 
 * Analytics visualization for API usage with cyberpunk theming
 * and consciousness-aligned data presentation.
 */

'use client';

import React, { useState, useMemo } from 'react';
import type { UsageChartProps } from '@/types/api-keys';

export function UsageChart({ data, timeRange, onTimeRangeChange }: UsageChartProps) {
  const [activeMetric, setActiveMetric] = useState<'calls' | 'errors' | 'responseTime'>('calls');

  // Process data for visualization
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const maxCalls = Math.max(...data.map(d => d.calls));
    const maxErrors = Math.max(...data.map(d => d.errors));
    const maxResponseTime = Math.max(...data.map(d => d.avgResponseTime));

    return data.map(point => ({
      ...point,
      normalizedCalls: maxCalls > 0 ? (point.calls / maxCalls) * 100 : 0,
      normalizedErrors: maxErrors > 0 ? (point.errors / maxErrors) * 100 : 0,
      normalizedResponseTime: maxResponseTime > 0 ? (point.avgResponseTime / maxResponseTime) * 100 : 0,
      formattedTime: formatTimeLabel(point.timestamp, timeRange)
    }));
  }, [data, timeRange]);

  const formatTimeLabel = (timestamp: string, range: string) => {
    const date = new Date(timestamp);
    
    switch (range) {
      case '24h':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      case '7d':
        return date.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
      case '30d':
      case '90d':
        return date.toLocaleDateString('en-US', { 
          month: 'short',
          day: 'numeric'
        });
      default:
        return date.toLocaleDateString();
    }
  };

  const getMetricValue = (point: any) => {
    switch (activeMetric) {
      case 'calls':
        return point.calls;
      case 'errors':
        return point.errors;
      case 'responseTime':
        return point.avgResponseTime;
      default:
        return 0;
    }
  };

  const getNormalizedValue = (point: any) => {
    switch (activeMetric) {
      case 'calls':
        return point.normalizedCalls;
      case 'errors':
        return point.normalizedErrors;
      case 'responseTime':
        return point.normalizedResponseTime;
      default:
        return 0;
    }
  };

  const getMetricColor = () => {
    switch (activeMetric) {
      case 'calls':
        return 'cyan';
      case 'errors':
        return 'red';
      case 'responseTime':
        return 'purple';
      default:
        return 'cyan';
    }
  };

  const getMetricUnit = () => {
    switch (activeMetric) {
      case 'calls':
        return 'calls';
      case 'errors':
        return 'errors';
      case 'responseTime':
        return 'ms';
      default:
        return '';
    }
  };

  const totalCalls = data.reduce((sum, point) => sum + point.calls, 0);
  const totalErrors = data.reduce((sum, point) => sum + point.errors, 0);
  const avgResponseTime = data.length > 0 
    ? Math.round(data.reduce((sum, point) => sum + point.avgResponseTime, 0) / data.length)
    : 0;
  const errorRate = totalCalls > 0 ? ((totalErrors / totalCalls) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-cyan-300 font-mono mb-2">
              📈 API Usage Analytics
            </h3>
            <p className="text-gray-400 font-mono text-sm">
              Monitor your consciousness engine API consumption patterns
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
            {[
              { id: '24h', label: '24H' },
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' }
            ].map(range => (
              <button
                key={range.id}
                onClick={() => onTimeRangeChange(range.id as any)}
                className={`px-3 py-1 font-mono text-xs rounded transition-all ${
                  timeRange === range.id
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-400 hover:text-cyan-300'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 font-mono mb-1">TOTAL CALLS</div>
            <div className="text-2xl font-bold text-cyan-300 font-mono">
              {totalCalls.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 font-mono mb-1">ERROR RATE</div>
            <div className="text-2xl font-bold text-red-400 font-mono">
              {errorRate}%
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 font-mono mb-1">AVG RESPONSE</div>
            <div className="text-2xl font-bold text-purple-400 font-mono">
              {avgResponseTime}ms
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 font-mono mb-1">DATA POINTS</div>
            <div className="text-2xl font-bold text-yellow-400 font-mono">
              {data.length}
            </div>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-6">
          {[
            { id: 'calls', label: '📊 API Calls', color: 'cyan' },
            { id: 'errors', label: '❌ Errors', color: 'red' },
            { id: 'responseTime', label: '⏱️ Response Time', color: 'purple' }
          ].map(metric => (
            <button
              key={metric.id}
              onClick={() => setActiveMetric(metric.id as any)}
              className={`px-4 py-2 font-mono text-sm rounded transition-all ${
                activeMetric === metric.id
                  ? `bg-${metric.color}-600/20 border border-${metric.color}-500/50 text-${metric.color}-300`
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>

        {/* Chart Area */}
        <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700/30">
          {chartData.length > 0 ? (
            <div className="space-y-4">
              {/* Chart Visualization */}
              <div className="relative h-64 flex items-end space-x-1 overflow-x-auto">
                {chartData.map((point, index) => {
                  const height = getNormalizedValue(point);
                  const value = getMetricValue(point);
                  const color = getMetricColor();
                  
                  return (
                    <div
                      key={index}
                      className="flex-shrink-0 relative group"
                      style={{ minWidth: '20px' }}
                    >
                      {/* Bar */}
                      <div
                        className={`w-full bg-gradient-to-t from-${color}-600 to-${color}-400 rounded-t transition-all duration-200 hover:opacity-80`}
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="bg-black border border-cyan-500/50 rounded px-2 py-1 text-xs font-mono whitespace-nowrap">
                          <div className="text-cyan-300">{point.formattedTime}</div>
                          <div className="text-white">
                            {value.toLocaleString()} {getMetricUnit()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-axis Labels */}
              <div className="flex justify-between text-xs text-gray-500 font-mono">
                <span>{chartData[0]?.formattedTime}</span>
                {chartData.length > 2 && (
                  <span>{chartData[Math.floor(chartData.length / 2)]?.formattedTime}</span>
                )}
                <span>{chartData[chartData.length - 1]?.formattedTime}</span>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 font-mono">
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <div className="text-lg mb-2">No Data Available</div>
                <div className="text-sm">Start making API calls to see analytics</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Breakdown */}
      {data.length > 0 && (
        <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
          <h4 className="text-lg font-bold text-cyan-300 font-mono mb-4">
            📋 Detailed Breakdown
          </h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-gray-400">Time</th>
                  <th className="text-right py-2 text-cyan-400">Calls</th>
                  <th className="text-right py-2 text-red-400">Errors</th>
                  <th className="text-right py-2 text-purple-400">Avg Response</th>
                  <th className="text-right py-2 text-green-400">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {chartData.slice(-10).reverse().map((point, index) => {
                  const successRate = point.calls > 0 
                    ? (((point.calls - point.errors) / point.calls) * 100).toFixed(1)
                    : '100.0';
                  
                  return (
                    <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-2 text-gray-300">{point.formattedTime}</td>
                      <td className="py-2 text-right text-cyan-300">{point.calls.toLocaleString()}</td>
                      <td className="py-2 text-right text-red-300">{point.errors.toLocaleString()}</td>
                      <td className="py-2 text-right text-purple-300">{point.avgResponseTime}ms</td>
                      <td className="py-2 text-right text-green-300">{successRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
