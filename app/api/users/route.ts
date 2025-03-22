import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@sanity/client';

// Create a server-side Sanity client with the token
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03';
const token = process.env.SANITY_API_TOKEN;

// Log token presence (not the actual token) for debugging
console.log(`SANITY_API_TOKEN present: ${!!token}`);

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

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/users - Creating a new user');
    const { userId } = await auth();
    
    if (!userId) {
      console.log('Authentication failed - No userId found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const data = await request.json();
    console.log('Received user data:', JSON.stringify(data, null, 2));
    
    if (!data.userData || !data.userData.clerkId) {
      return NextResponse.json(
        { error: 'Missing user data or clerkId' },
        { status: 400 }
      );
    }
    
    // Make sure clerkId matches authenticated user
    if (data.userData.clerkId !== userId) {
      return NextResponse.json(
        { error: 'ClerkId mismatch with authenticated user' },
        { status: 403 }
      );
    }
    
    // Check if user already exists
    const existingUser = await getUserByClerkId(userId);
    if (existingUser) {
      return NextResponse.json(
        { user: existingUser, message: 'User already exists' },
        { status: 200 }
      );
    }
    
    // Create the user - this is now server-side with access to the token
    console.log('Creating user with data:', JSON.stringify({
      _type: 'user',
      clerkId: data.userData.clerkId,
      name: data.userData.name,
      email: data.userData.email
      // Other fields omitted for brevity
    }, null, 2));
    
    // Ensure required fields
    const userData = {
      _type: 'user',
      clerkId: data.userData.clerkId,
      name: data.userData.name || 'User',
      email: data.userData.email || `user-${Date.now()}@example.com`,
      preferredPosition: data.userData.preferredPosition || 'any',
      skillLevel: data.userData.skillLevel || 75,
      isAdmin: data.userData.isAdmin || false,
      matchesPlayed: data.userData.matchesPlayed || 0,
      matchesPaid: data.userData.matchesPaid || 0,
      totalPayments: data.userData.totalPayments || 0
    };
    
    try {
      // Attempt to create the user using the server-side client with token
      const user = await client.create(userData);
      console.log('User created successfully:', user._id);
      
      return NextResponse.json(
        { user, message: 'User created successfully' },
        { status: 201 }
      );
    } catch (createError) {
      console.error('Error creating user in Sanity:', createError);
      
      // Get more detail on the error
      let errorMessage = 'Failed to create user';
      if (createError instanceof Error) {
        errorMessage = createError.message;
        
        // Extract and log detailed validation errors if present
        if (typeof createError === 'object' && createError !== null) {
          const details = (createError as any).details;
          if (details) {
            console.error('Validation details:', JSON.stringify(details, null, 2));
            errorMessage += `: ${JSON.stringify(details)}`;
          }
        }
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: createError instanceof Error ? createError.message : String(createError)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error in user creation API:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}