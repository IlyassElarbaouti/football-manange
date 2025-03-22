import Link from 'next/link';
import { Button } from '@/components/ui/button';
import MatchesDataGrid from '@/components/matches/MatchesDataGrid';
import { getAllMatches } from '@/lib/sanity/utils';

export default async function MatchesPage() {
  // Fetch matches from Sanity
  const matches = await getAllMatches();
  console.log(`Fetched ${matches?.length || 0} upcoming matches for display`);

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center">
            <span className="mr-3 rounded-md bg-gradient-to-br from-amber-500 to-yellow-500 px-2 py-1 text-xs font-bold text-black shadow-md shadow-amber-500/20">
              FUT 25
            </span>
            <h1 className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
               Matches
            </h1>
          </div>
          <p className="text-amber-400">
            View and join scheduled football matches
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

      <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-lg font-bold text-black">
          Upcoming Fixtures
        </div>
        <div className="p-4">
          <MatchesDataGrid matches={matches} />
        </div>
      </div>
    </div>
  );
}