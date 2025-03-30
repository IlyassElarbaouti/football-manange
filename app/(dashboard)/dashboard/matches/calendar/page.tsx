// app/(dashboard)/dashboard/matches/calendar/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getAllMatches, getUserByClerkId } from '@/lib/sanity/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import MatchCalendarView from '@/components/matches/MatchCalendarView';

export default async function MatchCalendarPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Get the user's Sanity profile
  const user = await getUserByClerkId(userId);
  
  if (!user) {
    redirect('/dashboard');
  }
  
  // Get all matches
  const matches = await getAllMatches();
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center">
            <span className="mr-3 rounded-md bg-gradient-to-br from-amber-500 to-yellow-500 px-2 py-1 text-xs font-bold text-black shadow-md shadow-amber-500/20">
              FUT 25
            </span>
            <h1 className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Match Calendar
            </h1>
          </div>
          <p className="text-amber-400">
            View all matches organized by date
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
          Match Calendar
        </div>
        <div className="p-4">
          <MatchCalendarView matches={matches} userId={user._id} />
        </div>
      </div>
    </div>
  );
}