// app/api/payments/route.ts
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

// GET: Fetch all payments (visible to everyone)
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/payments - Fetching all payments');
    
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
    
    // Fetch all payments with user and match details
    const payments = await client.fetch(
      `*[_type == "payment"] | order(date desc) {
        _id,
        user->{
          _id,
          name,
          email,
          profileImage
        },
        match->{
          _id,
          title,
          date,
          venue->{
            name,
            address
          }
        },
        amount,
        date,
        method,
        status,
        notes,
        playDate,
        timeSlot,
        matchDetails
      }`
    );
    
    return NextResponse.json({ payments });
    
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST: Create a new payment
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/payments - Creating a new payment');
    
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
    
    // Parse request body
    const body = await request.json();
    console.log('Received payment data:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.match || !body.amount || !body.method) {
      return NextResponse.json(
        { error: 'Missing required fields: match, amount, and method are required' },
        { status: 400 }
      );
    }
    
    // Check if a payment already exists for this match
    const existingPayments = await client.fetch(
      `*[_type == "payment" && match._ref == $matchId] {
        _id,
        user->{_id}
      }`,
      { matchId: body.match._ref }
    );
    
    if (existingPayments && existingPayments.length > 0) {
      return NextResponse.json(
        { error: 'A payment has already been recorded for this match. Only one payment per match is allowed.' },
        { status: 400 }
      );
    }
    
    // Add user reference, additional fields, and current date
    const paymentData = {
      _type: 'payment',
      user: {
        _type: 'reference',
        _ref: user._id,
      },
      match: body.match,
      amount: body.amount,
      date: new Date().toISOString(),
      method: body.method,
      status: body.status || 'pending',
      notes: body.notes || '',
      // Additional fields for match details
      playDate: body.playDate || null,
      timeSlot: body.timeSlot || null,
      matchDetails: body.matchDetails || ''
    };
    
    // Create payment in Sanity
    console.log('Creating payment in Sanity with data:', JSON.stringify(paymentData, null, 2));
    const payment = await client.create(paymentData);
    console.log('Payment created successfully:', payment._id);
    
    // Update match to show who paid
    await client.patch(body.match._ref)
      .set({ 
        paidBy: {
          _type: 'reference',
          _ref: user._id
        },
        hasPayment: true 
      })
      .commit();
    
    return NextResponse.json(
      { payment, success: true },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}