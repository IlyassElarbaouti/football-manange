import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@sanity/client';
import { getMatchById, getUserByClerkId } from '@/lib/sanity/utils';

// Create a server-side Sanity client with the token
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID  ;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03';
const token = process.env.SANITY_API_TOKEN;

// Log token presence for debugging
console.log(`SANITY_API_TOKEN present in match detail API: ${!!token}`);

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/matches/${params.id} - Fetching match details`);
    
    const matchId = params.id;
    console.log(`Match ID: ${matchId}`);
    
    const match = await getMatchById(matchId);
    
    if (!match) {
      console.log('Match not found');
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ match });
  } catch (error) {
    console.error('Error fetching match:', error);
    return NextResponse.json(
      { error: 'Failed to fetch match', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`PATCH /api/matches/${params.id} - Updating match`);
    
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
    
    // Get the Sanity user
    const user = await getUserByClerkId(userId);
    
    if (!user) {
      console.log('User not found in Sanity database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the creator or admin
    const isCreator = match.createdBy?._id === user._id;
    const isAdmin = user.isAdmin;
    
    if (!isCreator && !isAdmin) {
      console.log('User not authorized to update this match');
      return NextResponse.json(
        { error: 'Not authorized to update this match' },
        { status: 403 }
      );
    }
    
    // Get the update data
    const updateData = await request.json();
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    
    // If cancelling the match, check if it's already completed
    if (updateData.status === 'cancelled' && match.status === 'completed') {
      console.log('Cannot cancel a completed match');
      return NextResponse.json(
        { error: 'Cannot cancel a completed match' },
        { status: 400 }
      );
    }
    
    try {
      console.log(`Updating match ${matchId} with data:`, JSON.stringify(updateData, null, 2));
      
      // Update the match
      const updatedMatch = await client
        .patch(matchId)
        .set(updateData)
        .commit();
      
      console.log('Match updated successfully');
      
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
    console.error('Error updating match:', error);
    return NextResponse.json(
      { error: 'Failed to update match', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`DELETE /api/matches/${params.id} - Deleting match`);
    
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
    
    // Get the Sanity user
    const user = await getUserByClerkId(userId);
    
    if (!user) {
      console.log('User not found in Sanity database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the creator or admin
    const isCreator = match.createdBy?._id === user._id;
    const isAdmin = user.isAdmin;
    
    // Allow match creators to delete their own matches
    if (!isCreator && !isAdmin) {
      console.log('User not authorized to delete this match');
      return NextResponse.json(
        { error: 'Not authorized to delete this match' },
        { status: 403 }
      );
    }
    
    try {
      console.log(`Deleting match ${matchId}`);
      
      // Delete the match
      await client.delete(matchId);
      
      console.log('Match deleted successfully');
      
      return NextResponse.json({ success: true });
    } catch (deleteError) {
      console.error('Error deleting match:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete match', details: deleteError instanceof Error ? deleteError.message : String(deleteError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting match:', error);
    return NextResponse.json(
      { error: 'Failed to delete match', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}