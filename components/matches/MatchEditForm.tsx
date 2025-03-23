'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Match } from '@/types/sanity';
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
import { format } from 'date-fns';
import { Loader2, Clock, Calendar as CalendarIcon } from 'lucide-react';
import VenueSelector from '@/components/matches/VenueSelector';

interface MatchEditFormProps {
  match: Match;
  onCancel: () => void;
}

export default function MatchEditForm({ match, onCancel }: MatchEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Parse initial values from match data
  const initialDate = new Date(match.date);
  const formattedTime = format(initialDate, 'HH:mm');
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [selectedTime, setSelectedTime] = useState(formattedTime);
  const [formData, setFormData] = useState({
    title: match.title,
    matchType: match.matchType,
    totalSlots: match.totalSlots,
    venue: match.venue._ref,
    notes: match.notes || '',
    status: match.status
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
      
      // Prepare match data for update
      const matchData = {
        title: formData.title,
        date: matchDate.toISOString(),
        venue: {
          _type: 'reference',
          _ref: formData.venue,
        },
        matchType: formData.matchType,
        totalSlots: Number(formData.totalSlots),
        status: formData.status,
        notes: formData.notes,
      };
      
      // Send to API
      const response = await fetch(`/api/matches/${match._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update match');
      }
      
      // Refresh the page to show updated data
      router.refresh();
      
      // Navigate back to match details
      onCancel();
    } catch (error) {
      console.error('Error updating match:', error);
      // Show error notification
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-lg font-bold text-black rounded-t-lg">
        Edit Match
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 p-4">
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
              min={match.filledSlots}
              max={22}
              value={formData.totalSlots}
              onChange={handleInputChange}
              className="border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400"
              required
            />
            <p className="text-xs text-amber-400/80">
              Cannot be less than current players ({match.filledSlots})
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status" className="text-white">
              Match Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger
                id="status"
                className="border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="border-amber-500/20 bg-gray-900">
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
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
            onClick={onCancel}
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
                Updating...
              </>
            ) : (
              'Update Match'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}