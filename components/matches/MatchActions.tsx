// Enhanced MatchActions.tsx with payment integration
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Match, Payment } from '@/types/sanity';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
         AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
         AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserPlus, UserMinus, Clock, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PaymentComponent from '@/components/payments/PaymentComponent';

interface MatchActionsProps {
  match: Match;
  user: User;
  isCreator: boolean;
  isPlayer: boolean;
}

export default function MatchActions({ 
  match, 
  user, 
  isCreator, 
  isPlayer 
}: MatchActionsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [optimisticState, setOptimisticState] = useState<{
    isPlayer: boolean;
    isInQueue: boolean;
    filledSlots: number;
    hasPaid: boolean;
  }>({
    isPlayer,
    isInQueue: match.queue?.some(queuedUser => queuedUser.user._ref === user._id) || false,
    filledSlots: match.filledSlots,
    hasPaid: false
  });
  
  // Fetch payment status for this match
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Only check if user is a player
        if (!optimisticState.isPlayer) return;
        
        const response = await fetch('/api/payments');
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        
        const data = await response.json();
        const matchPayments = data.payments.filter((payment: Payment) => 
          payment.match._ref === match._id && 
          (payment.status === 'completed' || payment.status === 'pending')
        );
        
        setOptimisticState(prev => ({
          ...prev,
          hasPaid: matchPayments.length > 0
        }));
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };
    
    checkPaymentStatus();
  }, [match._id, optimisticState.isPlayer, user._id]);

  // Check if match is full
  const isFull = optimisticState.filledSlots >= match.totalSlots;
  
  // Check if user is in the queue already
  const isInQueue = optimisticState.isInQueue;

  // Handle join match
  const handleJoinMatch = async () => {
    try {
      setIsJoining(true);
      
      // If match is full, join the queue instead
      const endpoint = isFull 
        ? `/api/matches/${match._id}/queue` 
        : `/api/matches/${match._id}/join`;
      
      // Optimistic UI update
      if (isFull) {
        setOptimisticState(prev => ({
          ...prev,
          isInQueue: true
        }));
      } else {
        setOptimisticState(prev => ({
          ...prev,
          isPlayer: true,
          filledSlots: prev.filledSlots + 1
        }));
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Revert optimistic update on error
        setOptimisticState({
          isPlayer,
          isInQueue: match.queue?.some(queuedUser => queuedUser.user._ref === user._id) || false,
          filledSlots: match.filledSlots,
          hasPaid: optimisticState.hasPaid
        });
        
        throw new Error(data.error || 'Failed to join match');
      }
      
      if (isFull) {
        toast({
          title: "Added to waiting list",
          description: "You'll be automatically added to the match if a spot becomes available.",
          variant: "default",
        });
      } else {
        toast({
          title: "You've joined the match!",
          description: "You're now on the player list.",
          variant: "default",
        });
      }
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error joining match:', error);
      toast({
        title: "Failed to join match",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };
  
  // Handle leave match
  const handleLeaveMatch = async () => {
    try {
      setIsLeaving(true);
      
      // Determine if leaving the main list or queue
      const endpoint = optimisticState.isPlayer 
        ? `/api/matches/${match._id}/leave` 
        : `/api/matches/${match._id}/queue/leave`;
      
      // Optimistic UI update
      if (optimisticState.isPlayer) {
        setOptimisticState(prev => ({
          ...prev,
          isPlayer: false,
          filledSlots: prev.filledSlots - 1
        }));
      } else if (optimisticState.isInQueue) {
        setOptimisticState(prev => ({
          ...prev,
          isInQueue: false
        }));
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Revert optimistic update on error
        setOptimisticState({
          isPlayer,
          isInQueue: match.queue?.some(queuedUser => queuedUser.user._ref === user._id) || false,
          filledSlots: match.filledSlots,
          hasPaid: optimisticState.hasPaid
        });
        
        throw new Error(data.error || 'Failed to leave match');
      }
      
      toast({
        title: optimisticState.isPlayer ? "You've left the match" : "Removed from waiting list",
        description: optimisticState.isPlayer ? "You are no longer on the player list." : "You've been removed from the queue.",
        variant: "default",
      });
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error leaving match:', error);
      toast({
        title: "Failed to leave match",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLeaving(false);
    }
  };
  
  // Handle payment success
  const handlePaymentSuccess = () => {
    setOptimisticState(prev => ({
      ...prev,
      hasPaid: true
    }));
    router.refresh();
  };

  // If match is not scheduled, show appropriate message
  if (match.status !== 'scheduled') {
    return (
      <div className="rounded-lg border border-amber-500/20 bg-black/50 backdrop-blur-sm p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-amber-500/10 p-3 rounded-full mb-4">
            <Clock className="h-8 w-8 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Match is {match.status}
          </h3>
          <p className="text-white/70">
            {match.status === 'cancelled' 
              ? 'This match has been cancelled and is no longer available.' 
              : match.status === 'completed'
              ? 'This match has already been played.'
              : 'This match is currently in progress.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-500/20 bg-black/50 backdrop-blur-sm p-4">
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 mb-2">
          Match Actions
        </h3>
        
        {/* Match status info */}
        <div className={`bg-amber-500/10 p-3 rounded-md mb-2 flex items-start ${isFull ? 'border-l-4 border-amber-500' : ''}`}>
          <div className="flex items-start">
            <div>
              <p className="text-white font-medium">
                {optimisticState.filledSlots} of {match.totalSlots} spots filled
              </p>
              <p className="text-white/70 text-sm mt-1">
                {optimisticState.isPlayer
                  ? "You're confirmed for this match"
                  : optimisticState.isInQueue
                  ? "You're on the waiting list"
                  : isCreator
                  ? "You're organizing this match"
                  : "Join this match to reserve your spot"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Payment information for players */}
        {(optimisticState.isPlayer || isCreator) && (
          <div className={`p-3 rounded-md mb-2 flex items-start ${optimisticState.hasPaid ? 'bg-green-500/10 border-l-4 border-green-500' : 'bg-amber-500/10 border-l-4 border-amber-500'}`}>
            <div className="flex items-start">
              <div>
                <p className="text-white font-medium">
                  {optimisticState.hasPaid 
                    ? "Payment recorded for this match" 
                    : "Payment required for this match"}
                </p>
                <p className="text-white/70 text-sm mt-1">
                  {optimisticState.hasPaid 
                    ? "Your payment is being processed or has been confirmed" 
                    : `Cost per player: ${match.costPerPlayer || 'To be determined'}`}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <div className="flex flex-col space-y-3">
            {/* Join match button */}
            {!optimisticState.isPlayer && !isCreator && !optimisticState.isInQueue && (
              <Button
                onClick={handleJoinMatch}
                disabled={isJoining}
                className={`w-full ${
                  isFull
                    ? "bg-amber-700 hover:bg-amber-800"
                    : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                } text-black font-bold`}
              >
                {isJoining ? (
                  <>Processing...</>
                ) : (
                  <>
                    {isFull ? (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Join Waiting List
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Join Match
                      </>
                    )}
                  </>
                )}
              </Button>
            )}
            
            {/* Payment button - visible to players who haven't paid */}
            {optimisticState.isPlayer && !optimisticState.hasPaid && (
              <div>
                <PaymentComponent 
                  match={match} 
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </div>
            )}
            
            {/* Payment status - visible to players who have paid */}
            {optimisticState.isPlayer && optimisticState.hasPaid && (
              <Button
                disabled
                className="w-full bg-green-600 hover:bg-green-700 text-white cursor-default"
              >
                <Check className="mr-2 h-4 w-4" />
                Payment Recorded
              </Button>
            )}
            
            {/* Leave match / waiting list button */}
            {(optimisticState.isPlayer && !isCreator) || optimisticState.isInQueue ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-red-400 hover:text-red-300"
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    {optimisticState.isPlayer ? "Leave Match" : "Leave Waiting List"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-amber-500/20 bg-gray-900">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      {optimisticState.isPlayer ? "Leave match?" : "Leave waiting list?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-white/70">
                      {optimisticState.isPlayer 
                        ? optimisticState.hasPaid 
                          ? "Your payment record will remain, but you'll give up your spot."
                          : "Your spot will be given to the next person in the waiting list."
                        : "You'll lose your current position in the queue."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-amber-500/20 bg-gray-800 text-white hover:bg-gray-700 hover:text-white">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLeaveMatch}
                      disabled={isLeaving}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isLeaving ? "Processing..." : "Confirm"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
            
            {/* Match creation actions - only visible to creator */}
            {isCreator && (
              <div className="mt-4 space-y-2">
                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <a href={`/dashboard/matches/${match._id}/edit`}>
                    Edit Match Details
                  </a>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-red-400 hover:text-red-300"
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Cancel Match
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-amber-500/20 bg-gray-900">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">
                        Cancel this match?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-white/70">
                        This will notify all participants that the match has been cancelled.
                        Any recorded payments will need to be refunded manually.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-amber-500/20 bg-gray-800 text-white hover:bg-gray-700 hover:text-white">
                        Go Back
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          // Cancel match logic
                          fetch(`/api/matches/${match._id}`, {
                            method: 'PATCH',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              status: 'cancelled'
                            }),
                          }).then(() => {
                            toast({
                              title: "Match cancelled",
                              description: "All participants have been notified.",
                            });
                            router.refresh();
                          }).catch(error => {
                            console.error('Error cancelling match:', error);
                            toast({
                              title: "Failed to cancel match",
                              description: "Please try again later",
                              variant: "destructive",
                            });
                          });
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Cancel Match
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}