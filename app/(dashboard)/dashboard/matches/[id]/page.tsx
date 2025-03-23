import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { format } from 'date-fns'; // Direct import from date-fns
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Clock, MessageCircle, ChevronLeft, Users } from 'lucide-react';
import { getMatchById, getUserByClerkId } from '@/lib/sanity/utils';
import MatchActions from '@/components/matches/MatchActions';

export default async function MatchDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const { userId } = await auth();
  if (!userId) {
    notFound();
  }
  
  // Get the user from Sanity
  const user = await getUserByClerkId(userId);
  if (!user) {
    notFound();
  }
  
  // Get the match from Sanity - access id property safely
  const id = params.id;
  const match = await getMatchById(id);
  if (!match) {
    notFound();
  }
  
  // Parse the date
  const matchDate = new Date(match.date);
  const formattedDate = format(matchDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(matchDate, 'h:mm a');
  
  // Check if the current user is the creator
  const isCreator = match.createdBy?._id === user._id;
  
  // Check if the current user is already a player
  const isPlayer = match.players?.some(player => 
    player.user._id === user._id
  );
  
  // Calculate the cost per player if available
  const costPerPlayer = match.totalCost && match.totalSlots 
    ? Math.ceil(match.totalCost / match.totalSlots)
    : match.costPerPlayer || null;
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button 
          asChild 
          variant="outline" 
          className="border-amber-500/20 bg-gray-800/30 text-white hover:bg-gray-800/50 hover:text-amber-400"
        >
          <Link href="/dashboard/matches">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Matches
          </Link>
        </Button>
        
        <Badge 
          className={`
            ${match.status === 'scheduled' ? 'bg-blue-500' : 
              match.status === 'in-progress' ? 'bg-green-500' : 
              match.status === 'completed' ? 'bg-gray-500' : 
              'bg-red-500'} 
            text-white
          `}
        >
          {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
        </Badge>
      </div>
      
      {/* Match Title and Creator */}
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
          {match.title}
        </h1>
        
        <div className="flex items-center space-x-2">
          <p className="text-white/60">Organized by</p>
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              {match.createdBy?.profileImage ? (
                <AvatarImage src={match.createdBy.profileImage} alt={match.createdBy.name || 'Organizer'} />
              ) : (
                <AvatarFallback className="bg-amber-800/50 text-amber-200">
                  {match.createdBy?.name?.charAt(0) || 'O'}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-amber-400 font-medium">{match.createdBy?.name || 'Anonymous'}</span>
          </div>
        </div>
      </div>
      
      {/* Match Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Match Info */}
        <div className="space-y-6">
          <div className="rounded-lg border border-amber-500/20 bg-black/50 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-950 to-gray-900 px-4 py-3">
              <h2 className="text-lg font-bold text-amber-400">Match Details</h2>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Date and Time */}
              <div className="flex items-start">
                <div className="bg-amber-500/10 p-2 rounded-md mr-3">
                  <Calendar className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{formattedDate}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 text-amber-400 mr-1" />
                    <p className="text-white/70">{formattedTime}</p>
                  </div>
                </div>
              </div>
              
              {/* Venue */}
              {match.venue && typeof match.venue === 'object' && 'name' in match.venue && (
                <div className="flex items-start">
                  <div className="bg-amber-500/10 p-2 rounded-md mr-3">
                    <MapPin className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{match.venue.name}</p>
                    <p className="text-white/70">{match.venue.address}</p>
                    {match.venue.amenities && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {match.venue.amenities.map((amenity: string) => (
                          <Badge key={amenity} variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/20">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Match Type */}
              <div className="flex items-center">
                <div className="bg-amber-500/10 p-2 rounded-md mr-3">
                  <Users className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <Badge className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-none">
                    {match.matchType === '5-aside' ? '5-a-side' : 
                     match.matchType === '7-aside' ? '7-a-side' : 
                     match.matchType === '11-aside' ? '11-a-side' : match.matchType}
                  </Badge>
                  <p className="text-white/70 mt-1">
                    {match.filledSlots || 0}/{match.totalSlots} players joined
                  </p>
                </div>
              </div>
              
              {/* Cost per player if available */}
              {costPerPlayer && (
                <div className="mt-6 p-3 rounded-md bg-amber-500/10">
                  <p className="text-white">
                    Cost per player: <span className="font-bold text-amber-400">{costPerPlayer}₽</span>
                  </p>
                </div>
              )}
              
              {/* Match Description */}
              {match.notes && (
                <div className="mt-4">
                  <Separator className="bg-amber-500/20 mb-4" />
                  <p className="text-white/80 whitespace-pre-line">{match.notes}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Match Actions */}
          <MatchActions 
            match={match}
            user={user}
            isCreator={isCreator}
            isPlayer={isPlayer}
          />
        </div>
        
        {/* Right Column: Players */}
        <div className="space-y-6">
          <div className="rounded-lg border border-amber-500/20 bg-black/50 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-950 to-gray-900 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-amber-400">Players</h2>
              <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-300">
                {match.filledSlots || 0}/{match.totalSlots}
              </Badge>
            </div>
            
            <div className="p-4">
              {match.players && match.players.length > 0 ? (
                <div className="space-y-3">
                  {match.players.map((player: any) => (
                    <div key={player.user._id} className="flex items-center p-2 rounded-md hover:bg-amber-500/5">
                      <Avatar className="h-10 w-10 mr-3 border border-amber-500/30">
                        {player.user.profileImage ? (
                          <AvatarImage src={player.user.profileImage} alt={player.user.name} />
                        ) : (
                          <AvatarFallback className="bg-amber-800/50 text-amber-200">
                            {player.user.name?.charAt(0) || 'P'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-white">
                            {player.user.name}
                            {player.user._id === match.createdBy?._id && (
                              <Badge className="ml-2 bg-amber-600 text-xs text-white">Organizer</Badge>
                            )}
                          </p>
                          {player.confirmed ? (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                              Confirmed
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                              Pending
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center mt-1 text-white/60 text-sm">
                          <span className="mr-3">
                            Position: {player.user.preferredPosition || 'Any'}
                          </span>
                          {player.user.skillLevel && (
                            <span>
                              Skill: {player.user.skillLevel}/100
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-white/60">No players have joined yet.</p>
                  {!isPlayer && match.status === 'scheduled' && (
                    <p className="text-amber-400 mt-2">Be the first to join!</p>
                  )}
                </div>
              )}
              
              {/* Available slots visualization */}
              {match.status === 'scheduled' && match.filledSlots < match.totalSlots && (
                <div className="mt-6 p-3 rounded-md bg-gray-800/30 border border-amber-500/10">
                  <p className="text-white mb-2">
                    {match.totalSlots - match.filledSlots} slots available
                  </p>
                  <div className="grid grid-cols-10 gap-1">
                    {Array.from({ length: match.totalSlots }).map((_, index) => (
                      <div
                        key={index}
                        className={`h-3 rounded-sm ${
                          index < match.filledSlots
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                            : 'bg-gray-700/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Chat/Discussion Placeholder */}
          <div className="rounded-lg border border-amber-500/20 bg-black/50 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-950 to-gray-900 px-4 py-3">
              <h2 className="text-lg font-bold text-amber-400">Discussion</h2>
            </div>
            
            <div className="p-6 text-center">
              <MessageCircle className="h-10 w-10 mx-auto text-amber-500/30 mb-2" />
              <p className="text-white/60 mb-2">Chat functionality coming soon</p>
              <p className="text-white/40 text-sm">
                Join our Telegram group for match discussions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}