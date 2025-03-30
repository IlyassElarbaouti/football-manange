// components/matches/MatchCalendarView.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, Users } from 'lucide-react';
import { Match } from '@/types/sanity';
import { format, addMonths, subMonths } from 'date-fns';

interface MatchCalendarViewProps {
  matches: Match[];
  userId: string;
}

export default function MatchCalendarView({ matches, userId }: MatchCalendarViewProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [matchesByDate, setMatchesByDate] = useState<Record<string, Match[]>>({});

  // Process matches into a map by date
  useEffect(() => {
    if (!matches) return;
    
    const matchMap: Record<string, Match[]> = {};
    matches.forEach(match => {
      const matchDate = new Date(match.date);
      const dateKey = format(matchDate, 'yyyy-MM-dd');
      
      if (!matchMap[dateKey]) {
        matchMap[dateKey] = [];
      }
      matchMap[dateKey].push(match);
    });
    
    setMatchesByDate(matchMap);
  }, [matches]);

  // Get matches for the selected date
  const selectedDateMatches = selectedDate ? 
    matchesByDate[format(selectedDate, 'yyyy-MM-dd')] || [] : [];

  // Navigate to previous month
  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  // Custom day renderer for the calendar
  const renderDay = (day: Date, selectedDays: Date[], dayProps: any) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const dayMatches = matchesByDate[dateString] || [];
    const hasMatches = dayMatches.length > 0;
    
    // Check if user is participating in any matches on this day
    const isParticipating = hasMatches && dayMatches.some(match => {
      // Check if user created the match
      if (match.createdBy?._id === userId || match.createdBy?._ref === userId) return true;
      
      // Check if user is a player
      return match.players?.some(player => 
        player.user._id === userId || player.user._ref === userId
      );
    });
    
    return (
      <div
        {...dayProps}
        className={`
          relative h-10 w-10 rounded-md flex items-center justify-center
          ${dayProps.className}
          ${hasMatches ? 'font-bold' : ''}
          ${isParticipating ? 'ring-2 ring-amber-500' : ''}
        `}
      >
        {day.getDate()}
        {hasMatches && (
          <div className="absolute -bottom-1 flex space-x-0.5 justify-center">
            {dayMatches.slice(0, Math.min(3, dayMatches.length)).map((_, i) => (
              <div 
                key={i} 
                className={`
                  h-1 w-1 rounded-full
                  ${isParticipating ? 'bg-amber-500' : 'bg-white/60'}
                `}
              />
            ))}
            {dayMatches.length > 3 && (
              <div className="h-1 w-1 rounded-full bg-white/60" />
            )}
          </div>
        )}
      </div>
    );
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500 text-white';
      case 'in-progress':
        return 'bg-green-500 text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-amber-500 text-black';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Panel */}
      <div className="lg:col-span-2">
        <div className="bg-black/50 rounded-lg p-4 border border-amber-500/20">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-bold text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="bg-transparent"
            weekdayClassName="text-amber-400"
            components={{
              Day: ({ day, selected, ...props }) => renderDay(day, selected ? [selected] : [], props),
            }}
          />
          
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-white/70">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-white/60 mr-2"></div>
              <span>Match Scheduled</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-amber-500 mr-2"></div>
              <span>Your Match</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Matches for selected day */}
      <div className="lg:col-span-1">
        <div className="bg-black/50 rounded-lg p-4 border border-amber-500/20 h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              {selectedDate ? (
                format(selectedDate, 'EEEE, MMMM d, yyyy')
              ) : (
                'Select a day'
              )}
            </h2>
            
            {selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && (
              <Badge className="bg-amber-500 text-black">Today</Badge>
            )}
          </div>
          
          {selectedDateMatches.length > 0 ? (
            <div className="space-y-3 overflow-y-auto max-h-[450px] pr-1">
              {selectedDateMatches.map((match) => {
                const matchTime = new Date(match.date);
                const isUserMatch = 
                  match.createdBy?._id === userId || 
                  match.createdBy?._ref === userId ||
                  match.players?.some(player => 
                    player.user._id === userId || player.user._ref === userId
                  );
                
                return (
                  <Card 
                    key={match._id}
                    className={`border-amber-500/20 bg-gray-900/50 hover:bg-gray-900/70 transition-colors overflow-hidden ${
                      isUserMatch ? 'ring-1 ring-amber-500' : ''
                    }`}
                  >
                    <CardContent className="p-3">
                      <Link href={`/dashboard/matches/${match._id}`} className="block">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-white">{match.title}</h3>
                          <Badge className={getStatusBadge(match.status)}>
                            {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center text-white/70">
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                            {format(matchTime, 'h:mm a')}
                          </div>
                          
                          {match.venue && typeof match.venue === 'object' && 'name' in match.venue && (
                            <div className="flex items-center text-white/70">
                              <MapPin className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                              {match.venue.name}
                            </div>
                          )}
                          
                          <div className="flex items-center text-white/70">
                            <Users className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                            {match.filledSlots}/{match.totalSlots} players
                          </div>
                        </div>
                        
                        {isUserMatch && (
                          <div className="mt-2 pt-2 border-t border-amber-500/20">
                            <span className="text-xs text-amber-400">You're participating in this match</span>
                          </div>
                        )}
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <CalendarIcon className="h-12 w-12 mx-auto text-amber-500/30 mb-4" />
              <p className="text-white mb-2">
                {selectedDate ? 'No matches scheduled' : 'Select a day to view matches'}
              </p>
              <p className="text-white/60 mb-4 text-sm">
                {selectedDate && 'Create a new match for this day'}
              </p>
              
              {selectedDate && (
                <Button 
                  onClick={() => router.push('/dashboard/matches/create')}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:from-amber-600 hover:to-yellow-600"
                >
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
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}