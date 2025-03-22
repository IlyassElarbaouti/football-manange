'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns'; // Update import to use direct import
import { Loader2, Clock, Calendar as CalendarIcon } from 'lucide-react';
import VenueSelector from '@/components/matches/VenueSelector';

export default function CreateMatchPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('19:00');
  const [formData, setFormData] = useState({
    title: '',
    matchType: '5-aside',
    totalSlots: 10,
    venue: '',
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !formData.venue) {
      // Show validation error
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Combine date and time
      const matchDate = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      matchDate.setHours(hours, minutes);
      
      // Prepare match data
      const matchData = {
        title: formData.title,
        date: matchDate.toISOString(),
        venue: {
          _type: 'reference',
          _ref: formData.venue,
        },
        matchType: formData.matchType,
        totalSlots: Number(formData.totalSlots),
        status: 'scheduled',
        createdBy: {
          _type: 'reference',
          _ref: '', // Will be filled on the server with Sanity user ID
        },
        notes: formData.notes,
      };
      
      // Send to API
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create match');
      }
      
      const data = await response.json();
      
      // Redirect to match details page
      router.push(`/dashboard/matches/${data.match._id}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating match:', error);
      // Show error notification
    } finally {
      setIsSubmitting(false);
    }
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
              Schedule Match
            </h1>
          </div>
          <p className="text-amber-400">
            Create a new match and invite your teammates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Match creation form */}
        <div className="col-span-1 overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md shadow-xl md:col-span-3">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-lg font-bold text-black">
            Match Details
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">
                    Match Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Evening Kickabout"
                    className="border-amber-500/20 bg-gray-800/50 text-white placeholder:text-white/50 focus:border-amber-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matchType" className="text-white">
                    Match Type
                  </Label>
                  <Select
                    value={formData.matchType}
                    onValueChange={(value) => handleSelectChange('matchType', value)}
                  >
                    <SelectTrigger
                      id="matchType"
                      className="border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400"
                    >
                      <SelectValue placeholder="Select match type" />
                    </SelectTrigger>
                    <SelectContent className="border-amber-500/20 bg-gray-900">
                      <SelectItem value="5-aside">5-a-side</SelectItem>
                      <SelectItem value="7-aside">7-a-side</SelectItem>
                      <SelectItem value="11-aside">11-a-side</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">
                    Match Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto border-amber-500/20 bg-gray-900 p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className="bg-gray-900"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-white">
                    Match Time
                  </Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-amber-400" />
                    <Input
                      id="time"
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totalSlots" className="text-white">
                    Total Players Needed
                  </Label>
                  <Input
                    id="totalSlots"
                    name="totalSlots"
                    type="number"
                    min={2}
                    max={22}
                    value={formData.totalSlots}
                    onChange={handleInputChange}
                    className="border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400"
                    required
                  />
                  <p className="text-xs text-amber-400/80">
                    Including yourself
                  </p>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-white">
                    Venue
                  </Label>
                  <VenueSelector
                    value={formData.venue}
                    onChange={(value) => handleSelectChange('venue', value)}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes" className="text-white">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional information about the match..."
                    className="min-h-[100px] border-amber-500/20 bg-gray-800/50 text-white placeholder:text-white/50 focus:border-amber-400"
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="mr-4 border-amber-500/20 bg-gray-800/30 text-white hover:bg-gray-800/50 hover:text-amber-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 font-bold text-black shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-yellow-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Match'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}