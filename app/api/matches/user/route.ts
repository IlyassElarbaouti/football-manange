// app/api/matches/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@sanity/client';
import { getUserByClerkId } from '@/lib/sanity/utils';

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

// GET: Fetch all matches the user is participating in
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/matches/user - Fetching user matches');
    
    const { userId } = await auth();
    
    if (!userId) {
      console.log('Authentication failed - No userId found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
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
    
    // Fetch all matches where user is a player or creator
    const matches = await client.fetch(
      `*[_type == "match" && (
        createdBy._ref == $userId ||
        count(players[user._ref == $userId]) > 0
      )] | order(date desc) {
        _id,
        title,
        date,
        venue->{
          name,
          address
        },
        matchType,
        totalSlots,
        filledSlots,
        totalCost,
        costPerPlayer,
        status,
        createdBy,
        players,
        visibility
      }`,
      { userId: user._id }
    );
    
    return NextResponse.json({ matches });
    
  } catch (error) {
    console.error('Error fetching user matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user matches', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}