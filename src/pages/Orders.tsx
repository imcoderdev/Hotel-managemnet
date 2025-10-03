// Cook/Kitchen view - Display all orders with table numbers
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChefHat, CheckCircle, Clock } from "lucide-react";
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

  // Mark order as completed
  const handleCompleteOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'completed');
    loadOrders();
    toast.success("Order marked as completed!");
  };

  // Filter orders
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Kitchen Orders</h1>
                <p className="text-sm text-muted-foreground">
                  {pendingOrders.length} pending orders
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => navigate("/owner/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">No orders yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Orders from customers will appear here
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-bold">Pending Orders</h2>
                  <Badge variant="default">{pendingOrders.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingOrders.map((order) => (
                    <Card key={order.id} className="shadow-md hover:shadow-lg transition-smooth border-2 border-primary/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-2xl">Table {order.tableNumber}</CardTitle>
                          <Badge variant="default" className="bg-primary">Pending</Badge>
                        </div>
                        <CardDescription>
                          Order #{order.id.slice(-6)} • {new Date(order.createdAt).toLocaleTimeString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Order Items */}
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>
                                <span className="font-bold text-primary">{item.quantity}x</span>{" "}
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold">Total</span>
                            <span className="text-xl font-bold text-primary">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                          <Button 
                            className="w-full"
                            variant="success"
                            onClick={() => handleCompleteOrder(order.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Completed
                          </Button>
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
                  <h2 className="text-2xl font-bold">Completed Orders</h2>
                  <Badge variant="secondary">{completedOrders.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedOrders.map((order) => (
                    <Card key={order.id} className="opacity-75">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">Table {order.tableNumber}</CardTitle>
                          <Badge variant="secondary" className="bg-success">Completed</Badge>
                        </div>
                        <CardDescription>
                          Order #{order.id.slice(-6)} • {new Date(order.createdAt).toLocaleTimeString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                              <span>
                                <span className="font-bold">{item.quantity}x</span> {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t">
                          <span className="text-sm font-semibold">Total</span>
                          <span className="font-bold">${order.total.toFixed(2)}</span>
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
