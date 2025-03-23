// app/api/matches/[id]/join/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`POST /api/matches/${params.id}/join - Joining a match`);
    
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
    
    // Parse request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Get user's Sanity ID
    const userSanityId = body.userId;
    
    if (!userSanityId) {
      console.log('Missing user Sanity ID in request');
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }
    
    try {
      // Use a transaction to prevent race conditions
      // First, get the latest match data directly in the transaction
      const transaction = client.transaction();
      
      // Get the match from Sanity in real-time
      const match = await getMatchById(matchId);
      
      if (!match) {
        console.log('Match not found');
        return NextResponse.json(
          { error: 'Match not found' },
          { status: 404 }
        );
      }
      
      // Check if match is already full
      if (match.filledSlots >= match.totalSlots) {
        console.log('Match is already full');
        return NextResponse.json(
          { error: 'Match is already full' },
          { status: 400 }
        );
      }
      
      // Check if user is already a player
      const isAlreadyPlayer = match.players?.some(
        player => player.user._id === userSanityId || player.user._ref === userSanityId
      );
      
      if (isAlreadyPlayer) {
        console.log('User is already a player in this match');
        return NextResponse.json(
          { error: 'User is already a player in this match' },
          { status: 400 }
        );
      }
      
      // Check match status
      if (match.status !== 'scheduled') {
        console.log(`Cannot join match with status: ${match.status}`);
        return NextResponse.json(
          { error: `Cannot join a match that is ${match.status}` },
          { status: 400 }
        );
      }
      
      console.log(`Adding user ${userSanityId} to match ${matchId}`);
      
      // Create a unique key for the player
      const playerKey = `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Add user to players array with the transaction
      transaction.patch(matchId, (patch) => 
        patch
          .setIfMissing({ players: [] })
          .append('players', [
            {
              _key: playerKey,
              user: {
                _type: 'reference',
                _ref: userSanityId,
              },
              confirmed: true,
              hasPaid: false,
              assignedPosition: 'unassigned',
            },
          ])
          .inc({ filledSlots: 1 })
      );
      
      // Execute the transaction
      const updatedMatch = await transaction.commit();
      
      console.log('User successfully joined match');
      
      // Return updated match data
      return NextResponse.json({ match: updatedMatch });
      
    } catch (patchError) {
      console.error('Error updating match:', patchError);
      return NextResponse.json(
        { error: 'Failed to update match', details: patchError instanceof Error ? patchError.message : String(patchError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error joining match:', error);
    return NextResponse.json(
      { error: 'Failed to join match', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}