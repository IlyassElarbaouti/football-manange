"use client"

import {useState, useEffect} from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users } from 'lucide-react';

// Get field size and formation based on match type
const getFieldConfig = (matchType) => {
  switch(matchType) {
    case '5-aside':
      return {
        name: '1-2-1-1',
        // Horizontal on desktop, vertical on mobile
        fieldClass: 'aspect-[1/1.5] md:aspect-[1.6/1]',
        centerCircleSize: 'w-16 h-16',
        positions: {
          // Desktop positions (horizontal field)
          desktop: {
            teamA: [
              {id: 'GK', x: '10%', y: '50%', role: 'Goalkeeper'},
              {id: 'LB', x: '25%', y: '25%', role: 'Left Back'},
              {id: 'RB', x: '25%', y: '75%', role: 'Right Back'},
              {id: 'CM', x: '40%', y: '50%', role: 'Midfielder'},
              {id: 'ST', x: '60%', y: '50%', role: 'Striker'},
            ],
            teamB: [
              {id: 'GK', x: '90%', y: '50%', role: 'Goalkeeper'},
              {id: 'LB', x: '75%', y: '25%', role: 'Left Back'},
              {id: 'RB', x: '75%', y: '75%', role: 'Right Back'},
              {id: 'CM', x: '60%', y: '50%', role: 'Midfielder'},
              {id: 'ST', x: '40%', y: '50%', role: 'Striker'},
            ]
          },
          // Mobile positions (vertical field)
          mobile: {
            teamA: [
              {id: 'GK', x: '50%', y: '90%', role: 'Goalkeeper'},
              {id: 'LB', x: '25%', y: '75%', role: 'Left Back'},
              {id: 'RB', x: '75%', y: '75%', role: 'Right Back'},
              {id: 'CM', x: '50%', y: '65%', role: 'Midfielder'},
              {id: 'ST', x: '50%', y: '55%', role: 'Striker'},
            ],
            teamB: [
              {id: 'GK', x: '50%', y: '10%', role: 'Goalkeeper'},
              {id: 'LB', x: '25%', y: '25%', role: 'Left Back'},
              {id: 'RB', x: '75%', y: '25%', role: 'Right Back'},
              {id: 'CM', x: '50%', y: '35%', role: 'Midfielder'},
              {id: 'ST', x: '50%', y: '45%', role: 'Striker'},
            ]
          }
        }
      };
    case '7-aside':
      return {
        name: '1-3-2-1',
        fieldClass: 'aspect-[1/1.8] md:aspect-[2/1]',
        centerCircleSize: 'w-16 h-16 md:w-20 md:h-20',
        positions: {
          desktop: {
            teamA: [
              {id: 'GK', x: '5%', y: '50%', role: 'Goalkeeper'},
              {id: 'LB', x: '15%', y: '25%', role: 'Left Back'},
              {id: 'CB', x: '15%', y: '50%', role: 'Center Back'},
              {id: 'RB', x: '15%', y: '75%', role: 'Right Back'},
              {id: 'LM', x: '30%', y: '30%', role: 'Left Midfielder'},
              {id: 'RM', x: '30%', y: '70%', role: 'Right Midfielder'},
              {id: 'ST', x: '45%', y: '50%', role: 'Striker'},
            ],
            teamB: [
              {id: 'GK', x: '95%', y: '50%', role: 'Goalkeeper'},
              {id: 'LB', x: '85%', y: '25%', role: 'Left Back'},
              {id: 'CB', x: '85%', y: '50%', role: 'Center Back'},
              {id: 'RB', x: '85%', y: '75%', role: 'Right Back'},
              {id: 'LM', x: '70%', y: '30%', role: 'Left Midfielder'},
              {id: 'RM', x: '70%', y: '70%', role: 'Right Midfielder'},
              {id: 'ST', x: '55%', y: '50%', role: 'Striker'},
            ]
          },
          mobile: {
            teamA: [
              {id: 'GK', x: '50%', y: '90%', role: 'Goalkeeper'},
              {id: 'LB', x: '25%', y: '80%', role: 'Left Back'},
              {id: 'CB', x: '50%', y: '80%', role: 'Center Back'},
              {id: 'RB', x: '75%', y: '80%', role: 'Right Back'},
              {id: 'LM', x: '25%', y: '70%', role: 'Left Midfielder'},
              {id: 'RM', x: '75%', y: '70%', role: 'Right Midfielder'},
              {id: 'ST', x: '50%', y: '60%', role: 'Striker'},
            ],
            teamB: [
              {id: 'GK', x: '50%', y: '10%', role: 'Goalkeeper'},
              {id: 'LB', x: '25%', y: '20%', role: 'Left Back'},
              {id: 'CB', x: '50%', y: '20%', role: 'Center Back'},
              {id: 'RB', x: '75%', y: '20%', role: 'Right Back'},
              {id: 'LM', x: '25%', y: '30%', role: 'Left Midfielder'},
              {id: 'RM', x: '75%', y: '30%', role: 'Right Midfielder'},
              {id: 'ST', x: '50%', y: '40%', role: 'Striker'},
            ]
          }
        }
      };
    case '11-aside':
    default:
      return {
        name: '4-4-2',
        fieldClass: 'aspect-[1/2] md:aspect-[2.2/1]',
        centerCircleSize: 'w-16 h-16 md:w-32 md:h-32',
        positions: {
          desktop: {
            teamA: [
              {id: 'GK', x: '5%', y: '50%', role: 'Goalkeeper'},
              {id: 'LB', x: '15%', y: '20%', role: 'Left Back'},
              {id: 'CB1', x: '15%', y: '40%', role: 'Center Back'},
              {id: 'CB2', x: '15%', y: '60%', role: 'Center Back'},
              {id: 'RB', x: '15%', y: '80%', role: 'Right Back'},
              {id: 'LM', x: '30%', y: '20%', role: 'Left Midfielder'},
              {id: 'CM1', x: '30%', y: '40%', role: 'Center Midfielder'},
              {id: 'CM2', x: '30%', y: '60%', role: 'Center Midfielder'},
              {id: 'RM', x: '30%', y: '80%', role: 'Right Midfielder'},
              {id: 'ST1', x: '45%', y: '35%', role: 'Striker'},
              {id: 'ST2', x: '45%', y: '65%', role: 'Striker'},
            ],
            teamB: [
              {id: 'GK', x: '95%', y: '50%', role: 'Goalkeeper'},
              {id: 'LB', x: '85%', y: '20%', role: 'Left Back'},
              {id: 'CB1', x: '85%', y: '40%', role: 'Center Back'},
              {id: 'CB2', x: '85%', y: '60%', role: 'Center Back'},
              {id: 'RB', x: '85%', y: '80%', role: 'Right Back'},
              {id: 'LM', x: '70%', y: '20%', role: 'Left Midfielder'},
              {id: 'CM1', x: '70%', y: '40%', role: 'Center Midfielder'},
              {id: 'CM2', x: '70%', y: '60%', role: 'Center Midfielder'},
              {id: 'RM', x: '70%', y: '80%', role: 'Right Midfielder'},
              {id: 'ST1', x: '55%', y: '35%', role: 'Striker'},
              {id: 'ST2', x: '55%', y: '65%', role: 'Striker'},
            ]
          },
          mobile: {
            teamA: [
              {id: 'GK', x: '50%', y: '90%', role: 'Goalkeeper'},
              {id: 'LB', x: '20%', y: '85%', role: 'Left Back'},
              {id: 'CB1', x: '40%', y: '85%', role: 'Center Back'},
              {id: 'CB2', x: '60%', y: '85%', role: 'Center Back'},
              {id: 'RB', x: '80%', y: '85%', role: 'Right Back'},
              {id: 'LM', x: '20%', y: '75%', role: 'Left Midfielder'},
              {id: 'CM1', x: '40%', y: '75%', role: 'Center Midfielder'},
              {id: 'CM2', x: '60%', y: '75%', role: 'Center Midfielder'},
              {id: 'RM', x: '80%', y: '75%', role: 'Right Midfielder'},
              {id: 'ST1', x: '35%', y: '65%', role: 'Striker'},
              {id: 'ST2', x: '65%', y: '65%', role: 'Striker'},
            ],
            teamB: [
              {id: 'GK', x: '50%', y: '10%', role: 'Goalkeeper'},
              {id: 'LB', x: '20%', y: '15%', role: 'Left Back'},
              {id: 'CB1', x: '40%', y: '15%', role: 'Center Back'},
              {id: 'CB2', x: '60%', y: '15%', role: 'Center Back'},
              {id: 'RB', x: '80%', y: '15%', role: 'Right Back'},
              {id: 'LM', x: '20%', y: '25%', role: 'Left Midfielder'},
              {id: 'CM1', x: '40%', y: '25%', role: 'Center Midfielder'},
              {id: 'CM2', x: '60%', y: '25%', role: 'Center Midfielder'},
              {id: 'RM', x: '80%', y: '25%', role: 'Right Midfielder'},
              {id: 'ST1', x: '35%', y: '35%', role: 'Striker'},
              {id: 'ST2', x: '65%', y: '35%', role: 'Striker'},
            ]
          }
        }
      };
  }
};

