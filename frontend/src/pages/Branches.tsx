/**
 * Branch List Page
 * Danh sách chi nhánh với grid cards
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { BranchCard } from '@/components/admin/BranchCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Mock data for development
const mockBranches = [
  {
    id: '1',
    name: 'Downtown Branch',
    address: '123 Main Street, Downtown, City',
    status: 'Active',
    tables_count: 20,
    staff_count: 8,
    orders_today: 45,
    revenue_today: 2340.5,
  },
  {
    id: '2',
    name: 'Uptown Gastro',
    address: '456 Uptown Avenue, Uptown District',
    status: 'Active',
    tables_count: 20,
    staff_count: 12,
    orders_today: 67,
    revenue_today: 3890.25,
  },
  {
    id: '3',
    name: 'Airport Terminal',
    address: 'Terminal 2, International Airport',
    status: 'Maintenance',
    tables_count: 45,
    staff_count: 6,
    orders_today: 12,
    revenue_today: 890.0,
  },
];

export default function Branches() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [branches, setBranches] = useState(mockBranches);
  const [filteredBranches, setFilteredBranches] = useState(mockBranches);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);

  // Load branches from API
  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getBranches();
      if (response.success && response.data) {
        setBranches(response.data);
        setFilteredBranches(response.data);
      }
    } catch (error: any) {
      console.error('Error loading branches:', error);
      toast({
        title: 'Error loading branches',
        description: error.message || 'Failed to load branches',
        variant: 'destructive',
      });
      // Fallback to mock data if API fails
      setBranches(mockBranches);
      setFilteredBranches(mockBranches);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter branches
  useEffect(() => {
    let filtered = branches;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (branch) =>
          branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          branch.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((branch) => branch.status === statusFilter);
    }

    setFilteredBranches(filtered);
  }, [searchQuery, statusFilter, branches]);

  const handleView = (id: string) => {
    navigate(`/branches/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/branches/${id}/edit`);
  };

  const handleDeleteClick = (id: string) => {
    setBranchToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!branchToDelete) return;

    try {
      await apiClient.deleteBranch(branchToDelete);
      
      // Reload branches after delete
      await loadBranches();
      
      toast({
        title: 'Branch deleted',
        description: 'Branch has been deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting branch',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setBranchToDelete(null);
    }
  };

  // Calculate stats
  const stats = {
    total: branches.length,
    active: branches.filter((b) => b.status === 'Active').length,
    maintenance: branches.filter((b) => b.status === 'Maintenance').length,
    totalTables: branches.reduce((sum, b) => sum + (b.tables_count || 0), 0),
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Branches</h1>
            <p className="text-muted-foreground mt-1">
              Manage your restaurant branches and locations
            </p>
          </div>
          <Button onClick={() => navigate('/branches/create')} className="bg-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Branch
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Branches</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Maintenance</p>
              <p className="text-2xl font-bold mt-1 text-orange-600">{stats.maintenance}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Tables</p>
              <p className="text-2xl font-bold mt-1">{stats.totalTables}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search branches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Branch Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading branches...</p>
          </div>
        ) : filteredBranches.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No branches found</p>
              <Button onClick={() => navigate('/branches/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Branch
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBranches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the branch and all
                associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
