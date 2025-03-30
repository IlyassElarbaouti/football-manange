// app/(dashboard)/dashboard/leaderboard/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId } from '@/lib/sanity/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Users, Award, Star } from 'lucide-react';

// This would be fetched from an API in a real implementation
const leaderboardData = [
  { id: '1', name: 'Alexander Smith', position: 'forward', matchesPlayed: 25, wins: 18, winRate: 72, rating: 92, achievements: 5 },
  { id: '2', name: 'Michael Johnson', position: 'midfielder', matchesPlayed: 23, wins: 15, winRate: 65, rating: 88, achievements: 4 },
  { id: '3', name: 'David Wilson', position: 'defender', matchesPlayed: 19, wins: 12, winRate: 63, rating: 85, achievements: 3 },
  { id: '4', name: 'James Brown', position: 'midfielder', matchesPlayed: 21, wins: 13, winRate: 62, rating: 83, achievements: 3 },
  { id: '5', name: 'Robert Davis', position: 'forward', matchesPlayed: 18, wins: 11, winRate: 61, rating: 81, achievements: 2 },
  { id: '6', name: 'Thomas Miller', position: 'goalkeeper', matchesPlayed: 16, wins: 9, winRate: 56, rating: 79, achievements: 2 },
  { id: '7', name: 'Daniel Taylor', position: 'defender', matchesPlayed: 14, wins: 7, winRate: 50, rating: 78, achievements: 1 },
  { id: '8', name: 'Matthew Jones', position: 'midfielder', matchesPlayed: 12, wins: 6, winRate: 50, rating: 77, achievements: 1 },
  { id: '9', name: 'Christopher Davis', position: 'forward', matchesPlayed: 10, wins: 4, winRate: 40, rating: 75, achievements: 0 },
  { id: '10', name: 'Andrew Wilson', position: 'defender', matchesPlayed: 8, wins: 3, winRate: 38, rating: 72, achievements: 0 }
];

