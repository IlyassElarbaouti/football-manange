// components/payments/PaymentComponent.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, CreditCard, ArrowRight, CalendarIcon, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Match } from '@/types/sanity';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface PaymentComponentProps {
  match: Match;
  onPaymentSuccess?: () => void;
  existingPayment?: any;
}

export default function PaymentComponent({ match, onPaymentSuccess, existingPayment }: PaymentComponentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState(existingPayment?.method || 'cash');
  const [paymentNote, setPaymentNote] = useState(existingPayment?.notes || '');
  const [selectedDate, setSelectedDate] = useState(existingPayment?.playDate || format(new Date(match.date), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState(existingPayment?.timeSlot || '19:00');
  const [additionalDetails, setAdditionalDetails] = useState(existingPayment?.matchDetails || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [step, setStep] = useState(existingPayment ? 2 : 1); // Step 1: Payment, Step 2: Match Details

  // Calculate payment amount based on match data
  const amount = match.costPerPlayer || 
    (match.totalCost ? Math.ceil(match.totalCost / match.totalSlots) : 500);

  // Handle payment submission
  const handleSubmitPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // If we're in step 1 (initial payment recording)
      if (step === 1) {
        const paymentData = {
          match: {
            _type: 'reference',
            _ref: match._id,
          },
          amount,
          method: paymentMethod,
          notes: paymentNote,
          status: 'pending',
        };
        
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to submit payment');
        }
        
        const data = await response.json();
        
        toast({
          title: "Payment record submitted",
          description: "Now you can set match details and time slot.",
        });
        
        // Move to step 2 for match details
        setStep(2);
        setIsSubmitting(false);
        
        // Store the payment ID for later update
        localStorage.setItem(`payment_${match._id}`, data.payment._id);
        
      } else {
        // We're in step 2 (adding match details)
        const paymentId = existingPayment?._id || localStorage.getItem(`payment_${match._id}`);
        
        if (!paymentId) {
          throw new Error('Payment information not found');
        }
        
        const updateData = {
          timeSlot: selectedTime,
          playDate: selectedDate,
          matchDetails: additionalDetails,
        };
        
        const response = await fetch(`/api/payments/${paymentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update match details');
        }
        
        toast({
          title: "Match details saved",
          description: "Your match details and time have been recorded.",
        });
        
        // Close dialog and reset all
        setIsDialogOpen(false);
        
        // Call success callback if provided
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
        
        // Refresh data
        router.refresh();
      }
    } catch (error) {
      console.error('Error with payment process:', error);
      toast({
        title: step === 1 ? "Failed to submit payment" : "Failed to update match details",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating just the match details for an existing payment
  const handleUpdateMatchDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updateData = {
        timeSlot: selectedTime,
        playDate: selectedDate,
        matchDetails: additionalDetails,
      };
      
      const response = await fetch(`/api/payments/${existingPayment._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update match details');
      }
      
      toast({
        title: "Match details updated",
        description: "Your match details and time have been updated.",
      });
      
      // Close dialog
      setIsDialogOpen(false);
      
      // Refresh data
      router.refresh();
      
      // Call success callback if provided
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (error) {
      console.error('Error updating match details:', error);
      toast({
        title: "Failed to update details",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          className={`w-full ${existingPayment 
            ? "bg-blue-600 hover:bg-blue-700 text-white" 
            : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black"} font-medium`}
        >
          {existingPayment ? "Update Match Details" : "Record Payment"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-amber-500/20 bg-gray-900 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {step === 1 ? "Record Payment" : (existingPayment ? "Update Match Details" : "Set Match Details")}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {step === 1 
              ? `Record your payment for ${match.title}`
              : "Provide match details and preferred time slot"}
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 ? (
          // Step 1: Payment recording form
          <form onSubmit={(e) => { e.preventDefault(); handleSubmitPayment(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-white">
                Amount
              </Label>
              <div className="flex h-10 items-center rounded-md border border-amber-500/20 bg-gray-800/50 px-3 text-white">
                {amount}₽
              </div>
              <p className="text-xs text-amber-400/80">
                Payment amount per player
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method" className="text-white">
                Payment Method
              </Label>
              <Select 
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger
                  id="method"
                  className="border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400"
                >
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="border-amber-500/20 bg-gray-900">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Add any payment details..."
                className="border-amber-500/20 bg-gray-800/50 text-white placeholder:text-white/50 focus:border-amber-400"
              />
            </div>
            
            <DialogFooter className="mt-4">
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Submit Payment Record
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          // Step 2: Match details form
          <form onSubmit={existingPayment ? handleUpdateMatchDetails : handleSubmitPayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playDate" className="text-white">
                Match Date
              </Label>
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5 text-amber-400" />
                <Input
                  id="playDate"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400"
                  required
                />
              </div>
              <p className="text-xs text-amber-400/80">
                The date when the match will be played
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeSlot" className="text-white">
                Time Slot
              </Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-amber-400" />
                <Input
                  id="timeSlot"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400"
                  required
                />
              </div>
              <p className="text-xs text-amber-400/80">
                Preferred starting time for the match
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="matchDetails" className="text-white">
                Additional Details
              </Label>
              <Textarea
                id="matchDetails"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Additional information about the match (number of players, specific requirements, etc.)"
                className="min-h-[100px] border-amber-500/20 bg-gray-800/50 text-white placeholder:text-white/50 focus:border-amber-400"
              />
              <p className="text-xs text-amber-400/80">
                These details will be visible to all participants
              </p>
            </div>
            
            <DialogFooter className="mt-4">
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Save Match Details
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}