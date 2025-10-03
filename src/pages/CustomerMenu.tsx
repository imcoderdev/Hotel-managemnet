// Customer menu page - Browse and add items to cart
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { getAllMenuItems, initializeSampleData } from "@/lib/localStorage";
import { MenuItem, CartItem } from "@/types";
import { toast } from "sonner";

const CustomerMenu = () => {
  const navigate = useNavigate();
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load table number and menu items
  useEffect(() => {
    // Check if table number is selected
    const storedTable = sessionStorage.getItem("tableNumber");
    if (!storedTable) {
      navigate("/customer/table");
      return;
    }
    setTableNumber(parseInt(storedTable));

    // Initialize sample data and load menu
    initializeSampleData();
    const items = getAllMenuItems();
    setMenuItems(items);
  }, [navigate]);

  // Calculate cart totals
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Add item to cart
  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // Increase quantity
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // Add new item
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
    toast.success(`Added ${item.name} to cart`);
  };

  // Remove one from cart
  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);
      
      if (!existingItem) return prevCart;
      
      if (existingItem.quantity > 1) {
        // Decrease quantity
        return prevCart.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        // Remove item completely
        return prevCart.filter(item => item.id !== itemId);
      }
    });
  };

  // Remove item completely from cart
  const removeItemCompletely = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  // Get quantity of item in cart
  const getItemQuantity = (itemId: string): number => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  // Proceed to checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    // Store cart in sessionStorage
    sessionStorage.setItem("cart", JSON.stringify(cart));
    navigate("/customer/checkout");
  };

  if (!tableNumber) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pb-24">
      {/* Header */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/customer/table")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Change Table
            </Button>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Table {tableNumber}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Our Menu</h1>
          <p className="text-muted-foreground text-lg">Choose your delicious meals</p>
        </div>

        {/* Menu Items Grid */}
        {menuItems.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No menu items available at the moment</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => {
              const quantity = getItemQuantity(item.id);
              
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-smooth">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {quantity > 0 && (
                      <Badge className="absolute top-2 right-2 bg-success">
                        {quantity} in cart
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        ${item.price.toFixed(2)}
                      </span>
                      <Button onClick={() => addToCart(item)} size="sm">
                        <Plus className="mr-1 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Your Order ({cartItemsCount} items)</p>
                  <p className="text-2xl font-bold text-primary">${cartTotal.toFixed(2)}</p>
                </div>
              </div>
              <Button size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-muted p-2 rounded">
                  <span className="font-medium flex-1">{item.name}</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-bold w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addToCart(item)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeItemCompletely(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;
