// Checkout page - Order summary and payment simulation
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, CheckCircle } from "lucide-react";
import { CartItem } from "@/types";
import { createOrder } from "@/lib/localStorage";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load cart and table number
  useEffect(() => {
    const storedTable = sessionStorage.getItem("tableNumber");
    const storedCart = sessionStorage.getItem("cart");

    if (!storedTable || !storedCart) {
      navigate("/customer/table");
      return;
    }

    setTableNumber(parseInt(storedTable));
    setCart(JSON.parse(storedCart));
  }, [navigate]);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Handle payment (simulated)
  const handlePayment = async () => {
    if (!tableNumber) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      try {
        // Create order in localStorage
        const order = createOrder(tableNumber, cart, total);
        
        // Clear cart from sessionStorage
        sessionStorage.removeItem("cart");
        
        toast.success("Payment successful! Order placed.");
        
        // Navigate to confirmation
        navigate(`/customer/confirmation/${order.id}`);
      } catch (error) {
        toast.error("Failed to place order. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  if (!tableNumber || cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/customer/menu")}
          className="mb-6"
          disabled={isProcessing}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Checkout</h1>

          <div className="grid gap-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Table {tableNumber}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
                <CardDescription>Simulated payment for demo purposes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Demo Payment Mode</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This is a demonstration. No real payment will be processed.
                  </p>
                </div>

                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Confirm & Pay ${total.toFixed(2)}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
