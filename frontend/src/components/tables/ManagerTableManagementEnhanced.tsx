/**
 * Enhanced Table Management Component
 * Comprehensive table management with role-based features
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Building,
  Trash2,
  RefreshCw
} from 'lucide-react';
import TableCard from './TableCard';
import TableDialog from './TableDialog';
import TableQRDialog from './TableQRDialog';
import TableDetailsDialog from './TableDetailsDialog';
import BranchSelector from './BranchSelector';

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

interface Area {
  id: string;
  name: string;
  description?: string;
  branch_id: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
}

interface Reservation {
  id: string;
  table_id: string;
  guest_name: string;
  guest_phone?: string;
  guest_email?: string;
  guest_count: number;
  reservation_time: string;
  status: string;
  special_requests?: string;
}

interface ManagerTableManagementEnhancedProps {
  allowBranchSelection?: boolean;
  hideAddButtons?: boolean;
  disableStatusChange?: boolean;
  userRole: 'owner' | 'manager' | 'staff' | 'receptionist';
}

export default function ManagerTableManagementEnhanced({
  allowBranchSelection = false,
  hideAddButtons = false,
  disableStatusChange = false,
  userRole
}: ManagerTableManagementEnhancedProps) {
  const { toast } = useToast();
  
  // Data states
  const [tables, setTables] = useState<Table[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  // UI states
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Dialog states
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchBranchData();
    }
  }, [selectedBranch]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      if (allowBranchSelection) {
        await fetchBranches();
      } else {
        // Get current branch from context/localStorage
        const currentBranch = localStorage.getItem('current_branch_id');
        if (currentBranch) {
          setSelectedBranch(currentBranch);
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Get user data to find restaurant ID
      const userData = localStorage.getItem('user');
      let restaurantId = null;
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          restaurantId = user?.restaurant?.id;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      
      if (!restaurantId) {
        console.error('No restaurant ID found');
        return;
      }
      
      const response = await fetch(`http://localhost:3000/api/v1/branches?restaurantId=${restaurantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setBranches(data.data);
          if (data.data.length > 0 && !selectedBranch) {
            setSelectedBranch(data.data[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchBranchData = async () => {
    if (!selectedBranch) return;

    try {
      await Promise.all([
        fetchAreas(),
        fetchTables(),
        fetchReservations()
      ]);
    } catch (error) {
      console.error('Error fetching branch data:', error);
    }
  };

  const fetchAreas = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/api/v1/branches/${selectedBranch}/areas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAreas(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/api/v1/branches/${selectedBranch}/tables`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setTables(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/api/v1/branches/${selectedBranch}/reservations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setReservations(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBranchData();
    setIsRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Table data has been updated',
    });
  };

  const handleCreateTable = () => {
    setSelectedTable(null);
    setDialogMode('create');
    setIsTableDialogOpen(true);
  };

  const handleEditTable = (table: Table) => {
    setSelectedTable(table);
    setDialogMode('edit');
    setIsTableDialogOpen(true);
  };

  const handleSaveTable = async (data: any) => {
    try {
      const token = localStorage.getItem('access_token');
      const isEdit = dialogMode === 'edit' && selectedTable;
      
      const url = isEdit 
        ? `http://localhost:3000/api/v1/tables/${selectedTable.id}`
        : `http://localhost:3000/api/v1/areas/${data.area_id}/tables`;
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Table ${isEdit ? 'updated' : 'created'} successfully`,
        });
        fetchTables();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${dialogMode} table`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/api/v1/tables/${tableId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Table deleted successfully',
        });
        fetchTables();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete table',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (tableId: string, newStatus: string) => {
    if (disableStatusChange) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/api/v1/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTables(tables.map(table => 
          table.id === tableId ? { ...table, status: newStatus as any } : table
        ));
        toast({
          title: 'Success',
          description: 'Table status updated',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update table status',
        variant: 'destructive',
      });
    }
  };

  const handleShowQR = (table: Table) => {
    setSelectedTable(table);
    setIsQRDialogOpen(true);
  };

  const handleViewDetails = (table: Table) => {
    setSelectedTable(table);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteArea = async (areaId: string) => {
    const areaHasTables = tables.some(table => table.area_id === areaId);
    if (areaHasTables) {
      toast({
        title: 'Cannot Delete',
        description: 'Cannot delete area that contains tables',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this area?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/api/v1/areas/${areaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Area deleted successfully',
        });
        fetchAreas();
        fetchTables();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete area',
        variant: 'destructive',
      });
    }
  };

  // Filter tables
  const filteredTables = tables.filter((table) => {
    const matchesSearch = table.table_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = selectedArea === 'all' || table.area_id === selectedArea;
    return matchesSearch && matchesArea;
  });

  // Group tables by area
  const tablesByArea = areas.map(area => ({
    ...area,
    tables: filteredTables.filter(table => table.area_id === area.id),
  }));

  // Statistics
  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'FREE').length,
    occupied: tables.filter(t => t.status === 'OCCUPIED').length,
    outOfService: tables.filter(t => t.status === 'OUT_OF_SERVICE').length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-6">
          <div className="h-96 bg-muted rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Table Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage tables, areas, and reservations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Branch Selection */}
      {allowBranchSelection && branches.length > 0 && (
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Select Branch</CardTitle>
                <p className="text-sm text-muted-foreground">Choose a branch to view its tables</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BranchSelector
              branches={branches}
              selectedBranch={selectedBranch}
              onSelectBranch={setSelectedBranch}
            />
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {!hideAddButtons && (
        <div className="flex gap-3">
          <Button onClick={() => setIsAreaDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Area
          </Button>
          <Button onClick={handleCreateTable} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Table
          </Button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tables</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out of Service</p>
                <p className="text-2xl font-bold text-gray-600">{stats.outOfService}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area.id} value={area.id}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tables by Area */}
      <div className="space-y-8">
        {tablesByArea.map((area, areaIndex) => (
          <div key={area.id} className="animate-in slide-in-from-left" style={{ animationDelay: `${areaIndex * 100}ms` }}>
            {/* Area Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                <div>
                  <h2 className="text-2xl font-bold">{area.name}</h2>
                  <p className="text-muted-foreground text-sm">
                    {area.tables.length} tables • {area.tables.filter(t => t.status === 'FREE').length} available
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {area.tables.length} tables
                </Badge>
                {!hideAddButtons && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteArea(area.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {area.tables.map((table, tableIndex) => (
                <TableCard
                  key={table.id}
                  table={table}
                  reservations={reservations.filter(r => r.table_id === table.id)}
                  userRole={userRole}
                  onStatusChange={handleStatusChange}
                  onViewDetails={handleViewDetails}
                  onShowQR={handleShowQR}
                  onDelete={handleDeleteTable}
                  className={`animate-in slide-in-from-bottom`}
                  style={{ animationDelay: `${(areaIndex * 100) + (tableIndex * 50)}ms` }}
                />
              ))}
            </div>

            {area.tables.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tables in this area</p>
                {!hideAddButtons && (
                  <Button onClick={handleCreateTable} variant="outline" className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Table
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {areas.length === 0 && (
        <Card className="animate-in slide-in-from-bottom duration-500">
          <CardContent className="p-12 text-center">
            <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No areas found</h3>
            <p className="text-muted-foreground mb-6">
              Create your first area to start managing tables
            </p>
            {!hideAddButtons && (
              <Button onClick={() => setIsAreaDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Area
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <TableDialog
        isOpen={isTableDialogOpen}
        onClose={() => setIsTableDialogOpen(false)}
        onSave={handleSaveTable}
        table={selectedTable}
        areas={areas}
        existingTables={tables}
        mode={dialogMode}
      />

      <TableQRDialog
        isOpen={isQRDialogOpen}
        onClose={() => setIsQRDialogOpen(false)}
        table={selectedTable}
        branchId={selectedBranch}
      />

      <TableDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        table={selectedTable}
        areas={areas}
        reservations={reservations.filter(r => r.table_id === selectedTable?.id)}
        userRole={userRole}
        onUpdateTable={handleSaveTable}
        onStatusChange={handleStatusChange}
        branchId={selectedBranch}
      />
    </div>
  );
}