// Cook/Kitchen view - Display all orders with status workflow
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChefHat, CheckCircle, Clock, ThumbsUp, Utensils, Truck } from "lucide-react";
import { getAllOrders, updateOrderStatus, getCurrentOwner } from "@/lib/localStorage";
import { Order } from "@/types";
import { toast } from "sonner";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  // Check authentication and load orders
  useEffect(() => {
    const currentOwner = getCurrentOwner();
    if (!currentOwner) {
      navigate("/owner/login");
      return;
    }

    loadOrders();
    
    // Poll for updates every 3 seconds
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

  // Load orders from localStorage
  const loadOrders = () => {
    const allOrders = getAllOrders();
    // Sort by newest first
    const sortedOrders = allOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setOrders(sortedOrders);
  };

  // Update order status
  const handleStatusUpdate = (orderId: string, newStatus: Order['status'], message: string) => {
    updateOrderStatus(orderId, newStatus);
    loadOrders();
    toast.success(message);
  };

  // Filter orders by status
  const waitingOrders = orders.filter(o => o.status === 'waiting');
  const acceptedOrders = orders.filter(o => o.status === 'accepted');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const onTheWayOrders = orders.filter(o => o.status === 'on-the-way');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const activeOrders = [...waitingOrders, ...acceptedOrders, ...preparingOrders, ...onTheWayOrders];

  // Get status badge
  const getStatusBadge = (status: Order['status']) => {
    const badges = {
      'waiting': { label: '⏳ Waiting', variant: 'secondary' as const, color: 'text-amber-600' },
      'accepted': { label: '✅ Accepted', variant: 'default' as const, color: 'text-blue-600' },
      'preparing': { label: '🍳 Preparing', variant: 'default' as const, color: 'text-purple-600' },
      'on-the-way': { label: '🏃 On the Way', variant: 'default' as const, color: 'text-orange-600' },
      'completed': { label: '✓ Completed', variant: 'secondary' as const, color: 'text-success' },
    };
    const badge = badges[status];
    return <Badge variant={badge.variant} className={badge.color}>{badge.label}</Badge>;
  };

  // Get action buttons based on status
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
            className="w-full bg-success hover:bg-success/90"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
            <Button variant="ghost" className="text-white hover:bg-slate-700" onClick={() => navigate("/owner/dashboard")}>
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
                    <Card key={order.id} className="bg-slate-800 border-slate-700 shadow-xl hover:shadow-2xl transition-smooth animate-fade-in">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-2xl text-white">Table {order.tableNumber}</CardTitle>
                          {getStatusBadge(order.status)}
                        </div>
                        <CardDescription className="text-slate-400">
                          Order #{order.id.slice(-6)} • {new Date(order.createdAt).toLocaleTimeString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Order Items */}
                        <div className="space-y-2 bg-slate-900 p-3 rounded-lg">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-slate-300">
                                <span className="font-bold text-primary">{item.quantity}x</span>{" "}
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-slate-700">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-slate-300">Total</span>
                            <span className="text-xl font-bold text-primary">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                          {getActionButtons(order)}
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
                  <CheckCircle className="w-5 h-5 text-success" />
                  <h2 className="text-2xl font-bold text-white">Completed Orders</h2>
                  <Badge variant="secondary">{completedOrders.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedOrders.map((order) => (
                    <Card key={order.id} className="opacity-60 bg-slate-800 border-slate-700">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl text-white">Table {order.tableNumber}</CardTitle>
                          {getStatusBadge(order.status)}
                        </div>
                        <CardDescription className="text-slate-400">
                          Order #{order.id.slice(-6)} • {new Date(order.createdAt).toLocaleTimeString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm text-slate-400">
                              <span>
                                <span className="font-bold">{item.quantity}x</span> {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700">
                          <span className="text-sm font-semibold text-slate-400">Total</span>
                          <span className="font-bold text-slate-300">${order.total.toFixed(2)}</span>
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
};

export default Orders;
