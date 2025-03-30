// components/profiles/ProfileEditForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/sanity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

interface ProfileEditFormProps {
  user: User;
}

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    telegramUsername: user.telegramUsername || '',
    preferredPosition: user.preferredPosition || 'any',
    skillLevel: user.skillLevel || 75,
    availableDays: user.availableDays || [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillLevelChange = (value: number[]) => {
    setFormData(prev => ({ ...prev, skillLevel: value[0] }));
  };

  const handleAvailableDayToggle = (day: string) => {
    setFormData(prev => {
      const days = [...prev.availableDays];
      if (days.includes(day)) {
        return { ...prev, availableDays: days.filter(d => d !== day) };
      } else {
        return { ...prev, availableDays: [...days, day] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, we would send the updated data to an API endpoint
      // const response = await fetch(`/api/users/${user._id}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Redirect to profile page
      router.push('/dashboard/profile');
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Failed to update profile",
        description: "An error occurred while updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateRating = (skill: number) => {
    // Map 1-100 skill to 50-99 FIFA rating
    return Math.floor(50 + (skill * 49) / 100);
  };

  const playerRating = calculateRating(formData.skillLevel);

  return (
    <div className="grid gap-6 md:grid-cols-6">
      {/* FIFA-inspired player card preview */}
      <div className="md:col-span-2">
        <div className="mb-4 text-lg font-semibold text-white">Player Card Preview</div>
        <div className="flex justify-center">
          <div className="relative h-80 w-56 overflow-hidden rounded-xl bg-gradient-to-b from-amber-500 to-yellow-500 p-1.5">
            <div className="h-full w-full rounded-lg bg-gradient-to-b from-black to-gray-900 p-4">
              <div className="flex justify-between">
                <div className="flex h-20 w-20 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 text-black">
                  <span className="text-4xl font-bold">{playerRating}</span>
                  <span className="text-sm font-bold">
                    {formData.preferredPosition === 'any' ? 'ANY' : 
                     formData.preferredPosition === 'goalkeeper' ? 'GK' : 
                     formData.preferredPosition === 'defender' ? 'DEF' : 
                     formData.preferredPosition === 'midfielder' ? 'MID' : 'FWD'}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <Avatar className="h-12 w-12 border-2 border-amber-500">
                    {user.profileImage ? (
                      <AvatarImage src={user.profileImage} alt={user.name} />
                    ) : (
                      <AvatarFallback className="bg-amber-800 text-amber-200">
                        {formData.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="mt-1 text-xs text-white/70">Player</span>
                </div>
              </div>
              
              <div className="mt-4 flex h-28 items-center justify-center">
                {user.profileImage ? (
                  <div className="rounded-lg overflow-hidden opacity-30 blur-[1px]">
                    <AvatarImage 
                      src={user.profileImage}
                      alt={user.name}
                      className="h-28 w-28 object-cover"
                    />
                  </div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-20 w-20 text-white/30"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
              
              <div className="mt-3 text-center">
                <h3 className="font-bold uppercase text-white">
                  {formData.name}
                </h3>
                {formData.telegramUsername && (
                  <p className="text-xs text-amber-400/80 mt-1">@{formData.telegramUsername}</p>
                )}
              </div>
              
              <div className="mt-4 flex justify-between text-center text-xs text-white">
                <div>
                  <div className="text-lg font-bold">{Math.max(60, playerRating - 10)}</div>
                  <div className="text-amber-400">PAC</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{Math.max(60, playerRating - 5)}</div>
                  <div className="text-amber-400">SHO</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{playerRating}</div>
                  <div className="text-amber-400">PAS</div>
                </div>
              </div>
              
              <div className="mt-1 flex justify-between text-center text-xs text-white">
                <div>
                  <div className="text-lg font-bold">{Math.max(60, playerRating - 3)}</div>
                  <div className="text-amber-400">DRI</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{Math.max(60, playerRating - 7)}</div>
                  <div className="text-amber-400">DEF</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{Math.max(60, playerRating - 2)}</div>
                  <div className="text-amber-400">PHY</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit form */}
      <div className="md:col-span-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telegramUsername" className="text-white">
                Telegram Username
              </Label>
              <Input
                id="telegramUsername"
                name="telegramUsername"
                value={formData.telegramUsername}
                onChange={handleInputChange}
                placeholder="@username"
                className="border-amber-500/20 bg-gray-800/50 text-white placeholder:text-white/50 focus:border-amber-400"
              />
              <p className="text-xs text-amber-400/80">
                Used for match notifications and group chats
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferredPosition" className="text-white">
                Preferred Position
              </Label>
              <Select 
                value={formData.preferredPosition} 
                onValueChange={(value) => handleSelectChange("preferredPosition", value)}
              >
                <SelectTrigger 
                  id="preferredPosition" 
                  className="border-amber-500/20 bg-gray-800/50 text-white focus:border-amber-400"
                >
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent className="border-amber-500/20 bg-gray-900">
                  <SelectItem value="goalkeeper">Goalkeeper (GK)</SelectItem>
                  <SelectItem value="defender">Defender (DEF)</SelectItem>
                  <SelectItem value="midfielder">Midfielder (MID)</SelectItem>
                  <SelectItem value="forward">Forward (FWD)</SelectItem>
                  <SelectItem value="any">Any Position</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="skillLevel" className="text-white">
                  Skill Level
                </Label>
                <span className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-2 py-1 text-xs font-bold text-black">
                  {formData.skillLevel}/100
                </span>
              </div>
              <Slider
                id="skillLevel"
                min={1}
                max={100}
                step={1}
                value={[formData.skillLevel]}
                onValueChange={handleSkillLevelChange}
                className="py-4"
              />
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Beginner</span>
                <span className="text-amber-400">Intermediate</span>
                <span className="text-white/60">Professional</span>
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">Available Days</Label>
              <div className="grid grid-cols-7 gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleAvailableDayToggle(day)}
                    className={`rounded-md p-2 text-center text-xs font-medium transition-colors ${
                      formData.availableDays.includes(day)
                        ? 'bg-amber-500 text-black'
                        : 'bg-gray-800/50 text-white/70 hover:bg-gray-800/70'
                    }`}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-amber-400/80">
                Select days when you're typically available to play
              </p>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-amber-500/20 bg-gray-800/30 text-white hover:bg-gray-800/50 hover:text-amber-400"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}