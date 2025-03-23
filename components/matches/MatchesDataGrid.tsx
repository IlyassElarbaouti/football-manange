'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Users, Search, Edit, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Match, User } from "@/types/sanity";
import { useToast } from "@/hooks/use-toast";

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
  const { user } = useUser();
  const [displayedMatches, setDisplayedMatches] = useState<Match[]>(matches);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingMatch, setDeletingMatch] = useState<string | null>(null);

  // Debug information - log the current user details
  useEffect(() => {
    console.log("Current user from props:", currentUser);
    console.log("Current user from Clerk:", user);
  }, [currentUser, user]);

  // Sort and filter matches
  useEffect(() => {
    let filtered = [...matches];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(match => {
        const matchesSearch = searchTerm
          ? match.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (match.venue && typeof match.venue === "object" && 
             "name" in match.venue && match.venue.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (match.createdBy?.name && match.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase()))
          : true;
        return matchesSearch;
      });
    }

    // Group and sort logic remains the same
    filtered.sort((a, b) => {
      const getMatchGroup = (match: Match) => {
        if (match.status === 'in-progress') return 0;
        if (match.status === 'scheduled') return 1;
        return 2;
      };

      const groupA = getMatchGroup(a);
      const groupB = getMatchGroup(b);

      if (groupA !== groupB) {
        return groupA - groupB;
      }

      if (groupA === 1) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setDisplayedMatches(filtered);
  }, [matches, searchTerm]);

  // Handle deleting a match
  const handleDeleteMatch = async (matchId: string) => {
    try {
      setDeletingMatch(matchId);
      
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete match');
      }
      
      toast({
        title: "Match deleted",
        description: "The match has been permanently deleted."
      });
      
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to delete match",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setDeletingMatch(null);
    }
  };

  // Helper function to get status styling
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'scheduled':
        return {
          bg: 'bg-blue-500',
          badgeClass: 'bg-blue-500 text-white',
          statusText: 'Scheduled'
        };
      case 'in-progress':
        return {
          bg: 'bg-green-500',
          badgeClass: 'bg-green-500 text-white',
          statusText: 'In Progress'
        };
      case 'completed':
        return {
          bg: 'bg-gray-500',
          badgeClass: 'bg-gray-500 text-white',
          statusText: 'Completed'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-500',
          badgeClass: 'bg-red-500 text-white',
          statusText: 'Cancelled'
        };
      default:
        return {
          bg: 'bg-amber-500',
          badgeClass: 'bg-amber-500 text-white',
          statusText: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };

  // Render match card with edit and delete always visible for debugging
  const renderMatchCard = (match: Match) => {
    // Format date and time
    const matchDate = moment(match.date);
    const formattedDate = matchDate.format("ddd, MMM D");
    const formattedTime = matchDate.format("h:mm A");
    
    // Get status styles
    const statusStyles = getStatusStyles(match.status);

    // Debug - log match creator info
    console.log(`Match ${match._id} - Creator info:`, match.createdBy);

    return (
      <div 
        key={match._id}
        className="rounded-lg border border-amber-500/20 overflow-hidden bg-black/80 shadow-md transition-all hover:shadow-amber-500/10 mb-3"
      >
        {/* Status indicator bar */}
        <div className={`h-1 w-full ${statusStyles.bg}`}></div>
        
        <div className="p-3">
          {/* Top row with date, time, status */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4 text-amber-400" />
              <span className="text-white text-sm">
                {matchDate.isSame(moment(), 'day') ? 'Today' : formattedDate}, {formattedTime}
              </span>
            </div>
            <Badge className={`text-xs ${statusStyles.badgeClass}`}>
              {statusStyles.statusText}
            </Badge>
          </div>
          
          {/* Match title */}
          <h3 className="text-white font-bold mb-2">{match.title}</h3>
          
          {/* Venue */}
          {match.venue && typeof match.venue === "object" && "name" in match.venue && (
            <div className="flex items-center text-white/70 text-xs mb-3">
              <MapPin className="h-3 w-3 mr-1 text-amber-400" />
              {match.venue.name}
            </div>
          )}
          
          {/* Players status */}
          <div className="flex items-center text-white/70 text-xs mb-3">
            <Users className="h-3 w-3 mr-1 text-amber-400" />
            <span>{match.filledSlots || 0}/{match.totalSlots} players</span>
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
            
            {/* Always show edit button for testing */}
            <Button
              asChild
              size="sm"
              className="text-xs bg-blue-600 text-white hover:bg-blue-700"
            >
              <Link href={`/dashboard/matches/${match._id}/edit`}>
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Link>
            </Button>
            
            {/* Always show delete button for testing */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  className="text-xs bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-amber-500/20 bg-gray-900">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete this match?</AlertDialogTitle>
                  <AlertDialogDescription className="text-white/70">
                    This will permanently delete the match and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-amber-500/20 bg-gray-800 text-white hover:bg-gray-700 hover:text-white">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteMatch(match._id)}
                    disabled={deletingMatch === match._id}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deletingMatch === match._id ? "Processing..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    );
  };

  if (!matches || matches.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-white/70">No matches found</p>
        <Button 
          asChild 
          className="bg-gradient-to-r from-amber-500 to-yellow-500 font-bold text-black"
        >
          <Link href="/dashboard/matches/create">Schedule Your First Match</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar only */}
      <div className="mb-4">
        <div className="relative">
          <Input
            placeholder="Search matches..."
            className="pl-10 border-amber-500/20 bg-gray-800/50 text-white placeholder:text-white/50 focus:border-amber-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
        </div>
      </div>
      
      {/* Group headers and matches */}
      {displayedMatches.some(match => match.status === 'in-progress') && (
        <div className="mb-2">
          <h3 className="text-amber-400 font-semibold">In Progress</h3>
          {displayedMatches
            .filter(match => match.status === 'in-progress')
            .map(match => renderMatchCard(match))}
        </div>
      )}
      
      {displayedMatches.some(match => match.status === 'scheduled') && (
        <div className="mb-2 mt-6">
          <h3 className="text-amber-400 font-semibold">Upcoming Matches</h3>
          {displayedMatches
            .filter(match => match.status === 'scheduled')
            .map(match => renderMatchCard(match))}
        </div>
      )}
      
      {displayedMatches.some(match => ['completed', 'cancelled'].includes(match.status)) && (
        <div className="mb-2 mt-6">
          <h3 className="text-amber-400 font-semibold">Past Matches</h3>
          {displayedMatches
            .filter(match => ['completed', 'cancelled'].includes(match.status))
            .map(match => renderMatchCard(match))}
        </div>
      )}
    </div>
  );
}