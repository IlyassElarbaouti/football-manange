'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import moment from "moment";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Clock, Users, Search, AlertCircle, ArrowUpDown, UserPlus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Match, User } from "@/types/sanity";
import { useToast } from "@/hooks/use-toast";
import QuickFilterTabs from "@/components/matches/QuickFilterTabs";

interface MatchesDataGridProps {
  matches: Match[];
  currentUser?: User | null;
  showMyMatchesOnly?: boolean;
}

export default function MatchesDataGrid({ 
  matches, 
  currentUser,
  showMyMatchesOnly = false
}: MatchesDataGridProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [displayedMatches, setDisplayedMatches] = useState<Match[]>(matches);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [joinInProgress, setJoinInProgress] = useState<string | null>(null);
  const [quickJoinCode, setQuickJoinCode] = useState("");
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [sortOption, setSortOption] = useState("date-asc");
  
  // Handle quick filter changes
  const handleFilterChange = (filter: string) => {
    // Reset other filters when quick filter changes
    setSelectedType(null);
    setSelectedStatus(null);
    
    if (filter === 'today') {
      // Filter for today's matches
      const today = moment().startOf('day');
      const tomorrow = moment().endOf('day');
      const todayMatches = matches.filter(match => {
        const matchDate = moment(match.date);
        return matchDate.isBetween(today, tomorrow, null, '[]');
      });
      setDisplayedMatches(todayMatches);
    } else if (filter === 'week') {
      // Filter for this week's matches
      const weekStart = moment().startOf('week');
      const weekEnd = moment().endOf('week');
      const weekMatches = matches.filter(match => {
        const matchDate = moment(match.date);
        return matchDate.isBetween(weekStart, weekEnd, null, '[]');
      });
      setDisplayedMatches(weekMatches);
    } else if (filter === 'scheduled') {
      // Filter for scheduled matches
      const scheduledMatches = matches.filter(match => match.status === 'scheduled');
      setDisplayedMatches(scheduledMatches);
    } else if (filter === 'in-progress') {
      // Filter for matches in progress
      const inProgressMatches = matches.filter(match => match.status === 'in-progress');
      setDisplayedMatches(inProgressMatches);
    } else {
      // All matches (reset filters)
      setDisplayedMatches(matches);
    }
  };

  // Get all unique match types and statuses from the data
  const matchTypes = Array.from(new Set(matches.map((match) => match.matchType)));
  const statuses = Array.from(new Set(matches.map((match) => match.status)));

  // Filter matches based on type, status, and search term
  useEffect(() => {
    // First handle "my matches only" filter if enabled
    let filtered = [...matches];
    
    if (showMyMatchesOnly && currentUser) {
      filtered = filtered.filter(match => {
        const isUserInvolved = 
          match.players?.some(player => player.user._ref === currentUser._id) || 
          match.createdBy?._ref === currentUser._id ||
          match.queue?.some(queueItem => queueItem.user._ref === currentUser._id);
        
        return isUserInvolved;
      });
    }
    
    // Then apply other filters
    filtered = filtered.filter(match => {
      const matchesType = !selectedType || selectedType === "all" 
        ? true 
        : match.matchType === selectedType;
      
      const matchesStatus = !selectedStatus || selectedStatus === "all" 
        ? true 
        : match.status === selectedStatus;
      
      const matchesSearch = searchTerm
        ? match.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (match.venue && typeof match.venue === "object" && 
           "name" in match.venue && match.venue.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (match.createdBy?.name && match.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;

      return matchesType && matchesStatus && matchesSearch;
    });

    // Sort matches
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "slots-asc":
          return (a.filledSlots / a.totalSlots) - (b.filledSlots / b.totalSlots);
        case "slots-desc":
          return (b.filledSlots / b.totalSlots) - (a.filledSlots / b.totalSlots);
        default:
          return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

    setDisplayedMatches(filtered);
  }, [matches, currentUser, showMyMatchesOnly, selectedType, selectedStatus, searchTerm, sortOption]);

  // Handle quick join by code
  const handleQuickJoin = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join matches",
        variant: "destructive",
      });
      return;
    }
    
    if (!quickJoinCode.trim()) {
      toast({
        title: "No code entered",
        description: "Please enter a match invitation code",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Find match by invite code
      const matchWithCode = matches.find(match => 
        match.inviteCode === quickJoinCode && 
        match.visibility === 'invite' &&
        match.status === 'scheduled'
      );
      
      if (matchWithCode) {
        // Redirect to match details page
        router.push(`/dashboard/matches/${matchWithCode._id}`);
      } else {
        throw new Error('Invalid match code');
      }
    } catch (error) {
      toast({
        title: "Failed to join match",
        description: "The code you entered is invalid or expired",
        variant: "destructive",
      });
    }
  };

  // Handle joining a match directly
  const handleJoinMatch = async (match: Match) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join matches",
        variant: "destructive",
      });
      return;
    }
    
    // Prevent joining your own match (should handle in UI as well)
    if (match.createdBy?._ref === currentUser._id) {
      toast({
        title: "You're the organizer",
        description: "You're already part of this match as the organizer",
        variant: "default",
      });
      router.push(`/dashboard/matches/${match._id}`);
      return;
    }
    
    // Check if match is private
    if (match.visibility === 'private') {
      toast({
        title: "Private match",
        description: "This match is private and requires an invitation from the organizer",
        variant: "destructive",
      });
      return;
    }
    
    // Handle invite-only matches
    if (match.visibility === 'invite' && !isUserInMatch(match) && !isUserInQueue(match)) {
      setSelectedMatch(match);
      setShowJoinDialog(true);
      return;
    }
    
    setJoinInProgress(match._id);
    
    // Check if match is full
    const isFull = match.filledSlots >= match.totalSlots;
    
    // Determine if user should join directly or go to waiting list
    const endpoint = isFull 
      ? `/api/matches/${match._id}/queue` 
      : `/api/matches/${match._id}/join`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser._id,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join match');
      }
      
      // Show success message
      toast({
        title: isFull ? "Added to waiting list" : "Successfully joined match",
        description: isFull 
          ? "You'll be notified if a spot becomes available" 
          : "You've been added to the match",
        variant: "default",
      });
      
      // Navigate to match details
      router.push(`/dashboard/matches/${match._id}`);
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to join match",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setJoinInProgress(null);
    }
  };

  // Helper function to get status styling
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'scheduled':
        return {
          bg: 'bg-blue-500',
          bgTransparent: 'bg-blue-500/20',
          border: 'border-blue-500/30',
          text: 'text-blue-300',
          gradient: 'from-blue-500 to-blue-600',
          badgeClass: 'bg-blue-500 text-white',
          statusText: 'Scheduled'
        };
      case 'in-progress':
        return {
          bg: 'bg-green-500',
          bgTransparent: 'bg-green-500/20',
          border: 'border-green-500/30',
          text: 'text-green-300',
          gradient: 'from-green-500 to-green-600',
          badgeClass: 'bg-green-500 text-white',
          statusText: 'In Progress'
        };
      case 'completed':
        return {
          bg: 'bg-gray-500',
          bgTransparent: 'bg-gray-500/20',
          border: 'border-gray-500/30',
          text: 'text-gray-300',
          gradient: 'from-gray-500 to-gray-600',
          badgeClass: 'bg-gray-500 text-white',
          statusText: 'Completed'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-500',
          bgTransparent: 'bg-red-500/20',
          border: 'border-red-500/30',
          text: 'text-red-300',
          gradient: 'from-red-500 to-red-600',
          badgeClass: 'bg-red-500 text-white',
          statusText: 'Cancelled'
        };
      default:
        return {
          bg: 'bg-amber-500',
          bgTransparent: 'bg-amber-500/20',
          border: 'border-amber-500/30',
          text: 'text-amber-300',
          gradient: 'from-amber-500 to-yellow-500',
          badgeClass: 'bg-amber-500 text-white',
          statusText: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')
        };
    }
  };

  // Check if user is already in a match
  const isUserInMatch = (match: Match): boolean => {
    if (!currentUser) return false;
    
    return !!match.players?.some(player => 
      player.user._ref === currentUser._id
    );
  };

  // Check if user is in the waiting queue
  const isUserInQueue = (match: Match): boolean => {
    if (!currentUser) return false;
    
    return !!match.queue?.some(queueItem => 
      queueItem.user._ref === currentUser._id
    );
  };

  // Check if user is the creator
  const isCreator = (match: Match): boolean => {
    if (!currentUser) return false;
    
    return match.createdBy?._ref === currentUser._id;
  };

  // Minimalistic card for mobile
  const renderMatchCard = (match: Match) => {
    // Format date and time
    const matchDate = moment(match.date);
    const formattedDate = matchDate.format("ddd, MMM D");
    const formattedTime = matchDate.format("h:mm A");

    // Calculate if match is today
    const isToday = matchDate.isSame(moment(), 'day');
    
    // Get status styles
    const statusStyles = getStatusStyles(match.status);
    
    // Check user participation
    const userJoined = isUserInMatch(match);
    const userInQueue = isUserInQueue(match);
    const matchCreator = isCreator(match);
    
    // Check if match is full
    const isFull = match.filledSlots >= match.totalSlots;

    // Match type formatting
    const matchTypeLabel = match.matchType === '5-aside' ? '5-a-side' : 
                           match.matchType === '7-aside' ? '7-a-side' : 
                           match.matchType === '11-aside' ? '11-a-side' : match.matchType;

    return (
      <div 
        key={match._id}
        className="rounded-lg border border-amber-500/20 overflow-hidden bg-black/80 shadow-md transition-all hover:shadow-amber-500/10 mb-3"
      >
        {/* Status indicator bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${statusStyles.gradient}`}></div>
        
        <div className="p-3" onClick={() => router.push(`/dashboard/matches/${match._id}`)}>
          {/* Top row with date, time, status */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Calendar className={`mr-1 h-4 w-4 ${statusStyles.text}`} />
              <span className="text-white text-sm">
                {isToday ? 'Today' : formattedDate}, {formattedTime}
              </span>
            </div>
            <Badge className={`text-xs ${statusStyles.badgeClass}`}>
              {statusStyles.statusText}
            </Badge>
          </div>
          
          {/* Match title and type */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-bold">{match.title}</h3>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-xs">
              {matchTypeLabel}
            </Badge>
          </div>
          
          {/* Venue */}
          {match.venue && typeof match.venue === "object" && "name" in match.venue && (
            <div className="flex items-center text-white/70 text-xs mb-3">
              <MapPin className="h-3 w-3 mr-1 text-amber-400" />
              {match.venue.name}
            </div>
          )}
          
          {/* Players status */}
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center text-white/70 text-xs">
              <Users className="h-3 w-3 mr-1 text-amber-400" />
              <span>{match.filledSlots || 0}/{match.totalSlots} players</span>
            </div>
            
            {userJoined && (
              <Badge className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                You're In
              </Badge>
            )}
            
            {userInQueue && (
              <Badge className="text-xs bg-amber-500/20 text-amber-300 border-amber-500/30">
                In Queue
              </Badge>
            )}
            
            {matchCreator && (
              <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                Your Match
              </Badge>
            )}
          </div>
          
          {/* Player slots visualization */}
          <div className="w-full h-1.5 bg-gray-800/50 rounded-full overflow-hidden mb-3">
            <div 
              className={`h-full ${statusStyles.bg}`} 
              style={{ width: `${(match.filledSlots / match.totalSlots) * 100}%` }}
            ></div>
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 text-xs border-amber-500/20 bg-gray-800/30 text-white hover:bg-gray-800/50 hover:text-amber-400"
            >
              <Link href={`/dashboard/matches/${match._id}`}>
                View Details
              </Link>
            </Button>
            
            {match.status === 'scheduled' && !userJoined && !matchCreator && (
              <Button
                size="sm"
                className={`text-xs ${
                  isFull
                    ? "bg-amber-700 hover:bg-amber-800"
                    : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                } text-black font-medium`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoinMatch(match);
                }}
                disabled={joinInProgress === match._id}
              >
                {joinInProgress === match._id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isFull ? (
                  "Join Queue"
                ) : (
                  "Join"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!matches || matches.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Filter Tabs */}
      <QuickFilterTabs onChange={handleFilterChange} />
      
      {/* Search and Advanced Filters (collapsible on mobile) */}
      <div className="mb-4">
        <div className="flex mb-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search matches..."
              className="pl-10 border-amber-500/20 bg-gray-800/50 text-white placeholder:text-white/50 focus:border-amber-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select
            value={selectedStatus || "all"}
            onValueChange={(value) => setSelectedStatus(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-32 h-8 text-xs border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-amber-500/20 bg-gray-900">
              <SelectItem value="all" className="text-xs">All statuses</SelectItem>
              {statuses.map((status) => {
                const styles = getStatusStyles(status);
                return (
                  <SelectItem key={status} value={status} className="text-xs flex items-center">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 mr-2"></div>
                    {styles.statusText}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select
            value={selectedType || "all"}
            onValueChange={(value) => setSelectedType(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-32 h-8 text-xs border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400">
              <SelectValue placeholder="Match Type" />
            </SelectTrigger>
            <SelectContent className="border-amber-500/20 bg-gray-900">
              <SelectItem value="all" className="text-xs">All types</SelectItem>
              {matchTypes.map((type) => (
                <SelectItem key={type} value={type} className="text-xs flex items-center">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 mr-2"></div>
                  {type === '5-aside' ? '5-a-side' : 
                   type === '7-aside' ? '7-a-side' : 
                   type === '11-aside' ? '11-a-side' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={sortOption}
            onValueChange={setSortOption}
          >
            <SelectTrigger className="w-32 h-8 text-xs border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400">
              <ArrowUpDown className="mr-2 h-3 w-3" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="border-amber-500/20 bg-gray-900">
              <SelectItem value="date-asc" className="text-xs">Soonest first</SelectItem>
              <SelectItem value="date-desc" className="text-xs">Latest first</SelectItem>
              <SelectItem value="slots-asc" className="text-xs">Most available</SelectItem>
              <SelectItem value="slots-desc" className="text-xs">Most filled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Quick Join Bar - Simplified for mobile */}
      <div className="flex items-center mb-3 p-3 rounded-lg border border-amber-500/10 bg-black/20">
        <Input
          value={quickJoinCode}
          onChange={(e) => setQuickJoinCode(e.target.value)}
          placeholder="Enter invite code..."
          className="flex-1 h-9 mr-2 border-amber-500/20 bg-gray-800/50 text-white text-sm"
        />
        <Button
          onClick={handleQuickJoin}
          size="sm"
          className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:from-amber-600 hover:to-yellow-600"
        >
          Join
        </Button>
      </div>
      
      {/* Matches list - Mobile optimized */}
      <div className="space-y-1">
        {displayedMatches.map(match => renderMatchCard(match))}
      </div>
      
      {/* Results count */}
      <div className="text-xs text-white/60 text-center pt-2">
        Showing {displayedMatches.length} of {matches.length} matches
      </div>
      
      {/* Join with Code Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="border-amber-500/20 bg-gray-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Join Invite-Only Match</DialogTitle>
            <DialogDescription className="text-white/70">
              This match requires an invitation code to join.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMatch && (
            <div className="py-4">
              <h3 className="font-bold text-white mb-2">{selectedMatch.title}</h3>
              <p className="text-white/70 text-sm mb-4">Please enter the invitation code provided by the match organizer.</p>
              
              <Input
                placeholder="Enter invite code..."
                className="border-amber-500/20 bg-gray-800/50 text-white mb-4"
                value={quickJoinCode}
                onChange={(e) => setQuickJoinCode(e.target.value)}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowJoinDialog(false)}
              className="border-amber-500/20 bg-gray-800/50 text-white hover:bg-gray-800/70"
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:from-amber-600 hover:to-yellow-600"
              onClick={() => {
                if (selectedMatch && quickJoinCode === selectedMatch.inviteCode) {
                  handleJoinMatch(selectedMatch);
                  setShowJoinDialog(false);
                } else {
                  toast({
                    title: "Invalid code",
                    description: "The code you entered is incorrect",
                    variant: "destructive",
                  });
                }
              }}
            >
              Verify & Join
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}