'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useClerkSanityUser } from '@/lib/hooks/userClerkSanityUser';
import { Button } from '@/components/ui/button';

export default function UserSyncIndicator() {
  const { sanityUser, isLoading, error } = useClerkSanityUser();
  const [showMessage, setShowMessage] = useState(false);
  const messageTimer = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Only show the loading message after a delay to avoid flashing
    if (isLoading) {
      // Clear any existing timer
      if (messageTimer.current) {
        clearTimeout(messageTimer.current);
      }
      
      // Set a new timer
      messageTimer.current = setTimeout(() => {
        setShowMessage(true);
      }, 2000);
    } else {
      // If done loading, clear the timer and hide the message
      if (messageTimer.current) {
        clearTimeout(messageTimer.current);
      }
      setShowMessage(false);
    }
    
    // Cleanup on unmount
    return () => {
      if (messageTimer.current) {
        clearTimeout(messageTimer.current);
      }
    };
  }, [isLoading]);
  
  // If user is found and no error, don't show anything
  if (!isLoading && !error && sanityUser) {
    return null;
  }
  
  // Show error message if there is an error
  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-red-500/20 bg-gradient-to-br from-red-900/90 to-red-950/80 p-4 text-white shadow-lg">
        <h3 className="mb-2 font-semibold">User Sync Error</h3>
        <p className="text-sm text-white/80">
          {error.message || 'Failed to sync user with database'}
        </p>
        <div className="mt-3 flex justify-end">
          <Button
            asChild
            className="bg-gradient-to-r from-amber-500 to-yellow-500 text-xs font-bold text-black shadow-sm shadow-amber-500/20 hover:from-amber-600 hover:to-yellow-600"
          >
            <Link href="/dashboard/profile/setup">
              Manual Setup
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Show loading message if still loading and delay has passed
  if (isLoading && showMessage) {
    return (
      <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-amber-500/20 bg-gradient-to-br from-gray-900/90 to-black/80 p-4 text-white shadow-lg">
        <div className="flex items-center">
          <Loader2 className="mr-3 h-5 w-5 animate-spin text-amber-400" />
          <div>
            <h3 className="font-semibold">Setting Up Your Profile</h3>
            <p className="text-sm text-white/80">
              Creating your player profile in our database...
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}