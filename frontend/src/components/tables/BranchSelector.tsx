/**
 * BranchSelector Component
 * Grid-based branch selection with card layout
 */

import { Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string | null;
}

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranch: string;
  onSelectBranch: (branchId: string) => void;
}

export default function BranchSelector({
  branches,
  selectedBranch,
  onSelectBranch,
}: BranchSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {branches.map((branch) => {
        const isSelected = selectedBranch === branch.id;
        
        return (
          <Card
            key={branch.id}
            onClick={() => onSelectBranch(branch.id)}
            className={`
              relative cursor-pointer transition-all duration-300 
              bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm
              hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1
              ${
                isSelected
                  ? 'border-2 border-primary shadow-lg shadow-primary/20 bg-gradient-to-br from-primary/10 to-primary/5'
                  : 'border border-border/50 hover:border-primary/50'
              }
            `}
          >
            <CardContent className="p-6 space-y-3">
              {/* Branch Name */}
              <div className="space-y-1">
                <h3 className={`
                  font-semibold text-base leading-tight line-clamp-2
                  ${isSelected ? 'text-primary' : 'text-foreground'}
                `}>
                  {branch.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {branch.address}
                </p>
              </div>

              {/* Phone Number */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {branch.phone || 'No phone'}
                </span>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
