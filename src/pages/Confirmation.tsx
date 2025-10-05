// Order confirmation and live tracking page
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Clock, ThumbsUp, Utensils, Truck, CheckCircle } from "lucide-react";
import { getAllOrders } from "@/lib/localStorage";
import { Order } from "@/types";

const Confirmation = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  // Poll for order status updates
  useEffect(() => {
    if (!orderId) {
      navigate("/customer/table");
      return;
    }

    const loadOrder = () => {
      const orders = getAllOrders();
      const foundOrder = orders.find(o => o.id === orderId);
      
      if (!foundOrder) {
        navigate("/customer/table");
        return;
      }

      setOrder(foundOrder);
    };

    // Initial load
    loadOrder();

    // Poll every 2 seconds for live updates
    const interval = setInterval(loadOrder, 2000);
    return () => clearInterval(interval);
  }, [orderId, navigate]);

  if (!order) {
    return null;
  }

  // Status information with icons and messages
  const statusInfo = {
    'waiting': {
      icon: Clock,
      title: 'Waiting for Confirmation',
      message: '⏳ Your order has been placed. Waiting for the kitchen to accept it...',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    'accepted': {
      icon: ThumbsUp,
      title: 'Order Accepted!',
      message: '✅ Great! The kitchen has accepted your order and will start preparing it soon.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    'preparing': {
      icon: Utensils,
      title: 'Preparing Your Meal',
      message: '🍳 Your delicious meal is being prepared with care by our chef!',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    'on-the-way': {
      icon: Truck,
      title: 'On the Way!',
      message: '🏃‍♂️ Your order is ready and on its way to your table!',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    'completed': {
      icon: CheckCircle,
      title: 'Order Delivered!',
      message: '🍽️ Enjoy your meal! Thank you for your order.',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
    },
  };

  const currentStatus = statusInfo[order.status];
  const StatusIcon = currentStatus.icon;

  // Progress steps
  const steps = [
    { status: 'waiting', label: 'Placed', icon: Clock },
    { status: 'accepted', label: 'Accepted', icon: ThumbsUp },
    { status: 'preparing', label: 'Preparing', icon: Utensils },
    { status: 'on-the-way', label: 'On the Way', icon: Truck },
    { status: 'completed', label: 'Delivered', icon: CheckCircle },
  ];

  const statusOrder = ['waiting', 'accepted', 'preparing', 'on-the-way', 'completed'];
  const currentStepIndex = statusOrder.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-4">
      <div className="max-w-3xl mx-auto py-8">
        {/* Status Card */}
        <Card className={`shadow-xl mb-6 border-2 ${currentStatus.borderColor} animate-fade-in`}>
          <CardHeader className={`text-center pb-4 ${currentStatus.bgColor} rounded-t-lg`}>
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full ${currentStatus.bgColor} border-2 ${currentStatus.borderColor} flex items-center justify-center animate-scale-in`}>
              <StatusIcon className={`w-10 h-10 ${currentStatus.color}`} />
            </div>
            <CardTitle className={`text-3xl mb-2 ${currentStatus.color}`}>
              {currentStatus.title}
            </CardTitle>
            <CardDescription className="text-lg font-medium">
              {currentStatus.message}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Progress Tracker */}
            <div className="mb-8">
              <div className="flex justify-between items-center relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-muted">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                  />
                </div>

                {/* Steps */}
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={step.status} className="relative flex flex-col items-center z-10">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isActive 
                            ? 'bg-primary border-primary text-white' 
                            : 'bg-background border-muted'
                        } ${isCurrent ? 'animate-pulse' : ''}`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <p className={`text-xs mt-2 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-muted p-4 rounded-lg mb-4">
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
            <div className="mb-4">
              <h3 className="font-semibold mb-3">Your Order:</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center text-xl font-bold py-4 border-t border-b">
              <span>Total Paid</span>
              <span className="text-primary">${order.total.toFixed(2)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
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

        {/* Live Updates Indicator */}
        <p className="text-center text-sm text-muted-foreground">
          🔄 Live updates enabled • Status updates automatically
        </p>
      </div>
    </div>
  );
};

export default Confirmation;
