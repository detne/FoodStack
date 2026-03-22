/**
 * Staff Management
 * Manage staff members in your restaurant
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Plus,
  Download,
  Eye,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string | {
    name: string;
  };
  branch?: {
    id: string;
    name: string;
    address: string;
  };
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

const roleColors = {
  RESTAURANT_OWNER: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  MANAGER: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  STAFF: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

const roleLabels = {
  RESTAURANT_OWNER: 'Owner',
  MANAGER: 'Manager',
  STAFF: 'Staff',
};

export default function Staff() {
  const { toast } = useToast();
  
  // Data states
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'STAFF',
    branch_id: '',
  });

  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'STAFF',
    branch_id: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  // Fetch staff on mount
  useEffect(() => {
    fetchStaff();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3000/api/v1/branches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setBranches(data.data.items || data.data);
        }
      } else {
        console.warn('Failed to fetch branches:', response.status);
        setBranches([]);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
    }
  };

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', '100');
      
      const response = await fetch(`http://localhost:3000/api/v1/staff?${params.toString()}`, {
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
      } else {
        throw new Error('Failed to fetch staff');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load staff members',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStaff();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const filteredStaff = staff.filter((member) => {
    const memberRole = typeof member.role === 'string' ? member.role : member.role?.name;
    const matchesRole = roleFilter === 'all' || memberRole === roleFilter;
    const matchesBranch = branchFilter === 'all' || member.branch?.id === branchFilter;
    return matchesRole && matchesBranch;
  });

  const stats = {
    total: staff.length,
    active: staff.filter(s => s.status === 'ACTIVE').length,
    inactive: staff.filter(s => s.status === 'INACTIVE').length,
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.password) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('access_token');
      
      const payload: any = {
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role,
      };
      
      if (formData.phone && formData.phone.trim()) {
        payload.phone = formData.phone;
      }
      if (formData.password && formData.password.trim()) {
        payload.password = formData.password;
      }
      if (formData.branch_id && formData.branch_id.trim()) {
        payload.branch_id = formData.branch_id;
      }
      
      const response = await fetch('http://localhost:3000/api/v1/staff', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Staff member created successfully',
        });
        setIsDialogOpen(false);
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          password: '',
          role: 'STAFF',
          branch_id: '',
        });
        fetchStaff();
      } else {
        throw new Error(data.message || 'Failed to create staff');
      }
    } catch (error: any) {
      console.error('Error creating staff:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create staff member',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingStaff || !editFormData.full_name || !editFormData.email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('access_token');
      
      const payload: any = {
        full_name: editFormData.full_name,
        email: editFormData.email,
        role: editFormData.role,
        status: editFormData.status,
      };
      
      if (editFormData.phone && editFormData.phone.trim()) {
        payload.phone = editFormData.phone;
      }
      if (editFormData.branch_id && editFormData.branch_id.trim() && editFormData.branch_id !== 'all') {
        payload.branch_id = editFormData.branch_id;
      }
      
      const response = await fetch(`http://localhost:3000/api/v1/staff/${editingStaff.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Staff member updated successfully',
        });
        setIsEditDialogOpen(false);
        setEditingStaff(null);
        fetchStaff();
      } else {
        throw new Error(data.message || 'Failed to update staff');
      }
    } catch (error: any) {
      console.error('Error updating staff:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update staff member',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!editingStaff) return;

    const newStatus = editingStaff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`http://localhost:3000/api/v1/staff/${editingStaff.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: `Staff member ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`,
        });
        setIsEditDialogOpen(false);
        setEditingStaff(null);
        fetchStaff();
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update staff status',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!editingStaff) return;

    // Confirm deletion
    if (!confirm(`Are you sure you want to permanently delete ${editingStaff.full_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`http://localhost:3000/api/v1/staff/${editingStaff.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Staff member deleted permanently',
        });
        setIsEditDialogOpen(false);
        setEditingStaff(null);
        fetchStaff();
      } else {
        throw new Error(data.message || 'Failed to delete staff');
      }
    } catch (error: any) {
      console.error('Error deleting staff:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete staff member',
      });
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage staff members in your restaurant
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Staff Account
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 animate-in slide-in-from-bottom duration-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 animate-in slide-in-from-bottom duration-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Shifts</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 animate-in slide-in-from-bottom duration-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="animate-in slide-in-from-bottom duration-500">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            
            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-3">
              <div className="min-w-[140px]">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        All Roles
                      </div>
                    </SelectItem>
                    <SelectItem value="RESTAURANT_OWNER">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Owner
                      </div>
                    </SelectItem>
                    <SelectItem value="MANAGER">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Manager
                      </div>
                    </SelectItem>
                    <SelectItem value="STAFF">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Staff
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="min-w-[140px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        All Status
                      </div>
                    </SelectItem>
                    <SelectItem value="ACTIVE">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="INACTIVE">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="min-w-[160px]">
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        All Branches
                      </div>
                    </SelectItem>
                    {branches.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          {branch.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || branchFilter !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchQuery}"
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {roleFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Role: {roleLabels[roleFilter as keyof typeof roleLabels]}
                  <button 
                    onClick={() => setRoleFilter('all')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusFilter}
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {branchFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Branch: {branches.find(b => b.id === branchFilter)?.name}
                  <button 
                    onClick={() => setBranchFilter('all')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setBranchFilter('all');
                }}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff Accounts */}
      <Card className="animate-in slide-in-from-bottom duration-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Staff Accounts</h2>
            <div className="text-sm text-muted-foreground">
              {filteredStaff.length} of {staff.length} members
            </div>
          </div>
          
          {filteredStaff.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No staff accounts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || branchFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by adding your first staff member.'}
              </p>
              {(!searchQuery && roleFilter === 'all' && statusFilter === 'all' && branchFilter === 'all') && (
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add First Staff Member
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left p-4 font-medium text-sm">Staff Member</th>
                      <th className="text-left p-4 font-medium text-sm">Role</th>
                      <th className="text-left p-4 font-medium text-sm">Branch</th>
                      <th className="text-left p-4 font-medium text-sm">Joined Date</th>
                      <th className="text-left p-4 font-medium text-sm">Status</th>
                      <th className="text-center p-4 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((member, index) => (
                      <tr 
                        key={member.id} 
                        className={`border-b hover:bg-muted/30 transition-colors duration-200 ${
                          index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-700 font-medium text-sm">
                                {member.full_name ? member.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{member.full_name || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                              {member.phone && (
                                <p className="text-xs text-muted-foreground truncate">{member.phone}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {(() => {
                            const memberRole = typeof member.role === 'string' ? member.role : member.role?.name;
                            return (
                              <Badge className={`${roleColors[memberRole as keyof typeof roleColors]} border text-xs font-medium`}>
                                {roleLabels[memberRole as keyof typeof roleLabels] || memberRole}
                              </Badge>
                            );
                          })()}
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {member.branch?.name ? (
                              <div>
                                <p className="font-medium">{member.branch.name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {member.branch.address}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">All Branches</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-muted-foreground">
                            {member.created_at ? new Date(member.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}
                            className={`text-xs font-medium ${
                              member.status === 'ACTIVE' 
                                ? 'bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20' 
                                : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                member.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                              }`}></div>
                              {member.status}
                            </div>
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingStaff(member);
                              setEditFormData({
                                full_name: member.full_name,
                                email: member.email,
                                phone: member.phone || '',
                                role: typeof member.role === 'string' ? member.role : member.role.name,
                                branch_id: member.branch?.id || 'all',
                                status: member.status,
                              });
                              setIsEditDialogOpen(true);
                            }}
                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Staff Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Add Staff Account</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Create a new staff member account. They will receive login credentials via email.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateStaff} className="space-y-5">
            {/* Form Fields - Horizontal Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Personal Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b pb-2">
                  Personal Information
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-medium">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Enter full name"
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Account Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b pb-2">
                  Account Information
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium">Role *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STAFF">Staff</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch" className="text-sm font-medium">Branch</Label>
                    <Select value={formData.branch_id} onValueChange={(value) => setFormData({ ...formData, branch_id: value })}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch: any) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t">
              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Creating...' : 'Create Staff'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Manage Staff Member</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Update staff member information or manage their account status.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateStaff} className="space-y-5">
            {/* Form Fields - Horizontal Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Personal Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b pb-2">
                  Personal Information
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit_full_name" className="text-sm font-medium">Full Name *</Label>
                    <Input
                      id="edit_full_name"
                      value={editFormData.full_name}
                      onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                      placeholder="Enter full name"
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_email" className="text-sm font-medium">Email *</Label>
                    <Input
                      id="edit_email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      placeholder="Enter email address"
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_phone" className="text-sm font-medium">Phone</Label>
                    <Input
                      id="edit_phone"
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      placeholder="Enter phone number"
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Work Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b pb-2">
                  Work Information
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit_role" className="text-sm font-medium">Role *</Label>
                    <Select value={editFormData.role} onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STAFF">Staff</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_branch" className="text-sm font-medium">Branch</Label>
                    <Select value={editFormData.branch_id} onValueChange={(value) => setEditFormData({ ...editFormData, branch_id: value })}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.map((branch: any) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_status" className="text-sm font-medium">Status *</Label>
                    <Select 
                      value={editFormData.status} 
                      onValueChange={(value: 'ACTIVE' | 'INACTIVE') => setEditFormData({ ...editFormData, status: value })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="INACTIVE">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                {/* Secondary Actions - Left */}
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={isSubmitting}
                    className={`${
                      editingStaff?.status === 'ACTIVE' 
                        ? 'border-orange-300 text-orange-600 hover:bg-orange-50' 
                        : 'border-green-300 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {editingStaff?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteStaff}
                    disabled={isSubmitting || editingStaff?.status === 'ACTIVE'}
                    className={`border-red-300 text-red-600 hover:bg-red-50 ${
                      editingStaff?.status === 'ACTIVE' 
                        ? 'opacity-40 cursor-not-allowed' 
                        : ''
                    }`}
                  >
                    Delete
                  </Button>
                </div>
                
                {/* Primary Actions - Right */}
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Staff'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}