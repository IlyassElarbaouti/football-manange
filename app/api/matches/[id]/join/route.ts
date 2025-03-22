import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@sanity/client';
import { getMatchById } from '@/lib/sanity/utils';

// Create a server-side Sanity client with the token
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID  ;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03';
const token = process.env.SANITY_API_TOKEN;

// Log token presence for debugging
console.log(`SANITY_API_TOKEN present in join match API: ${!!token}`);

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
    
    // Get the match from Sanity
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
    
    // Check if user is already a player
    const isAlreadyPlayer = match.players?.some(
      player => player.user._id === userSanityId
    );
    
    if (isAlreadyPlayer) {
      console.log('User is already a player in this match');
      return NextResponse.json(
        { error: 'User is already a player in this match' },
        { status: 400 }
      );
    }
    
    try {
      console.log(`Adding user ${userSanityId} to match ${matchId}`);
      
      // Add user to players array and increment filledSlots
      const updatedMatch = await client
        .patch(matchId)
        .setIfMissing({ players: [] })
        .append('players', [
          {
            _key: `player_${Date.now()}`,
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
        .commit();
      
      console.log('User successfully joined match');
      
      // Potentially send notification via Telegram bot here
      
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