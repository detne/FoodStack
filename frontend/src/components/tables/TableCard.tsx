/**
 * Table Card Component
 * Displays individual table information with status and actions
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  QrCode, 
  Eye, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  status: 'FREE' | 'OCCUPIED' | 'RESERVED' | 'OUT_OF_SERVICE';
  area_id: string;
  qr_code_url?: string;
  created_at: string;
  updated_at: string;
}

interface Reservation {
  id: string;
  guest_name: string;
  guest_count: number;
  reservation_time: string;
  status: string;
}

interface TableCardProps {
  table: Table;
  reservations?: Reservation[];
  userRole: 'owner' | 'manager' | 'staff' | 'receptionist';
  onStatusChange?: (tableId: string, newStatus: string) => void;
  onViewDetails?: (table: Table) => void;
  onShowQR?: (table: Table) => void;
  onDelete?: (tableId: string) => void;
  className?: string;
}

const statusConfig = {
  FREE: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    label: 'Available'
  },
  OCCUPIED: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    label: 'Occupied'
  },
  RESERVED: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Clock,
    label: 'Reserved'
  },
  OUT_OF_SERVICE: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: AlertCircle,
    label: 'Out of Service'
  }
};

export default function TableCard({
  table,
  reservations = [],
  userRole,
  onStatusChange,
  onViewDetails,
  onShowQR,
  onDelete,
  className = ''
}: TableCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const statusInfo = statusConfig[table.status];
  const StatusIcon = statusInfo.icon;

  const canDelete = ['manager'].includes(userRole);
  const canChangeStatus = ['manager', 'staff', 'receptionist'].includes(userRole);
  const canViewQR = ['owner', 'manager', 'staff', 'receptionist'].includes(userRole);

  const activeReservations = reservations.filter(r => 
    r.status === 'CONFIRMED' && new Date(r.reservation_time) > new Date()
  );

  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails?.(table)}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{table.table_number}</h3>
              <p className="text-sm text-muted-foreground">
                Capacity: {table.capacity} guests
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <Badge className={`${statusInfo.color} px-3 py-1 rounded-full flex items-center gap-1`}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>

        {/* Reservations Count */}
        {activeReservations.length > 0 && (
          <div className="mb-4">
            <Badge className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
              {activeReservations.length} upcoming reservation{activeReservations.length > 1 ? 's' : ''}
            </Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex items-center gap-2 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(table);
            }}
            className="flex-1 gap-2"
          >
            <Eye className="h-4 w-4" />
            Details
          </Button>
          
          {canViewQR && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onShowQR?.(table);
              }}
              className="gap-2"
            >
              <QrCode className="h-4 w-4" />
              QR
            </Button>
          )}
          
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(table.id);
              }}
              className="text-destructive hover:text-destructive gap-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Quick Status Change for Staff */}
        {canChangeStatus && userRole === 'staff' && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant={table.status === 'FREE' ? 'default' : 'outline'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange?.(table.id, 'FREE');
                }}
                className="flex-1"
              >
                Free
              </Button>
              <Button
                variant={table.status === 'OCCUPIED' ? 'default' : 'outline'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange?.(table.id, 'OCCUPIED');
                }}
                className="flex-1"
              >
                Occupied
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}