import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Grid3x3,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Calendar,
  StickyNote,
} from 'lucide-react';

interface Area {
  id: string;
  name: string;
  sort_order: number;
}

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'OUTOFSERVICE' | 'available' | 'occupied' | 'reserved' | 'outofservice';
  qr_token?: string;
  qr_code_url?: string;
  area_id: string;
  area_name?: string;
  areas?: Area;
}

interface Reservation {
  id: string;
  table_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: string;
  notes?: string;
  created_at: string;
}

const STATUS_CONFIG = {
  AVAILABLE: {
    label: 'Available',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle,
    badgeVariant: 'default' as const,
  },
  OCCUPIED: {
    label: 'Occupied',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: XCircle,
    badgeVariant: 'destructive' as const,
  },
  RESERVED: {
    label: 'Reserved',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: AlertCircle,
    badgeVariant: 'secondary' as const,
  },
  OUTOFSERVICE: {
    label: 'Out of Service',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: XCircle,
    badgeVariant: 'outline' as const,
  },
};

export default function StaffTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterArea, setFilterArea] = useState<string>('ALL');
  const [currentReservationIndex, setCurrentReservationIndex] = useState(0);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const branchId = user?.branchId || localStorage.getItem('selected_branch_id');

  useEffect(() => {
    if (branchId) {
      fetchTables();
      fetchReservations();
    } else {
      setLoading(false);
      setError('Branch information not found. Please login again.');
    }
  }, [branchId]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.tables.list(branchId);
      console.log('StaffTables - Tables response:', response);
      if (response.success) {
        setTables((response.data as Table[]) || []);
      } else {
        setError(response.message || 'Failed to load tables');
      }
    } catch (err: any) {
      console.error('Error fetching tables:', err);
      setError(err.message || 'Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await apiClient.getReservations({ branchId });
      if (response.success) {
        const data = response.data as any;
        setReservations(data?.reservations || []);
      }
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedTable || !newStatus) return;

    try {
      const response = await apiClient.updateTableStatus(selectedTable.id, newStatus);

      if (response.success) {
        await fetchTables();
        setShowStatusDialog(false);
        setSelectedTable(null);
        setNewStatus('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update table status');
    }
  };

  const openStatusDialog = (table: Table) => {
    setSelectedTable(table);
    setNewStatus(table.status);
    setShowStatusDialog(true);
  };

  const openDetailsDialog = (table: Table) => {
    setSelectedTable(table);
    setCurrentReservationIndex(0);
    setShowDetailsDialog(true);
  };

  // Group tables by area
  const groupedTables = tables.reduce((acc, table) => {
    const areaName = table.area_name || table.areas?.name || 'No Area';
    if (!acc[areaName]) {
      acc[areaName] = [];
    }
    acc[areaName].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  // Get unique areas
  const areas = Array.from(new Set(tables.map((t) => t.area_name || t.areas?.name || 'No Area')));

  // Filter tables
  const filteredTables = tables.filter((table) => {
    const statusMatch = filterStatus === 'ALL' || table.status === filterStatus;
    const areaMatch = filterArea === 'ALL' || table.areas?.name === filterArea;
    return statusMatch && areaMatch;
  });

  // Get reservations for selected table
  const tableReservations = selectedTable
    ? reservations.filter((r) => r.table_id === selectedTable.id && r.status !== 'CANCELLED')
    : [];

  // Statistics
  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'AVAILABLE').length,
    occupied: tables.filter((t) => t.status === 'OCCUPIED').length,
    reserved: tables.filter((t) => t.status === 'RESERVED').length,
    outOfService: tables.filter((t) => t.status === 'OUTOFSERVICE').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading tables...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">Error</p>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Table Management</h1>
        <p className="text-muted-foreground mt-1">View and update table status</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tables</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
              </div>
              <Grid3x3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200 hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Available</p>
                <p className="text-2xl font-bold text-green-800 mt-1">{stats.available}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200 hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Occupied</p>
                <p className="text-2xl font-bold text-red-800 mt-1">{stats.occupied}</p>
              </div>
              <Users className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200 hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Reserved</p>
                <p className="text-2xl font-bold text-yellow-800 mt-1">{stats.reserved}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-gray-200 hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">Out of Service</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.outOfService}</p>
              </div>
              <XCircle className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                  <SelectItem value="RESERVED">Reserved</SelectItem>
                  <SelectItem value="OUTOFSERVICE">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Filter by Area</Label>
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Areas</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tables by Area */}
      {Object.entries(groupedTables).map(([areaName, areaTables]) => {
        const visibleTables = areaTables.filter((table) => {
          const statusMatch = filterStatus === 'ALL' || table.status.toUpperCase() === filterStatus;
          const areaMatch = filterArea === 'ALL' || areaName === filterArea;
          return statusMatch && areaMatch;
        });

        if (visibleTables.length === 0) return null;

        return (
          <div key={areaName} className="space-y-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">{areaName}</h2>
              <Badge variant="secondary" className="ml-2">
                {visibleTables.length} {visibleTables.length === 1 ? 'table' : 'tables'}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleTables.map((table) => {
                const tableStatus = table.status.toUpperCase() as keyof typeof STATUS_CONFIG;
                const statusConfig = STATUS_CONFIG[tableStatus] || STATUS_CONFIG.AVAILABLE;
                const StatusIcon = statusConfig.icon;
                return (
                  <Card
                    key={table.id}
                    className={`hover:shadow-lg transition-all duration-200 border-2 ${statusConfig.color} hover:scale-105 cursor-pointer`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{table.table_number}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Users className="w-4 h-4" />
                            <span>{table.capacity} seats</span>
                          </div>
                        </div>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => openStatusDialog(table)}
                          className="flex-1"
                          variant="default"
                        >
                          Change Status
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openDetailsDialog(table)}
                          className="flex-1"
                          variant="outline"
                        >
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {filteredTables.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <Grid3x3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">No tables found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Change Table Status</DialogTitle>
            <DialogDescription>
              Update the status for {selectedTable?.table_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Current Status:{' '}
                <span className="font-bold">
                  {selectedTable && STATUS_CONFIG[selectedTable.status.toUpperCase() as keyof typeof STATUS_CONFIG]?.label}
                </span>
              </Label>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Select New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                  <SelectItem value="RESERVED">Reserved</SelectItem>
                  <SelectItem value="OUTOFSERVICE">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusDialog(false);
                setSelectedTable(null);
                setNewStatus('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusChange}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {selectedTable?.table_number} Details
            </DialogTitle>
            <DialogDescription>View table information and reservations</DialogDescription>
          </DialogHeader>

          {selectedTable && (
            <div className="space-y-6">
              {/* Table Info */}
              <Card className="bg-muted/50 border-border">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground mb-3">Table Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Grid3x3 className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Table Name</p>
                        <p className="font-medium text-foreground">{selectedTable.table_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Area</p>
                        <p className="font-medium text-foreground">{selectedTable.areas?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Capacity</p>
                        <p className="font-medium text-foreground">{selectedTable.capacity} seats</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge className={STATUS_CONFIG[selectedTable.status.toUpperCase() as keyof typeof STATUS_CONFIG]?.color}>
                          {STATUS_CONFIG[selectedTable.status.toUpperCase() as keyof typeof STATUS_CONFIG]?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reservations */}
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Reservations ({tableReservations.length})
                </h4>

                {tableReservations.length === 0 ? (
                  <Card className="bg-muted/50 border-border">
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No reservations</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-blue-700 font-medium">
                          Reservation {currentReservationIndex + 1} of {tableReservations.length}
                        </span>
                        <Badge
                          className={
                            tableReservations[currentReservationIndex].status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {tableReservations[currentReservationIndex].status}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Guest Name</p>
                            <p className="font-medium text-foreground">
                              {tableReservations[currentReservationIndex].customer_name}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Phone</p>
                              <p className="font-medium text-foreground text-sm">
                                {tableReservations[currentReservationIndex].customer_phone}
                              </p>
                            </div>
                          </div>
                          {tableReservations[currentReservationIndex].customer_email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="font-medium text-foreground text-sm truncate">
                                  {tableReservations[currentReservationIndex].customer_email}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Party Size</p>
                              <p className="font-medium text-foreground">
                                {tableReservations[currentReservationIndex].party_size} guests
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Date & Time</p>
                              <p className="font-medium text-foreground text-sm">
                                {new Date(
                                  tableReservations[currentReservationIndex].reservation_date
                                ).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}{' '}
                                {tableReservations[currentReservationIndex].reservation_time}
                              </p>
                            </div>
                          </div>
                        </div>

                        {tableReservations[currentReservationIndex].notes && (
                          <div className="flex items-start gap-2">
                            <StickyNote className="w-4 h-4 text-muted-foreground mt-1" />
                            <div>
                              <p className="text-xs text-muted-foreground">Notes</p>
                              <p className="font-medium text-foreground text-sm">
                                {tableReservations[currentReservationIndex].notes}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Carousel Controls */}
                      {tableReservations.length > 1 && (
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-blue-200">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setCurrentReservationIndex((prev) =>
                                prev === 0 ? tableReservations.length - 1 : prev - 1
                              )
                            }
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setCurrentReservationIndex((prev) =>
                                prev === tableReservations.length - 1 ? 0 : prev + 1
                              )
                            }
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDetailsDialog(false);
                setSelectedTable(null);
                setCurrentReservationIndex(0);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
