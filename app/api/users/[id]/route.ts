// app/api/users/[id]/route.ts
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`PATCH /api/users/${params.id} - Updating user`);
    
    const { userId } = await auth();
    
    if (!userId) {
      console.log('Authentication failed - No userId found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get the authenticated user
    const authUser = await getUserByClerkId(userId);
    
    if (!authUser) {
      console.log('User not found in Sanity database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if the authenticated user is updating their own profile
    if (authUser._id !== params.id && !authUser.isAdmin) {
      console.log('User not authorized to update this profile');
      return NextResponse.json(
        { error: 'Not authorized to update this profile' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const updateData = await request.json();
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    
    // Update the user in Sanity
    const updatedUser = await client
      .patch(params.id)
      .set({
        name: updateData.name,
        email: updateData.email,
        telegramUsername: updateData.telegramUsername,
        preferredPosition: updateData.preferredPosition,
        skillLevel: updateData.skillLevel,
        availableDays: updateData.availableDays,
      })
      .commit();
    
    console.log('User updated successfully');
    
    return NextResponse.json({ user: updatedUser });
    
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}