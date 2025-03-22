'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { User } from '@/types/sanity';

export function useClerkSanityUser() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const [sanityUser, setSanityUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use refs to track sync attempts and prevent loops
  const syncAttempted = useRef(false);
  const syncInProgress = useRef(false);

  useEffect(() => {
    // Only run this effect once per component lifecycle
    if (syncAttempted.current || syncInProgress.current) {
      return;
    }

    const syncUser = async () => {
      // Exit if clerk is not loaded or no user
      if (!clerkLoaded) {
        return;
      }

      if (!user) {
        setIsLoading(false);
        syncAttempted.current = true;
        return;
      }

      try {
        syncInProgress.current = true;
        console.log('🔄 Syncing Clerk user with Sanity:', user.id);
        
        // Check if the user exists in Sanity through our API
        const response = await fetch(`/api/users/check?clerkId=${encodeURIComponent(user.id)}`);
        const data = await response.json();
        
        if (response.ok && data.exists && data.user) {
          console.log('✅ User found in Sanity:', data.user._id);
          setSanityUser(data.user);
        } else if (!data.exists) {
          // If user doesn't exist, create it
          console.log('⚠️ User not found in Sanity, creating via API...');
          
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User';
          const email = user.primaryEmailAddress?.emailAddress || '';
          
          // Create minimal required user data
          const userData = {
            clerkId: user.id,
            name: fullName,
            email: email || `user-${Date.now()}@example.com`,
            preferredPosition: 'any',
            skillLevel: 75,
            isAdmin: false,
            matchesPlayed: 0,
            matchesPaid: 0,
            totalPayments: 0,
          };
          
          const createResponse = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userData }),
          });
          
          if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(`API error: ${errorData.error || createResponse.statusText}`);
          }
          
          const createData = await createResponse.json();
          console.log('✅ Sanity user created successfully via API:', createData.user._id);
          setSanityUser(createData.user);
        }
      } catch (err) {
        console.error('❌ Error syncing user with Sanity:', err);
        setError(err instanceof Error ? err : new Error('Failed to sync user with Sanity'));
      } finally {
        setIsLoading(false);
        syncInProgress.current = false;
        syncAttempted.current = true;
      }
    };

    syncUser();
  }, [user, clerkLoaded]); // Only depend on user and clerkLoaded

  return { sanityUser, isLoading, error };
}