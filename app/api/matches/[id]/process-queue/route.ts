
// app/api/matches/[id]/process-queue/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@sanity/client';
import { getMatchById, getUserByClerkId } from '@/lib/sanity/utils';

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
    console.log(`POST /api/matches/${params.id}/process-queue - Processing queue`);
    
    const { userId } = await auth();
    
    if (!userId) {
      console.log('Authentication failed - No userId found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get current user
    const user = await getUserByClerkId(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
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
    
    // Check if user is authorized (creator or admin)
    const isCreator = match.createdBy?._id === user._id;
    const isAdmin = user.isAdmin;
    
    if (!isCreator && !isAdmin) {
      console.log('User not authorized to process queue');
      return NextResponse.json(
        { error: 'Not authorized to process queue' },
        { status: 403 }
      );
    }
    
    // Check if there are available slots
    const availableSlots = match.totalSlots - match.filledSlots;
    
    if (availableSlots <= 0) {
      console.log('No available slots to fill from queue');
      return NextResponse.json(
        { error: 'No available slots to fill from queue' },
        { status: 400 }
      );
    }
    
    // Check if there are users in the queue
    if (!match.queue || match.queue.length === 0) {
      console.log('No users in the queue');
      return NextResponse.json(
        { error: 'No users in the queue' },
        { status: 400 }
      );
    }
    
    try {
      console.log(`Processing queue for match ${matchId}`);
      
      // Number of users to move from queue to players
      const playersToAdd = Math.min(availableSlots, match.queue.length);
      
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
      
      // Update match: add players, remove from queue, update filledSlots
      const updatedMatch = await client
        .patch(matchId)
        .setIfMissing({ players: [] })
        .append('players', newPlayers)
        .unset(keysToRemove)
        .inc({ filledSlots: playersToAdd })
        .commit();
      
      console.log(`Successfully added ${playersToAdd} players from queue`);
      
      return NextResponse.json({ 
        match: updatedMatch,
        added: playersToAdd,
        remaining: match.queue.length - playersToAdd
      });
    } catch (patchError) {
      console.error('Error processing queue:', patchError);
      return NextResponse.json(
        { error: 'Failed to process queue', details: patchError instanceof Error ? patchError.message : String(patchError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing queue:', error);
    return NextResponse.json(
      { error: 'Failed to process queue', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}