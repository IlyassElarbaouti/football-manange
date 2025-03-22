import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@sanity/client';
import { getUserByClerkId } from '@/lib/sanity/utils';

// Create a server-side Sanity client with the token
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID  ;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03';
const token = process.env.SANITY_API_TOKEN;

// Log token presence (not the actual token) for debugging
console.log(`SANITY_API_TOKEN present in matches API: ${!!token}`);

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

// Helper function to create a match directly with the server-side client
async function createMatchInSanity(matchData) {
  try {
    console.log('Creating match in Sanity with data structure:', 
      JSON.stringify({
        _type: 'match',
        title: matchData.title,
        date: matchData.date,
        venue: matchData.venue,
        matchType: matchData.matchType,
        totalSlots: matchData.totalSlots,
        filledSlots: matchData.filledSlots,
        createdBy: matchData.createdBy,
        players: matchData.players?.length,
        status: matchData.status
      }, null, 2)
    );
    
    return client.create({
      _type: 'match',
      ...matchData
    });
  } catch (error) {
    console.error('Error in createMatch:', error);
    throw error;
  }
}

// Helper function to find all matches using the server-side client
async function getAllMatchesFromSanity() {
  try {
    console.log('Fetching all matches from Sanity');
    return client.fetch(
      `*[_type == "match"] | order(date desc)`
    );
  } catch (error) {
    console.error('Error in getAllMatches:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const matches = await getAllMatchesFromSanity();
    
    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/matches - Creating a new match');
    const { userId } = await auth();
    
    if (!userId) {
      console.log('Authentication failed - No userId found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get Sanity user from Clerk ID using the server-side client
    console.log('Getting Sanity user from Clerk ID:', userId);
    const user = await getUserByClerkId(userId);
    
    if (!user) {
      console.log('User not found in Sanity database');
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    console.log('Received match data:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.title || !data.date || !data.venue || !data.matchType || !data.totalSlots) {
      console.log('Missing required fields:', {
        title: !!data.title,
        date: !!data.date,
        venue: !!data.venue,
        matchType: !!data.matchType,
        totalSlots: !!data.totalSlots
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Add creator reference
    console.log('Setting creator reference, user._id:', user._id);
    data.createdBy = {
      _type: 'reference',
      _ref: user._id,
    };
    
    // Set initial filledSlots to 1 (the creator)
    data.filledSlots = 1;
    
    // Add creator as first player
    data.players = [
      {
        _key: `player_${Date.now()}`,
        user: {
          _type: 'reference',
          _ref: user._id,
        },
        confirmed: true,
        hasPaid: false,
        assignedPosition: user.preferredPosition || 'unassigned',
      },
    ];
    
    console.log('Creating match in Sanity with data:', JSON.stringify({
      ...data,
      // Leave out long fields for clarity
      notes: data.notes ? `${data.notes.substring(0, 30)}...` : undefined
    }, null, 2));
    
    try {
      // Create match in Sanity with the server-side client
      const match = await createMatchInSanity(data);
      console.log('Match created successfully:', match._id);
      
      // Potentially send notifications via Telegram bot here
      
      return NextResponse.json({ match }, { status: 201 });
    } catch (createError) {
      console.error('Error creating match in Sanity:', createError);
      return NextResponse.json(
        { error: 'Failed to create match in Sanity', details: createError instanceof Error ? createError.message : String(createError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: 'Failed to create match', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}