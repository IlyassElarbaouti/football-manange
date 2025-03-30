'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, AlertCircle, Check, Calendar, Clock, MapPin, Users, CreditCard, Wallet, ArrowRight, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Match, Payment } from '@/types/sanity';
import { format } from 'date-fns';

export default function PaymentsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserStats, setCurrentUserStats] = useState({
    totalPaid: 0,
    matchesPaid: 0,
    pendingPayments: 0
  });

  // Fetch matches and payments on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user's matches (those they're participating in)
        const matchesResponse = await fetch('/api/matches/user');
        if (!matchesResponse.ok) throw new Error('Failed to fetch matches');
        const matchesData = await matchesResponse.json();
        
        // Filter for matches that require payment and sorted by date
        const filteredMatches = matchesData.matches
          .filter((match: Match) => match.status !== 'cancelled')
          .sort((a: Match, b: Match) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setMatches(filteredMatches);
        
        // Fetch user's payments
        const paymentsResponse = await fetch('/api/payments');
        if (!paymentsResponse.ok) throw new Error('Failed to fetch payments');
        const paymentsData = await paymentsResponse.json();
        
        setPayments(paymentsData.payments);
        
        // Calculate stats
        calculateStats(paymentsData.payments);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Failed to load payments data",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Calculate payment statistics
  const calculateStats = (payments: Payment[]) => {
    const totalPaid = payments.reduce((sum, payment) => 
      payment.status === 'completed' ? sum + payment.amount : sum, 0);
      
    const matchesPaid = new Set(payments
      .filter(payment => payment.status === 'completed')
      .map(payment => payment.match._ref)).size;
      
    // For demo purposes - we'd need to sync with matches data to be accurate
    const pendingPayments = 2; // Example value
    
    setCurrentUserStats({
      totalPaid,
      matchesPaid,
      pendingPayments
    });
  };

  // Handle payment submission
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMatch) return;
    
    setIsSubmitting(true);
    
    try {
      // For demo, we'll calculate the payment amount based on match cost
      const amount = selectedMatch.costPerPlayer || Math.ceil((selectedMatch.totalCost || 500) / selectedMatch.totalSlots);
      
      const paymentData = {
        match: {
          _type: 'reference',
          _ref: selectedMatch._id,
        },
        amount,
        method: paymentMethod,
        notes: paymentNote,
        // Status will be initially set to 'pending' and updated by admin when confirmed
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
      
      // Get the new payment data
      const data = await response.json();
      
      toast({
        title: "Payment record submitted",
        description: "Your payment record has been submitted for confirmation.",
      });
      
      // Update local state
      setPayments([...payments, data.payment]);
      setSelectedMatch(null);
      setPaymentMethod('cash');
      setPaymentNote('');
      
      // Refresh the page to update the UI
      router.refresh();
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: "Failed to submit payment",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unpaid matches
  const getUnpaidMatches = () => {
    const paidMatchIds = payments
      .filter(payment => payment.status !== 'refunded')
      .map(payment => payment.match._ref);
      
    return matches.filter(match => !paidMatchIds.includes(match._id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center">
            <span className="mr-3 rounded-md bg-gradient-to-br from-amber-500 to-yellow-500 px-2 py-1 text-xs font-bold text-black shadow-md shadow-amber-500/20">
              FUT 25
            </span>
            <h1 className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Payment Center
            </h1>
          </div>
          <p className="text-amber-400">
            Manage your match payments and view payment history
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Payment Statistics Card */}
          <Card className="col-span-1 overflow-hidden border-amber-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md shadow-xl md:col-span-3">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-lg font-bold text-black">
              Payment Summary
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-gradient-to-br from-gray-900/80 to-black/80 p-4 border border-amber-500/10">
                  <div className="flex items-center">
                    <div className="mr-3 rounded-full bg-amber-500/20 p-2">
                      <Wallet className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Total Paid</p>
                      <p className="text-2xl font-bold text-white">{currentUserStats.totalPaid}₽</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg bg-gradient-to-br from-gray-900/80 to-black/80 p-4 border border-amber-500/10">
                  <div className="flex items-center">
                    <div className="mr-3 rounded-full bg-amber-500/20 p-2">
                      <Check className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Matches Paid</p>
                      <p className="text-2xl font-bold text-white">{currentUserStats.matchesPaid}</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg bg-gradient-to-br from-gray-900/80 to-black/80 p-4 border border-amber-500/10">
                  <div className="flex items-center">
                    <div className="mr-3 rounded-full bg-amber-500/20 p-2">
                      <AlertCircle className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Pending Payments</p>
                      <p className="text-2xl font-bold text-white">{currentUserStats.pendingPayments}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Main Content Tabs */}
          <Card className="col-span-1 overflow-hidden border-amber-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md shadow-xl md:col-span-3">
            <div className="bg-gradient-to-r from-amber-950 to-gray-900 px-4 py-2">
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
                  <TabsTrigger 
                    value="pending" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-500/20 data-[state=active]:text-amber-400"
                  >
                    Pending Payments
                  </TabsTrigger>
                  <TabsTrigger 
                    value="completed" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-500/20 data-[state=active]:text-amber-400"
                  >
                    Payment History
                  </TabsTrigger>
                  <TabsTrigger 
                    value="record" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-500/20 data-[state=active]:text-amber-400"
                  >
                    Record a Payment
                  </TabsTrigger>
                </TabsList>
                
                {/* Pending Payments Tab */}
                <TabsContent value="pending" className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
                      <Info className="h-5 w-5 text-amber-400 mr-2" />
                      <p className="text-sm text-white/80">
                        Pending payments are recorded but waiting for confirmation from the organizer.
                      </p>
                    </div>
                    
                    {payments.filter(payment => payment.status === 'pending').length > 0 ? (
                      <div className="space-y-3">
                        {payments
                          .filter(payment => payment.status === 'pending')
                          .map((payment, index) => {
                            // Find matching match info
                            const matchInfo = matches.find(m => m._id === payment.match._ref);
                            
                            return (
                              <div 
                                key={index}
                                className="rounded-lg border border-amber-500/20 bg-gray-800/30 p-4"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-bold text-white">{matchInfo?.title || 'Unknown Match'}</h3>
                                    {matchInfo && (
                                      <p className="text-sm text-white/70 mt-1">
                                        {format(new Date(matchInfo.date), 'PPP')} at {format(new Date(matchInfo.date), 'p')}
                                      </p>
                                    )}
                                  </div>
                                  <Badge className="bg-yellow-500 text-black">Pending</Badge>
                                </div>
                                
                                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                                  <div>
                                    <p className="text-white/50">Amount</p>
                                    <p className="font-semibold text-white">{payment.amount}₽</p>
                                  </div>
                                  <div>
                                    <p className="text-white/50">Method</p>
                                    <p className="font-semibold text-white capitalize">{payment.method}</p>
                                  </div>
                                  <div>
                                    <p className="text-white/50">Date</p>
                                    <p className="font-semibold text-white">{format(new Date(payment.date), 'PPP')}</p>
                                  </div>
                                </div>
                                
                                {payment.notes && (
                                  <div className="mt-3 text-sm">
                                    <p className="text-white/50">Notes</p>
                                    <p className="text-white/80">{payment.notes}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="py-10 text-center">
                        <div className="inline-block rounded-full bg-amber-500/10 p-3 mb-4">
                          <Check className="h-6 w-6 text-amber-400" />
                        </div>
                        <p className="text-white mb-2">No pending payments</p>
                        <p className="text-white/60 text-sm">All your payments are up to date!</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* Payment History Tab */}
                <TabsContent value="completed" className="p-4">
                  {payments.filter(payment => payment.status === 'completed').length > 0 ? (
                    <div className="space-y-3">
                      {payments
                        .filter(payment => payment.status === 'completed')
                        .map((payment, index) => {
                          // Find matching match info
                          const matchInfo = matches.find(m => m._id === payment.match._ref);
                          
                          return (
                            <div 
                              key={index}
                              className="rounded-lg border border-amber-500/20 bg-gray-800/30 p-4"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold text-white">{matchInfo?.title || 'Unknown Match'}</h3>
                                  {matchInfo && (
                                    <p className="text-sm text-white/70 mt-1">
                                      {format(new Date(matchInfo.date), 'PPP')} at {format(new Date(matchInfo.date), 'p')}
                                    </p>
                                  )}
                                </div>
                                <Badge className="bg-green-500 text-white">Completed</Badge>
                              </div>
                              
                              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <p className="text-white/50">Amount</p>
                                  <p className="font-semibold text-white">{payment.amount}₽</p>
                                </div>
                                <div>
                                  <p className="text-white/50">Method</p>
                                  <p className="font-semibold text-white capitalize">{payment.method}</p>
                                </div>
                                <div>
                                  <p className="text-white/50">Date</p>
                                  <p className="font-semibold text-white">{format(new Date(payment.date), 'PPP')}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <p className="text-white/60">No payment history found</p>
                    </div>
                  )}
                </TabsContent>
                
                {/* Record a Payment Tab */}
                <TabsContent value="record" className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
                      <Info className="h-5 w-5 text-amber-400 mr-2" />
                      <p className="text-sm text-white/80">
                        Record payments for matches you've participated in. The organizer will confirm your payment.
                      </p>
                    </div>
                    
                    {getUnpaidMatches().length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {getUnpaidMatches().map((match) => {
                          // Calculate payment amount
                          const amount = match.costPerPlayer || 
                            (match.totalCost ? Math.ceil(match.totalCost / match.totalSlots) : 500);
                            
                          return (
                            <div
                              key={match._id}
                              className="rounded-lg border border-amber-500/20 bg-gray-800/30 hover:bg-gray-800/50 transition-colors p-4"
                            >
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold text-white">{match.title}</h3>
                                <Badge className="bg-blue-500 text-white">
                                  {amount}₽
                                </Badge>
                              </div>
                              
                              <div className="mt-2 space-y-2 text-sm">
                                <div className="flex items-center text-white/70">
                                  <Calendar className="h-4 w-4 mr-1.5 text-amber-400" />
                                  {format(new Date(match.date), 'PPP')}
                                </div>
                                <div className="flex items-center text-white/70">
                                  <Clock className="h-4 w-4 mr-1.5 text-amber-400" />
                                  {format(new Date(match.date), 'p')}
                                </div>
                                {match.venue && typeof match.venue === 'object' && 'name' in match.venue && (
                                  <div className="flex items-center text-white/70">
                                    <MapPin className="h-4 w-4 mr-1.5 text-amber-400" />
                                    {match.venue.name}
                                  </div>
                                )}
                                <div className="flex items-center text-white/70">
                                  <Users className="h-4 w-4 mr-1.5 text-amber-400" />
                                  {match.filledSlots}/{match.totalSlots} players
                                </div>
                              </div>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    className="mt-4 w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-medium"
                                    onClick={() => setSelectedMatch(match)}
                                  >
                                    Record Payment
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="border-amber-500/20 bg-gray-900 sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="text-white">Record Payment</DialogTitle>
                                    <DialogDescription className="text-white/70">
                                      Record your payment for {match.title}
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <form onSubmit={handleSubmitPayment} className="space-y-4">
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
                                </DialogContent>
                              </Dialog>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-10 text-center">
                        <div className="inline-block rounded-full bg-amber-500/10 p-3 mb-4">
                          <Check className="h-6 w-6 text-amber-400" />
                        </div>
                        <p className="text-white mb-2">No unpaid matches</p>
                        <p className="text-white/60 text-sm">You've already paid for all your matches!</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}