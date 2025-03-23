"use client";

import { useState } from "react";
import Link from "next/link";
import moment from "moment";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar,  Users, Search, AlertCircle } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Match } from "@/types/sanity";

interface MatchesDataGridProps {
  matches: Match[];
}

export default function MatchesDataGrid({ matches }: MatchesDataGridProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Get all unique match types from the data
  const matchTypes = Array.from(
    new Set(matches.map((match) => match.matchType))
  );

  // Get all unique statuses from the data
  const statuses = Array.from(
    new Set(matches.map((match) => match.status))
  );

  // Filter matches based on type, status and search term
  const filteredMatches = matches.filter((match) => {
    const matchesType =
      !selectedType || selectedType === "all"
        ? true
        : match.matchType === selectedType;
    
    const matchesStatus =
      !selectedStatus || selectedStatus === "all"
        ? true
        : match.status === selectedStatus;
    
    const matchesSearch = searchTerm
      ? match.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (match.venue &&
          typeof match.venue === "object" &&
          "name" in match.venue &&
          match.venue.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (match.createdBy?.name &&
          match.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    return matchesType && matchesStatus && matchesSearch;
  });

  // Function to get status styling
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

  // Function to get match type styling
  const getMatchTypeStyles = (matchType: string) => {
    switch (matchType) {
      case '5-aside':
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          text: 'text-emerald-400',
          dotsFilled: 'bg-emerald-500',
          label: '5-a-side'
        };
      case '7-aside':
        return {
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          text: 'text-blue-400',
          dotsFilled: 'bg-blue-500',
          label: '7-a-side'
        };
      case '11-aside':
        return {
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          text: 'text-purple-400',
          dotsFilled: 'bg-purple-500',
          label: '11-a-side'
        };
      default:
        return {
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          text: 'text-amber-400',
          dotsFilled: 'bg-amber-500',
          label: matchType
        };
    }
  };

  // Group matches by status
  const matchesByStatus = filteredMatches.reduce((acc, match) => {
    if (!acc[match.status]) {
      acc[match.status] = [];
    }
    acc[match.status].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  // Sort statuses in priority order
  const sortedStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled']
    .filter(status => matchesByStatus[status] && matchesByStatus[status].length > 0);

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
          <Link href="/dashboard/matches/create">
            Schedule Your First Match
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter Bar */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Search matches..."
            className="pl-10 border-amber-500/20 bg-gray-800/50 text-white placeholder:text-white/50 focus:border-amber-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
        </div>

        <div className="flex space-x-3">
          <Select
            value={selectedStatus || "all"}
            onValueChange={(value) =>
              setSelectedStatus(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[140px] border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="border-amber-500/20 bg-gray-900">
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((status) => {
                const styles = getStatusStyles(status);
                return (
                  <SelectItem key={status} value={status} className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${styles.bg} mr-2`}></div>
                    {styles.statusText}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select
            value={selectedType || "all"}
            onValueChange={(value) =>
              setSelectedType(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[140px] border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent className="border-amber-500/20 bg-gray-900">
              <SelectItem value="all">All types</SelectItem>
              {matchTypes.map((type) => {
                const styles = getMatchTypeStyles(type);
                return (
                  <SelectItem key={type} value={type} className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${styles.dotsFilled} mr-2`}></div>
                    {styles.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Status Legend */}
      <div className="flex flex-wrap items-center gap-4 bg-black/20 p-3 rounded-lg border border-white/10">
        <span className="text-white/60 text-sm">Match Status:</span>
        {['scheduled', 'in-progress', 'completed', 'cancelled'].map(status => {
          const styles = getStatusStyles(status);
          return (
            <div key={status} className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${styles.bg} mr-1.5`}></div>
              <span className="text-white text-xs">{styles.statusText}</span>
            </div>
          );
        })}
      </div>

      {/* Matches grouped by status */}
      {sortedStatuses.map(status => {
        const statusMatches = matchesByStatus[status];
        const statusStyles = getStatusStyles(status);
        
        return (
          <div key={status} className="space-y-4">
            {/* Status section header */}
            <div className={`flex items-center p-2 ${statusStyles.bgTransparent} rounded-lg`}>
              <div className={`h-4 w-4 rounded-full ${statusStyles.bg} mr-2`}></div>
              <h2 className={`font-bold ${statusStyles.text}`}>{statusStyles.statusText} Matches ({statusMatches.length})</h2>
            </div>
            
            {/* Match cards for this status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statusMatches.map((match) => {
                // Format date and time
                const matchDate = moment(match.date);
                const formattedDate = matchDate.format("ddd, MMM D");
                const formattedTime = matchDate.format("h:mm A");

                // Calculate if match is today
                const isToday = matchDate.isSame(moment(), 'day');
                
                // Calculate if match is happening soon (within 24 hours)
                const isSoon = matchDate.diff(moment(), 'hours') < 24 && matchDate.diff(moment(), 'hours') > 0;
                
                // Get match type styles
                const typeStyles = getMatchTypeStyles(match.matchType);
                
                // Set opacity based on match status
                const cardOpacity = match.status === 'cancelled' ? 'opacity-80' : 'opacity-100';

                return (
                  <div
                    key={match._id}
                    onClick={() => router.push(`/dashboard/matches/${match._id}`)}
                    className={`rounded-lg border ${statusStyles.border} overflow-hidden transition-all cursor-pointer hover:shadow-lg ${cardOpacity} group`}
                    style={{
                      backgroundImage: `linear-gradient(to bottom right, rgba(0,0,0,0.8), rgba(0,0,0,0.95))`,
                      backgroundSize: 'cover'
                    }}
                  >
                    {/* Status indicator bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${statusStyles.gradient}`}></div>
                    
                    {/* Top section with time and status */}
                    <div className="p-3 flex justify-between items-center border-b border-white/5">
                      <div className="flex items-center">
                        <Calendar className={`mr-2 h-4 w-4 ${statusStyles.text}`} />
                        <div>
                          <span className="text-white font-medium">
                            {isToday ? 'Today' : formattedDate}
                          </span>
                          <span className="text-white/70 ml-2">
                            {formattedTime}
                          </span>
                          {isToday && match.status === 'scheduled' && (
                            <Badge className="ml-2 bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                              Today
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Badge className={statusStyles.badgeClass}>
                        {statusStyles.statusText}
                      </Badge>
                    </div>
                    
                    {/* Match Content */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">{match.title}</h3>
                        
                        <Badge className={typeStyles.badge}>
                          {typeStyles.label}
                        </Badge>
                      </div>
                      
                      {/* Organizer */}
                      <div className="flex items-center mb-3">
                        <Avatar className={`h-5 w-5 mr-2 border ${statusStyles.border}`}>
                          {match.createdBy?.profileImage ? (
                            <AvatarImage src={match.createdBy.profileImage} alt={match.createdBy.name || 'Organizer'} />
                          ) : (
                            <AvatarFallback className={`bg-gray-800 ${statusStyles.text} text-xs`}>
                              {match.createdBy?.name?.charAt(0) || 'O'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="text-white text-sm">
                          By: <span className={statusStyles.text}>
                            {match.createdBy?.name || 'Anonymous'}
                          </span>
                        </span>
                      </div>
                      
                      {/* Venue */}
                      {match.venue && typeof match.venue === "object" && "name" in match.venue && (
                        <div className="flex items-start mb-3">
                          <MapPin className={`h-4 w-4 ${statusStyles.text} mt-0.5 mr-1.5 flex-shrink-0`} />
                          <div>
                            <p className="text-white text-sm">{match.venue.name}</p>
                            <p className="text-white/60 text-xs">{match.venue.address}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Player Count + Match Type */}
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center">
                          <Users className={`h-4 w-4 ${statusStyles.text} mr-1`} />
                          <span className="text-white text-sm">
                            {match.filledSlots || 0}/{match.totalSlots}
                          </span>
                          
                          {/* Player slots visualization */}
                          <div className="ml-2 flex space-x-0.5">
                            {Array.from({ length: Math.min(5, match.totalSlots) }).map((_, index) => (
                              <div
                                key={index}
                                className={`h-1.5 w-1.5 rounded-full ${
                                  index < (match.filledSlots || 0)
                                    ? statusStyles.bg
                                    : 'bg-gray-700/50'
                                }`}
                              />
                            ))}
                            {match.totalSlots > 5 && (
                              <div className="h-1.5 w-1.5 rounded-full bg-gray-700/50 flex items-center justify-center">
                                <span className="text-white/50 text-[8px]">+</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Special alerts for certain statuses */}
                      {match.status === 'cancelled' && (
                        <div className="mt-3 p-2 flex items-start rounded bg-red-900/20 border border-red-500/20">
                          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 mr-1.5 flex-shrink-0" />
                          <span className="text-red-300 text-xs">This match has been cancelled</span>
                        </div>
                      )}
                      
                      {/* Action Button - style based on status */}
                      <Button
                        asChild
                        className={`w-full mt-4 bg-gradient-to-r ${statusStyles.gradient} text-xs font-bold text-white shadow-sm`}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/matches/${match._id}`);
                        }}
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
          </div>
        );
      })}

      {/* Results count */}
      <div className="text-sm text-white/60">
        Showing {filteredMatches.length} of {matches.length} matches
      </div>
    </div>
  );
}