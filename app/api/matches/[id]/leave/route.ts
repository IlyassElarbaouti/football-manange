// app/api/matches/[id]/leave/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@sanity/client';
import { getMatchById } from '@/lib/sanity/utils';
import { processMatchQueue } from '@/lib/match-queue-processor';

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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`POST /api/matches/${params.id}/leave - Leaving a match`);
    
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
    
    try {
      // Get the most up-to-date match data
      const match = await getMatchById(matchId);
      
      if (!match) {
        console.log('Match not found');
        return NextResponse.json(
          { error: 'Match not found' },
          { status: 404 }
        );
      }
      
      // Check if user is the creator
      const isCreator = match.createdBy?._id === userSanityId || match.createdBy?._ref === userSanityId;
      
      if (isCreator) {
        console.log('Match creator cannot leave the match');
        return NextResponse.json(
          { error: 'Match creator cannot leave the match. Please cancel the match instead.' },
          { status: 400 }
        );
      }
      
      // Check if user is actually a player
      const playerIndex = match.players?.findIndex(
        player => player.user._id === userSanityId || player.user._ref === userSanityId
      );
      
      if (playerIndex === -1 || playerIndex === undefined) {
        console.log('User is not a player in this match');
        return NextResponse.json(
          { error: 'User is not a player in this match' },
          { status: 400 }
        );
      }
      
      // Check match status
      if (match.status !== 'scheduled') {
        console.log(`Cannot leave match with status: ${match.status}`);
        return NextResponse.json(
          { error: `Cannot leave a match that is ${match.status}` },
          { status: 400 }
        );
      }
      
      console.log(`Removing user ${userSanityId} from match ${matchId}`);
      
      // Get player key to remove
      const playerKey = match.players[playerIndex]._key;
      
      // Begin a transaction
      const transaction = client.transaction();
      
      // Remove player and decrement filledSlots in a transaction
      transaction.patch(matchId, (patch) => 
        patch
          .unset([`players[_key=="${playerKey}"]`])
          .dec({ filledSlots: 1 })
      );
      
      // Execute the transaction
      const updatedMatch = await transaction.commit();
      
      console.log('User successfully left match');
      
      // Process the queue if there are players waiting
      if (match.queue && match.queue.length > 0) {
        console.log('Processing queue after player left');
        await processMatchQueue(matchId);
      }
      
      return NextResponse.json({ match: updatedMatch });
    } catch (patchError) {
      console.error('Error updating match:', patchError);
      return NextResponse.json(
        { error: 'Failed to update match', details: patchError instanceof Error ? patchError.message : String(patchError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error leaving match:', error);
    return NextResponse.json(
      { error: 'Failed to leave match', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}