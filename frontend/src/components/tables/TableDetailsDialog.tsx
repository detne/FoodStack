/**
 * Table Details Dialog Component
 * Shows detailed table information with reservations and status management
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Clock, 
  Calendar,
  Phone,
  Mail,
  Edit3,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Copy
} from 'lucide-react';

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  status: 'FREE' | 'OCCUPIED' | 'RESERVED' | 'OUT_OF_SERVICE';
  area_id: string;
  created_at: string;
  updated_at: string;
}

interface Area {
  id: string;
  name: string;
}

interface Reservation {
  id: string;
  guest_name: string;
  guest_phone?: string;
  guest_email?: string;
  guest_count: number;
  reservation_time: string;
  status: string;
  special_requests?: string;
}

interface TableDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
  areas: Area[];
  reservations: Reservation[];
  userRole: 'owner' | 'manager' | 'staff' | 'receptionist';
  onUpdateTable?: (tableId: string, data: any) => Promise<void>;
  onStatusChange?: (tableId: string, newStatus: string) => Promise<void>;
  branchId: string;
}

const statusOptions = [
  { value: 'FREE', label: 'Available', color: 'bg-green-100 text-green-800' },
  { value: 'OCCUPIED', label: 'Occupied', color: 'bg-red-100 text-red-800' },
  { value: 'RESERVED', label: 'Reserved', color: 'bg-blue-100 text-blue-800' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service', color: 'bg-gray-100 text-gray-800' }
];

export default function TableDetailsDialog({
  isOpen,
  onClose,
  table,
  areas,
  reservations,
  userRole,
  onUpdateTable,
  onStatusChange,
  branchId
}: TableDetailsDialogProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [currentReservationIndex, setCurrentReservationIndex] = useState(0);
  const [editData, setEditData] = useState({
    table_number: '',
    capacity: '',
    area_id: ''
  });

  const canEdit = ['manager'].includes(userRole);
  const canChangeStatus = ['manager', 'staff', 'receptionist'].includes(userRole);

  useEffect(() => {
    if (table) {
      setEditData({
        table_number: table.table_number,
        capacity: table.capacity.toString(),
        area_id: table.area_id
      });
      setCurrentReservationIndex(0);
    }
  }, [table]);

  const handleSaveEdit = async () => {
    if (!table || !onUpdateTable) return;

    try {
      await onUpdateTable(table.id, {
        table_number: editData.table_number,
        capacity: parseInt(editData.capacity),
        area_id: editData.area_id
      });
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Table updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update table',
        variant: 'destructive'
      });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!table || !onStatusChange) return;

    try {
      await onStatusChange(table.id, newStatus);
      toast({
        title: 'Success',
        description: 'Table status updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const handleCopyTableUrl = async () => {
    if (!table) return;
    
    const tableUrl = `${window.location.origin}/t/${branchId}/${table.id}`;
    try {
      await navigator.clipboard.writeText(tableUrl);
      toast({
        title: 'Copied',
        description: 'Table URL copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy URL',
        variant: 'destructive'
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!table) return null;

  const currentStatus = statusOptions.find(s => s.value === table.status);
  const currentArea = areas.find(a => a.id === table.area_id);
  const activeReservations = reservations.filter(r => 
    r.status === 'CONFIRMED' && new Date(r.reservation_time) > new Date()
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Table Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Table Information</h3>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Table Number</Label>
                      <Input
                        value={editData.table_number}
                        onChange={(e) => setEditData({ ...editData, table_number: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Capacity</Label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={editData.capacity}
                        onChange={(e) => setEditData({ ...editData, capacity: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Area</Label>
                      <Select 
                        value={editData.area_id} 
                        onValueChange={(value) => setEditData({ ...editData, area_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {areas.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} size="sm" className="gap-2">
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)} 
                        size="sm"
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{table.table_number}</span>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="gap-2"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Capacity: {table.capacity} guests</p>
                      <p>Area: {currentArea?.name || 'Unknown'}</p>
                      <p>Created: {formatDateTime(table.created_at)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Status & Actions</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Current Status</Label>
                    <div className="mt-2">
                      <Badge className={`${currentStatus?.color} px-3 py-1`}>
                        {currentStatus?.label}
                      </Badge>
                    </div>
                  </div>

                  {canChangeStatus && (
                    <div>
                      <Label>Change Status</Label>
                      <Select onValueChange={handleStatusChange}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleCopyTableUrl}
                    className="w-full gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Table URL
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reservations */}
          {activeReservations.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">
                    Upcoming Reservations ({activeReservations.length})
                  </h3>
                  {activeReservations.length > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentReservationIndex(Math.max(0, currentReservationIndex - 1))}
                        disabled={currentReservationIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {currentReservationIndex + 1} of {activeReservations.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentReservationIndex(Math.min(activeReservations.length - 1, currentReservationIndex + 1))}
                        disabled={currentReservationIndex === activeReservations.length - 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {activeReservations[currentReservationIndex] && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{activeReservations[currentReservationIndex].guest_name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            {activeReservations[currentReservationIndex].guest_count} guests
                          </div>
                          {activeReservations[currentReservationIndex].guest_phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {activeReservations[currentReservationIndex].guest_phone}
                            </div>
                          )}
                          {activeReservations[currentReservationIndex].guest_email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {activeReservations[currentReservationIndex].guest_email}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Reservation Time</span>
                        </div>
                        <p className="text-sm">
                          {formatDateTime(activeReservations[currentReservationIndex].reservation_time)}
                        </p>
                        {activeReservations[currentReservationIndex].special_requests && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Special Requests:</p>
                            <p className="text-sm text-muted-foreground">
                              {activeReservations[currentReservationIndex].special_requests}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeReservations.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No upcoming reservations</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}