export default async function LeaderboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Get the user's Sanity profile
  const user = await getUserByClerkId(userId);
  
  if (!user) {
    redirect('/dashboard');
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center">
            <span className="mr-3 rounded-md bg-gradient-to-br from-amber-500 to-yellow-500 px-2 py-1 text-xs font-bold text-black shadow-md shadow-amber-500/20">
              FUT 25
            </span>
            <h1 className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Leaderboard
            </h1>
          </div>
          <p className="text-amber-400">
            Top players ranked by performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top 3 players podium */}
        <div className="md:col-span-3 grid grid-cols-3 gap-4">
          {/* 2nd place */}
          <div className="col-start-1 mt-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-gray-400 shadow-lg">
                  <AvatarFallback className="bg-gray-600 text-3xl text-gray-300">
                    {leaderboardData[1].name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-3 -right-3 bg-gray-400 rounded-full h-10 w-10 flex items-center justify-center text-xl font-bold text-black shadow-md">
                  2
                </div>
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">{leaderboardData[1].name}</h3>
              <p className="text-gray-400">{leaderboardData[1].rating} OVR</p>
              <div className="h-32 w-full bg-gray-700/50 mt-2 rounded-t-lg flex items-end justify-center">
                <div className="w-3/4 h-24 bg-gradient-to-t from-gray-600 to-gray-400 rounded-t-lg"></div>
              </div>
            </div>
          </div>
          
          {/* 1st place */}
          <div className="col-start-2">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-yellow-500 shadow-xl">
                  <AvatarFallback className="bg-amber-700 text-4xl text-yellow-300">
                    {leaderboardData[0].name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-3 -right-3 bg-yellow-500 rounded-full h-12 w-12 flex items-center justify-center text-2xl font-bold text-black shadow-md">
                  1
                </div>
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">{leaderboardData[0].name}</h3>
              <p className="text-amber-400">{leaderboardData[0].rating} OVR</p>
              <div className="h-40 w-full bg-amber-900/50 mt-2 rounded-t-lg flex items-end justify-center">
                <div className="w-3/4 h-32 bg-gradient-to-t from-amber-700 to-yellow-500 rounded-t-lg"></div>
              </div>
            </div>
          </div>
          
          {/* 3rd place */}
          <div className="col-start-3 mt-16">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-amber-800 shadow-lg">
                  <AvatarFallback className="bg-amber-900 text-2xl text-amber-300">
                    {leaderboardData[2].name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-3 -right-3 bg-amber-800 rounded-full h-8 w-8 flex items-center justify-center text-lg font-bold text-black shadow-md">
                  3
                </div>
              </div>
              <h3 className="mt-4 text-base font-bold text-white">{leaderboardData[2].name}</h3>
              <p className="text-amber-600">{leaderboardData[2].rating} OVR</p>
              <div className="h-24 w-full bg-amber-900/50 mt-2 rounded-t-lg flex items-end justify-center">
                <div className="w-3/4 h-16 bg-gradient-to-t from-amber-900 to-amber-700 rounded-t-lg"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Leaderboard table */}
        <Card className="md:col-span-3 overflow-hidden border-amber-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md shadow-xl">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-yellow-500 py-3">
            <CardTitle className="text-lg font-bold text-black">Player Rankings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-amber-500/20 bg-black/50">
                    <th className="py-2 px-4 text-left text-amber-400">Rank</th>
                    <th className="py-2 px-4 text-left text-amber-400">Player</th>
                    <th className="py-2 px-4 text-center text-amber-400">Rating</th>
                    <th className="py-2 px-4 text-center text-amber-400 hidden md:table-cell">Matches</th>
                    <th className="py-2 px-4 text-center text-amber-400 hidden md:table-cell">Win %</th>
                    <th className="py-2 px-4 text-center text-amber-400">Achievements</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((player, index) => {
                    // Determine if this is the current user (for demo, just use a random player)
                    const isCurrentUser = index === Math.floor(Math.random() * 10);
                    
                    return (
                      <tr 
                        key={player.id} 
                        className={`
                          border-b border-amber-500/10 
                          ${isCurrentUser ? 'bg-amber-500/20' : index % 2 === 0 ? 'bg-gray-900/30' : 'bg-black/30'}
                          hover:bg-gray-800/50 transition-colors
                        `}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className={`
                              inline-block w-6 h-6 rounded-full text-center text-sm font-bold leading-6
                              ${index === 0 ? 'bg-yellow-500 text-black' : 
                                index === 1 ? 'bg-gray-400 text-black' : 
                                index === 2 ? 'bg-amber-800 text-white' : 
                                'bg-gray-800 text-white'}
                            `}>
                              {index + 1}
                            </span>
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-amber-400">(You)</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback className={`
                                text-sm
                                ${index < 3 ? 'bg-amber-800 text-amber-200' : 'bg-gray-800 text-gray-200'}
                              `}>
                                {player.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-white">{player.name}</div>
                              <div className="text-xs text-white/60 capitalize">{player.position}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-none">
                            {player.rating} OVR
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center text-white hidden md:table-cell">
                          {player.matchesPlayed}
                        </td>
                        <td className="py-3 px-4 text-center hidden md:table-cell">
                          <span className={`
                            font-bold
                            ${player.winRate >= 70 ? 'text-green-400' : 
                              player.winRate >= 50 ? 'text-amber-400' : 
                              'text-red-400'}
                          `}>
                            {player.winRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center">
                            {player.achievements > 0 ? (
                              <>
                                <Award className="h-4 w-4 text-amber-400" />
                                <span className="ml-1 text-white">{player.achievements}</span>
                              </>
                            ) : (
                              <span className="text-white/50">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats cards */}
        <Card className="overflow-hidden border-amber-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md shadow-xl">
          <CardHeader className="bg-gradient-to-r from-amber-950 to-gray-900 py-3">
            <CardTitle className="text-lg font-bold text-amber-400 flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Top Scorer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Avatar className="h-14 w-14 mr-3 border-2 border-amber-500">
                <AvatarFallback className="bg-amber-800 text-xl text-amber-200">
                  {leaderboardData[0].name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-white">{leaderboardData[0].name}</h3>
                <p className="text-amber-400 text-sm">28 goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-amber-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md shadow-xl">
          <CardHeader className="bg-gradient-to-r from-amber-950 to-gray-900 py-3">
            <CardTitle className="text-lg font-bold text-amber-400 flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Most Assists
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Avatar className="h-14 w-14 mr-3 border-2 border-amber-500">
                <AvatarFallback className="bg-amber-800 text-xl text-amber-200">
                  {leaderboardData[1].name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-white">{leaderboardData[1].name}</h3>
                <p className="text-amber-400 text-sm">22 assists</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-amber-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md shadow-xl">
          <CardHeader className="bg-gradient-to-r from-amber-950 to-gray-900 py-3">
            <CardTitle className="text-lg font-bold text-amber-400 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Most Matches
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Avatar className="h-14 w-14 mr-3 border-2 border-amber-500">
                <AvatarFallback className="bg-amber-800 text-xl text-amber-200">
                  {leaderboardData[0].name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-white">{leaderboardData[0].name}</h3>
                <p className="text-amber-400 text-sm">{leaderboardData[0].matchesPlayed} matches</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}