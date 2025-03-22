"use client";

import { useState } from "react";
import Link from "next/link";
import moment from "moment";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Clock, Users } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [searchTerm, setSearchTerm] = useState("");

  // Get all unique match types from the data
  const matchTypes = Array.from(
    new Set(matches.map((match) => match.matchType))
  );

  // Filter matches based on type and search term
  // Filter matches based on type and search term
  const filteredMatches = matches.filter((match) => {
    const matchesType =
      !selectedType || selectedType === "all"
        ? true
        : match.matchType === selectedType;
    const matchesSearch = searchTerm
      ? match.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (match.venue &&
          typeof match.venue === "object" &&
          "name" in match.venue &&
          match.venue.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    return matchesType && matchesSearch;
  });

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
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Search matches..."
            className="pl-10 border-amber-500/20 bg-gray-800/50 text-white placeholder:text-white/50 focus:border-amber-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div>
          <Select
            value={selectedType || "all"}
            onValueChange={(value) =>
              setSelectedType(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[180px] border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400">
              <SelectValue placeholder="All match types" />
            </SelectTrigger>
            <SelectContent className="border-amber-500/20 bg-gray-900">
              <SelectItem value="all">All match types</SelectItem>
              {matchTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "5-aside"
                    ? "5-a-side"
                    : type === "7-aside"
                      ? "7-a-side"
                      : type === "11-aside"
                        ? "11-a-side"
                        : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Grid */}
      <div className="rounded-md overflow-hidden border border-amber-500/20">
        <Table className="min-w-full">
          <TableHeader className="bg-gradient-to-r from-amber-950 to-gray-900">
            <TableRow className="hover:bg-transparent border-amber-500/20">
              <TableHead className="text-amber-400 font-medium">
                Match
              </TableHead>
              <TableHead className="text-amber-400 font-medium hidden md:table-cell">
                Date & Time
              </TableHead>
              <TableHead className="text-amber-400 font-medium hidden lg:table-cell">
                Location
              </TableHead>
              <TableHead className="text-amber-400 font-medium">Type</TableHead>
              <TableHead className="text-amber-400 font-medium hidden md:table-cell">
                Players
              </TableHead>
              <TableHead className="text-amber-400 font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMatches.map((match) => {
              // Format date and time
              const matchDate = moment(match.date);
              const formattedDate = matchDate.format("ddd, MMM D");
              const formattedTime = matchDate.format("h:mm A");

              // Calculate progress percentage
              const progressPercentage = match.filledSlots
                ? Math.min(100, (match.filledSlots / match.totalSlots) * 100)
                : 0;

              return (
                <TableRow
                  key={match._id}
                  className="hover:bg-amber-500/5 cursor-pointer border-amber-500/10"
                  onClick={() => router.push(`/dashboard/matches/${match._id}`)}
                >
                  <TableCell className="font-medium text-white">
                    {match.title}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-white/80">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4 text-amber-400" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="mr-1 h-4 w-4 text-amber-400" />
                        <span>{formattedTime}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-white/80">
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4 text-amber-400" />
                      {match.venue &&
                      typeof match.venue === "object" &&
                      "name" in match.venue
                        ? match.venue.name
                        : "TBD"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-none">
                      {match.matchType === "5-aside"
                        ? "5-a-side"
                        : match.matchType === "7-aside"
                          ? "7-a-side"
                          : match.matchType === "11-aside"
                            ? "11-a-side"
                            : match.matchType}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-white/80">
                    <div className="flex items-center">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-800/50 mr-2">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-500"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <span>
                        {match.filledSlots || 0}/{match.totalSlots}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-amber-500/20 bg-gray-800/30 text-white hover:bg-gray-800/50 hover:text-amber-400"
                        >
                          Options
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="border-amber-500/20 bg-gray-900">
                        <DropdownMenuLabel className="text-white/70">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-amber-500/20" />
                        <DropdownMenuItem
                          className="text-white hover:bg-amber-500/10 hover:text-white cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/matches/${match._id}`);
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        {match.status === "scheduled" && (
                          <DropdownMenuItem
                            className="text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/matches/${match._id}`);
                            }}
                          >
                            Join Match
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="text-sm text-white/60">
        Showing {filteredMatches.length} of {matches.length} matches
      </div>
    </div>
  );
}
