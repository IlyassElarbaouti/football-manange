
// app/api/matches/[id]/queue/leave/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@sanity/client';
import { getMatchById } from '@/lib/sanity/utils';

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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`POST /api/matches/${params.id}/queue/leave - Leaving the queue`);
    
    const { userId } = await auth();
    
    if (!userId) {
      console.log('Authentication failed - No userId found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const matchId = params.id;
    console.log(`Match ID: ${matchId}`);
    
    // Get the match from Sanity
    const match = await getMatchById(matchId);
    
    if (!match) {
      console.log('Match not found');
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const userSanityId = body.userId;
    
    if (!userSanityId) {
      console.log('Missing user Sanity ID in request');
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }
    
    // Find the user in the queue
    const queueIndex = match.queue?.findIndex(
      queueItem => queueItem.user._ref === userSanityId
    );
    
    if (queueIndex === -1 || queueIndex === undefined) {
      console.log('User is not in the queue');
      return NextResponse.json(
        { error: 'User is not in the queue' },
        { status: 400 }
      );
    }
    
    try {
      console.log(`Removing user ${userSanityId} from queue for match ${matchId}`);
      
      // Get the queue item key
      const queueItemKey = match.queue[queueIndex]._key;
      
      // Remove user from queue
      const updatedMatch = await client
        .patch(matchId)
        .unset([`queue[_key=="${queueItemKey}"]`])
        .commit();
      
      console.log('User successfully removed from queue');
      
      return NextResponse.json({ match: updatedMatch });
    } catch (patchError) {
      console.error('Error updating match queue:', patchError);
      return NextResponse.json(
        { error: 'Failed to update match queue', details: patchError instanceof Error ? patchError.message : String(patchError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error leaving queue:', error);
    return NextResponse.json(
      { error: 'Failed to leave queue', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}