// Helper function to determine position category
const getPositionCategory = (position) => {
  if (position.toLowerCase().includes('gk') || position.toLowerCase() === 'goalkeeper') {
    return 'Goalkeeper';
  } else if (position.toLowerCase().includes('b') || position.toLowerCase().includes('cb') || position.toLowerCase().includes('back')) {
    return 'Defender';
  } else if (position.toLowerCase().includes('m') || position.toLowerCase().includes('mid')) {
    return 'Midfielder';
  } else {
    return 'Forward';
  }
};

const MatchFieldVisualization = ({ match }) => {
  // Get field configuration based on match type
  const fieldConfig = getFieldConfig(match?.matchType || '11-aside');
  
  // Extract and balance players based on skill level
  const balanceTeams = () => {
    // Get all confirmed players from the match
    const allPlayers = match?.players || [];
    if (allPlayers.length === 0) return { teamA: [], teamB: [], queue: [] };
    
    // Sort players by skill level (higher first)
    const sortedPlayers = [...allPlayers].sort((a, b) => 
      (b.user.skillLevel || 75) - (a.user.skillLevel || 75)
    );
    
    // Create alternating teams - this ensures we don't put all players in one team
    const teamA = [];
    const teamB = [];
    
    // Distribute players evenly between teams using alternating assignment
    sortedPlayers.forEach((player, index) => {
      if (index % 2 === 0) {
        teamA.push(player);
      } else {
        teamB.push(player);
      }
    });
    
    // Create player assignments for each position in each team
    const assignPlayers = (team, positions) => {
      const result = [];
      
      positions.forEach((position) => {
        // Try to find player with matching position preference
        const positionCategory = getPositionCategory(position.id);
        const matchingPlayer = team.find(p => 
          getPositionCategory(p.user.preferredPosition || 'Any') === positionCategory && 
          !result.some(r => r.user?._id === p.user._id)
        );
        
        // If we found a matching player
        if (matchingPlayer) {
          result.push({
            ...matchingPlayer,
            position: position.id,
            x: position.x,
            y: position.y,
            role: position.role
          });
        } 
        // Otherwise check if we have any player left
        else {
          const anyPlayer = team.find(p => !result.some(r => r.user?._id === p.user._id));
          if (anyPlayer) {
            result.push({
              ...anyPlayer,
              position: position.id,
              x: position.x,
              y: position.y,
              role: position.role
            });
          } else {
            // No player available, add empty position
            result.push({
              position: position.id,
              x: position.x,
              y: position.y,
              role: position.role,
              isEmpty: true
            });
          }
        }
      });
      
      return result;
    };
    
    // Assign players to positions for both teams
    const assignedTeamA = assignPlayers(teamA, isMobile ? fieldConfig.positions.mobile.teamA : fieldConfig.positions.desktop.teamA);
    const assignedTeamB = assignPlayers(teamB, isMobile ? fieldConfig.positions.mobile.teamB : fieldConfig.positions.desktop.teamB);
    
    // Collect all assigned player IDs
    const usedPlayerIds = new Set([
      ...assignedTeamA.filter(p => !p.isEmpty).map(p => p.user?._id),
      ...assignedTeamB.filter(p => !p.isEmpty).map(p => p.user?._id)
    ]);
    
    // Remaining players go to the queue
    const queue = allPlayers.filter(p => !usedPlayerIds.has(p.user?._id));
    
    // Add placeholders for total slots that haven't been filled
    const totalAssignedPlayers = assignedTeamA.filter(p => !p.isEmpty).length + 
                               assignedTeamB.filter(p => !p.isEmpty).length + 
                               queue.length;
    
    const totalPlaceholdersNeeded = match.totalSlots - totalAssignedPlayers;
    
    const placeholders = Array.from({ length: Math.max(0, totalPlaceholdersNeeded) }).map((_, i) => ({
      isPlaceholder: true,
      position: 'ANY',
      user: {
        name: `Player ${queue.length + i + 1}`,
      }
    }));
    
    return {
      teamA: assignedTeamA,
      teamB: assignedTeamB,
      queue: [...queue, ...placeholders]
    };
  };
  
  const [isMobile, setIsMobile] = useState(true);

  // Effect to detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Get positions based on screen size
  const getPositions = (team) => {
    if (isMobile) {
      return fieldConfig.positions.mobile[team];
    } else {
      return fieldConfig.positions.desktop[team];
    }
  };
  
  return (
    <div className="space-y-6 mt-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
          Match Formation
        </h2>
        
        <div className="bg-amber-500/10 p-2 rounded text-amber-300 text-sm">
          <p className="flex items-center">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Formation: {fieldConfig.name} ({match.matchType || "11-aside"})
          </p>
        </div>
      </div>
      
      {/* Team labels for mobile/desktop */}
      <div className="flex justify-between px-4">
        <Badge className="md:bg-black md:text-white bg-white text-black">
          <span className="md:block hidden">Team Black</span>
          <span className="md:hidden block">Team White</span>
        </Badge>
        <Badge className="md:bg-white md:text-black bg-black text-white">
          <span className="md:block hidden">Team White</span>
          <span className="md:hidden block">Team Black</span>
        </Badge>
      </div>
      
      {/* Football pitch - responsive design for mobile/desktop */}
      <div className={`relative ${fieldConfig.fieldClass} rounded-lg overflow-hidden border border-amber-500/20 bg-gradient-to-r md:bg-gradient-to-r bg-gradient-to-b from-green-800 to-green-700`}>
        {/* Field markings - responsive for mobile/desktop */}
        <div className="absolute inset-0">
          {/* Center circle */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${fieldConfig.centerCircleSize} border-2 border-white/60 rounded-full`}></div>
          
          {/* Center line - horizontal on mobile, vertical on desktop */}
          <div className="absolute md:top-0 md:left-1/2 md:transform-gpu md:-translate-x-1/2 md:w-0.5 md:h-full top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-white/60"></div>
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/80 rounded-full"></div>
          
          {/* Goal areas - adjust for mobile/desktop */}
          <div className="md:absolute md:left-0 md:top-1/2 md:transform md:-translate-y-1/2 md:h-32 md:w-8 absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-8 border-2 border-white/60 md:border-l-0 border-t-0"></div>
          <div className="md:absolute md:right-0 md:top-1/2 md:transform md:-translate-y-1/2 md:h-32 md:w-8 absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-8 border-2 border-white/60 md:border-r-0 border-b-0"></div>
          
          {/* Penalty areas - adjust for mobile/desktop */}
          <div className="md:absolute md:left-0 md:top-1/2 md:transform md:-translate-y-1/2 md:h-48 md:w-16 absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-16 border-2 border-white/60 md:border-l-0 border-t-0"></div>
          <div className="md:absolute md:right-0 md:top-1/2 md:transform md:-translate-y-1/2 md:h-48 md:w-16 absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-16 border-2 border-white/60 md:border-r-0 border-b-0"></div>
        </div>
        
        {/* Display Team A (Black on Desktop, White on Mobile) players */}
        {teamA.map((player, index) => {
          // Get the position data for this player
          const position = teamAPositions[index] || teamAPositions[0]; // Fallback to first position if index out of bounds
          
          return (
          <TooltipProvider key={`teamA-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="absolute"
                  style={{
                    left: position.x,
                    top: position.y,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {player.isEmpty ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full border-2 md:border-black md:bg-black/30 border-white bg-white/30">
                        <span className="text-xs font-bold md:text-white/70 text-black/70">
                          {position.id}
                        </span>
                      </div>
                      <div className="mt-1 px-1.5 py-0.5 text-xs rounded-md md:bg-black/60 md:text-white/80 bg-white/60 text-black/80">
                        {position.role}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 ring-2 md:ring-black md:bg-black ring-white bg-white">
                        {player.user.profileImage ? (
                          <AvatarImage src={player.user.profileImage} alt={player.user.name} />
                        ) : (
                          <AvatarFallback className="md:bg-gray-900 md:text-amber-400 bg-gray-100 text-amber-800">
                            {player.user.name.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="mt-1 px-1.5 py-0.5 text-xs font-medium rounded-md md:bg-black md:text-white bg-white text-black">
                        {position.id}
                      </div>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              {!player.isEmpty && (
                <TooltipContent>
                  <div className="space-y-1 p-1">
                    <p className="font-medium">{player.user.name}</p>
                    <p className="text-xs">Position: {position.role}</p>
                    <p className="text-xs">Skill: {player.user.skillLevel || 75}/100</p>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )})}
        
        {/* Display Team B (White on Desktop, Black on Mobile) players */}
        {teamB.map((player, index) => {
          // Get the position data for this player
          const position = teamBPositions[index] || teamBPositions[0]; // Fallback to first position if index out of bounds
          
          return (
          <TooltipProvider key={`teamB-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="absolute"
                  style={{
                    left: position.x,
                    top: position.y,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {player.isEmpty ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full border-2 md:border-white md:bg-white/30 border-black bg-black/30">
                        <span className="text-xs font-bold md:text-black/70 text-white/70">
                          {position.id}
                        </span>
                      </div>
                      <div className="mt-1 px-1.5 py-0.5 text-xs rounded-md md:bg-white/60 md:text-black/80 bg-black/60 text-white/80">
                        {position.role}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 ring-2 md:ring-white md:bg-white ring-black bg-black">
                        {player.user.profileImage ? (
                          <AvatarImage src={player.user.profileImage} alt={player.user.name} />
                        ) : (
                          <AvatarFallback className="md:bg-gray-100 md:text-amber-800 bg-gray-900 text-amber-400">
                            {player.user.name.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="mt-1 px-1.5 py-0.5 text-xs font-medium rounded-md md:bg-white md:text-black bg-black text-white">
                        {position.id}
                      </div>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              {!player.isEmpty && (
                <TooltipContent>
                  <div className="space-y-1 p-1">
                    <p className="font-medium">{player.user.name}</p>
                    <p className="text-xs">Position: {position.role}</p>
                    <p className="text-xs">Skill: {player.user.skillLevel || 75}/100</p>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )})}

      </div>
      
      {/* Team assignment overview - responsive design */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-gradient-to-br from-gray-900/80 to-black/80 p-4 border border-amber-500/10">
          <h3 className="text-sm font-semibold text-amber-400 mb-2">
            <span className="md:inline hidden">Team Black</span>
            <span className="md:hidden inline">Team White</span>
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-white/60">Players</p>
              <p className="text-lg font-bold text-white">
                {teamA.filter(p => !p.isEmpty).length}/{teamAPositions.length}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {teamA.map((player, index) => (
                <div key={index} className={`w-6 h-6 rounded-full ${player.isEmpty ? 'md:bg-black/30 md:border-dashed md:border-amber-500/30 bg-white/30 border-dashed border-amber-500/30' : 'md:bg-black md:border-amber-500/30 bg-white border-amber-500/30'} flex items-center justify-center border`}>
                  {!player.isEmpty && (
                    <span className="text-xs md:text-amber-400 text-amber-800">{index+1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-gradient-to-br from-gray-100/10 to-white/10 p-4 border border-amber-500/10">
          <h3 className="text-sm font-semibold text-amber-400 mb-2">
            <span className="md:inline hidden">Team White</span>
            <span className="md:hidden inline">Team Black</span>
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-white/60">Players</p>
              <p className="text-lg font-bold text-white">
                {teamB.filter(p => !p.isEmpty).length}/{teamBPositions.length}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {teamB.map((player, index) => (
                <div key={index} className={`w-6 h-6 rounded-full ${player.isEmpty ? 'md:bg-white/30 md:border-dashed md:border-amber-500/30 bg-black/30 border-dashed border-amber-500/30' : 'md:bg-white md:border-amber-500/30 bg-black border-amber-500/30'} flex items-center justify-center border`}>
                  {!player.isEmpty && (
                    <span className="text-xs md:text-gray-800 text-amber-400">{index+1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Waiting Queue */}
      <Card className="overflow-hidden border-amber-500/20 bg-black/60 backdrop-blur-sm mt-6">
        <div className="bg-gradient-to-r from-amber-950 to-gray-900 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Waiting Queue</h3>
          </div>
          <Badge className="bg-amber-500/20 border-amber-500/30 text-amber-300">
            {queue.length} Players
          </Badge>
        </div>
        
        <div className="p-4">
          {queue.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {queue.map((player, index) => (
                <div key={index} className="flex items-center p-2 rounded-md bg-gray-800/50 border border-amber-500/10">
                  {player.isPlaceholder ? (
                    <div className="h-10 w-10 mr-3 rounded-full border border-dashed border-amber-500/30 flex items-center justify-center bg-amber-500/10">
                      <Users className="h-5 w-5 text-amber-400/50" />
                    </div>
                  ) : (
                    <Avatar className="h-10 w-10 mr-3 border border-amber-500/30">
                      {player.user.profileImage ? (
                        <AvatarImage src={player.user.profileImage} alt={player.user.name} />
                      ) : (
                        <AvatarFallback className="bg-amber-800/50 text-amber-200">
                          {player.user.name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${player.isPlaceholder ? 'text-white/50 italic' : 'text-white'}`}>
                        {player.user.name}
                        {player.isPlaceholder && " (Spot Available)"}
                      </p>
                      <Badge className={player.isPlaceholder ? 
                        "bg-gray-500/20 text-gray-300 border-gray-500/30" : 
                        "bg-blue-500/20 text-blue-300 border-blue-500/30"}>
                        #{index + 1}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center mt-1 text-white/60 text-xs">
                      {player.isPlaceholder ? (
                        <span>Waiting for player to join...</span>
                      ) : (
                        <>
                          <span className="mr-3">
                            Position: {player.user.preferredPosition || 'Any'}
                          </span>
                          {player.user.skillLevel && (
                            <span>
                              Skill: {player.user.skillLevel}/100
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-white/60">No players in waiting queue.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MatchFieldVisualization;