/**
 * Staff Orders — Round-based order management
 * Tabs filter by latest round status (Pending/Preparing/Served/Completed).
 * "Checkout" flow: preview → CASH or QR_PAY → confirm → invoice.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import {
  Search, ShoppingBag, Clock, CheckCircle, XCircle,
  DollarSign, Users, Eye, Calendar,
  CreditCard, Banknote, QrCode,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  menu_item: { id: string; name: string; image_url?: string };
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
  status: string;
}

interface OrderRound {
  id: string;
  round_number: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  active_round_status: string | null;
  subtotal: number;
  tax: number;
  service_charge: number;
  total: number;
  payment_status: string;
  customer_count: number;
  created_at: string;
  updated_at: string;
  table: { id: string; table_number: string; area_name?: string; qr_token?: string };
  items_count?: number;
  rounds?: OrderRound[];
  pending_cash_payment?: { id: string; method: string; status: string } | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ROUND_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  PREPARING: { label: 'Preparing', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Clock },
  SERVED:    { label: 'Served',    color: 'bg-teal-100 text-teal-700 border-teal-200',       icon: CheckCircle },
};

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  ACTIVE:    { label: 'Active',    color: 'bg-blue-100 text-blue-700 border-blue-200',   icon: ShoppingBag },
  COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-700 border-gray-200',   icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200',      icon: XCircle },
};

const PAYMENT_CONFIG: Record<string, { label: string; color: string }> = {
  UNPAID:  { label: 'Unpaid',  color: 'bg-red-100 text-red-700' },
  PAID:    { label: 'Paid',    color: 'bg-green-100 text-green-700' },
  PARTIAL: { label: 'Partial', color: 'bg-yellow-100 text-yellow-700' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapOrderFromApi(o: any): Order {
  return {
    id: o.id,
    order_number: o.order_number,
    status: o.status,
    active_round_status: o.active_round_status ?? null,
    subtotal: Number(o.subtotal),
    tax: Number(o.tax),
    service_charge: Number(o.service_charge),
    total: Number(o.total),
    payment_status: o.payment_status,
    customer_count: o.customer_count,
    created_at: o.created_at,
    updated_at: o.updated_at,
    table: o.table,
    items_count: o.items_count,
    rounds: o.rounds,
    pending_cash_payment: o.pending_cash_payment ?? null,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StaffOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingRound, setUpdatingRound] = useState<string | null>(null);
  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
  // Banner nổi cho cash payment
  const [cashAlerts, setCashAlerts] = useState<{ id: string; tableNumber: string; amount: number }[]>([]);
  const notifiedCashIds = useRef<Set<string>>(new Set());

  const fetchOrders = useCallback(async (tab: string, silent = false) => {
    const branchId = localStorage.getItem('selected_branch_id');
    if (!branchId) return;

    if (!silent) setIsLoading(true);
    try {
      let result;
      if (tab === 'completed') {
        result = await apiClient.getCompletedOrdersByBranch(branchId, { limit: 100 });
      } else {
        result = await apiClient.getOrdersByBranch(branchId, {
          roundStatus: tab === 'all' ? undefined : tab,
          limit: 100,
        });
      }

      if (result.success && result.data) {
        const mapped = result.data.orders.map(mapOrderFromApi);
        setOrders(mapped);

        // Phát hiện cash payment mới chưa notify
        mapped.forEach((o) => {
          if (o.pending_cash_payment && !notifiedCashIds.current.has(o.id)) {
            notifiedCashIds.current.add(o.id);
            // Toast
            toast({
              title: '💵 Yêu cầu thu tiền mặt',
              description: `Bàn ${o.table?.table_number} — ${Number(o.total).toLocaleString('vi-VN')}đ`,
              duration: 10000,
            });
            // Banner nổi
            setCashAlerts((prev) => [
              ...prev.filter((a) => a.id !== o.id),
              { id: o.id, tableNumber: o.table?.table_number || '?', amount: Number(o.total) },
            ]);
            // Tự ẩn banner sau 10s
            setTimeout(() => {
              setCashAlerts((prev) => prev.filter((a) => a.id !== o.id));
            }, 10000);
          }
          // Nếu order đã PAID thì xóa khỏi notified để không re-alert nếu tạo order mới
          if (o.payment_status === 'PAID') {
            notifiedCashIds.current.delete(o.id);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (!silent) toast({ title: 'Lỗi', description: 'Không thể tải danh sách order', variant: 'destructive' });
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const branchId = localStorage.getItem('selected_branch_id');
    const token = localStorage.getItem('access_token');
    if (token && branchId) fetchOrders(activeTab);
  }, [activeTab, fetchOrders]);

  // Auto-refresh mỗi 10s để bắt cash payment notification
  useEffect(() => {
    const interval = setInterval(() => {
      const branchId = localStorage.getItem('selected_branch_id');
      const token = localStorage.getItem('access_token');
      if (token && branchId) fetchOrders(activeTab, true);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab, fetchOrders]);

  const handleViewDetails = async (order: Order) => {
    try {
      const result = await apiClient.getOrderDetails(order.id);
      if (result.success && result.data) {
        setSelectedOrder(result.data as Order);
      } else {
        setSelectedOrder(order);
      }
    } catch {
      setSelectedOrder(order);
    }
    setIsDetailOpen(true);
  };

  const handleUpdateRoundStatus = async (orderId: string, roundId: string, newStatus: string) => {
    // 'REFRESH' là signal từ ItemRow sau khi mark item served — chỉ cần re-fetch
    if (newStatus === 'REFRESH') {
      const result = await apiClient.getOrderDetails(orderId);
      if (result.success && result.data) setSelectedOrder(result.data as Order);
      fetchOrders(activeTab);
      return;
    }
    setUpdatingRound(roundId);
    try {
      await apiClient.updateRoundStatus(orderId, roundId, newStatus);
      toast({ title: 'Đã cập nhật', description: `Round chuyển sang ${newStatus}` });
      const result = await apiClient.getOrderDetails(orderId);
      if (result.success && result.data) setSelectedOrder(result.data as Order);
      fetchOrders(activeTab);
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err?.message || 'Không thể cập nhật round', variant: 'destructive' });
    } finally {
      setUpdatingRound(null);
    }
  };

  const handleOpenCheckout = async (order: Order) => {
    // Lấy order details mới nhất (có qr_token)
    try {
      const result = await apiClient.getOrderDetails(order.id);
      if (result.success && result.data) {
        setCheckoutOrder(result.data as Order);
      } else {
        setCheckoutOrder(order);
      }
    } catch {
      setCheckoutOrder(order);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.table?.table_number?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.active_round_status === 'PENDING').length,
    preparing: orders.filter((o) => o.active_round_status === 'PREPARING').length,
    served: orders.filter((o) => o.active_round_status === 'SERVED').length,
    cashPending: orders.filter((o) => o.pending_cash_payment).length,
  };

  return (
    <div className="space-y-6 bg-background">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground mt-1">Quản lý order và rounds</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Active', value: stats.total, color: 'text-foreground', icon: ShoppingBag },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-600', icon: Clock },
          { label: 'Preparing', value: stats.preparing, color: 'text-purple-600', icon: Clock },
          { label: 'Served', value: stats.served, color: 'text-teal-600', icon: CheckCircle },
          { label: 'Thu tiền mặt', value: stats.cashPending, color: 'text-amber-600', icon: Banknote },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className={`w-8 h-8 ${s.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Tìm theo số order hoặc bàn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-input"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="preparing">Preparing</TabsTrigger>
              <TabsTrigger value="served">Served</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="mt-2 text-muted-foreground">Đang tải...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Không có order nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const roundCfg = order.active_round_status
                  ? ROUND_STATUS_CONFIG[order.active_round_status]
                  : null;
                const RoundIcon = roundCfg?.icon || ShoppingBag;
                const paymentCfg = PAYMENT_CONFIG[order.payment_status] || PAYMENT_CONFIG.UNPAID;
                const orderCfg = ORDER_STATUS_CONFIG[order.status];

                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-lg text-foreground">{order.order_number}</h3>
                            {roundCfg ? (
                              <Badge className={roundCfg.color}>
                                <RoundIcon className="w-3 h-3 mr-1" />
                                {roundCfg.label}
                              </Badge>
                            ) : orderCfg && (
                              <Badge className={orderCfg.color}>
                                <orderCfg.icon className="w-3 h-3 mr-1" />
                                {orderCfg.label}
                              </Badge>
                            )}
                            <Badge className={paymentCfg.color}>{paymentCfg.label}</Badge>
                            {order.pending_cash_payment && (
                              <Badge className="bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                <Banknote className="w-3 h-3 mr-1" />
                                Thu tiền mặt
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4" />
                              <span>Bàn {order.table?.table_number || 'N/A'}
                                {order.table?.area_name && ` · ${order.table.area_name}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{order.customer_count} khách</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-semibold text-foreground">
                                {Number(order.total).toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(order.created_at).toLocaleString('vi-VN')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(order)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.status === 'ACTIVE' && order.payment_status !== 'PAID' && (
                            <Button size="sm" variant="default" onClick={() => handleOpenCheckout(order)}>
                              <CreditCard className="w-4 h-4 mr-1" />
                              Checkout
                            </Button>
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

      <OrderDetailDialog
        order={selectedOrder}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdateRound={handleUpdateRoundStatus}
        onCheckout={(order) => { setIsDetailOpen(false); handleOpenCheckout(order); }}
        updatingRound={updatingRound}
      />

      {checkoutOrder && (
        <CheckoutDialog
          order={checkoutOrder}
          open={!!checkoutOrder}
          onOpenChange={(v) => { if (!v) setCheckoutOrder(null); }}
          onSuccess={() => {
            setCheckoutOrder(null);
            fetchOrders(activeTab);
          }}
        />
      )}

      {/* ── Cash Payment Alert Banners ── */}
      {cashAlerts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {cashAlerts.map((alert) => {
            const order = orders.find(o => o.id === alert.id);
            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 bg-amber-500 text-white rounded-xl shadow-2xl p-4 animate-in slide-in-from-right-5 duration-300"
              >
                <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">Thu tiền mặt — Bàn {alert.tableNumber}</p>
                  <p className="text-amber-100 text-xs mt-0.5">
                    {alert.amount.toLocaleString('vi-VN')}đ · Khách đang chờ
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {order && (
                    <button
                      className="text-xs bg-white text-amber-700 font-semibold px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors"
                      onClick={() => {
                        setCashAlerts(prev => prev.filter(a => a.id !== alert.id));
                        handleOpenCheckout(order);
                      }}
                    >
                      Xác nhận
                    </button>
                  )}
                  <button
                    className="text-xs text-amber-200 hover:text-white transition-colors text-center"
                    onClick={() => setCashAlerts(prev => prev.filter(a => a.id !== alert.id))}
                  >
                    Bỏ qua
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Order Detail Dialog ──────────────────────────────────────────────────────

function OrderDetailDialog({
  order, open, onOpenChange, onUpdateRound, onCheckout, updatingRound,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdateRound: (orderId: string, roundId: string, status: string) => void;
  onCheckout: (order: Order) => void;
  updatingRound: string | null;
}) {
  if (!order) return null;

  const rounds = order.rounds || [];
  const canCheckout = order.status === 'ACTIVE' &&
    order.payment_status !== 'PAID' &&
    rounds.length > 0 &&
    rounds.every((r) => r.status === 'SERVED');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Order {order.order_number}</DialogTitle>
          <DialogDescription>
            Bàn {order.table?.table_number}
            {order.table?.area_name && ` · ${order.table.area_name}`}
            {' · '}{order.customer_count} khách
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 p-4 bg-muted rounded-lg text-sm">
            <div>
              <p className="text-muted-foreground">Trạng thái order</p>
              <Badge className={ORDER_STATUS_CONFIG[order.status]?.color || ''}>
                {ORDER_STATUS_CONFIG[order.status]?.label || order.status}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Thanh toán</p>
              <Badge className={PAYMENT_CONFIG[order.payment_status]?.color || ''}>
                {PAYMENT_CONFIG[order.payment_status]?.label || order.payment_status}
              </Badge>
            </div>
          </div>

          {rounds.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">Chưa có round nào</p>
          ) : (
            rounds.map((round) => {
              const cfg = ROUND_STATUS_CONFIG[round.status];
              const RIcon = cfg?.icon || Clock;

              return (
                <div key={round.id} className="border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-muted">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">Round {round.round_number}</span>
                      {cfg && (
                        <Badge className={cfg.color}>
                          <RIcon className="w-3 h-3 mr-1" />
                          {cfg.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="divide-y divide-border">
                    {round.items.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        orderId={order.id}
                        roundId={round.id}
                        roundStatus={round.status}
                        orderStatus={order.status}
                        onServed={onUpdateRound}
                        updatingRound={updatingRound}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}

          <div className="border-t pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Tạm tính</span><span>{Number(order.subtotal).toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Thuế (10%)</span><span>{Number(order.tax).toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Phí dịch vụ (5%)</span><span>{Number(order.service_charge).toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Tổng cộng</span><span>{Number(order.total).toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          {canCheckout && (
            <Button className="w-full" onClick={() => onCheckout(order)}>
              <CreditCard className="w-4 h-4 mr-2" />
              Thanh toán
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Item Row with per-item served tick ───────────────────────────────────────

function ItemRow({
  item, orderId, roundId, roundStatus, orderStatus, onServed, updatingRound,
}: {
  item: OrderItem;
  orderId: string;
  roundId: string;
  roundStatus: string;
  orderStatus: string;
  onServed: (orderId: string, roundId: string, extra: string) => void;
  updatingRound: string | null;
}) {
  const { toast } = useToast();
  const [marking, setMarking] = useState(false);
  const isServed = item.status === 'SERVED';
  const canMark = orderStatus === 'ACTIVE' && roundStatus === 'PREPARING' && !isServed;

  const handleMark = async () => {
    setMarking(true);
    try {
      await apiClient.markItemServed(orderId, roundId, item.id);
      // Trigger parent refresh bằng cách gọi onServed với roundId (parent sẽ re-fetch)
      onServed(orderId, roundId, 'REFRESH');
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err?.message || 'Không thể cập nhật', variant: 'destructive' });
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="flex justify-between items-center px-4 py-3">
      <div className="flex items-center gap-3 flex-1">
        {canMark ? (
          <button
            onClick={handleMark}
            disabled={marking || updatingRound === roundId}
            className="w-6 h-6 rounded-full border-2 border-muted-foreground hover:border-teal-500 hover:bg-teal-50 flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
            title="Đánh dấu đã phục vụ"
          >
            {marking ? (
              <div className="w-3 h-3 rounded-full border border-current animate-spin border-t-transparent" />
            ) : (
              <CheckCircle className="w-4 h-4 text-muted-foreground hover:text-teal-500" />
            )}
          </button>
        ) : (
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            {isServed && <CheckCircle className="w-5 h-5 text-teal-500" />}
          </div>
        )}
        <div>
          <p className={`font-medium text-sm ${isServed ? 'line-through text-muted-foreground' : ''}`}>
            {item.menu_item?.name || 'Unknown'}
          </p>
          <p className="text-xs text-muted-foreground">
            {Number(item.price).toLocaleString('vi-VN')}đ × {item.quantity}
            {item.notes && ` · ${item.notes}`}
          </p>
        </div>
      </div>
      <p className={`font-semibold text-sm ${isServed ? 'text-muted-foreground' : ''}`}>
        {Number(item.subtotal).toLocaleString('vi-VN')}đ
      </p>
    </div>
  );
}

// ─── Checkout Dialog ──────────────────────────────────────────────────────────

type CheckoutStep = 'preview' | 'processing' | 'qr_waiting' | 'success';

function CheckoutDialog({
  order, open, onOpenChange, onSuccess,
}: {
  order: Order;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState<CheckoutStep>('preview');
  const [preview, setPreview] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  // confirmedMethod giữ method đã chọn, KHÔNG bị reset khi processing xong
  const [confirmedMethod, setConfirmedMethod] = useState<'CASH' | 'QR_PAY' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [confirmingCash, setConfirmingCash] = useState(false);

  const qrToken = order.table?.qr_token;

  useEffect(() => {
    if (open && qrToken) {
      setStep('preview');
      setPreview(null);
      setPaymentResult(null);
      setConfirmedMethod(null);
      loadPreview();
    }
  }, [open, order.id]);

  const loadPreview = async () => {
    if (!qrToken) return;
    setLoadingPreview(true);
    try {
      const result = await apiClient.getCheckoutPreview(order.id, qrToken);
      if (result.success && result.data) {
        setPreview(result.data);
      }
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err?.message || 'Không thể tải hóa đơn', variant: 'destructive' });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handlePay = async (method: 'CASH' | 'QR_PAY') => {
    if (!qrToken) {
      toast({ title: 'Lỗi', description: 'Không tìm thấy QR token của bàn', variant: 'destructive' });
      return;
    }
    setConfirmedMethod(method);
    setIsProcessing(true);
    setStep('processing');
    try {
      const result = await apiClient.processPayment({ orderId: order.id, qrToken, method });
      if (result.success && result.data) {
        setPaymentResult(result.data);
        setStep('qr_waiting');
      } else {
        throw new Error(result.message || 'Tạo thanh toán thất bại');
      }
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err?.message || 'Không thể xử lý thanh toán', variant: 'destructive' });
      setStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmCash = async () => {
    if (!paymentResult?.id) return;
    setConfirmingCash(true);
    try {
      const result = await apiClient.confirmCashPayment(paymentResult.id);
      if (result.success) {
        setStep('success');
        setPaymentResult(result.data);
      } else {
        throw new Error(result.message || 'Xác nhận thất bại');
      }
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err?.message || 'Không thể xác nhận thanh toán', variant: 'destructive' });
    } finally {
      setConfirmingCash(false);
    }
  };

  const handleClose = () => {
    if (step === 'success') onSuccess();
    onOpenChange(false);
  };

  const data = preview || order;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {step === 'success' ? 'Thanh toán thành công' : `Thanh toán — ${order.order_number}`}
          </DialogTitle>
          <DialogDescription>
            Bàn {order.table?.table_number}
            {order.table?.area_name && ` · ${order.table.area_name}`}
          </DialogDescription>
        </DialogHeader>

        {/* PREVIEW STEP */}
        {step === 'preview' && (
          <div className="space-y-4">
            {loadingPreview ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="mt-2 text-muted-foreground text-sm">Đang tải hóa đơn...</p>
              </div>
            ) : (
              <>
                {/* Items list */}
                {(data.items || []).length > 0 && (
                  <div className="border border-border rounded-lg divide-y divide-border">
                    {(data.items as any[]).map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center px-4 py-2 text-sm">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="font-medium">{Number(item.subtotal).toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-1 text-sm border-t pt-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tạm tính</span><span>{Number(data.subtotal).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Thuế (10%)</span><span>{Number(data.tax).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Phí dịch vụ (5%)</span><span>{Number(data.service_charge).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-2">
                    <span>Tổng cộng</span>
                    <span className="text-primary">{Number(data.total).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                {!qrToken && (
                  <p className="text-sm text-red-500 text-center">
                    Bàn này chưa có QR token. Không thể thanh toán.
                  </p>
                )}

                {/* Payment method buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-1"
                    disabled={!qrToken || isProcessing}
                    onClick={() => handlePay('CASH')}
                  >
                    <Banknote className="w-5 h-5" />
                    <span className="text-sm">Tiền mặt</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-1"
                    disabled={!qrToken || isProcessing}
                    onClick={() => handlePay('QR_PAY')}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-sm">QR Pay</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* PROCESSING STEP */}
        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
            <p className="mt-3 text-muted-foreground">Đang xử lý...</p>
          </div>
        )}

        {/* CASH CONFIRM / QR WAITING STEP */}
        {step === 'qr_waiting' && confirmedMethod !== 'QR_PAY' && (
          <div className="space-y-4">
            <div className="text-center p-6 bg-muted rounded-lg">
              <Banknote className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="font-semibold text-lg">
                Thu tiền mặt: {Number(data.total).toLocaleString('vi-VN')}đ
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Xác nhận sau khi đã nhận đủ tiền từ khách
              </p>
            </div>
            <Button
              className="w-full"
              disabled={confirmingCash}
              onClick={handleConfirmCash}
            >
              {confirmingCash ? 'Đang xác nhận...' : 'Xác nhận đã nhận tiền'}
            </Button>
          </div>
        )}

        {step === 'qr_waiting' && confirmedMethod === 'QR_PAY' && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <QrCode className="w-10 h-10 text-primary mx-auto mb-2" />
              <p className="font-semibold">Chờ khách quét QR thanh toán</p>
              <p className="text-lg font-bold text-primary mt-1">
                {Number(data.total).toLocaleString('vi-VN')}đ
              </p>
            </div>

            {/* QR image — thử qr_code URL trực tiếp, fallback sang VietQR */}
            <div className="flex justify-center">
              {paymentResult?.qr_code ? (
                <img
                  src={paymentResult.qr_code}
                  alt="QR Code"
                  className="w-56 h-56 rounded-lg border object-contain bg-white p-2"
                  onError={(e) => {
                    // Nếu ảnh lỗi, ẩn đi và hiện nút mở link
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : paymentResult?.bin && paymentResult?.account_number ? (
                <img
                  src={`https://img.vietqr.io/image/${paymentResult.bin}-${paymentResult.account_number}-compact2.png?amount=${Math.round(Number(data.total))}&addInfo=${encodeURIComponent(paymentResult.description || '')}&accountName=${encodeURIComponent(paymentResult.account_name || '')}`}
                  alt="VietQR"
                  className="w-56 h-56 rounded-lg border object-contain bg-white p-2"
                />
              ) : null}
            </div>

            {paymentResult?.checkout_url && (
              <Button
                className="w-full"
                onClick={() => window.open(paymentResult.checkout_url, '_blank')}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Mở trang thanh toán PayOS
              </Button>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Hệ thống sẽ tự động cập nhật khi thanh toán thành công
            </p>
            <Button variant="outline" className="w-full" onClick={() => { onSuccess(); onOpenChange(false); }}>
              Đóng (thanh toán sau)
            </Button>
          </div>
        )}

        {/* SUCCESS STEP */}
        {step === 'success' && (
          <div className="space-y-4">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-3" />
              <p className="font-bold text-xl text-green-700">Thanh toán thành công</p>
              <p className="text-sm text-muted-foreground mt-1">
                Order {order.order_number} đã hoàn tất
              </p>
            </div>
            <div className="text-sm space-y-1 border-t pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phương thức</span>
                <span className="font-medium">{confirmedMethod === 'CASH' ? 'Tiền mặt' : 'QR Pay'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số tiền</span>
                <span className="font-bold">{Number(paymentResult?.amount || data.total).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
            <Button className="w-full" onClick={handleClose}>
              Đóng
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
