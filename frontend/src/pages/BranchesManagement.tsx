/**
 * Branches Management Page
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  GitBranch, Plus, MapPin, Phone, Pencil, Trash2, Store,
  Info, BarChart2, Calendar, TrendingUp, ShoppingBag, Table2,
} from 'lucide-react';
import BranchEdit from './BranchEdit';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  is_active?: boolean;
  status?: string;
}

interface BranchDetail {
  id: string;
  name: string;
  address: string;
  phone?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BranchStats {
  branch_id: string;
  branch_name: string;
  filters: { from_date: string | null; to_date: string | null };
  statistics: { total_revenue: number; total_orders: number; active_tables: number };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function BranchesManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editBranchId, setEditBranchId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<BranchDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Statistics modal
  const [statsOpen, setStatsOpen] = useState(false);
  const [stats, setStats] = useState<BranchStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsFrom, setStatsFrom] = useState('');
  const [statsTo, setStatsTo] = useState('');
  const [statsBranchId, setStatsBranchId] = useState<string | null>(null);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBranches(user?.restaurant?.id);
      if (response.success) setBranches((response.data as Branch[]) || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to load branches', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, []);

  // Filter branches based on active/inactive toggle
  const filteredBranches = branches.filter(branch => {
    const isActive = branch.status !== 'INACTIVE' && branch.is_active !== false;
    return showInactive ? !isActive : isActive;
  });

  const activeBranchCount = branches.filter(b => b.status !== 'INACTIVE' && b.is_active !== false).length;
  const inactiveBranchCount = branches.filter(b => b.status === 'INACTIVE' || b.is_active === false).length;

  const handleDelete = async (id: string) => {
    // Check if branch is already inactive
    const branch = branches.find(b => b.id === id);
    const isInactive = branch?.status === 'INACTIVE' || branch?.is_active === false;
    
    const confirmMessage = isInactive
      ? 'This branch is inactive. Are you sure you want to PERMANENTLY delete it? This action cannot be undone.'
      : 'Are you sure you want to deactivate this branch? You can permanently delete it later.';
    
    if (!confirm(confirmMessage)) return;
    
    try {
      setDeletingId(id);
      const response = await apiClient.deleteBranch(id);
      if (response.success) {
        const isPermanent = (response as any).permanent;
        toast({ 
          title: 'Success', 
          description: isPermanent 
            ? 'Branch permanently deleted' 
            : 'Branch deactivated. Click delete again to permanently remove.'
        });
        fetchBranches();
      } else throw new Error(response.message || 'Failed to delete branch');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const openDetail = async (id: string) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const response = await apiClient.getBranch(id);
      if (response.success) setDetail(response.data as BranchDetail);
      else throw new Error(response.message);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openStats = (id: string) => {
    setStatsBranchId(id);
    setStats(null);
    setStatsFrom('');
    setStatsTo('');
    setStatsOpen(true);
  };

  const fetchStats = async () => {
    if (!statsBranchId) return;
    setStatsLoading(true);
    try {
      const response = await apiClient.getBranchStatistics(statsBranchId, {
        from_date: statsFrom || undefined,
        to_date: statsTo || undefined,
      });
      // statistics API returns result directly (not wrapped in success/data)
      const data = (response as any).statistics ? response : (response as any).data;
      setStats(data as BranchStats);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (statsOpen && statsBranchId) fetchStats();
  }, [statsOpen, statsBranchId]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Branches Management</h1>
            <p className="text-sm text-muted-foreground">Manage your restaurant branches</p>
          </div>
        </div>
        <Button onClick={() => navigate('/owner/branch-setup')} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Branch
        </Button>
      </div>

      {/* Active/Inactive Toggle */}
      <div className="flex gap-2">
        <Button
          variant={!showInactive ? 'default' : 'outline'}
          onClick={() => setShowInactive(false)}
          className="gap-2"
        >
          Active ({activeBranchCount})
        </Button>
        <Button
          variant={showInactive ? 'default' : 'outline'}
          onClick={() => setShowInactive(true)}
          className="gap-2"
        >
          Inactive ({inactiveBranchCount})
        </Button>
      </div>

      {/* Branch list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredBranches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Store className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">
            {showInactive ? 'No inactive branches' : 'No branches yet'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {showInactive 
              ? 'All your branches are active' 
              : 'Create your first branch to get started'}
          </p>
          {!showInactive && (
            <Button onClick={() => navigate('/owner/branch-setup')} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Branch
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBranches.map((branch) => {
            const isInactive = branch.status === 'INACTIVE' || branch.is_active === false;
            return (
              <Card key={branch.id} className={`hover:shadow-md transition-shadow ${isInactive ? 'opacity-60 border-orange-300' : ''}`}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-primary flex-shrink-0" />
                      <h3 className="font-semibold text-base leading-tight">{branch.name}</h3>
                    </div>
                    <Badge variant={!isInactive ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                      {branch.status || (isInactive ? 'Inactive' : 'Active')}
                    </Badge>
                  </div>

                  {branch.address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{branch.address}</span>
                    </div>
                  )}

                  {branch.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {!isInactive && (
                      <>
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => openDetail(branch.id)}>
                          <Info className="w-3.5 h-3.5" />
                          Details
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => openStats(branch.id)}>
                          <BarChart2 className="w-3.5 h-3.5" />
                          Statistics
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => setEditBranchId(branch.id)}>
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-1 ${isInactive ? 'col-span-2 bg-red-50' : ''} text-destructive hover:text-destructive hover:bg-destructive/10`}
                      onClick={() => handleDelete(branch.id)}
                      disabled={deletingId === branch.id}
                    >
                      {deletingId === branch.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      {isInactive ? 'Delete Permanently' : 'Delete'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      {editBranchId && (
        <BranchEdit
          branchId={editBranchId}
          isOpen={true}
          onClose={() => setEditBranchId(null)}
          onSuccess={() => { setEditBranchId(null); fetchBranches(); }}
        />
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Branch Details
            </DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : detail ? (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <p className="font-medium">{detail.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant={detail.status === 'active' ? 'default' : 'secondary'}>
                    {detail.status || 'active'}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Address
                </p>
                <p className="text-sm">{detail.address || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone
                </p>
                <p className="text-sm">{detail.phone || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1 border-t">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-sm">{formatDate(detail.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Updated</p>
                  <p className="text-sm">{formatDate(detail.updatedAt)}</p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Statistics Dialog */}
      <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5" />
              Branch Statistics
            </DialogTitle>
          </DialogHeader>

          {/* Date filter */}
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" /> From
              </Label>
              <Input type="date" value={statsFrom} onChange={(e) => setStatsFrom(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" /> To
              </Label>
              <Input type="date" value={statsTo} onChange={(e) => setStatsTo(e.target.value)} className="h-8 text-sm" />
            </div>
            <Button size="sm" onClick={fetchStats} disabled={statsLoading} className="h-8">
              {statsLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Apply'}
            </Button>
          </div>

          {statsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : stats ? (
            <div className="space-y-3 pt-1">
              <p className="text-sm font-medium text-muted-foreground">{stats.branch_name}</p>
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4 text-center space-y-1">
                    <TrendingUp className="w-5 h-5 text-green-500 mx-auto" />
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="font-bold text-sm">{formatCurrency(stats.statistics.total_revenue)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center space-y-1">
                    <ShoppingBag className="w-5 h-5 text-blue-500 mx-auto" />
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="font-bold text-sm">{stats.statistics.total_orders}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center space-y-1">
                    <Table2 className="w-5 h-5 text-purple-500 mx-auto" />
                    <p className="text-xs text-muted-foreground">Tables</p>
                    <p className="font-bold text-sm">{stats.statistics.active_tables}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
