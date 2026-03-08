/**
 * Branch Card Component
 * Card hiển thị thông tin chi nhánh trong grid
 */

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Utensils, Eye, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BranchCardProps {
  branch: {
    id: string;
    name: string;
    address?: string;
    status?: string;
    tables_count?: number;
    staff_count?: number;
    orders_today?: number;
    revenue_today?: number;
    image_url?: string;
  };
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function BranchCard({ branch, onView, onEdit, onDelete }: BranchCardProps) {
  const statusColors = {
    Active: 'bg-green-100 text-green-800',
    ACTIVE: 'bg-green-100 text-green-800',
    Inactive: 'bg-gray-100 text-gray-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    Maintenance: 'bg-orange-100 text-orange-800',
    Closed: 'bg-red-100 text-red-800',
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Cover Image */}
      <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 relative">
        {branch.image_url ? (
          <img
            src={branch.image_url}
            alt={branch.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="h-16 w-16 text-primary/30" />
          </div>
        )}
        {branch.status && (
          <Badge
            className={cn(
              'absolute top-3 right-3',
              statusColors[branch.status as keyof typeof statusColors] || 'bg-gray-100'
            )}
          >
            {branch.status}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        {/* Branch Name */}
        <h3 className="font-semibold text-lg mb-2 truncate">{branch.name}</h3>

        {/* Address */}
        {branch.address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{branch.address}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Utensils className="h-3 w-3" />
            </div>
            <p className="text-lg font-semibold">{branch.tables_count || 0}</p>
            <p className="text-xs text-muted-foreground">Tables</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Users className="h-3 w-3" />
            </div>
            <p className="text-lg font-semibold">{branch.staff_count || 0}</p>
            <p className="text-xs text-muted-foreground">Staff</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Utensils className="h-3 w-3" />
            </div>
            <p className="text-lg font-semibold">{branch.orders_today || 0}</p>
            <p className="text-xs text-muted-foreground">Orders</p>
          </div>
        </div>

        {/* Revenue */}
        {branch.revenue_today !== undefined && (
          <div className="mt-3 p-2 bg-primary/5 rounded-lg">
            <p className="text-xs text-muted-foreground">Today's Revenue</p>
            <p className="text-lg font-semibold text-primary">
              ${branch.revenue_today.toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {onView && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(branch.id)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        )}
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(branch.id)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(branch.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
