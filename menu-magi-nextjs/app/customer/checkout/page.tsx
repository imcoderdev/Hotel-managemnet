'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { calculateGST, formatIndianCurrency } from '@/lib/gst';
import { shareOnWhatsApp, getOrderConfirmationMessage } from '@/lib/whatsapp';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const storedTable = sessionStorage.getItem('tableNumber');
    const storedCart = sessionStorage.getItem('cart');
    const storedOwnerId = sessionStorage.getItem('ownerId');
    const storedRestaurantId = sessionStorage.getItem('restaurantId');

    console.log('🔍 Checkout - sessionStorage values:', {
      tableNumber: storedTable,
      cartItems: storedCart ? JSON.parse(storedCart).length : 0,
      ownerId: storedOwnerId,
      restaurantId: storedRestaurantId
    });

    if (!storedTable || !storedCart) {
      router.push('/customer/table');
      return;
    }

    // ✅ FIX: Use restaurantId as fallback if ownerId is missing
    const finalOwnerId = storedOwnerId || storedRestaurantId;
    
    if (!finalOwnerId) {
      console.error('❌ No ownerId or restaurantId found in sessionStorage!');
      toast.error('Restaurant information missing. Please scan QR code again.');
      router.push('/customer/table');
      return;
    }

    setTableNumber(parseInt(storedTable));
    setCart(JSON.parse(storedCart));
    setOwnerId(finalOwnerId);
    
    console.log('✅ Checkout initialized with ownerId:', finalOwnerId);
  }, [router]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate GST (5% for restaurants in India: 2.5% CGST + 2.5% SGST)
  const gstRate = 5;
  const gstCalculation = calculateGST(subtotal, gstRate, false); // false = same state
  const tax = gstCalculation.totalGST; // ✅ FIXED: Use totalGST (just the tax), not total (subtotal + tax)
  const total = gstCalculation.total; // ✅ FIXED: Use the pre-calculated total from GST function

  const handlePayment = async () => {
    if (!tableNumber || !ownerId) {
      const missingInfo = [];
      if (!tableNumber) missingInfo.push('table number');
      if (!ownerId) missingInfo.push('restaurant ID');
      
      console.error('❌ Missing order information:', { tableNumber, ownerId });
      toast.error(`Missing: ${missingInfo.join(', ')}. Please start from table selection.`);
      return;
    }

    console.log('✅ Starting order creation with:', { tableNumber, ownerId, itemCount: cart.length });
    setIsProcessing(true);

    try {
      // Generate unique invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const orderPayload = {
        owner_id: ownerId,
        table_number: tableNumber,
        status: 'waiting',
        subtotal,
        tax,
        total,
        payment_status: 'pending', // ✅ FIXED: Orders start as pending, owner marks as paid
        payment_method: 'cash',
        gst_rate: gstRate,
        gst_amount: gstCalculation.totalGST,
        cgst: gstCalculation.cgst,
        sgst: gstCalculation.sgst,
        invoice_number: invoiceNumber, // ✅ FIXED: Generate unique invoice number
      };

      console.log('🔍 Order payload:', orderPayload);
      console.log('🔍 Payload JSON:', JSON.stringify(orderPayload, null, 2));
      console.log('🔍 GST Calculation:', gstCalculation);

      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      console.log('📦 Order response:', { data: orderData, error: orderError });
      console.log('📦 Full orderError object:', JSON.stringify(orderError, null, 2));
      console.log('📦 orderData:', JSON.stringify(orderData, null, 2));

      if (orderError) {
        console.error('❌ Order error detected!');
        console.error('❌ Error type:', typeof orderError);
        console.error('❌ Error keys:', Object.keys(orderError));
        console.error('❌ Full error:', JSON.stringify(orderError, null, 2));
        throw new Error(`Database error: ${orderError.message || JSON.stringify(orderError)}`);
      }

      if (!orderData) {
        console.error('❌ No order data returned from database');
        throw new Error('No order data returned from database');
      }

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      console.log('📦 Creating order items:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Order items error:', {
          message: itemsError.message,
          details: itemsError.details,
          hint: itemsError.hint,
        });
        throw itemsError;
      }

      console.log('✅ Order created successfully!');

      // Clear cart
      sessionStorage.removeItem('cart');
      
      toast.success('Payment successful! Order placed.');
      
      // WhatsApp sharing option
      const whatsappMessage = getOrderConfirmationMessage({
        orderId: orderData.invoice_number || orderData.id.slice(-6),
        restaurantName: 'Menu Magi Restaurant',
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: total,
        tableNumber: tableNumber
      });
      
      // Show WhatsApp share dialog after a brief moment
      setTimeout(() => {
        if (confirm('📱 Share order confirmation on WhatsApp?')) {
          shareOnWhatsApp(whatsappMessage, '');
        }
      }, 1000);
      
      router.push(`/customer/confirmation/${orderData.id}`);
    } catch (error: any) {
      console.error('❌ Order creation error:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack,
      });
      
      const errorMessage = error?.message || error?.details || 'Unknown error occurred';
      toast.error('Failed to place order: ' + errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!tableNumber || cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/customer/menu')}
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
                        ₹{formatIndianCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold">₹{formatIndianCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{formatIndianCurrency(subtotal)}</span>
                  </div>
                  <div className="space-y-1 py-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>CGST (2.5%)</span>
                      <span>₹{formatIndianCurrency(gstCalculation.cgst)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>SGST (2.5%)</span>
                      <span>₹{formatIndianCurrency(gstCalculation.sgst)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-muted-foreground">
                    <span>Total GST (5%)</span>
                    <span>₹{formatIndianCurrency(gstCalculation.totalGST)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{formatIndianCurrency(total)}</span>
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
                      Confirm & Pay ₹{formatIndianCurrency(total)}
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
}
