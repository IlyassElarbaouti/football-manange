'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickFilterTabsProps {
  onChange?: (filter: string) => void;
}

export default function QuickFilterTabs({ onChange }: QuickFilterTabsProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (onChange) {
      onChange(filter);
    }
  };

  const filters = [
    { id: 'all', label: 'All Matches' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'in-progress', label: 'In Progress' },
  ];

  return (
    <div className="mb-6 overflow-x-auto pb-2">
      <div className="flex space-x-2">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant="outline"
            size="sm"
            className={cn(
              "border-amber-500/20 bg-gray-800/30 text-sm transition-all",
              activeFilter === filter.id 
                ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30"
                : "text-white hover:bg-gray-800/50 hover:text-amber-400"
            )}
            onClick={() => handleFilterChange(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}