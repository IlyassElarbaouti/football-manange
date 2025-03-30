// app/(dashboard)/dashboard/matches/[id]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { format } from 'date-fns'; 
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Clock, MessageCircle, ChevronLeft, Users, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { getMatchById, getUserByClerkId, getAllPaymentsForMatch } from '@/lib/sanity/utils';
import MatchActions from '@/components/matches/MatchActions';
import MatchFieldVisualization from '@/components/matches/MatchFieldVisualization';

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
  
  // Get payment information for this match
  const payments = await getAllPaymentsForMatch(id);
  const payment = payments && payments.length > 0 ? payments[0] : null;
  
  // Parse the match date
  const matchDate = new Date(match.date);
  const formattedDate = format(matchDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(matchDate, 'h:mm a');
  
  // Get confirmed play date and time if available
  const hasConfirmedDetails = match.playDate && match.timeSlot;
  const playDate = match.playDate ? new Date(match.playDate) : null;
  const formattedPlayDate = playDate ? format(playDate, 'EEEE, MMMM d, yyyy') : null;
  
  // Check if the current user is the creator
  const isCreator = match.createdBy?._id === user._id;
  
  // Check if the current user is already a player
  const isPlayer = match.players?.some(player => 
    player.user._id === user._id
  );
  
  // Check if this user paid for the match
  const isPayer = match.paidBy?._id === user._id;
  
  // Calculate the cost per player if available
  const costPerPlayer = match.costPerPlayer || 
    (match.totalCost && match.totalSlots 
      ? Math.ceil(match.totalCost / match.totalSlots)
      : null);
  
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
      
      {/* Payment Status Banner */}
      {match.hasPayment && (
        <div className={`p-4 rounded-lg ${match.paymentConfirmed ? 'bg-green-500/10 border border-green-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
          <div className="flex items-center">
            {match.paymentConfirmed ? 
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" /> : 
              <CreditCard className="h-5 w-5 text-amber-400 mr-3" />
            }
            <div>
              <h3 className="font-bold text-white">
                {match.paymentConfirmed ? "Payment Confirmed" : "Payment Recorded"}
              </h3>
              <p className="text-white/70">
                {match.paidBy?.name || "Someone"} has {match.paymentConfirmed ? "paid" : "recorded payment"} for this match
                {hasConfirmedDetails && (
                  <span> and set the match time for <span className="text-amber-400">{formattedPlayDate} at {match.timeSlot}</span></span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Match Field Visualization */}
      <MatchFieldVisualization match={match} />
      
      {/* Match Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Match Info */}
        <div className="space-y-6">
          <div className="rounded-lg border border-amber-500/20 bg-black/50 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-950 to-gray-900 px-4 py-3">
              <h2 className="text-lg font-bold text-amber-400">Match Details</h2>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Confirmed Date and Time - Show if available */}
              {hasConfirmedDetails && (
                <div className="p-3 bg-amber-500/10 rounded-md mb-4">
                  <h3 className="font-semibold text-white flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Confirmed Match Time
                  </h3>
                  <div className="flex items-start ml-6">
                    <div>
                      <p className="text-white font-medium">{formattedPlayDate}</p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 text-amber-400 mr-1" />
                        <p className="text-white/70">{match.timeSlot}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Tentative Date and Time */}
              <div className="flex items-start">
                <div className="bg-amber-500/10 p-2 rounded-md mr-3">
                  <Calendar className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-medium">
                    {hasConfirmedDetails ? "Originally Planned Date" : "Planned Date"}
                  </p>
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
                    Cost per player: <span className="font-bold text-amber-400">{costPerPlayer}€</span>
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
              
              {/* Additional Match Details from payment */}
              {match.matchDetails && (
                <div className="mt-4">
                  <Separator className="bg-amber-500/20 mb-4" />
                  <h3 className="text-white font-medium mb-2">Additional Details:</h3>
                  <div className="p-3 bg-gray-800/50 rounded-md">
                    <p className="text-white/80 whitespace-pre-line">{match.matchDetails}</p>
                    {match.paidBy && (
                      <div className="mt-2 text-right text-xs text-white/60">
                        Added by {match.paidBy.name}
                      </div>
                    )}
                  </div>
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
            payment={payment}
          />
        </div>
        
        {/* Right Column: Team Stats & Strategy */}
        <div className="space-y-6">
          <div className="rounded-lg border border-amber-500/20 bg-black/50 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-950 to-gray-900 px-4 py-3">
              <h2 className="text-lg font-bold text-amber-400">Team Stats</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gradient-to-br from-gray-900/80 to-black/80 p-4 border border-amber-500/10">
                  <h3 className="text-sm font-semibold text-amber-400 mb-2">Team Black</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-white/60">Avg. Skill</p>
                      <p className="text-lg font-bold text-white">79.5</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Players</p>
                      <div className="flex mt-1">
                        {Array.from({length: Math.min(5, match.filledSlots)}).map((_, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-black border border-amber-500/30 -ml-1 first:ml-0 flex items-center justify-center">
                            <span className="text-xs text-amber-400">{i+1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg bg-gradient-to-br from-gray-100/10 to-white/10 p-4 border border-amber-500/10">
                  <h3 className="text-sm font-semibold text-amber-400 mb-2">Team White</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-white/60">Avg. Skill</p>
                      <p className="text-lg font-bold text-white">78.2</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Players</p>
                      <div className="flex mt-1">
                        {Array.from({length: Math.min(5, Math.max(0, match.filledSlots - 5))}).map((_, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-white border border-amber-500/30 -ml-1 first:ml-0 flex items-center justify-center">
                            <span className="text-xs text-gray-800">{i+6}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="bg-amber-500/20" />
              
              <div>
                <h3 className="text-sm font-semibold text-amber-400 mb-2">Position Balance</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-white/70 mb-1">
                      <span>Goalkeepers</span>
                      <span>2/2</span>
                    </div>
                    <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-white/70 mb-1">
                      <span>Defenders</span>
                      <span>9/9</span>
                    </div>
                    <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-white/70 mb-1">
                      <span>Midfielders</span>
                      <span>8/8</span>
                    </div>
                    <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-white/70 mb-1">
                      <span>Forwards</span>
                      <span>2/3</span>
                    </div>
                    <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400" style={{ width: '66%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Details Card - If payment exists */}
          {payment && (
            <Card className="overflow-hidden border-amber-500/20 bg-black/50 backdrop-blur-sm">
              <div className={`px-4 py-3 ${payment.status === 'completed' ? 'bg-gradient-to-r from-green-900 to-gray-900' : 'bg-gradient-to-r from-amber-950 to-gray-900'}`}>
                <h2 className="text-lg font-bold text-white flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-amber-400" />
                  Payment Details
                </h2>
              </div>
              
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-white/60">Paid by</p>
                    <div className="flex items-center mt-1">
                      <Avatar className="h-6 w-6 mr-2">
                        {payment.user?.profileImage ? (
                          <AvatarImage src={payment.user.profileImage} alt={payment.user.name} />
                        ) : (
                          <AvatarFallback className="bg-amber-800/50 text-amber-200">
                            {payment.user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-white font-medium">{payment.user?.name}</span>
                    </div>
                  </div>
                  
                  <Badge 
                    className={`
                      ${payment.status === 'pending' ? 'bg-yellow-500 text-black' : 
                        payment.status === 'completed' ? 'bg-green-500 text-white' : 
                        'bg-red-500 text-white'}
                    `}
                  >
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/60">Amount</p>
                    <p className="text-white font-bold text-lg">{payment.amount}€</p>
                  </div>
                  
                  <div>
                    <p className="text-white/60">Payment Method</p>
                    <p className="text-white capitalize">{payment.method}</p>
                  </div>
                  
                  <div>
                    <p className="text-white/60">Payment Date</p>
                    <p className="text-white">{format(new Date(payment.date), 'PP')}</p>
                  </div>
                  
                  <div>
                    <p className="text-white/60">Payment Time</p>
                    <p className="text-white">{format(new Date(payment.date), 'p')}</p>
                  </div>
                </div>
                
                {payment.notes && (
                  <div>
                    <p className="text-white/60 mb-1">Payment Notes</p>
                    <p className="text-white/80 bg-gray-800/50 p-2 rounded">{payment.notes}</p>
                  </div>
                )}
                
                {/* If this user made the payment, show edit button */}
                {isPayer && (
                  <div className="mt-4">
                    <Button 
                      asChild
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Link href={`/dashboard/payments?edit=${payment._id}`}>
                        Edit Payment Details
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Weather Card */}
          <div className="rounded-lg border border-amber-500/20 bg-black/50 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-950 to-gray-900 px-4 py-3">
              <h2 className="text-lg font-bold text-amber-400">Weather Forecast</h2>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">{formattedDate}</h3>
                  <p className="text-white/70 text-sm">{match.venue?.name}</p>
                </div>
                
                <div className="flex items-center">
                  <div className="mr-3">
                    <div className="text-xl font-bold text-white">22°C</div>
                    <div className="text-xs text-white/70">Feels like 24°C</div>
                  </div>
                  
                  {/* Weather icon */}
                  <div className="bg-gradient-to-r from-blue-500/20 to-blue-400/20 p-2 rounded-full">
                    <svg className="h-10 w-10 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 7a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5m0 2a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3m0-7l2.39 3.42C13.65 5.15 12.84 5 12 5c-.84 0-1.65.15-2.39.42L12 2M3.34 7l4.16-.35A7.2 7.2 0 0 0 5.94 8.5c-.44.74-.69 1.5-.83 2.29L3.34 7m.02 10l1.76-3.77a7.131 7.131 0 0 0 2.38 4.14L3.36 17M20.65 7l-1.77 3.79a7.023 7.023 0 0 0-2.38-4.15l4.15.36m-.01 10l-4.14.36c.59-.51 1.12-1.14 1.54-1.86.42-.73.69-1.5.83-2.29L20.64 17M12 22l-2.41-3.44c.74.27 1.55.44 2.41.44.82 0 1.63-.17 2.37-.44L12 22z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="bg-gray-800/30 rounded-md p-2 text-center">
                  <div className="text-xs text-white/70">Precipitation</div>
                  <div className="text-white font-medium">15%</div>
                </div>
                <div className="bg-gray-800/30 rounded-md p-2 text-center">
                  <div className="text-xs text-white/70">Humidity</div>
                  <div className="text-white font-medium">65%</div>
                </div>
                <div className="bg-gray-800/30 rounded-md p-2 text-center">
                  <div className="text-xs text-white/70">Wind</div>
                  <div className="text-white font-medium">8 km/h</div>
                </div>
              </div>
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