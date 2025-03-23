// lib/match-status-updater.ts
import { createClient } from '@sanity/client';
import moment from 'moment';
import { getAllMatches } from '@/lib/sanity/utils';
import { processMatchQueue, verifyMatchConsistency } from '@/lib/match-queue-processor';

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

interface UpdateResult {
  updated: number;
  skipped: number;
  queueProcessed: number;
  consistencyFixed: number;
}

/**
 * Updates match statuses automatically based on their scheduled date/time
 * Also processes queues and verifies data consistency
 */
export async function updateMatchStatuses(): Promise<UpdateResult> {
  try {
    console.log('Running automatic match status and queue updates...');
    
    // Get all matches
    const matches = await getAllMatches();
    
    if (!matches || matches.length === 0) {
      console.log('No matches found to update');
      return { updated: 0, skipped: 0, queueProcessed: 0, consistencyFixed: 0 };
    }
    
    const now = moment();
    let updatedCount = 0;
    let skippedCount = 0;
    let queueProcessedCount = 0;
    let consistencyFixedCount = 0;
    
    // Process each match
    for (const match of matches) {
      try {
        // First verify data consistency
        const consistencyResult = await verifyMatchConsistency(match._id);
        if (consistencyResult.fixed) {
          consistencyFixedCount++;
          // Update our local copy of the match with the fixed data
          Object.assign(match, consistencyResult.match);
        }
        
        // Skip further processing for cancelled matches
        if (match.status === 'cancelled') {
          skippedCount++;
          continue;
        }
        
        const matchDate = moment(match.date);
        
        // Assume a match lasts 2 hours (this could be configurable)
        const matchEndTime = matchDate.clone().add(2, 'hours');
        
        let newStatus = null;
        
        // Determine the appropriate status based on time
        if (match.status === 'scheduled' && matchDate.isBefore(now) && matchEndTime.isAfter(now)) {
          // Match should be in progress - it has started but not finished
          newStatus = 'in-progress';
        } else if ((match.status === 'scheduled' || match.status === 'in-progress') && matchEndTime.isBefore(now)) {
          // Match should be completed - the end time has passed
          newStatus = 'completed';
        }
        
        // If status needs to be updated
        if (newStatus && match.status !== newStatus) {
          try {
            console.log(`Updating match "${match.title}" status: ${match.status} -> ${newStatus}`);
            
            // Update the match status
            await client.patch(match._id)
              .set({ status: newStatus })
              .commit();
              
            // Update our local copy
            match.status = newStatus;
            updatedCount++;
          } catch (error) {
            console.error(`Error updating match ${match._id}:`, error);
            skippedCount++;
          }
        } else {
          skippedCount++;
        }
        
        // Process the queue for scheduled matches with available slots
        if (match.queue && match.queue.length > 0 && 
            match.status === 'scheduled' &&
            match.filledSlots < match.totalSlots) {
          try {
            const queueResult = await processMatchQueue(match._id);
            queueProcessedCount += queueResult.processed;
            
            if (queueResult.processed > 0) {
              console.log(`Processed ${queueResult.processed} players from queue for match "${match.title}"`);
            }
          } catch (queueError) {
            console.error(`Error processing queue for match ${match._id}:`, queueError);
          }
        }
      } catch (matchError) {
        console.error(`Error processing match ${match._id}:`, matchError);
        skippedCount++;
      }
    }
    
    console.log(`Match updates complete. Updated: ${updatedCount}, Skipped: ${skippedCount}, Queue Processed: ${queueProcessedCount}, Consistency Fixed: ${consistencyFixedCount}`);
    
    return { 
      updated: updatedCount, 
      skipped: skippedCount, 
      queueProcessed: queueProcessedCount,
      consistencyFixed: consistencyFixedCount
    };
  } catch (error) {
    console.error('Error in updateMatchStatuses:', error);
    throw error;
  }
}

/**
 * Run match status updates for a specific match
 * Useful for immediate updates after operations
 */
export async function updateSingleMatchStatus(matchId: string): Promise<{
  updated: boolean;
  newStatus: string | null;
  match: any;
}> {
  try {
    console.log(`Updating status for single match ${matchId}`);
    
    // Get the latest match data
    const match = await client.fetch(
      `*[_type == "match" && _id == $matchId][0]`,
      { matchId }
    );
    
    if (!match) {
      console.log(`Match ${matchId} not found`);
      throw new Error('Match not found');
    }
    
    // Skip cancelled matches
    if (match.status === 'cancelled') {
      return { updated: false, newStatus: null, match };
    }
    
    const now = moment();
    const matchDate = moment(match.date);
    const matchEndTime = matchDate.clone().add(2, 'hours');
    
    let newStatus = null;
    
    // Determine the appropriate status based on time
    if (match.status === 'scheduled' && matchDate.isBefore(now) && matchEndTime.isAfter(now)) {
      newStatus = 'in-progress';
    } else if ((match.status === 'scheduled' || match.status === 'in-progress') && matchEndTime.isBefore(now)) {
      newStatus = 'completed';
    }
    
    // If status needs to be updated
    if (newStatus && match.status !== newStatus) {
      console.log(`Updating match status: ${match.status} -> ${newStatus}`);
      
      // Update the match status
      const updatedMatch = await client.patch(match._id)
        .set({ status: newStatus })
        .commit();
      
      return { updated: true, newStatus, match: updatedMatch };
    }
    
    return { updated: false, newStatus: null, match };
    
  } catch (error) {
    console.error(`Error updating single match status for ${matchId}:`, error);
    throw error;
  }
}