import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { getUserByClerkId, getUpcomingMatches } from "@/lib/sanity/utils";
import moment from "moment";

export default async function DashboardPage() {
  // Get the current user from Clerk
  const user = await currentUser();
  
  // Get the user's Sanity profile
  const sanityUser = user ? await getUserByClerkId(user.id) : null;
  
  // Get upcoming matches (limited to 3)
  const upcomingMatches = await getUpcomingMatches();
  
  // Mock data for now - in a full implementation, this would come from Sanity
  const playerStats = {
    rating: sanityUser?.skillLevel || 82,
    position: sanityUser?.preferredPosition ? sanityUser.preferredPosition.substring(0, 3).toUpperCase() : "MID",
    matchesPlayed: sanityUser?.matchesPlayed || 12,
    goalsScored: 5,
    assists: 7,
    wins: 8,
    form: ["W", "W", "D", "L", "W"],
  };
  
  // Calculate win ratio
  const winRatio = Math.round((playerStats.wins / playerStats.matchesPlayed) * 100) || 67;

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center">
            <span className="mr-3 rounded-md bg-gradient-to-br from-amber-500 to-yellow-500 px-2 py-1 text-xs font-bold text-black shadow-md shadow-amber-500/20">
              FUT 25
            </span>
            <h1 className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Home Stadium
            </h1>
          </div>
          <p className="text-amber-400">
            Welcome back, {sanityUser?.name || user?.firstName || "Player"}
          </p>
        </div>
        
        <Button 
          asChild 
          className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-md shadow-amber-500/20 transition-all duration-300 text-black font-bold"
        >
          <Link href="/dashboard/matches/create">
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white opacity-0 transition-all duration-300 group-hover:scale-90 group-hover:opacity-10"></span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Schedule Match
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Player Card - FIFA Style with Black and Gold */}
        <Card className="overflow-hidden rounded-xl border-amber-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md shadow-xl">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-lg font-bold text-black">
            Player Card
          </div>
          <CardContent className="p-0">
            <div className="relative">
              <div className="absolute -top-5 left-4 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 text-black shadow-lg">
                <span className="text-2xl font-bold">{playerStats.rating}</span>
                <span className="text-xs font-bold">{playerStats.position}</span>
              </div>
              
              <div className="mt-6 px-4 py-4">
                <div className="ml-20 mb-4">
                  <h3 className="text-xl font-bold text-white">{sanityUser?.name || user?.firstName || "Player"}</h3>
                  <div className="flex space-x-1">
                    {playerStats.form.map((result, i) => (
                      <span 
                        key={i} 
                        className={`h-5 w-5 rounded-full text-center text-xs font-bold leading-5 ${
                          result === 'W' ? 'bg-green-500 text-white' : 
                          result === 'L' ? 'bg-red-500 text-white' : 
                          'bg-amber-500 text-black'
                        }`}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-gray-800/50 p-2">
                    <div className="text-xl font-bold text-white">{playerStats.matchesPlayed}</div>
                    <div className="text-xs text-amber-400">Matches</div>
                  </div>
                  <div className="rounded-md bg-gray-800/50 p-2">
                    <div className="text-xl font-bold text-white">{playerStats.goalsScored}</div>
                    <div className="text-xs text-amber-400">Goals</div>
                  </div>
                  <div className="rounded-md bg-gray-800/50 p-2">
                    <div className="text-xl font-bold text-white">{playerStats.assists}</div>
                    <div className="text-xs text-amber-400">Assists</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-white/80">Win Ratio</span>
                    <span className="text-white">{winRatio}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-800/50">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-500" 
                      style={{ width: `${winRatio}%` }}
                    ></div>
                  </div>
                </div>
                
                <Button
                  asChild
                  variant="outline"
                  className="mt-4 w-full border-amber-500/20 bg-gray-800/30 text-sm text-amber-400 hover:bg-gray-800/50 hover:text-white"
                >
                  <Link href="/dashboard/profile">
                    View Full Stats
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - FIFA Menu Style with Black and Gold */}
        <Card className="overflow-hidden rounded-xl border-amber-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md shadow-xl">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-lg font-bold text-black">
            Quick Actions
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                asChild
                variant="outline"
                className="border-amber-500/20 bg-gray-800/30 text-white hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-yellow-500/20 hover:text-amber-400 transition-all duration-200"
              >
                <Link href="/dashboard/matches" className="flex flex-col items-center py-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-2 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                  <span>View Matches</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-amber-500/20 bg-gray-800/30 text-white hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-yellow-500/20 hover:text-amber-400 transition-all duration-200"
              >
                <Link href="/dashboard/payments" className="flex flex-col items-center py-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-2 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                  <span>Payments</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-amber-500/20 bg-gray-800/30 text-white hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-yellow-500/20 hover:text-amber-400 transition-all duration-200"
              >
                <Link href="/dashboard/profile" className="flex flex-col items-center py-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-2 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>My Profile</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-amber-500/20 bg-gray-800/30 text-white hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-yellow-500/20 hover:text-amber-400 transition-all duration-200"
              >
                <Link href="/dashboard/matches/calendar" className="flex flex-col items-center py-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-2 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Calendar</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Third card - Your stats or Telegram integration */}
        <Card className="overflow-hidden rounded-xl border-amber-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md shadow-xl">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-lg font-bold text-black">
            Quick Join
          </div>
          <CardContent className="p-4">
            <div className="mb-4 text-center text-white">
              <p>Enter match code to quickly join a game</p>
            </div>
            <div className="flex space-x-2 mb-4">
              <input 
                type="text" 
                placeholder="Match Code" 
                className="flex-1 rounded-md border border-amber-500/20 bg-gray-800/50 px-3 py-2 text-white placeholder-white/50 focus:border-amber-400 focus:outline-none"
              />
              <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:from-amber-600 hover:to-yellow-600">
                Join
              </Button>
            </div>
            <div className="border-t border-amber-500/10 pt-4 mt-4">
              <h3 className="font-semibold text-white mb-2">Join us on Telegram</h3>
              <p className="text-white/70 text-sm mb-3">Get instant match notifications and chat with other players</p>
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600"
                asChild
              >
                <a href="https://t.me/footballhubgroup" target="_blank" rel="noopener noreferrer">
                  <svg 
                    viewBox="0 0 24 24" 
                    className="h-4 w-4 mr-2 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.5 6.424-.5 6.424s-.014.151-.056.226c-.042.075-.104.1-.171.1-.1 0-.233-.05-.36-.099-.243-.087-1.35-.499-1.35-.499l-1.621 1.161c-.1.07-.19.1-.276.1-.098 0-.19-.047-.254-.146l-.025-.187s-.386-3.106-.413-3.357c-.01-.07-.014-.135-.014-.196 0-.1.034-.147.105-.147.074 0 .198.055.304.098l.255.099 3.081-1.822c.098-.084.209-.156.066-.156-.057 0-.19.04-.266.075a.266.266 0 0 1-.079.024c-.027.002-.046-.009-.061-.026l-3.301 2.024c-.117.048-.193.075-.284.075a.618.618 0 0 1-.505-.256s-.578-.544-.763-.747c.009-.007.142-.075.248-.135 2.248-1.275 5.118-2.974 6.54-3.836a.47.47 0 0 1 .28-.089z"/>
                  </svg>
                  Open Telegram Group
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Matches - FIFA Tournament Style with Black and Gold */}
        <Card className="col-span-1 overflow-hidden rounded-xl border-amber-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md shadow-xl md:col-span-3">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-lg font-bold text-black flex justify-between items-center">
            <span>Upcoming Matches</span>
            <Link href="/dashboard/matches" className="text-sm font-medium text-black hover:text-white/90 transition-colors underline">
              View All
            </Link>
          </div>
          <CardContent className="p-4">
            {upcomingMatches && upcomingMatches.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingMatches.slice(0, 3).map((match) => {
                  // Format date and time using moment
                  const matchDate = moment(match.date);
                  const formattedDate = matchDate.format('ddd, MMM D');
                  const formattedTime = matchDate.format('h:mm A');
                  
                  // Calculate progress percentage
                  const progressPercentage = match.filledSlots 
                    ? Math.min(100, (match.filledSlots / match.totalSlots) * 100)
                    : 0;
                    
                  return (
                    <div
                      key={match._id}
                      className="group relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-black/80 to-gray-900/80 p-4 shadow-md transition-all duration-300 hover:shadow-amber-500/10"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/0 opacity-0 transition-all duration-300 group-hover:opacity-10"></div>
                      
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white">{match.title}</h3>
                          <div className="flex items-center text-amber-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="mr-1 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {match.venue && typeof match.venue === 'object' && 'name' in match.venue
                              ? match.venue.name
                              : 'TBD'}
                          </div>
                        </div>
                        <div>
                          <span className="rounded-md bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-2 py-1 text-xs font-bold text-amber-400">
                            {match.matchType === '5-aside' ? '5-a-side' : 
                             match.matchType === '7-aside' ? '7-a-side' : 
                             match.matchType === '11-aside' ? '11-a-side' : match.matchType}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4 flex items-center gap-x-4 gap-y-1 text-sm text-white/70">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mr-1 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {formattedDate}, {formattedTime}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <div className="mb-1 text-xs text-white/70">Players Confirmed</div>
                          <div className="flex items-center">
                            <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-800/50">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-yellow-500" 
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-white">
                              {match.filledSlots || 0}/{match.totalSlots}
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          asChild
                          size="sm"
                          className="bg-gradient-to-r from-amber-500 to-yellow-500 text-xs font-bold text-black shadow-sm shadow-amber-500/20 hover:from-amber-600 hover:to-yellow-600"
                        >
                          <Link href={`/dashboard/matches/${match._id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-full text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m4.93 4.93 4.24 4.24" />
                    <path d="m14.83 9.17 4.24-4.24" />
                    <path d="m14.83 14.83 4.24 4.24" />
                    <path d="m9.17 14.83-4.24 4.24" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </div>
                <p className="mb-4 text-white/70">No upcoming matches found</p>
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 font-bold text-black shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-yellow-600"
                >
                  <Link href="/dashboard/matches/create">Schedule Your First Match</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}