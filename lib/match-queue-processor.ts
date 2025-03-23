// lib/match-queue-processor.ts
import { createClient } from '@sanity/client';
import { getMatchById } from '@/lib/sanity/utils';

// Create a server-side Sanity client with the token
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03';
const token = process.env.SANITY_API_TOKEN;

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

/**
 * Process the waiting queue for a match, moving players to the active list if slots are available
 * This function ensures consistency between filledSlots and the actual player count
 */
export async function processMatchQueue(matchId: string): Promise<{ 
  processed: number, 
  remaining: number,
  match: any
}> {
  try {
    console.log(`Processing queue for match ${matchId}`);
    
    // Get the latest match data
    const match = await getMatchById(matchId);
    
    if (!match) {
      console.error(`Match ${matchId} not found`);
      throw new Error('Match not found');
    }
    
    // Skip processing if match is not scheduled
    if (match.status !== 'scheduled') {
      console.log(`Match ${matchId} is ${match.status}, skipping queue processing`);
      return { processed: 0, remaining: match.queue?.length || 0, match };
    }
    
    // Count actual players to ensure consistency
    const actualPlayerCount = match.players?.length || 0;
    
    // If the filledSlots is inconsistent with actual player count, fix it
    if (actualPlayerCount !== match.filledSlots) {
      console.log(`Fixing player count mismatch: filledSlots=${match.filledSlots}, actual=${actualPlayerCount}`);
      await client.patch(matchId)
        .set({ filledSlots: actualPlayerCount })
        .commit();
        
      // Update our local copy of the match data
      match.filledSlots = actualPlayerCount;
    }
    
    // Check if there are available slots
    const availableSlots = match.totalSlots - match.filledSlots;
    
    // If no slots or no queue, exit early
    if (availableSlots <= 0 || !match.queue || match.queue.length === 0) {
      console.log(`No slots available (${availableSlots}) or no players in queue (${match.queue?.length || 0})`);
      return { processed: 0, remaining: match.queue?.length || 0, match };
    }
    
    // Number of users to move from queue to players
    const playersToAdd = Math.min(availableSlots, match.queue.length);
    
    // If no players to add, exit early
    if (playersToAdd <= 0) {
      return { processed: 0, remaining: match.queue.length, match };
    }
    
    console.log(`Moving ${playersToAdd} players from queue to active list`);
    
    // Sort queue by timestamp (oldest first)
    const sortedQueue = [...match.queue].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Users to add to players
    const usersToAdd = sortedQueue.slice(0, playersToAdd);
    
    // Convert queue users to player objects
    const newPlayers = usersToAdd.map(queueItem => ({
      _key: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user: {
        _type: 'reference',
        _ref: queueItem.user._ref,
      },
      confirmed: true,
      hasPaid: false,
      assignedPosition: 'unassigned',
    }));
    
    // Get keys of queue items to remove
    const keysToRemove = usersToAdd.map(item => `queue[_key=="${item._key}"]`);
    
    // Use a transaction to ensure consistency
    const transaction = client.transaction();
    
    // Update match: add players, remove from queue, update filledSlots
    transaction
      .patch(matchId, patch => 
        patch
          .setIfMissing({ players: [] })
          .append('players', newPlayers)
          .unset(keysToRemove)
          .inc({ filledSlots: playersToAdd })
      );
    
    // Execute the transaction
    const updatedMatch = await transaction.commit();
    
    console.log(`Successfully added ${playersToAdd} players from queue to match ${matchId}`);
    
    // Calculate remaining queue size
    const remainingInQueue = match.queue.length - playersToAdd;
    
    return { 
      processed: playersToAdd, 
      remaining: remainingInQueue, 
      match: updatedMatch 
    };
    
  } catch (error) {
    console.error(`Error processing queue for match ${matchId}:`, error);
    throw error;
  }
}

/**
 * Verify and fix match data consistency
 * This checks for mismatches between filledSlots and actual player count
 */
export async function verifyMatchConsistency(matchId: string): Promise<{ 
  fixed: boolean, 
  match: any 
}> {
  try {
    console.log(`Verifying data consistency for match ${matchId}`);
    
    // Get the latest match data
    const match = await getMatchById(matchId);
    
    if (!match) {
      console.error(`Match ${matchId} not found`);
      throw new Error('Match not found');
    }
    
    // Count actual players
    const actualPlayerCount = match.players?.length || 0;
    
    // If the filledSlots is inconsistent with actual player count, fix it
    if (actualPlayerCount !== match.filledSlots) {
      console.log(`Fixing player count mismatch: filledSlots=${match.filledSlots}, actual=${actualPlayerCount}`);
      const updatedMatch = await client.patch(matchId)
        .set({ filledSlots: actualPlayerCount })
        .commit();
      
      return { fixed: true, match: updatedMatch };
    }
    
    return { fixed: false, match };
    
  } catch (error) {
    console.error(`Error verifying match consistency for ${matchId}:`, error);
    throw error;
  }
}