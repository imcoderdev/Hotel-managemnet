// Order confirmation page
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home } from "lucide-react";
import { getAllOrders } from "@/lib/localStorage";
import { Order } from "@/types";

const Confirmation = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) {
      navigate("/customer/table");
      return;
    }

    // Find the order
    const orders = getAllOrders();
    const foundOrder = orders.find(o => o.id === orderId);
    
    if (!foundOrder) {
      navigate("/customer/table");
      return;
    }

    setOrder(foundOrder);
  }, [orderId, navigate]);

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <CardTitle className="text-3xl mb-2">Order Confirmed!</CardTitle>
            <CardDescription className="text-lg">
              Your order has been sent to the kitchen
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Order Details */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Order Number</p>
                  <p className="text-xl font-bold">#{order.id.slice(-6)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Table Number</p>
                  <p className="text-xl font-bold text-primary">Table {order.tableNumber}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3">Your Order:</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center text-xl font-bold pt-4 border-t">
              <span>Total Paid</span>
              <span className="text-primary">${order.total.toFixed(2)}</span>
            </div>

            {/* Success Message */}
            <div className="bg-success/10 border border-success/20 p-4 rounded-lg">
              <p className="text-center text-success font-semibold">
                🍽️ Your food will be ready shortly! Enjoy your meal!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/customer/menu")}
              >
                Order More
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  sessionStorage.clear();
                  navigate("/");
                }}
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Confirmation;
