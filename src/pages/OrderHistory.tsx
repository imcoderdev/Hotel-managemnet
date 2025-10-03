import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, DollarSign, ShoppingBag } from "lucide-react";
import { getCurrentOwner, getDailyOrderStats } from "@/lib/localStorage";
import { Order } from "@/types";

const OrderHistory = () => {
  const navigate = useNavigate();
  const [dailyStats, setDailyStats] = useState<Record<string, { orders: Order[], totalRevenue: number, orderCount: number }>>({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const owner = getCurrentOwner();
    if (!owner) {
      navigate("/owner/login");
      return;
    }

    const stats = getDailyOrderStats(owner.id);
    setDailyStats(stats);

    // Calculate totals
    let revenue = 0;
    let orders = 0;
    Object.values(stats).forEach(day => {
      revenue += day.totalRevenue;
      orders += day.orderCount;
    });
    setTotalRevenue(revenue);
    setTotalOrders(orders);
  }, [navigate]);

  const sortedDates = Object.keys(dailyStats).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/owner/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-4xl font-bold">Order History</h1>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days Active</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sortedDates.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Breakdown */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Daily Breakdown</h2>
          {sortedDates.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No orders yet
              </CardContent>
            </Card>
          ) : (
            sortedDates.map(date => {
              const dayStats = dailyStats[date];
              return (
                <Card key={date} className="gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {date}
                      </span>
                      <span className="text-lg text-primary">${dayStats.totalRevenue.toFixed(2)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <span>{dayStats.orderCount} orders</span>
                        <span>Avg: ${(dayStats.totalRevenue / dayStats.orderCount).toFixed(2)}</span>
                      </div>
                      
                      <div className="space-y-2">
                        {dayStats.orders.map(order => (
                          <div key={order.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">Table {order.tableNumber}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                order.status === 'completed' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="text-sm space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-muted-foreground">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t">
                              <span className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleTimeString()}
                              </span>
                              <span className="font-bold">${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
