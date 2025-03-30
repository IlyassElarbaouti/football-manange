// app/(dashboard)/dashboard/profile/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId, getUpcomingMatches } from '@/lib/sanity/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ProfileStats from '@/components/profiles/ProfileStats';
import ProfileEditForm from '@/components/profiles/ProfileEditForm';
import { Edit, Calendar, Trophy, Clock, MapPin } from 'lucide-react';

export default async function ProfilePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Get the user's Sanity profile
  const user = await getUserByClerkId(userId);
  
  if (!user) {
    redirect('/dashboard'); // Redirect if user not found
  }
  
  // Get user's upcoming matches
  const upcomingMatches = await getUpcomingMatches();
  
  // Filter matches where user is a participant
  const userMatches = upcomingMatches.filter(match => {
    // Check if user created the match
    if (match.createdBy?._id === user._id) return true;
    
    // Check if user is a player
    return match.players?.some(player => 
      player.user._id === user._id || player.user._ref === user._id
    );
  });

  // Calculate statistics
  const stats = {
    matchesPlayed: user.matchesPlayed || 0,
    matchesPaid: user.matchesPaid || 0,
    totalPayments: user.totalPayments || 0,
    winRate: user.matchesPlayed ? Math.round((user.matchesPlayed * 0.6) * 100) / 100 : 0, // Example calculation
    skillLevel: user.skillLevel || 75,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center">
            <span className="mr-3 rounded-md bg-gradient-to-br from-amber-500 to-yellow-500 px-2 py-1 text-xs font-bold text-black shadow-md shadow-amber-500/20">
              FUT 25
            </span>
            <h1 className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              My Profile
            </h1>
          </div>
          <p className="text-amber-400">
            Manage your player profile and view your stats
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="col-span-1 overflow-hidden border-amber-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md md:col-span-1">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-24 relative">
            <div className="absolute -bottom-12 left-4">
              <Avatar className="h-24 w-24 border-4 border-black shadow-xl">
                {user.profileImage ? (
                  <AvatarImage src={user.profileImage} alt={user.name} />
                ) : (
                  <AvatarFallback className="text-2xl bg-amber-800 text-amber-200">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          </div>
          
          <CardContent className="mt-14 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-amber-400 text-sm">
                  {user.preferredPosition === 'any' 
                    ? 'Any Position' 
                    : user.preferredPosition?.charAt(0).toUpperCase() + user.preferredPosition?.slice(1)}
                </p>
              </div>
              <Badge className="bg-amber-500/20 border-amber-500/30 text-amber-300">
                Level {Math.floor(stats.skillLevel/10)}
              </Badge>
            </div>
            
            <Separator className="my-4 bg-amber-500/20" />
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-gray-800/50 p-2">
                  <div className="text-xl font-bold text-white">{stats.matchesPlayed}</div>
                  <div className="text-xs text-amber-400">Matches</div>
                </div>
                <div className="rounded-md bg-gray-800/50 p-2">
                  <div className="text-xl font-bold text-white">{stats.matchesPaid}</div>
                  <div className="text-xs text-amber-400">Paid</div>
                </div>
                <div className="rounded-md bg-gray-800/50 p-2">
                  <div className="text-xl font-bold text-white">{stats.winRate}%</div>
                  <div className="text-xs text-amber-400">Win Rate</div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-white/70 mb-1">
                  <span>Skill Level</span>
                  <span>{stats.skillLevel}/100</span>
                </div>
                <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500" 
                    style={{ width: `${stats.skillLevel}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-2">
                <Link href="/dashboard/profile/edit">
                  <Button 
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Card */}
        <Card className="col-span-1 overflow-hidden border-amber-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md md:col-span-2">
          <div className="bg-gradient-to-r from-amber-950 to-gray-900 px-4 py-3">
            <CardTitle className="text-lg font-bold text-amber-400">Player Statistics</CardTitle>
          </div>
          <CardContent className="p-6">
            <ProfileStats userId={user._id} />
          </CardContent>
        </Card>
        
        {/* Upcoming Matches */}
        <Card className="col-span-1 overflow-hidden border-amber-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md md:col-span-3">
          <div className="bg-gradient-to-r from-amber-950 to-gray-900 px-4 py-3 flex justify-between items-center">
            <CardTitle className="text-lg font-bold text-amber-400">My Upcoming Matches</CardTitle>
            <Link href="/dashboard/matches">
              <Button variant="outline" className="border-amber-500/20 bg-gray-800/30 text-white hover:bg-gray-800/50 hover:text-amber-400">
                View All
              </Button>
            </Link>
          </div>
          <CardContent className="p-6">
            {userMatches && userMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userMatches.slice(0, 3).map(match => (
                  <Link 
                    key={match._id} 
                    href={`/dashboard/matches/${match._id}`}
                    className="block hover:scale-[1.01] transition-transform"
                  >
                    <div className="rounded-lg border border-amber-500/20 bg-black/50 p-4 hover:bg-black/70 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-white font-bold">{match.title}</h3>
                        <Badge 
                          className={
                            match.status === 'scheduled' ? 'bg-blue-500 text-white' : 
                            match.status === 'in-progress' ? 'bg-green-500 text-white' :
                            'bg-gray-500 text-white'
                          }
                        >
                          {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-white/70">
                          <Calendar className="h-4 w-4 mr-2 text-amber-400" />
                          {new Date(match.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-white/70">
                          <Clock className="h-4 w-4 mr-2 text-amber-400" />
                          {new Date(match.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        {match.venue && typeof match.venue === 'object' && 'name' in match.venue && (
                          <div className="flex items-center text-white/70">
                            <MapPin className="h-4 w-4 mr-2 text-amber-400" />
                            {match.venue.name}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 flex items-center">
                        <div>
                          <div className="text-xs text-white/60 mb-1">Players</div>
                          <div className="flex items-center">
                            <div className="h-2 w-24 bg-gray-800/50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-500" 
                                style={{ width: `${(match.filledSlots / match.totalSlots) * 100}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-white">
                              {match.filledSlots}/{match.totalSlots}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Trophy className="h-12 w-12 mx-auto text-amber-500/30 mb-4" />
                <p className="text-white mb-2">No upcoming matches found</p>
                <p className="text-white/60 mb-4">Join matches from the matches page or create your own</p>
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 font-bold text-black shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-yellow-600"
                >
                  <Link href="/dashboard/matches/create">Create a Match</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}