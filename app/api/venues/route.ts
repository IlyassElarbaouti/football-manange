import { NextResponse } from 'next/server';
import { getAllVenues } from '@/lib/sanity/utils';

export async function GET() {
  try {
    console.log('Venues API route called');
    const venues = await getAllVenues();
    console.log(`Retrieved ${venues?.length || 0} venues from Sanity`);
    
    return NextResponse.json({ venues });
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venues', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}