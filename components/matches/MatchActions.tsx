'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Match } from '@/types/sanity';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  UserPlus, 
  UserMinus, 
  Calendar, 
  AlertTriangle, 
  Users, 
  XCircle, 
  Clock, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MatchEditForm from './MatchEditForm';

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
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showQueueDialog, setShowQueueDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Check if match is full
  const isFull = match.filledSlots >= match.totalSlots;
  
  // Check if user is in the queue already
  const isInQueue = match.queue?.some(queuedUser => 
    queuedUser.user._id === user._id
  );

  // Handle join match
  const handleJoinMatch = async () => {
    try {
      setIsJoining(true);
      
      // Determine if joining the main list or queue
      const endpoint = isFull 
        ? `/api/matches/${match._id}/queue` 
        : `/api/matches/${match._id}/join`;
      
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
      const endpoint = isPlayer 
        ? `/api/matches/${match._id}/leave` 
        : `/api/matches/${match._id}/queue/leave`;
      
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
        throw new Error(data.error || 'Failed to leave match');
      }
      
      toast({
        title: isPlayer ? "You've left the match" : "Removed from waiting list",
        description: isPlayer ? "You are no longer on the player list." : "You've been removed from the queue.",
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
  
  // Handle cancel match (for creators only)
  const handleCancelMatch = async () => {
    try {
      setIsCancelling(true);
      
      const response = await fetch(`/api/matches/${match._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel match');
      }
      
      toast({
        title: "Match cancelled",
        description: "All players have been notified.",
        variant: "default",
      });
      
      // Redirect to matches page
      router.push('/dashboard/matches');
      router.refresh();
    } catch (error) {
      console.error('Error cancelling match:', error);
      toast({
        title: "Failed to cancel match",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle delete match (for creators only)
  const handleDeleteMatch = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/matches/${match._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete match');
      }
      
      toast({
        title: "Match deleted",
        description: "The match has been permanently deleted.",
        variant: "default",
      });
      
      // Redirect to matches page
      router.push('/dashboard/matches');
      router.refresh();
    } catch (error) {
      console.error('Error deleting match:', error);
      toast({
        title: "Failed to delete match",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // If match is cancelled or completed, show a message
  if (match.status === 'cancelled' || match.status === 'completed') {
    return (
      <div className="rounded-lg border border-amber-500/20 bg-black/50 backdrop-blur-sm p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-amber-500/10 p-3 rounded-full mb-4">
            {match.status === 'cancelled' ? (
              <XCircle className="h-8 w-8 text-red-400" />
            ) : (
              <Calendar className="h-8 w-8 text-green-400" />
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {match.status === 'cancelled' ? 'Match Cancelled' : 'Match Completed'}
          </h3>
          <p className="text-white/70">
            {match.status === 'cancelled' 
              ? 'This match has been cancelled and is no longer available.' 
              : 'This match has already been played.'}
          </p>
          
          {/* Even if match is cancelled/completed, creator can still delete it */}
          {isCreator && (
            <div className="mt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Match
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-amber-500/20 bg-gray-900">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      Delete this match?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-white/70">
                      This will permanently delete the match and cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-amber-500/20 bg-gray-800 text-white hover:bg-gray-700 hover:text-white">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteMatch}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isDeleting ? "Processing..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Edit dialog content
  const EditDialog = (
    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent className="border-amber-500/20 bg-gray-900 p-0 max-w-4xl max-h-[90vh] overflow-y-auto">
        <MatchEditForm match={match} onCancel={() => setShowEditDialog(false)} />
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="rounded-lg border border-amber-500/20 bg-black/50 backdrop-blur-sm p-6">
      <div className="flex flex-col space-y-4">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 mb-2">
          Match Actions
        </h3>
        
        {/* Match status info */}
        <div className="bg-amber-500/10 p-4 rounded-md mb-2">
          {isFull && !isPlayer ? (
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">This match is currently full</p>
                <p className="text-white/70 text-sm mt-1">
                  You can join the waiting list and will be automatically added if a spot becomes available.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">
                  {match.filledSlots} of {match.totalSlots} spots filled
                </p>
                <p className="text-white/70 text-sm mt-1">
                  {isPlayer
                    ? "You're confirmed for this match"
                    : isInQueue
                    ? "You're on the waiting list"
                    : "Join this match to reserve your spot"}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Creator-specific actions */}
        {isCreator && (
          <div className="space-y-3 mb-2">
            <h4 className="text-sm font-medium text-amber-400 uppercase">Organizer Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowEditDialog(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Match
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-red-400 hover:text-red-300"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Match
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-amber-500/20 bg-gray-900">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      Cancel this match?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-white/70">
                      This will notify all players and remove the match from the schedule.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-amber-500/20 bg-gray-800 text-white hover:bg-gray-700 hover:text-white">
                      Back
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelMatch}
                      disabled={isCancelling}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isCancelling ? "Processing..." : "Cancel Match"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Match
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-amber-500/20 bg-gray-900">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      Delete this match?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-white/70">
                      This will permanently delete the match and cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-amber-500/20 bg-gray-800 text-white hover:bg-gray-700 hover:text-white">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteMatch}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isDeleting ? "Processing..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
        
        {/* Player actions */}
        <div className="space-y-3">
          {isCreator ? (
            <h4 className="text-sm font-medium text-amber-400 uppercase">Player Actions</h4>
          ) : null}
          
          <div className="flex flex-col space-y-3">
            {/* Join match button */}
            {!isPlayer && !isCreator && !isInQueue && (
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
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
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
            
            {/* Leave match / waiting list button */}
            {(isPlayer || isInQueue) && !isCreator && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-red-400 hover:text-red-300"
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    {isPlayer ? "Leave Match" : "Leave Waiting List"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-amber-500/20 bg-gray-900">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      {isPlayer ? "Leave match?" : "Leave waiting list?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-white/70">
                      {isPlayer 
                        ? "Your spot will be given to the next person in the waiting list."
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
            )}
            
            {/* View waiting list (for everyone) */}
            {match.queue && match.queue.length > 0 && (
              <Button
                variant="outline"
                className="w-full border-amber-500/20 bg-gray-800/30 text-white hover:bg-gray-800/50 hover:text-amber-400"
                onClick={() => setShowQueueDialog(true)}
              >
                <Users className="mr-2 h-4 w-4" />
                View Waiting List ({match.queue.length})
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Waiting List Dialog */}
      <Dialog open={showQueueDialog} onOpenChange={setShowQueueDialog}>
        <DialogContent className="border-amber-500/20 bg-gray-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-400">Waiting List</DialogTitle>
            <DialogDescription className="text-white/70">
              People in the queue will automatically join if spots become available.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto space-y-2 py-2">
            {match.queue?.map((queueItem, index) => (
              <div 
                key={queueItem.user._id} 
                className="flex items-center p-2 rounded-md hover:bg-amber-500/5 border border-amber-500/10"
              >
                <div className="bg-amber-500/10 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <span className="text-amber-400 text-sm font-medium">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {queueItem.user.name}
                    {queueItem.user._id === user._id && (
                      <span className="ml-2 text-xs text-amber-400">(You)</span>
                    )}
                  </p>
                  <p className="text-sm text-white/60">
                    Joined queue: {new Date(queueItem.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button 
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold"
              onClick={() => setShowQueueDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Match Dialog */}
      {EditDialog}
    </div>
  );
}