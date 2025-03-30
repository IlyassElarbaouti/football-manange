// app/api/payments/[id]/route.ts
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

// Helper to get a payment by ID with expanded references
async function getPaymentById(paymentId: string) {
  return client.fetch(
    `*[_type == "payment" && _id == $paymentId][0] {
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
    }`,
    { paymentId }
  );
}

// GET: Fetch a specific payment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/payments/${params.id} - Fetching payment details`);
    
    const { userId } = await auth();
    
    if (!userId) {
      console.log('Authentication failed - No userId found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const paymentId = params.id;
    const payment = await getPaymentById(paymentId);
    
    if (!payment) {
      console.log(`Payment ${paymentId} not found`);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ payment });
    
  } catch (error) {
    console.error(`Error fetching payment ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch payment', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PATCH: Update a payment details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`PATCH /api/payments/${params.id} - Updating payment`);
    
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
    
    const paymentId = params.id;
    
    // Get the payment to update
    const payment = await getPaymentById(paymentId);
    
    if (!payment) {
      console.log(`Payment ${paymentId} not found`);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const updateData = await request.json();
    console.log('Payment update data:', JSON.stringify(updateData, null, 2));
    
    // Update the payment
    const updatedPayment = await client
      .patch(paymentId)
      .set(updateData)
      .commit();
    
    // If changing status to completed and it was previously pending
    if (updateData.status === 'completed' && payment.status !== 'completed') {
      // Update match status to show the payment is confirmed
      await client
        .patch(payment.match._id)
        .set({ paymentConfirmed: true })
        .commit();
    }
    
    // If updating match details or time slot, also update the match reference
    if (updateData.playDate || updateData.timeSlot || updateData.matchDetails) {
      // Build update object for the match
      const matchUpdate: any = {};
      
      if (updateData.playDate) {
        matchUpdate.playDate = updateData.playDate;
      }
      
      if (updateData.timeSlot) {
        matchUpdate.timeSlot = updateData.timeSlot;
      }
      
      if (updateData.matchDetails) {
        matchUpdate.matchDetails = updateData.matchDetails;
      }
      
      // Only update if we have data to update
      if (Object.keys(matchUpdate).length > 0) {
        await client
          .patch(payment.match._id)
          .set(matchUpdate)
          .commit();
      }
    }
    
    return NextResponse.json({ payment: updatedPayment });
    
  } catch (error) {
    console.error(`Error updating payment ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update payment', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Delete a payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`DELETE /api/payments/${params.id} - Deleting payment`);
    
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
    
    const paymentId = params.id;
    
    // Get the payment to delete
    const payment = await getPaymentById(paymentId);
    
    if (!payment) {
      console.log(`Payment ${paymentId} not found`);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // Only allow deletion by the user who created it
    if (payment.user._id !== user._id && !user.isAdmin) {
      console.log('User not authorized to delete this payment');
      return NextResponse.json(
        { error: 'Not authorized to delete this payment' },
        { status: 403 }
      );
    }
    
    // Update the match to remove payment reference
    await client
      .patch(payment.match._id)
      .unset(['paidBy', 'hasPayment', 'paymentConfirmed', 'playDate', 'timeSlot', 'matchDetails'])
      .commit();
    
    // Delete the payment
    await client.delete(paymentId);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error(`Error deleting payment ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete payment', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}