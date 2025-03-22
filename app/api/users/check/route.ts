import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

// Create a server-side Sanity client with the token
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID  ;
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

// Helper function to find user by clerk ID
async function getUserByClerkId(clerkId: string) {
  try {
    return await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]`,
      { clerkId }
    );
  } catch (error) {
    console.error(`Error fetching user with clerkId ${clerkId}:`, error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the clerkId from query params
    const url = new URL(request.url);
    const clerkId = url.searchParams.get('clerkId');
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Missing clerkId parameter' },
        { status: 400 }
      );
    }
    
    // Check if the user exists
    const user = await getUserByClerkId(clerkId);
    
    if (user) {
      return NextResponse.json({
        exists: true,
        user
      });
    } else {
      return NextResponse.json({
        exists: false
      });
    }
  } catch (error) {
    console.error('Error checking user existence:', error);
    return NextResponse.json(
      { error: 'Failed to check user', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}