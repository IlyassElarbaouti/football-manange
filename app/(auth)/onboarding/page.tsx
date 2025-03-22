// app/(auth)/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [telegramUsername, setTelegramUsername] = useState("");
  const [preferredPosition, setPreferredPosition] = useState("");
  const [skillLevel, setSkillLevel] = useState(75);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a full implementation, we would save this data to our database
      // For now, we'll just simulate that and redirect to the dashboard
      
      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Redirect to dashboard after successful submission
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate overall rating based on skill level
  const calculateRating = (skill: number) => {
    // Map 1-100 skill to 50-99 FIFA rating
    return Math.floor(50 + (skill * 49) / 100);
  };

  const playerRating = calculateRating(skillLevel);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/images/fifa-gb.webp')] bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-black/85 before:backdrop-blur-sm p-4">
      <div className="relative z-10 w-full max-w-lg">
        {/* FIFA-inspired header with Black and Gold */}
        <div className="mb-6 text-center">
          <div className="mb-2 flex justify-center">
            <div className="inline-block rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 p-1.5 shadow-lg shadow-amber-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 text-black"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
          </div>
          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                CREATE YOUR
              </span>
              <span className="ml-2 bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                PLAYER
              </span>
            </h1>
            <div className="absolute -right-2 top-0 rounded-md bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-black shadow-md">
              FUT 25
            </div>
          </div>
          <p className="mt-2 text-amber-400">Customize your ultimate team player</p>
        </div>
        
        {/* Player creation card with Black and Gold styling */}
        <div className="overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-black/90 to-gray-900/80 shadow-xl backdrop-blur-md">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-lg font-bold text-black">
            Player Setup
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:gap-6">
              {/* FIFA Player Card Preview with Black and Gold */}
              <div className="mb-6 flex justify-center md:mb-0 md:w-1/3">
                <div className="relative h-64 w-48 overflow-hidden rounded-xl bg-gradient-to-b from-amber-500 to-yellow-500 p-1">
                  <div className="h-full w-full rounded-lg bg-gradient-to-b from-black to-gray-900 p-3">
                    <div className="flex justify-between">
                      <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 text-black">
                        <span className="text-3xl font-bold">{playerRating}</span>
                        <span className="text-xs font-bold">
                          {preferredPosition ? 
                            preferredPosition.substring(0, 3).toUpperCase() : 
                            "POS"}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-amber-500/20"></div>
                        <span className="mt-1 text-xs text-white/70">Nation</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex h-20 items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-16 w-16 text-white/30"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    
                    <div className="mt-2 text-center">
                      <h3 className="font-bold uppercase text-white">
                        {user?.firstName || "Player Name"}
                      </h3>
                    </div>
                    
                    <div className="mt-3 flex justify-between text-center text-xs text-white">
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
              
              {/* Form with Black and Gold */}
              <div className="flex-1">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="telegram" className="text-white">
                      Telegram Username
                    </Label>
                    <Input
                      id="telegram"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      placeholder="@username"
                      className="border-amber-500/20 bg-gray-800/50 text-white placeholder:text-white/50 focus:border-amber-400"
                      required
                    />
                    <p className="text-xs text-amber-400/80">
                      We&apos;ll use this to notify you about matches
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-white">
                      Preferred Position
                    </Label>
                    <Select 
                      value={preferredPosition} 
                      onValueChange={setPreferredPosition}
                      required
                    >
                      <SelectTrigger 
                        id="position" 
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
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="skill" className="text-white">
                        Skill Level
                      </Label>
                      <span className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-2 py-1 text-xs font-bold text-black">
                        {skillLevel}/100
                      </span>
                    </div>
                    <Slider
                      id="skill"
                      min={1}
                      max={100}
                      step={1}
                      value={[skillLevel]}
                      onValueChange={(value) => setSkillLevel(value[0])}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">Beginner</span>
                      <span className="text-amber-400">Intermediate</span>
                      <span className="text-white/60">Professional</span>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="mt-4 w-full bg-gradient-to-r from-amber-500 to-yellow-500 font-bold shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-yellow-600 text-black"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating Player..." : "Complete Setup"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-sm text-white/60">
          © 2025 Football Hub. All rights reserved.
        </div>
      </div>
    </div>
  );
}