// app/api/matches/update-statuses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateMatchStatuses } from '@/lib/match-status-updater';

/**
 * API endpoint to trigger match status updates
 * This can be called from the client to update match statuses
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Run the status update function
    const result = await updateMatchStatuses();
    
    // Return the results
    return NextResponse.json({
      success: true,
      message: `Match statuses updated successfully. Updated: ${result.updated}, Skipped: ${result.skipped}`,
      ...result
    });
  } catch (error) {
    console.error('Error updating match statuses:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update match statuses',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}