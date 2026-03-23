/**
 * Manager Staff Management
 * Staff management for branch managers
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, Plus } from 'lucide-react';

interface StaffMember {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  branch_id: string;
}

export default function ManagerStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    role: 'STAFF', // Always STAFF
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staff, searchQuery, statusFilter]);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Please login first',
        });
        return;
      }

      // Get branchId from user data or localStorage
      let branchId = localStorage.getItem('selected_branch_id');
      
      if (!branchId) {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          branchId = user.branch_id;
        }
      }

      console.log('Fetching staff for branch:', branchId);

      const url = branchId 
        ? `http://localhost:3000/api/v1/staff?branchId=${branchId}`
        : 'http://localhost:3000/api/v1/staff';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setStaff(data.data.items || data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load staff',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = [...staff];

    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    setFilteredStaff(filtered);
  };

  const handleAddStaff = async () => {
    try {
      const branchId = localStorage.getItem('selected_branch_id');
      const token = localStorage.getItem('access_token');

      const response = await fetch('http://localhost:3000/api/v1/staff', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newStaff,
          branch_id: branchId,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Staff account created successfully',
        });
        setIsAddDialogOpen(false);
        setNewStaff({
          username: '',
          password: '',
          full_name: '',
          email: '',
          role: 'STAFF', // Always STAFF
        });
        fetchStaff();
      } else {
        const error = await response.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to create staff account',
        });
      }
    } catch (error) {
      console.error('Error creating staff:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create staff account',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage staff members in your branch
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Account
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStaff.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {staff.length === 0
                  ? 'No staff members found'
                  : 'No staff members match your filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStaff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold">{member.username}</p>
                      <Badge variant={member.role === 'WAITER' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                      <Badge
                        variant={member.status === 'ACTIVE' ? 'default' : 'outline'}
                      >
                        {member.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Name: {member.full_name || 'N/A'}</p>
                      <p>Email: {member.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Account</DialogTitle>
            <DialogDescription>
              Create a new staff account for your branch
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input
                value={newStaff.username}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, username: e.target.value })
                }
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={newStaff.password}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, password: e.target.value })
                }
                placeholder="Enter password"
              />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input
                value={newStaff.full_name}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, full_name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newStaff.email}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, email: e.target.value })
                }
                placeholder="Enter email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff}>Create Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
