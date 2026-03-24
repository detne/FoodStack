/**
 * Customer My Order — Rounds view + Real-time polling + Payment integration
 * URL: /customer/my-order?table=:tableId&qr_token=:qrToken&branch=:branchId
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, UtensilsCrossed, Home, ShoppingCart, FileText,
  Bell, Plus, RefreshCw, Receipt, Clock, CheckCircle,
  Banknote, QrCode, Loader2, AlertCircle,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  name?: string;           // flat (customer-orders route)
  menu_item?: { id?: string; name?: string; image_url?: string | null }; // nested (orders route)
  quantity: number;
  price: number;
  subtotal?: number;
  image_url?: string | null;
  notes?: string;
  status?: string;
}

interface OrderRound {
  id: string;
  round_number: number;
  status: string; // PENDING | PREPARING | SERVED
  created_at: string;
  items: OrderItem[];
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal?: number;
  tax?: number;
  service_charge?: number;
  rounds?: OrderRound[];
  items?: OrderItem[];
  created_at: string;
  table?: { id: string; table_number: string; qr_token?: string };
}

interface Payment {
  id: string;
  method: 'CASH' | 'QR_PAY';
  status: string; // PENDING | PAID | FAILED
  amount: number;
  checkout_url?: string;
  qr_code?: string;
  bin?: string;
  account_number?: string;
  account_name?: string;
  description?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const POLL_INTERVAL = 5000; // 5 giây

const ROUND_STATUS: Record<string, { label: string; color: string; icon: any; step: number }> = {
  PENDING:   { label: 'Đang chờ',    color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock,        step: 1 },
  PREPARING: { label: 'Đang làm',    color: 'bg-purple-100 text-purple-700 border-purple-300', icon: UtensilsCrossed, step: 2 },
  SERVED:    { label: 'Đã phục vụ',  color: 'bg-green-100 text-green-700 border-green-300',    icon: CheckCircle,  step: 3 },
};

const ITEM_STATUS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Chờ',       color: 'bg-yellow-50 text-yellow-600' },
  PREPARING: { label: 'Đang làm',  color: 'bg-purple-50 text-purple-600' },
  SERVED:    { label: 'Đã phục vụ', color: 'bg-green-50 text-green-600' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(amount: number) {
  return amount.toLocaleString('vi-VN') + 'đ';
}

async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...(options?.headers as any) } });
  return res.json();
}

// Lấy tên và ảnh từ item (hỗ trợ cả flat và nested menu_item)
function getItemName(item: OrderItem): string {
  return item.menu_item?.name || item.name || 'Món ăn';
}
function getItemImage(item: OrderItem): string | null | undefined {
  return item.menu_item?.image_url ?? item.image_url;
}

// ─── Round Status Bar ─────────────────────────────────────────────────────────

function RoundStatusBar({ status }: { status: string }) {
  const steps = [
    { key: 'PENDING',   label: 'Đặt món',    icon: Receipt },
    { key: 'PREPARING', label: 'Đang làm',   icon: UtensilsCrossed },
    { key: 'SERVED',    label: 'Phục vụ',    icon: CheckCircle },
  ];
  const currentStep = ROUND_STATUS[status]?.step ?? 1;

  return (
    <div className="flex items-center justify-between w-full px-2 py-3">
      {steps.map((s, i) => {
        const stepNum = i + 1;
        const done = currentStep > stepNum;
        const active = currentStep === stepNum;
        const Icon = s.icon;
        return (
          <div key={s.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                ${active ? 'bg-indigo-600 border-indigo-600 text-white' :
                  done ? 'bg-green-500 border-green-500 text-white' :
                  'bg-gray-100 border-gray-300 text-gray-400'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-xs mt-1 font-medium ${active ? 'text-indigo-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${currentStep > i + 1 ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Payment Section ──────────────────────────────────────────────────────────

function PaymentSection({
  order, qrToken, onPaymentUpdate,
}: {
  order: Order;
  qrToken: string;
  onPaymentUpdate: () => void;
}) {
  const [step, setStep] = useState<'select' | 'cash_waiting' | 'qr_show' | 'paid'>('select');
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Nếu order đã PAID thì hiện success ngay
  useEffect(() => {
    if (order.payment_status === 'PAID') setStep('paid');
  }, [order.payment_status]);

  // Poll payment status khi đang chờ
  useEffect(() => {
    if ((step === 'cash_waiting' || step === 'qr_show') && payment?.id) {
      pollRef.current = setInterval(async () => {
        try {
          const data = await apiFetch(`/payments/${payment.id}/status`);
          if (data.success && data.data?.status === 'PAID') {
            clearInterval(pollRef.current!);
            setStep('paid');
            onPaymentUpdate();
          }
        } catch { /* ignore */ }
      }, POLL_INTERVAL);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [step, payment?.id]);

  const handlePay = async (method: 'CASH' | 'QR_PAY') => {
    setLoading(true);
    try {
      const data = await apiFetch('/payments/process', {
        method: 'POST',
        body: JSON.stringify({ orderId: order.id, qrToken, method }),
      });
      if (!data.success) throw new Error(data.message || 'Lỗi tạo thanh toán');
      setPayment(data.data);
      setStep(method === 'CASH' ? 'cash_waiting' : 'qr_show');
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const total = order.total;

  if (step === 'paid') {
    return (
      <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <p className="font-bold text-lg text-green-700">Thanh toán thành công!</p>
        <p className="text-sm text-green-600 mt-1">Cảm ơn bạn đã dùng bữa</p>
      </div>
    );
  }

  if (step === 'cash_waiting') {
    return (
      <div className="space-y-4">
        <div className="text-center p-6 bg-amber-50 rounded-xl border border-amber-200">
          <Banknote className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <p className="font-bold text-lg text-amber-700">Nhân viên đang đến</p>
          <p className="text-sm text-amber-600 mt-1">
            Vui lòng chuẩn bị <span className="font-bold">{formatVND(total)}</span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            <span className="text-xs text-amber-500">Đang chờ nhân viên xác nhận...</span>
          </div>
        </div>
        <Button variant="outline" className="w-full text-sm" onClick={() => setStep('select')}>
          Đổi phương thức thanh toán
        </Button>
      </div>
    );
  }

  if (step === 'qr_show') {
    const qrImageUrl = payment?.qr_code
      ? payment.qr_code
      : payment?.bin && payment?.account_number
        ? `https://img.vietqr.io/image/${payment.bin}-${payment.account_number}-compact2.png?amount=${Math.round(total)}&addInfo=${encodeURIComponent(payment.description || '')}&accountName=${encodeURIComponent(payment.account_name || '')}`
        : null;

    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="font-bold text-lg">Quét mã QR để thanh toán</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{formatVND(total)}</p>
        </div>
        {qrImageUrl && (
          <div className="flex justify-center">
            <img src={qrImageUrl} alt="QR thanh toán" className="w-56 h-56 rounded-xl border-2 border-indigo-200 bg-white p-2 object-contain" />
          </div>
        )}
        {payment?.checkout_url && (
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => window.open(payment.checkout_url, '_blank')}>
            <QrCode className="w-4 h-4 mr-2" />
            Mở trang thanh toán PayOS
          </Button>
        )}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Tự động cập nhật khi thanh toán xong</span>
        </div>
        <Button variant="outline" className="w-full text-sm" onClick={() => setStep('select')}>
          Đổi phương thức thanh toán
        </Button>
      </div>
    );
  }

  // step === 'select'
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-700">Tổng thanh toán</span>
        <span className="text-xl font-bold text-indigo-600">{formatVND(total)}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-16 flex-col gap-1 border-2 hover:border-amber-400 hover:bg-amber-50"
          disabled={loading}
          onClick={() => handlePay('CASH')}
        >
          <Banknote className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-medium">Tiền mặt</span>
        </Button>
        <Button
          variant="outline"
          className="h-16 flex-col gap-1 border-2 hover:border-indigo-400 hover:bg-indigo-50"
          disabled={loading}
          onClick={() => handlePay('QR_PAY')}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5 text-indigo-600" />}
          <span className="text-sm font-medium">QR Pay</span>
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomerMyOrderSimple() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tableId = searchParams.get('table');
  const qrToken = searchParams.get('qr_token');
  const branchId = searchParams.get('branch');

  const [loading, setLoading] = useState(true);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch table orders (flat list) ──
  const loadTableOrders = useCallback(async (silent = false) => {
    if (!tableId || !qrToken) return;
    if (!silent) setLoading(true);
    try {
      const data = await apiFetch(`/customer-orders/table/${tableId}?qr_token=${qrToken}`);
      if (data.success) {
        setTableInfo(data.data.table);
        const allOrders: Order[] = data.data.orders;

        // Chỉ giữ order đang active — bỏ PAID/COMPLETED/CANCELLED
        const activeOrders = allOrders.filter(o =>
          o.status === 'ACTIVE' || o.status === 'PENDING' || o.status === 'PREPARING'
        );
        setOrders(activeOrders);

        // Luôn chọn order active mới nhất
        const active = activeOrders[0] ?? null;
        if (active) {
          setActiveOrderId(prev => {
            const stillActive = activeOrders.find(o => o.id === prev);
            return stillActive ? prev : active.id;
          });
        } else {
          // Không còn order active nào — reset
          setActiveOrderId(null);
          setOrderDetail(null);
        }
      }
    } catch (err) {
      if (!silent) toast({ title: 'Lỗi', description: 'Không thể tải đơn hàng', variant: 'destructive' });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [tableId, qrToken]);

  // ── Fetch order detail with rounds ──
  const loadOrderDetail = useCallback(async (orderId: string, silent = false) => {
    try {
      const data = await apiFetch(`/orders/${orderId}`);
      if (data.success && data.data) {
        setOrderDetail(data.data);
        // Sync payment_status vào orders list
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: data.data.payment_status, status: data.data.status } : o));
      }
    } catch { /* ignore silent */ }
  }, []);

  // ── Initial load ──
  useEffect(() => {
    if (!tableId || !qrToken) {
      toast({ title: 'Lỗi', description: 'Thiếu thông tin bàn', variant: 'destructive' });
      return;
    }
    loadTableOrders();
  }, [tableId, qrToken]);

  // ── Load detail khi chọn order ──
  useEffect(() => {
    if (activeOrderId) loadOrderDetail(activeOrderId);
  }, [activeOrderId]);

  // ── Polling mỗi 5s ──
  useEffect(() => {
    pollRef.current = setInterval(() => {
      loadTableOrders(true);
      if (activeOrderId) loadOrderDetail(activeOrderId, true);
    }, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadTableOrders, loadOrderDetail, activeOrderId]);

  const handleRefresh = () => {
    loadTableOrders();
    if (activeOrderId) loadOrderDetail(activeOrderId);
  };

  // Chỉ tính tiền của order đang active (không cộng order cũ đã PAID)
  const activeOrder = orders.find(o => o.id === activeOrderId) ?? orders.find(o => o.status === 'ACTIVE' || o.status === 'PENDING') ?? null;
  const getTotalAmount = () => activeOrder ? Number(activeOrder.total) : 0;
  const getTotalItems = () => activeOrder ? (activeOrder.items?.length ?? 0) : 0;
  const isPaid = activeOrder?.payment_status === 'PAID';

  // Chỉ cho thanh toán khi TẤT CẢ rounds đã SERVED
  const allRoundsServed = orderDetail?.rounds && orderDetail.rounds.length > 0
    ? orderDetail.rounds.every(r => r.status === 'SERVED')
    : false;
  const canPay = activeOrder && !isPaid && activeOrder.status !== 'CANCELLED' && allRoundsServed;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate(`/t/${qrToken}`)} variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">Đơn của tôi</h1>
          </div>
          <Button onClick={handleRefresh} variant="ghost" size="sm" className="p-2">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Table Info */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardContent className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{tableInfo?.table_number || `Bàn ${tableId?.slice(-4)}`}</h2>
                <p className="text-indigo-200 text-sm">{tableInfo?.area_name || 'Khu vực ăn'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-indigo-200">Tổng tiền</p>
                <p className="text-xl font-bold">{formatVND(Number(orderDetail?.total ?? activeOrder?.total ?? 0))}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {orders.length === 0 ? (
          /* Empty state */
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Chưa có đơn hàng</h3>
              <p className="text-gray-600 mb-6">Hãy bắt đầu gọi món nhé</p>
              <Button onClick={() => navigate(`/customer/menu?table=${tableId}&branch=${branchId}&qr_token=${qrToken}`)} className="bg-indigo-600 hover:bg-indigo-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Xem thực đơn
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Rounds View */}
            {orderDetail?.rounds && orderDetail.rounds.length > 0 ? (
              <div className="space-y-4">
                {orderDetail.rounds.map((round) => {
                  const cfg = ROUND_STATUS[round.status] ?? ROUND_STATUS.PENDING;
                  const Icon = cfg.icon;
                  return (
                    <Card key={round.id} className="border-0 shadow-sm overflow-hidden">
                      <CardHeader className="pb-0 pt-4 px-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-bold">Round {round.round_number}</CardTitle>
                          <Badge className={`${cfg.color} border`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {cfg.label}
                          </Badge>
                        </div>
                        <RoundStatusBar status={round.status} />
                      </CardHeader>
                      <CardContent className="px-4 pb-4 space-y-2">
                        {round.items.map((item) => {
                          const isServed = item.status === 'SERVED';
                          const isPreparing = item.status === 'PREPARING';
                          const itemName = getItemName(item);
                          const itemImage = getItemImage(item);
                          return (
                            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                              ${isServed ? 'bg-green-50 border-green-200' : isPreparing ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                              {/* Ảnh món */}
                              <div className="relative shrink-0">
                                {itemImage ? (
                                  <img src={itemImage} alt={itemName} className="w-14 h-14 rounded-xl object-cover" />
                                ) : (
                                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center
                                    ${isServed ? 'bg-green-100' : isPreparing ? 'bg-purple-100' : 'bg-gray-200'}`}>
                                    <UtensilsCrossed className={`w-6 h-6 ${isServed ? 'text-green-500' : isPreparing ? 'text-purple-500' : 'text-gray-400'}`} />
                                  </div>
                                )}
                                {/* Status icon overlay */}
                                {isServed && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-3 h-3 text-white" />
                                  </div>
                                )}
                                {isPreparing && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                                    <Clock className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>

                              {/* Tên + ghi chú */}
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm truncate ${isServed ? 'text-green-800' : isPreparing ? 'text-purple-800' : 'text-gray-800'}`}>
                                  {itemName}
                                </p>
                                {isPreparing && (
                                  <p className="text-xs text-purple-600 flex items-center gap-1 mt-0.5">
                                    <span className="inline-block w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                                    <span className="inline-block w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                                    <span className="inline-block w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                                    <span className="ml-1">Bếp đang chuẩn bị</span>
                                  </p>
                                )}
                                {isServed && (
                                  <p className="text-xs text-green-600 mt-0.5">Đã phục vụ</p>
                                )}
                                {item.notes && <p className="text-xs text-gray-500 italic mt-0.5">"{item.notes}"</p>}
                              </div>

                              {/* Số lượng + giá */}
                              <div className="text-right shrink-0">
                                <p className="text-xs text-gray-500">×{item.quantity}</p>
                                <p className={`text-sm font-bold ${isServed ? 'text-green-700' : 'text-indigo-600'}`}>
                                  {formatVND(Number(item.price) * item.quantity)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              /* Fallback: flat items list nếu chưa có rounds */
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UtensilsCrossed className="h-5 w-5" />
                    Món đã gọi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {orders.flatMap(o => (o.items ?? []).map(item => (
                    <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                      ) : (
                        <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center">
                          <UtensilsCrossed className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.name}</p>
                        {item.notes && <p className="text-xs text-gray-500 italic">Ghi chú: {item.notes}</p>}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">×{item.quantity}</span>
                          <span className="text-sm font-bold text-indigo-600">{formatVND(Number(item.price) * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  )))}
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatVND(Number(orderDetail?.subtotal ?? activeOrder?.total ?? 0))}</span>
                </div>
                {orderDetail?.tax != null && Number(orderDetail.tax) > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Thuế</span>
                    <span>{formatVND(Number(orderDetail.tax))}</span>
                  </div>
                )}
                {orderDetail?.service_charge != null && Number(orderDetail.service_charge) > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Phí dịch vụ</span>
                    <span>{formatVND(Number(orderDetail.service_charge))}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Tổng cộng</span>
                  <span className="text-indigo-600">{formatVND(Number(orderDetail?.total ?? activeOrder?.total ?? 0))}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Section */}
            {canPay && activeOrder && qrToken && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Receipt className="h-5 w-5" />
                    Thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentSection
                    order={activeOrder}
                    qrToken={qrToken}
                    onPaymentUpdate={handleRefresh}
                  />
                </CardContent>
              </Card>
            )}

            {/* Chờ phục vụ xong mới cho thanh toán */}
            {!isPaid && !canPay && activeOrder && orderDetail?.rounds && orderDetail.rounds.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-purple-800 text-sm">Bếp đang chuẩn bị món</p>
                  <p className="text-xs text-purple-600 mt-0.5">Thanh toán sẽ mở sau khi tất cả món được phục vụ</p>
                </div>
              </div>
            )}

            {isPaid && (
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-green-700">Đã thanh toán</p>
              </div>
            )}
          </>
        )}

        {/* Order More */}
        {!isPaid && (
          <Button
            onClick={() => navigate(`/customer/menu?table=${tableId}&branch=${branchId}&qr_token=${qrToken}`)}
            variant="outline"
            className="w-full border-2 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 py-6 rounded-xl"
          >
            <Plus className="h-5 w-5 mr-2" />
            Gọi thêm món
          </Button>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="grid grid-cols-4 gap-4">
            <button onClick={() => navigate(`/t/${qrToken}`)} className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-900 transition-colors">
              <Home className="h-5 w-5 mb-1" />
              <span className="text-xs">Trang chủ</span>
            </button>
            <button onClick={() => navigate(`/customer/menu?table=${tableId}&branch=${branchId}&qr_token=${qrToken}`)} className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-900 transition-colors">
              <ShoppingCart className="h-5 w-5 mb-1" />
              <span className="text-xs">Thực đơn</span>
            </button>
            <button className="flex flex-col items-center py-2 text-indigo-600">
              <div className="bg-indigo-600 rounded-full p-2 mb-1">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-bold">Đơn hàng</span>
            </button>
            <button className="flex flex-col items-center py-2 text-gray-500 hover:text-gray-900 transition-colors">
              <Bell className="h-5 w-5 mb-1" />
              <span className="text-xs">Dịch vụ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
