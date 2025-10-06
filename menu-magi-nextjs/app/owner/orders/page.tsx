'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChefHat, CheckCircle, Clock, ThumbsUp, Utensils, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { requestNotificationPermission, notifyNewOrder, playNotificationSound } from '@/lib/notifications';
import { formatIndianCurrency } from '@/lib/gst';

interface Order {
  id: string;
  owner_id: string;
  table_number: number;
  customer_name: string | null;
  customer_phone: string | null;
  status: 'waiting' | 'accepted' | 'preparing' | 'on-the-way' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
  order_items: OrderItem[];
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const supabase = createClient();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission().then((granted) => {
      setNotificationsEnabled(granted);
      if (granted) {
        console.log('✅ Notifications enabled');
      } else {
        toast.info('Enable notifications to get alerts for new orders');
      }
    });
  }, []);

  useEffect(() => {
    checkAuthAndLoadOrders();
    
    // Set up realtime subscription with notification support
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('🔔 New order received:', payload);
          const newOrder = payload.new as Order;
          
          // Trigger notifications for new waiting orders
          if (newOrder.status === 'waiting') {
            // Play sound
            if (audioRef.current) {
              audioRef.current.play().catch(err => console.log('Audio play failed:', err));
            } else {
              playNotificationSound();
            }

            // Show browser notification
            if (notificationsEnabled) {
              notifyNewOrder({
                tableNumber: newOrder.table_number,
                total: newOrder.total,
                orderId: newOrder.id,
                itemCount: 1 // Will be updated when order_items load
              });
            }

            // Show toast
            toast.success(`🔔 New Order from Table ${newOrder.table_number}!`, {
              duration: 5000,
              action: {
                label: 'View',
                onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            });
          }
          
          loadOrders();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        () => {
          loadOrders();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'orders'
        },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [notificationsEnabled]);

  const checkAuthAndLoadOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/owner/login');
        return;
      }

      await loadOrders();
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/owner/login');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      console.log('🔍 Loading orders for owner:', session.user.id);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            name,
            price,
            quantity
          )
        `)
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading orders:', error);
        toast.error('Error loading orders');
        return;
      }

      console.log('✅ Loaded orders:', data?.length || 0, 'orders');
      console.log('📋 Orders data:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status'], message: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(message);
      loadOrders();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleMarkAsPaid = async (orderId: string, tableNumber: number) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`✅ Table ${tableNumber} marked as paid!`);
      loadOrders();
    } catch (error: any) {
      console.error('Error marking as paid:', error);
      toast.error('Failed to mark order as paid');
    }
  };

  const getPaymentBadge = (paymentStatus: Order['payment_status']) => {
    const badges = {
      'pending': { label: '💳 Pending Payment', variant: 'destructive' as const, color: 'bg-orange-600' },
      'paid': { label: '✅ Paid', variant: 'default' as const, color: 'bg-green-600' },
      'failed': { label: '❌ Failed', variant: 'destructive' as const, color: 'bg-red-600' },
    };
    const badge = badges[paymentStatus];
    return <Badge variant={badge.variant} className={badge.color}>{badge.label}</Badge>;
  };

  const getStatusBadge = (status: Order['status']) => {
    const badges = {
      'waiting': { label: '⏳ Waiting', variant: 'secondary' as const, color: 'text-amber-600' },
      'accepted': { label: '✅ Accepted', variant: 'default' as const, color: 'text-blue-600' },
      'preparing': { label: '🍳 Preparing', variant: 'default' as const, color: 'text-purple-600' },
      'on-the-way': { label: '🏃 On the Way', variant: 'default' as const, color: 'text-orange-600' },
      'completed': { label: '✓ Completed', variant: 'secondary' as const, color: 'text-green-600' },
      'cancelled': { label: '✗ Cancelled', variant: 'secondary' as const, color: 'text-red-600' },
    };
    const badge = badges[status];
    return <Badge variant={badge.variant} className={badge.color}>{badge.label}</Badge>;
  };

  const getActionButtons = (order: Order) => {
    switch (order.status) {
      case 'waiting':
        return (
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => handleStatusUpdate(order.id, 'accepted', 'Order accepted!')}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Accept Order
          </Button>
        );
      case 'accepted':
        return (
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => handleStatusUpdate(order.id, 'preparing', 'Now preparing...')}
          >
            <Utensils className="mr-2 h-4 w-4" />
            Start Preparing
          </Button>
        );
      case 'preparing':
        return (
          <Button 
            className="w-full bg-orange-600 hover:bg-orange-700"
            onClick={() => handleStatusUpdate(order.id, 'on-the-way', 'Order on the way!')}
          >
            <Truck className="mr-2 h-4 w-4" />
            Mark On the Way
          </Button>
        );
      case 'on-the-way':
        return (
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => handleStatusUpdate(order.id, 'completed', 'Order completed!')}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark Completed
          </Button>
        );
      default:
        return null;
    }
  };

  const waitingOrders = orders.filter(o => o.status === 'waiting');
  const acceptedOrders = orders.filter(o => o.status === 'accepted');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const onTheWayOrders = orders.filter(o => o.status === 'on-the-way');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const activeOrders = [...waitingOrders, ...acceptedOrders, ...preparingOrders, ...onTheWayOrders];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Kitchen Dashboard</h1>
                <p className="text-sm text-slate-300">
                  {activeOrders.length} active orders
                </p>
              </div>
            </div>
            <Button variant="ghost" className="text-white hover:bg-slate-700" onClick={() => router.push('/owner/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <Card className="p-12 text-center bg-slate-800 border-slate-700">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700 flex items-center justify-center">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-300 text-lg">No orders yet</p>
            <p className="text-sm text-slate-400 mt-2">
              Orders from customers will appear here
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-bold text-white">Active Orders</h2>
                  <Badge className="bg-primary">{activeOrders.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeOrders.map((order) => (
                    <Card key={order.id} className="bg-slate-800 border-slate-700 shadow-xl hover:shadow-2xl transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-2xl text-white">Table {order.table_number}</CardTitle>
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(order.status)}
                            {getPaymentBadge(order.payment_status)}
                          </div>
                        </div>
                        <CardDescription className="text-slate-400">
                          Order #{order.id.slice(-6)} • {new Date(order.created_at).toLocaleTimeString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Order Items */}
                        <div className="space-y-2 bg-slate-900 p-3 rounded-lg">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-slate-300">
                                <span className="font-bold text-primary">{item.quantity}x</span>{' '}
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-slate-700">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-slate-300">Total</span>
                            <span className="text-xl font-bold text-primary">
                              ₹{formatIndianCurrency(order.total)}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            {getActionButtons(order)}
                            
                            {/* Mark as Paid button - only show if payment is pending */}
                            {order.payment_status === 'pending' && (
                              <Button 
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => handleMarkAsPaid(order.id, order.table_number)}
                              >
                                💳 Mark as Paid
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Orders */}
            {completedOrders.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h2 className="text-2xl font-bold text-white">Completed Orders</h2>
                  <Badge variant="secondary">{completedOrders.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedOrders.map((order) => (
                    <Card key={order.id} className="opacity-60 bg-slate-800 border-slate-700">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl text-white">Table {order.table_number}</CardTitle>
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(order.status)}
                            {getPaymentBadge(order.payment_status)}
                          </div>
                        </div>
                        <CardDescription className="text-slate-400">
                          Order #{order.id.slice(-6)} • {new Date(order.created_at).toLocaleTimeString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm text-slate-400">
                              <span>
                                <span className="font-bold">{item.quantity}x</span> {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700">
                          <span className="text-sm font-semibold text-slate-400">Total</span>
                          <span className="font-bold text-slate-300">₹{formatIndianCurrency(order.total)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
