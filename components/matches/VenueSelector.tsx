'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { urlFor } from '@/lib/sanity/client';


type Venue = {
  _id: string;
  name: string;
  address: string;
  image?: any;
  hourlyRate?: number;
  indoorOutdoor: string;
  supportedMatchTypes?: string[];
};

interface VenueSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function VenueSelector({ value, onChange }: VenueSelectorProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVenues = async () => {
      console.log('🏟️ Fetching venues...');
      try {
        const response = await fetch('/api/venues');
        console.log('📡 API Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Error response:', errorData);
          throw new Error(`Failed to fetch venues: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`✅ Retrieved ${data.venues?.length || 0} venues`);
        
        if (!data.venues || !Array.isArray(data.venues)) {
          console.error('❌ Invalid venues data format:', data);
          throw new Error('Invalid venue data format returned from API');
        }
        
        setVenues(data.venues);
      } catch (err) {
        console.error('❌ Error fetching venues:', err);
        setError(err instanceof Error ? err.message : 'Could not load venues. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVenues();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-amber-500/20 bg-gray-800/50">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-red-500/20 bg-gray-800/50 text-center">
        <div>
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-amber-400 hover:text-amber-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-amber-500/20 bg-gray-800/50 text-center">
        <div>
          <p className="text-white/70">No venues available.</p>
          <p className="mt-2 text-sm text-amber-400">
            Please add venues in Sanity Studio before creating matches.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {venues.map((venue) => (
        <div
          key={venue._id}
          className={cn(
            "cursor-pointer overflow-hidden rounded-lg border border-amber-500/20 bg-gray-800/30 transition-all hover:bg-gray-800/50",
            value === venue._id && "ring-2 ring-amber-500 ring-offset-2 ring-offset-gray-900"
          )}
          onClick={() => onChange(venue._id)}
        >
          <div className="relative h-32 w-full">
            {venue.image ? (
              <Image
                src={urlFor(venue.image).url()}
                alt={venue.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-amber-500/10">
                <MapPin className="h-12 w-12 text-amber-500/50" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-3">
              <h3 className="text-lg font-bold text-white">{venue.name}</h3>
              <div className="flex items-center text-sm text-amber-400">
                <MapPin className="mr-1 h-3 w-3" />
                {venue.address}
              </div>
            </div>
            {venue.hourlyRate && (
              <div className="absolute right-2 top-2 rounded-md bg-amber-500 px-2 py-1 text-xs font-bold text-black">
                £{venue.hourlyRate}/hr
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-amber-500/10 px-3 py-2">
            <span className="text-xs text-white/70">
              {venue.indoorOutdoor.charAt(0).toUpperCase() + venue.indoorOutdoor.slice(1)}
            </span>
            {venue.supportedMatchTypes && venue.supportedMatchTypes.length > 0 && (
              <div className="flex space-x-1">
                {venue.supportedMatchTypes.map((type) => (
                  <span
                    key={type}
                    className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-400"
                  >
                    {type}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}