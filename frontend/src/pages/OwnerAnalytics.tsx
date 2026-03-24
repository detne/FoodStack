/**
 * Owner Analytics / Reports Page
 * Connects to GET /payments/statistics for real revenue & transaction data.
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/components/ui/use-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Stats {
  restaurant: { id: string; name: string };
  filters: { startDate: string | null; endDate: string | null };
  totalRevenue: number;
  transactionCount: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n);
}

function toISODate(dateStr: string) {
  // Convert YYYY-MM-DD → ISO datetime string for the API
  if (!dateStr) return undefined;
  return new Date(dateStr).toISOString();
}

// Preset ranges
const PRESETS = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: 'All Time', days: 0 },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function OwnerAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePreset, setActivePreset] = useState(30);

  // Custom date range
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const restaurantId = user?.restaurant?.id;

  const fetchStats = useCallback(async (start?: string, end?: string) => {
    if (!restaurantId) {
      setError('No restaurant found for this account.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.getPaymentStatistics({
        restaurantId,
        startDate: start,
        endDate: end,
      });
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        throw new Error((response as any).message || 'Failed to load statistics');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to load payment statistics';
      setError(msg);
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  // Apply preset
  const applyPreset = (days: number) => {
    setActivePreset(days);
    setStartDate('');
    setEndDate('');
    if (days === 0) {
      fetchStats();
    } else {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      fetchStats(start.toISOString(), end.toISOString());
    }
  };

  // Apply custom range
  const applyCustomRange = () => {
    if (!startDate && !endDate) { fetchStats(); return; }
    setActivePreset(-1);
    fetchStats(
      startDate ? toISODate(startDate) : undefined,
      endDate ? toISODate(endDate) : undefined,
    );
  };

  // Load on mount with 30-day default
  useEffect(() => {
    applyPreset(30);
  }, [restaurantId]);

  const avgOrderValue = stats && stats.transactionCount > 0
    ? stats.totalRevenue / stats.transactionCount
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real payment statistics for{' '}
            <span className="font-medium text-foreground">
              {stats?.restaurant?.name ?? user?.restaurant?.name ?? '—'}
            </span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => applyPreset(activePreset >= 0 ? activePreset : 30)}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Preset buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {PRESETS.map(p => (
              <Button
                key={p.days}
                variant={activePreset === p.days ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyPreset(p.days)}
                disabled={loading}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <Separator />

          {/* Custom date range */}
          <div className="flex items-end gap-3 flex-wrap">
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" /> From
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="h-8 text-sm w-40"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" /> To
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="h-8 text-sm w-40"
              />
            </div>
            <Button size="sm" onClick={applyCustomRange} disabled={loading} className="h-8">
              Apply
            </Button>
            {(startDate || endDate) && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-muted-foreground"
                onClick={() => { setStartDate(''); setEndDate(''); applyPreset(30); }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-4">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                {loading ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded mt-1" />
                ) : (
                  <p className="text-2xl font-bold mt-1">
                    {stats ? formatCurrency(Number(stats.totalRevenue)) : '—'}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">Paid transactions only</p>
              </div>
              <div className="w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Count */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                {loading ? (
                  <div className="h-8 w-20 bg-muted animate-pulse rounded mt-1" />
                ) : (
                  <p className="text-2xl font-bold mt-1">
                    {stats ? formatNumber(stats.transactionCount) : '—'}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">Completed payments</p>
              </div>
              <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg Order Value */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
                {loading ? (
                  <div className="h-8 w-28 bg-muted animate-pulse rounded mt-1" />
                ) : (
                  <p className="text-2xl font-bold mt-1">
                    {stats && stats.transactionCount > 0 ? formatCurrency(avgOrderValue) : '—'}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">Revenue ÷ transactions</p>
              </div>
              <div className="w-11 h-11 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary card */}
      {stats && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5 text-primary" />
              Summary
            </CardTitle>
            <CardDescription>
              {stats.filters.startDate || stats.filters.endDate ? (
                <>
                  {stats.filters.startDate
                    ? new Date(stats.filters.startDate).toLocaleDateString('vi-VN')
                    : 'Beginning'}{' '}
                  →{' '}
                  {stats.filters.endDate
                    ? new Date(stats.filters.endDate).toLocaleDateString('vi-VN')
                    : 'Now'}
                </>
              ) : (
                'All time'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted/40 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Restaurant</p>
                <p className="font-semibold">{stats.restaurant.name}</p>
              </div>
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                <p className="font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(Number(stats.totalRevenue))}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Transactions</p>
                <p className="font-bold text-blue-700 dark:text-blue-400">
                  {formatNumber(stats.transactionCount)}
                </p>
              </div>
            </div>

            {stats.transactionCount === 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                No completed payments found for this period.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
