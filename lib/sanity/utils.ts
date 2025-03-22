import { groq } from 'next-sanity';
import { createClient } from '@sanity/client';
import { User, Match, Venue, Payment, Achievement, Notification, TelegramSettings } from '@/types/sanity';

// Create a server-side Sanity client with the token for server-side operations
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03';
const token = process.env.SANITY_API_TOKEN;

// Client for server-side operations
const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

// Client for client-side operations (no token)
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
});

// User queries
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  try {
    console.log(`Finding user with Clerk ID: ${clerkId}`);
    // Use the server client with the token
    return serverClient.fetch(
      groq`*[_type == "user" && clerkId == $clerkId][0]`,
      { clerkId }
    );
  } catch (error) {
    console.error(`Error in getUserByClerkId for clerk ID ${clerkId}:`, error);
    throw error;
  }
}

export async function createUser(userData: Omit<User, '_id' | '_type'>): Promise<User> {
  try {
    console.log('Creating user in Sanity with data:',
      JSON.stringify({
        _type: 'user',
        clerkId: userData.clerkId,
        name: userData.name,
        email: userData.email,
        // Omit other fields for clarity
        preferredPosition: userData.preferredPosition
      }, null, 2)
    );
    
    // Ensure required fields have defaults
    const userDataWithDefaults = {
      ...userData,
      preferredPosition: userData.preferredPosition || 'any',
      skillLevel: userData.skillLevel || 75,
      isAdmin: userData.isAdmin || false,
      matchesPlayed: userData.matchesPlayed || 0,
      matchesPaid: userData.matchesPaid || 0,
      totalPayments: userData.totalPayments || 0
    };
    
    // Use the server client with the token
    const newUser = await serverClient.create({
      _type: 'user',
      ...userDataWithDefaults
    });
    
    console.log(`User created successfully with ID: ${newUser._id}`);
    return newUser;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

// Match queries
export async function getAllMatches(): Promise<Match[]> {
  try {
    console.log('Fetching all matches from Sanity');
    return serverClient.fetch(
      groq`*[_type == "match"] | order(date desc)`
    );
  } catch (error) {
    console.error('Error in getAllMatches:', error);
    throw error;
  }
}

export async function getUpcomingMatches(): Promise<Match[]> {
  try {
    const now = new Date().toISOString();
    console.log('Fetching upcoming matches from Sanity');
    return serverClient.fetch(
      groq`*[_type == "match" && date > $now && status != "cancelled"] | order(date asc)`,
      { now }
    );
  } catch (error) {
    console.error('Error in getUpcomingMatches:', error);
    throw error;
  }
}

export async function getMatchById(matchId: string): Promise<Match | null> {
  try {
    console.log(`Fetching match by ID: ${matchId}`);
    return serverClient.fetch(
      groq`*[_type == "match" && _id == $matchId][0]{
        ...,
        venue->{
          name,
          address,
          image,
          hourlyRate,
          amenities
        },
        createdBy->{
          name,
          profileImage
        },
        "players": players[]{
          ...,
          user->{
            _id,
            name,
            profileImage,
            preferredPosition,
            skillLevel
          }
        }
      }`,
      { matchId }
    );
  } catch (error) {
    console.error(`Error in getMatchById for matchId ${matchId}:`, error);
    throw error;
  }
}

export async function createMatch(matchData: Omit<Match, '_id' | '_type'>): Promise<Match> {
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
    
    // Use the server client with the token
    return serverClient.create({
      _type: 'match',
      ...matchData
    });
  } catch (error) {
    console.error('Error in createMatch:', error);
    throw error;
  }
}

// Venue queries
export async function getAllVenues(): Promise<Venue[]> {
  try {
    console.log('Fetching all venues from Sanity');
    return serverClient.fetch(
      groq`*[_type == "venue"] | order(name asc)`
    );
  } catch (error) {
    console.error('Error in getAllVenues:', error);
    throw error;
  }
}

export async function getVenueById(venueId: string): Promise<Venue | null> {
  try {
    console.log(`Fetching venue by ID: ${venueId}`);
    return serverClient.fetch(
      groq`*[_type == "venue" && _id == $venueId][0]`,
      { venueId }
    );
  } catch (error) {
    console.error(`Error in getVenueById for venueId ${venueId}:`, error);
    throw error;
  }
}

// Helper function to generate image URLs with the Sanity image pipeline
import imageUrlBuilder from '@sanity/image-url';
const builder = imageUrlBuilder({ projectId, dataset });

export function urlFor(source: any) {
  return builder.image(source);
}