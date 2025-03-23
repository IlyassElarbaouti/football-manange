import { createClient } from '@sanity/client';
import moment from 'moment';
import { getAllMatches } from '@/lib/sanity/utils';

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
 * Updates match statuses automatically based on their scheduled date/time
 * This should be run before displaying matches to ensure statuses are accurate
 */
export async function updateMatchStatuses() {
  try {
    console.log('Running automatic match status updates...');
    
    // Get all matches
    const matches = await getAllMatches();
    
    if (!matches || matches.length === 0) {
      console.log('No matches found to update');
      return { updated: 0, skipped: 0 };
    }
    
    const now = moment();
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Process each match
    await Promise.all(matches.map(async match => {
      // Skip already cancelled matches
      if (match.status === 'cancelled') {
        skippedCount++;
        return;
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
            
          updatedCount++;
        } catch (error) {
          console.error(`Error updating match ${match._id}:`, error);
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }));
    
    console.log(`Match status updates complete. Updated: ${updatedCount}, Skipped: ${skippedCount}`);
    return { updated: updatedCount, skipped: skippedCount };
  } catch (error) {
    console.error('Error in updateMatchStatuses:', error);
    throw error;
  }
}