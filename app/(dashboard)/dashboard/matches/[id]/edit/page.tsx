// app/(dashboard)/dashboard/matches/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heading1 } from '@/components/ui/typography';
import { notFound } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Loader2, ChevronLeft } from 'lucide-react';
import MatchEditForm from '@/components/matches/MatchEditForm';

interface MatchEditPageProps {
  params: { id: string };
}

export default function MatchEditPage({ params }: MatchEditPageProps) {
  const router = useRouter();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await fetch(`/api/matches/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return notFound();
          }
          throw new Error('Failed to fetch match');
        }
        
        const data = await response.json();
        setMatch(data.match);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching match:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-500" />
          <p className="mt-2 text-white/70">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Error: {error || 'Match not found'}</p>
          <Button 
            asChild 
            variant="outline"
            className="mt-4 border-amber-500/20 bg-gray-800/30 text-white hover:bg-gray-800/50 hover:text-amber-400"
          >
            <Link href="/dashboard/matches">Back to Matches</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button 
          asChild 
          variant="outline" 
          className="border-amber-500/20 bg-gray-800/30 text-white hover:bg-gray-800/50 hover:text-amber-400"
        >
          <Link href={`/dashboard/matches/${params.id}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Match
          </Link>
        </Button>
      </div>
      
      <div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
          Edit Match: {match.title}
        </h1>
        <p className="text-amber-400 mt-2">
          Update match details and settings
        </p>
      </div>
      
      <Separator className="bg-amber-500/20" />
      
      <MatchEditForm match={match} onCancel={() => router.push(`/dashboard/matches/${params.id}`)} />
    </div>
  );
}