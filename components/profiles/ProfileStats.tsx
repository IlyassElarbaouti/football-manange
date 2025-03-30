// components/profiles/ProfileStats.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ProfileStats = () => {
  const [loading, setLoading] = useState(true);
  
  // Mock stats for the demo - in a real implementation, these would come from an API
  const stats = {
    // Match stats
    totalMatches: 15,
    wins: 9,
    draws: 3,
    losses: 3,
    winRate: 60,
    
    // Performance
    goalsScored: 12,
    assists: 8,
    cleanSheets: 2,
    
    // Payment history
    totalPaid: 7500,
    matchesPaid: 10,
    avgCostPerMatch: 750,
    
    // Form (last 5 matches)
    recentForm: ['W', 'W', 'L', 'D', 'W'],
    
    // Position preference
    positionStats: {
      'goalkeeper': 1,
      'defender': 2,
      'midfielder': 8,
      'forward': 4
    },
    
    // Achievements
    achievements: [
      { name: 'Regular Player', description: 'Played 10+ matches', level: 'bronze' },
      { name: 'Goal Machine', description: 'Scored 10+ goals', level: 'bronze' },
      { name: 'Team Player', description: 'Made 5+ assists', level: 'silver' }
    ]
  };
  
  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Match statistics */}
      <div>
        <h3 className="text-white font-semibold mb-3">Match Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalMatches}</div>
            <div className="text-xs text-amber-400">Total Matches</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.wins}</div>
            <div className="text-xs text-amber-400">Wins</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.draws}</div>
            <div className="text-xs text-amber-400">Draws</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.losses}</div>
            <div className="text-xs text-amber-400">Losses</div>
          </div>
        </div>
      </div>
      
      {/* Form */}
      <div>
        <h3 className="text-white font-semibold mb-3">Recent Form</h3>
        <div className="flex space-x-2">
          {stats.recentForm.map((result, index) => (
            <div 
              key={index} 
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                ${result === 'W' ? 'bg-green-500 text-white' : 
                  result === 'L' ? 'bg-red-500 text-white' : 
                  'bg-amber-500 text-black'}
              `}
            >
              {result}
            </div>
          ))}
        </div>
      </div>
      
      {/* Performance stats */}
      <div>
        <h3 className="text-white font-semibold mb-3">Performance</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.goalsScored}</div>
            <div className="text-xs text-amber-400">Goals</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.assists}</div>
            <div className="text-xs text-amber-400">Assists</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.cleanSheets}</div>
            <div className="text-xs text-amber-400">Clean Sheets</div>
          </div>
        </div>
      </div>
      
      {/* Position Distribution */}
      <div>
        <h3 className="text-white font-semibold mb-3">Position Distribution</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            {Object.entries(stats.positionStats).map(([position, count]) => (
              <div key={position} className="flex flex-col items-center">
                <div className="text-xl font-bold text-white">{count}</div>
                <div className="text-xs text-amber-400 capitalize">{position.charAt(0).toUpperCase() + position.slice(1)}</div>
                <div className="mt-1 h-1 w-full bg-gray-700 rounded-full">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${(count / stats.totalMatches) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Achievements */}
      <div>
        <h3 className="text-white font-semibold mb-3">Achievements</h3>
        <div className="space-y-2">
          {stats.achievements.map((achievement, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-3 flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mr-3
                ${achievement.level === 'bronze' ? 'bg-amber-700' : 
                  achievement.level === 'silver' ? 'bg-gray-400' : 
                  'bg-yellow-500'}
              `}>
                <Trophy className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">{achievement.name}</div>
                <div className="text-xs text-white/70">{achievement.description}</div>
              </div>
              <Badge className={`
                ${achievement.level === 'bronze' ? 'bg-amber-700/50' : 
                  achievement.level === 'silver' ? 'bg-gray-400/50' : 
                  'bg-yellow-500/50'}
                text-xs
              `}>
                {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Missing Trophy component import
import { Trophy } from 'lucide-react';

export default ProfileStats;