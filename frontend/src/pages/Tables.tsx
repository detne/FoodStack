/**
 * Table Management Suite
 * Quản lý trạng thái bàn với detail panel
 */

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Building2,
  QrCode,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import BranchSelector from '@/components/tables/BranchSelector';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
}

interface Area {
  id: string;
  name: string;
  branch_id: string;
}

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  status: 'FREE' | 'OCCUPIED' | 'INACTIVE';
  area_id: string;
  area_name?: string;
  qr_token?: string;
  qr_code_url?: string;
}

const statusConfig = {
  FREE: {
    label: 'Available',
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    icon: CheckCircle,
  },
  OCCUPIED: {
    label: 'Occupied',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    icon: Users,
  },
  INACTIVE: {
    label: 'Out of Service',
    color: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    icon: AlertCircle,
  },
};

export default function Tables() {
  const { toast } = useToast();

  // Data states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [userRole, setUserRole] = useState<string>('');

  // Permission helpers (computed after userRole state is declared)
  const canManageTables = userRole === 'manager' || userRole === 'owner';
  const canEditTables = userRole === 'manager';
  const isOwnerReadOnly = userRole === 'owner';

  // Debug log
  console.log('User role:', userRole);
  console.log('Can edit tables:', canEditTables);
  console.log('Is owner read-only:', isOwnerReadOnly);
  
  // UI states
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('all');
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTablesLoading, setIsTablesLoading] = useState(false);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [isDeleteLoading, setIsDeleteLoading] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [tableFormData, setTableFormData] = useState({
    capacity: 4,
    areaId: '',
  });
  
  // QR Modal states
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Fetch branches on mount
  useEffect(() => {
    // Get user role from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('User data from localStorage:', user);
        console.log('User role from data:', user?.role);
        setUserRole(user?.role?.toLowerCase() || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    fetchBranches();
  }, []);

  // Fetch areas and tables when branch changes
  useEffect(() => {
    if (selectedBranch) {
      fetchAreas();
      fetchTables();
    }
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
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
        toast({
          title: "Error",
          description: "No restaurant found. Please contact support.",
          variant: "destructive",
        });
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load branches',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAreas = async () => {
    if (!selectedBranch) return;

    try {
      const token = localStorage.getItem('access_token');
      console.log('Fetching areas for branch:', selectedBranch);
      
      const response = await fetch(`http://localhost:3000/api/v1/branches/${selectedBranch}/areas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Areas response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Areas data:', data);
        
        if (data.success && data.data) {
          setAreas(data.data);
          console.log('Set areas:', data.data.length);
        }
      } else {
        const errorData = await response.json();
        console.error('Areas fetch error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchTables = async () => {
    if (!selectedBranch) return;

    try {
      setIsTablesLoading(true);
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load tables',
      });
    } finally {
      setIsTablesLoading(false);
    }
  };

  // Auto-generate table number
  const getNextTableNumber = useMemo(() => {
    if (tables.length === 0) return 1;
    const tableNumbers = tables
      .map(table => {
        const match = table.table_number.match(/(?:table|bàn)\s*(\d+)/i);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((num): num is number => num !== null);
    if (tableNumbers.length === 0) return 1;
    return Math.max(...tableNumbers) + 1;
  }, [tables]);

  const autoGeneratedTag = useMemo(() => {
    return `Table ${getNextTableNumber}`;
  }, [getNextTableNumber]);

  // Group tables by area
  const areaMap = useMemo(() => {
    const map = new Map<string, { areaName: string; tables: Table[] }>();
    tables.forEach((table) => {
      const areaId = table.area_id || 'unknown';
      const areaName = table.area_name || areas.find(a => a.id === areaId)?.name || 'No Area';
      if (!map.has(areaId)) {
        map.set(areaId, { areaName, tables: [] });
      }
      map.get(areaId)!.tables.push(table);
    });
    return map;
  }, [tables, areas]);

  const filteredAreaEntries = useMemo(() => {
    const entries = Array.from(areaMap.entries()).sort((a, b) =>
      a[1].areaName.localeCompare(b[1].areaName)
    );
    if (selectedAreaFilter === 'all') return entries;
    return entries.filter(([areaId]) => areaId === selectedAreaFilter);
  }, [areaMap, selectedAreaFilter]);

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'FREE').length,
    occupied: tables.filter(t => t.status === 'OCCUPIED').length,
    outOfService: tables.filter(t => t.status === 'INACTIVE').length,
  };

  const handleCreateTable = async () => {
    if (!tableFormData.areaId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an area',
      });
      return;
    }

    try {
      setIsCreating(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/api/v1/areas/${tableFormData.areaId}/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tableNumber: autoGeneratedTag,
          capacity: tableFormData.capacity,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Table "${autoGeneratedTag}" created successfully`,
        });
        setIsCreateDialogOpen(false);
        setTableFormData({ capacity: 4, areaId: '' });
        fetchTables();
      } else {
        throw new Error('Failed to create table');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message || 'Failed to create table',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;

    setIsDeleteLoading(tableId);
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
      } else {
        throw new Error('Failed to delete table');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message || 'Failed to delete table',
      });
    } finally {
      setIsDeleteLoading(null);
    }
  };

  const handleCreateArea = async () => {
    if (!areaName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Area name is required',
      });
      return;
    }

    if (!selectedBranch) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a branch first',
      });
      return;
    }

    try {
      setIsCreating(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/api/v1/branches/${selectedBranch}/areas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: areaName.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Area created successfully',
        });
        setAreaName('');
        setIsAreaDialogOpen(false);
        fetchAreas();
      } else {
        throw new Error('Failed to create area');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message || 'Failed to create area',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleShowQRCode = (table: Table) => {
    setSelectedTableForQR(table);
    setIsQRModalOpen(true);
  };

  const handleCopyQRLink = async (qrToken: string) => {
    const baseUrl = import.meta.env.VITE_CUSTOMER_URL || 'http://localhost:8080';
    const qrLink = `${baseUrl}/t/${qrToken}`;
    
    try {
      await navigator.clipboard.writeText(qrLink);
      toast({
        title: 'Success',
        description: 'QR link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
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
            Manage tables, areas, and view status
          </p>
        </div>
        <div className="flex gap-2">
          {canEditTables && (
            <Button onClick={() => setIsAreaDialogOpen(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Area
            </Button>
          )}
          {canEditTables && (
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Table
            </Button>
          )}
          {isOwnerReadOnly && (
            <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-md border border-amber-200 dark:border-amber-800">
              👁️ View-only mode: Contact your manager to modify tables
            </div>
          )}
        </div>
      </div>

        {/* Branch Selection */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Select Branch</CardTitle>
                <CardDescription>Choose a branch to view its tables</CardDescription>
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

        {/* Stats */}
        {selectedBranch && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Tables</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Available</p>
                      <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Occupied</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.occupied}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 border-gray-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
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

            {/* Filter */}
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium whitespace-nowrap">Filter by Area:</Label>
              <Select value={selectedAreaFilter} onValueChange={setSelectedAreaFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Areas" />
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
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Tables by Floor
                </CardTitle>
                <CardDescription>View and manage all tables organized by area</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                {isTablesLoading ? (
                  <div className="flex items-center justify-center min-h-[300px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : tables.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
                    <p className="text-muted-foreground text-lg">No tables found</p>
                    <p className="text-muted-foreground text-sm mt-2">Click "Add Table" to create your first table</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {filteredAreaEntries.map(([areaId, { areaName, tables }]) => {
                      const sortedTables = tables.sort((a, b) => a.table_number.localeCompare(b.table_number));
                      return (
                        <div key={areaId} className="space-y-4">
                          {/* Area Header */}
                          <div className="flex items-center gap-4">
                            <div className="relative bg-gradient-to-r from-primary to-primary/80 rounded-xl px-6 py-3 shadow-lg">
                              <h3 className="text-xl font-bold text-primary-foreground">{areaName}</h3>
                            </div>
                            <div className="flex-1 h-0.5 bg-gradient-to-r from-border to-transparent" />
                            <Badge variant="secondary" className="text-sm">
                              {tables.length} table{tables.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>

                          {/* Tables Grid */}
                          <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-6">
                            {sortedTables.map((table) => {
                              const config = statusConfig[table.status as keyof typeof statusConfig] || statusConfig.FREE;
                              const Icon = config.icon;
                              
                              return (
                                <div
                                  key={table.id}
                                  onMouseEnter={() => setHoveredTable(table.id)}
                                  onMouseLeave={() => setHoveredTable(null)}
                                  className="relative"
                                >
                                  <Card
                                    className={`border-2 transition-all duration-300 ${
                                      hoveredTable === table.id
                                        ? 'border-primary shadow-2xl'
                                        : 'border-border/50 hover:shadow-lg'
                                    } ${table.status === 'OCCUPIED' ? 'bg-destructive/5' : ''}`}
                                    style={{
                                      height: '140px',
                                      transform: hoveredTable === table.id ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                                    }}
                                  >
                                    <CardContent className="relative pt-4 pb-3 h-full flex flex-col">
                                      <div className="space-y-2.5 relative flex-1">
                                        {/* Table Name */}
                                        <div className="w-full">
                                          <span className="font-bold text-base bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                            {table.table_number}
                                          </span>
                                        </div>

                                        {/* Status Badge */}
                                        <Badge className={`${config.color} border text-xs font-semibold w-fit`}>
                                          {config.label}
                                        </Badge>

                                        {/* Capacity and QR Code */}
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            <span className="font-medium">
                                              {table.capacity} {table.capacity === 1 ? 'seat' : 'seats'}
                                            </span>
                                          </div>
                                          
                                          {/* QR Code Button - Always show for all users */}
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600"
                                            onClick={() => handleShowQRCode(table)}
                                          >
                                            <QrCode className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>

                                      {/* Action Buttons */}
                                      <div
                                        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/90 to-transparent backdrop-blur-sm rounded-b-lg"
                                        style={{
                                          opacity: hoveredTable === table.id ? 1 : 0,
                                          transform: hoveredTable === table.id ? 'translateY(0)' : 'translateY(10px)',
                                          transition: 'all 0.3s ease',
                                          pointerEvents: hoveredTable === table.id ? 'auto' : 'none',
                                        }}
                                      >
                                        <div className="flex gap-2 justify-center p-2 border-t border-border/30">
                                          {canEditTables ? (
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                                              onClick={() => handleDeleteTable(table.id)}
                                              disabled={isDeleteLoading === table.id}
                                            >
                                              {isDeleteLoading === table.id ? (
                                                <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                                              ) : (
                                                <Trash2 className="w-4 h-4" />
                                              )}
                                            </Button>
                                          ) : isOwnerReadOnly ? (
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-9 w-9 p-0 hover:bg-blue-500/10 hover:text-blue-600"
                                              onClick={() => handleShowQRCode(table)}
                                            >
                                              <QrCode className="w-4 h-4" />
                                            </Button>
                                          ) : (
                                            <div className="text-xs text-muted-foreground py-2">
                                              View Only
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Create Table Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Table</DialogTitle>
              <DialogDescription>Add a new table to the selected area</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="areaId">Area *</Label>
                <Select
                  value={tableFormData.areaId}
                  onValueChange={(value) => setTableFormData({ ...tableFormData, areaId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an area" />
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

              <div className="space-y-2">
                <Label>Table Name</Label>
                <div className="px-3 py-2 bg-muted rounded-md text-sm font-medium">
                  {autoGeneratedTag}
                </div>
                <p className="text-xs text-muted-foreground">Table name will be automatically generated</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (people) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={tableFormData.capacity}
                  onChange={(e) => setTableFormData({ ...tableFormData, capacity: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTable} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Table'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Area Dialog */}
        <Dialog open={isAreaDialogOpen} onOpenChange={setIsAreaDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Area</DialogTitle>
              <DialogDescription>Create a new area for this branch</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="areaName">Area Name *</Label>
                <Input
                  id="areaName"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder="e.g. Main Dining, Patio, Outdoor"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsAreaDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateArea} disabled={isCreating || !areaName.trim()}>
                  {isCreating ? 'Creating...' : 'Add Area'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      {/* QR Code Modal */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code - {selectedTableForQR?.table_number}
            </DialogTitle>
            <DialogDescription>
              Customers can scan this QR code to access the menu and place orders
            </DialogDescription>
          </DialogHeader>

          {selectedTableForQR && (
            <div className="space-y-4">
              {/* Table Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Table:</span>
                    <div className="font-semibold">{selectedTableForQR.table_number}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity:</span>
                    <div className="font-semibold">{selectedTableForQR.capacity} seats</div>
                  </div>
                </div>
              </div>

              {/* QR Code Image */}
              {selectedTableForQR.qr_code_url ? (
                <div className="flex justify-center p-4 bg-white rounded-lg border">
                  <img 
                    src={selectedTableForQR.qr_code_url} 
                    alt={`QR Code for ${selectedTableForQR.table_number}`}
                    className="w-48 h-48 object-contain"
                  />
                </div>
              ) : (
                <div className="flex justify-center p-8 bg-muted/30 rounded-lg border-2 border-dashed">
                  <div className="text-center text-muted-foreground">
                    <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>QR Code not available</p>
                  </div>
                </div>
              )}

              {/* QR Link */}
              {selectedTableForQR.qr_token && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Direct Link:</label>
                  <div className="flex gap-2">
                    <Input
                      value={`${import.meta.env.VITE_CUSTOMER_URL || 'http://localhost:8080'}/t/${selectedTableForQR.qr_token}`}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyQRLink(selectedTableForQR.qr_token!)}
                      className="flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`${import.meta.env.VITE_CUSTOMER_URL || 'http://localhost:8080'}/t/${selectedTableForQR.qr_token}`, '_blank')}
                      className="flex-shrink-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this link if customers can't scan the QR code
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
