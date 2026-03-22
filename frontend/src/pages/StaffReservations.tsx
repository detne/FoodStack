/**
 * Staff Reservations
 * Quản lý đặt bàn cho nhân viên
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { 
  Search, 
  Plus,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Eye,
} from 'lucide-react';

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

interface Reservation {
  id: string;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  guest_count: number;
  reservation_date: string;
  reservation_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  special_requests?: string;
  table_id?: string;
  table?: {
    table_number: string;
  };
}

const statusConfig = {
  pending: { 
    label: 'Pending', 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: AlertCircle,
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: CheckCircle,
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
  },
};

export default function StaffReservations() {
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAssignTableDialogOpen, setIsAssignTableDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // New reservation form
  const [newReservation, setNewReservation] = useState({
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    guest_count: 2,
    reservation_date: '',
    reservation_time: '',
    special_requests: '',
    table_id: '', // For phone booking - assign table immediately
  });

  useEffect(() => {
    // Wait a bit for token to be set by AuthContext
    const timer = setTimeout(() => {
      const branchId = localStorage.getItem('selected_branch_id');
      const token = localStorage.getItem('access_token');
      
      if (token && branchId) {
        fetchReservations();
        fetchTables();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const branchId = localStorage.getItem('selected_branch_id');
      const result = await apiClient.reservations.list(branchId!);
      
      console.log('Reservations API result:', result);
      
      if (result.success && result.data) {
        // Handle both array and object with items
        const reservationList = Array.isArray(result.data) 
          ? result.data 
          : result.data.items || [];
        console.log('Reservations list:', reservationList);
        setReservations(reservationList);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reservations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const branchId = localStorage.getItem('selected_branch_id');
      const result = await apiClient.tables.list(branchId!);
      
      if (result.success && result.data) {
        console.log('Tables loaded:', result.data.length, 'tables');
        console.log('Sample table:', result.data[0]);
        setTables(result.data);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tables',
        variant: 'destructive',
      });
    }
  };

  const handleCreateReservation = async () => {
    // Validation
    if (!newReservation.guest_name || !newReservation.guest_phone || 
        !newReservation.reservation_date || !newReservation.reservation_time) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const branchId = localStorage.getItem('selected_branch_id');
      const result = await apiClient.reservations.create(branchId!, newReservation);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Reservation created successfully',
        });
        setIsNewDialogOpen(false);
        fetchReservations();
        // Reset form
        setNewReservation({
          guest_name: '',
          guest_phone: '',
          guest_email: '',
          guest_count: 2,
          reservation_date: '',
          reservation_time: '',
          special_requests: '',
          table_id: '',
        });
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create reservation',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmReservation = async (reservation: Reservation) => {
    // If table not assigned, show assign table dialog first
    if (!reservation.table_id) {
      setSelectedReservation(reservation);
      setIsAssignTableDialogOpen(true);
      return;
    }

    // If table already assigned, just confirm
    try {
      const branchId = localStorage.getItem('selected_branch_id');
      const result = await apiClient.reservations.confirm(
        branchId!,
        reservation.id
      );

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Reservation confirmed',
        });
        fetchReservations();
      }
    } catch (error) {
      console.error('Error confirming reservation:', error);
      toast({
        title: 'Error',
        description: 'Failed to confirm reservation',
        variant: 'destructive',
      });
    }
  };

  const handleAssignTable = async () => {
    if (!selectedTableId || !selectedReservation) {
      toast({
        title: 'Validation Error',
        description: 'Please select a table',
        variant: 'destructive',
      });
      return;
    }

    try {
      const branchId = localStorage.getItem('selected_branch_id');
      const result = await apiClient.reservations.assignTable(
        branchId!,
        selectedReservation.id,
        selectedTableId
      );

      if (result.success) {
        // After assigning table, confirm the reservation
        await apiClient.reservations.confirm(
          branchId!,
          selectedReservation.id
        );

        toast({
          title: 'Success',
          description: 'Table assigned and reservation confirmed',
        });
        setIsAssignTableDialogOpen(false);
        setSelectedTableId('');
        setSelectedReservation(null);
        fetchReservations();
      }
    } catch (error) {
      console.error('Error assigning table:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign table',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteReservation = async (id: string) => {
    try {
      const branchId = localStorage.getItem('selected_branch_id');
      const result = await apiClient.reservations.complete(branchId!, id);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Reservation completed and table freed',
        });
        fetchReservations();
        fetchTables(); // Refresh tables to show updated status
      }
    } catch (error) {
      console.error('Error completing reservation:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete reservation',
        variant: 'destructive',
      });
    }
  };

  const handleCancelReservation = async (id: string) => {
    try {
      const branchId = localStorage.getItem('selected_branch_id');
      const result = await apiClient.reservations.cancel(branchId!, id);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Reservation cancelled',
        });
        fetchReservations();
        fetchTables(); // Refresh tables
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel reservation',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDetailDialogOpen(true);
  };

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch = 
      res.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.guest_phone?.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || res.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status?.toLowerCase() === 'pending').length,
    confirmed: reservations.filter(r => r.status?.toLowerCase() === 'confirmed').length,
    today: reservations.filter(r => 
      r.reservation_date === new Date().toISOString().split('T')[0]
    ).length,
  };

  return (
    <div className="space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground mt-1">
            Manage table reservations
          </p>
        </div>
        <Button onClick={() => setIsNewDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Reservation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{stats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{stats.today}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-input"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading...</p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No reservations found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReservations.map((res) => {
                const StatusIcon = statusConfig[res.status].icon;
                return (
                  <Card key={res.id} className="hover:shadow-md transition-shadow bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-foreground">{res.guest_name}</h3>
                            <Badge className={statusConfig[res.status].color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[res.status].label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{res.reservation_date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{res.reservation_time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>{res.guest_count} guests</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{res.guest_phone}</span>
                            </div>
                          </div>

                          {res.table && (
                            <div className="flex items-center gap-2 text-sm mt-2">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-blue-600">
                                {res.table.table_number.startsWith('Table') 
                                  ? res.table.table_number 
                                  : `Table ${res.table.table_number}`}
                              </span>
                            </div>
                          )}

                          {res.special_requests && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              Note: {res.special_requests}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(res)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {res.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handleConfirmReservation(res)}
                              >
                                {res.table_id ? 'Confirm' : 'Assign & Confirm'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleCancelReservation(res.id)}
                              >
                                Cancel
                              </Button>
                            </>
                          )}

                          {res.status === 'confirmed' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                onClick={() => handleCompleteReservation(res.id)}
                              >
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleCancelReservation(res.id)}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Reservation Dialog - Updated Layout 2 Columns */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="max-w-3xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">New Reservation</DialogTitle>
            <DialogDescription>
              Create a new table reservation (Phone Booking)
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">{/* Two column layout */}
            {/* Left Column - Guest Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="guest_name">Guest Name *</Label>
                <Input
                  id="guest_name"
                  value={newReservation.guest_name}
                  onChange={(e) => setNewReservation({ ...newReservation, guest_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="guest_phone">Phone Number *</Label>
                <Input
                  id="guest_phone"
                  value={newReservation.guest_phone}
                  onChange={(e) => setNewReservation({ ...newReservation, guest_phone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <Label htmlFor="guest_email">Email (Optional)</Label>
                <Input
                  id="guest_email"
                  type="email"
                  value={newReservation.guest_email}
                  onChange={(e) => setNewReservation({ ...newReservation, guest_email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="reservation_date">Date *</Label>
                  <Input
                    id="reservation_date"
                    type="date"
                    value={newReservation.reservation_date}
                    onChange={(e) => setNewReservation({ ...newReservation, reservation_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="reservation_time">Time *</Label>
                  <Input
                    id="reservation_time"
                    type="time"
                    value={newReservation.reservation_time}
                    onChange={(e) => setNewReservation({ ...newReservation, reservation_time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="guest_count">Number of Guests *</Label>
                <Select
                  value={newReservation.guest_count.toString()}
                  onValueChange={(value) => setNewReservation({ ...newReservation, guest_count: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'guest' : 'guests'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="special_requests">Special Requests (Optional)</Label>
                <Textarea
                  id="special_requests"
                  value={newReservation.special_requests}
                  onChange={(e) => setNewReservation({ ...newReservation, special_requests: e.target.value })}
                  placeholder="Any special requirements..."
                  rows={3}
                />
              </div>
            </div>

            {/* Right Column - Table Selection */}
            {/* Right Column - Table Selection */}
            <div className="space-y-3">
              <Label className="block">Assign Table (Optional)</Label>
              <div className="space-y-2">
                {/* No table option */}
                <div
                  onClick={() => setNewReservation({ ...newReservation, table_id: '' })}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    !newReservation.table_id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      !newReservation.table_id ? 'border-primary' : 'border-muted-foreground'
                    }`}>
                      {!newReservation.table_id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="font-medium">No table (assign later)</span>
                  </div>
                </div>

                {/* Available tables - horizontal list */}
                {tables.filter(t => t.status === 'available' && t.capacity >= newReservation.guest_count).length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {tables
                      .filter(t => t.status === 'available' && t.capacity >= newReservation.guest_count)
                      .sort((a, b) => a.capacity - b.capacity || a.table_number.localeCompare(b.table_number))
                      .map((table) => (
                        <div
                          key={table.id}
                          onClick={() => setNewReservation({ ...newReservation, table_id: table.id })}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            newReservation.table_id === table.id
                              ? 'border-primary bg-primary/10 shadow-sm'
                              : 'border-border hover:border-primary/50 hover:bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              newReservation.table_id === table.id ? 'border-primary' : 'border-muted-foreground'
                            }`}>
                              {newReservation.table_id === table.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                              )}
                            </div>
                            <div className="flex-1 flex items-center justify-between">
                              <span className="font-semibold">
                                {table.table_number.startsWith('Table') 
                                  ? table.table_number 
                                  : `Table ${table.table_number}`}
                              </span>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>{table.capacity} seats</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-amber-600 p-3 bg-amber-50 rounded-lg">
                    ⚠️ No available tables for {newReservation.guest_count} guests
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReservation}>
              Create Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Table Dialog */}
      <Dialog open={isAssignTableDialogOpen} onOpenChange={setIsAssignTableDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Assign Table</DialogTitle>
            <DialogDescription>
              Select a table for {selectedReservation?.guest_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Guests:</span>
                  <span className="ml-2 font-medium">{selectedReservation?.guest_count}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <span className="ml-2 font-medium">{selectedReservation?.reservation_date}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Time:</span>
                  <span className="ml-2 font-medium">{selectedReservation?.reservation_time}</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Select Table *</Label>
              {tables.filter(t => 
                t.status === 'available' && 
                t.capacity >= (selectedReservation?.guest_count || 0)
              ).length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {tables
                    .filter(t => 
                      t.status === 'available' && 
                      t.capacity >= (selectedReservation?.guest_count || 0)
                    )
                    .sort((a, b) => a.capacity - b.capacity || a.table_number.localeCompare(b.table_number))
                    .map((table) => (
                      <div
                        key={table.id}
                        onClick={() => setSelectedTableId(table.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedTableId === table.id
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-border hover:border-primary/50 hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedTableId === table.id ? 'border-primary' : 'border-muted-foreground'
                          }`}>
                            {selectedTableId === table.id && (
                              <div className="w-3 h-3 rounded-full bg-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-lg">
                                {table.table_number.startsWith('Table') 
                                  ? table.table_number 
                                  : `Table ${table.table_number}`}
                              </span>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>{table.capacity} seats</span>
                              </div>
                            </div>
                            {table.area_name && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span>{table.area_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">
                    ⚠️ No available tables for {selectedReservation?.guest_count} guests
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    Please check table availability or adjust party size
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAssignTableDialogOpen(false);
                setSelectedTableId('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignTable}>
              Assign & Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reservation Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Reservation Details</DialogTitle>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedReservation.guest_name}</h3>
                <Badge className={statusConfig[selectedReservation.status].color}>
                  {statusConfig[selectedReservation.status].label}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedReservation.guest_phone}</span>
                </div>

                {selectedReservation.guest_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedReservation.guest_email}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedReservation.reservation_date}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedReservation.reservation_time}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedReservation.guest_count} guests</span>
                </div>

                {selectedReservation.table && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-600">
                      {selectedReservation.table.table_number.startsWith('Table') 
                        ? selectedReservation.table.table_number 
                        : `Table ${selectedReservation.table.table_number}`}
                    </span>
                  </div>
                )}

                {selectedReservation.special_requests && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Special Requests:</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedReservation.special_requests}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                {selectedReservation.status === 'pending' && (
                  <>
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        handleConfirmReservation(selectedReservation);
                      }}
                    >
                      {selectedReservation.table_id ? 'Confirm' : 'Assign & Confirm'}
                    </Button>
                    <Button
                      className="flex-1"
                      variant="destructive"
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        handleCancelReservation(selectedReservation.id);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}

                {selectedReservation.status === 'confirmed' && (
                  <>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        handleCompleteReservation(selectedReservation.id);
                      }}
                    >
                      Complete
                    </Button>
                    <Button
                      className="flex-1"
                      variant="destructive"
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        handleCancelReservation(selectedReservation.id);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
