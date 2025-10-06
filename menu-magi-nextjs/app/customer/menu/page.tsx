'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MenuItem, CartItem } from '@/types/database';
import { toast } from 'sonner';
import { formatIndianCurrency } from '@/lib/gst';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/i18n';
import { LanguageToggle } from '@/components/LanguageToggle';

export default function CustomerMenuPage() {
  const router = useRouter();
  const supabase = createClient();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load table number and menu items
  useEffect(() => {
    // Check table number
    const storedTable = sessionStorage.getItem('tableNumber');
    if (!storedTable) {
      router.push('/customer/table');
      return;
    }
    setTableNumber(parseInt(storedTable));

    // Get restaurant ID from sessionStorage (from QR code)
    const storedRestaurantId = sessionStorage.getItem('restaurantId');
    setRestaurantId(storedRestaurantId);

    // Load menu from Supabase
    loadMenu(storedRestaurantId);
  }, [router]);

  const loadMenu = async (ownerId: string | null) => {
    try {
      setLoading(true);
      
      // ✅ FIX: Store owner_id immediately if available from restaurantId
      if (ownerId) {
        sessionStorage.setItem('ownerId', ownerId);
        console.log('✅ Set ownerId from restaurantId:', ownerId);
      }
      
      // Build query - filter by owner_id if available
      let query = supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('name');
      
      // Filter by restaurant ID if available (from QR code)
      if (ownerId) {
        query = query.eq('owner_id', ownerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMenuItems(data || []);
      
      // ✅ FIX: Also store from menu items as fallback (if restaurantId was not in URL)
      if (!ownerId && data && data.length > 0 && data[0].owner_id) {
        sessionStorage.setItem('ownerId', data[0].owner_id);
        console.log('✅ Set ownerId from menu items:', data[0].owner_id);
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      toast.error(language === 'hi' ? 'मेनू लोड करने में विफल' : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  // Calculate cart totals
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Add item to cart
  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
    toast.success(t.itemAdded);
  };

  // Remove one from cart
  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);
      if (!existingItem) return prevCart;
      
      if (existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevCart.filter(item => item.id !== itemId);
      }
    });
  };

  // Remove item completely
  const removeItemCompletely = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  // Get quantity in cart
  const getItemQuantity = (itemId: string): number => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  // Proceed to checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error(t.emptyCart);
      return;
    }
    
    sessionStorage.setItem('cart', JSON.stringify(cart));
    router.push('/customer/checkout');
  };

  if (!tableNumber) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 pb-32">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/customer/table"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {language === 'hi' ? 'टेबल बदलें' : 'Change Table'}
            </Link>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold">
                {t.table} {tableNumber}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">{t.menu}</h1>
          <p className="text-gray-600 text-lg">
            {language === 'hi' ? 'अपने स्वादिष्ट भोजन चुनें' : 'Choose your delicious meals'}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {language === 'hi' ? 'मेनू लोड हो रहा है...' : 'Loading menu...'}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && menuItems.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">
              {language === 'hi' ? 'फिलहाल कोई मेनू आइटम उपलब्ध नहीं है' : 'No menu items available at the moment'}
            </p>
          </div>
        )}

        {/* Menu Items Grid */}
        {!loading && menuItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => {
              const quantity = getItemQuantity(item.id);
              
              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🍽️
                      </div>
                    )}
                    {quantity > 0 && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full font-semibold text-sm">
                        {quantity} {language === 'hi' ? 'कार्ट में' : 'in cart'}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description || 'Delicious dish'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{formatIndianCurrency(item.price)}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        {language === 'hi' ? 'जोड़ें' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {language === 'hi' ? 'आपका ऑर्डर' : 'Your Order'} ({cartItemsCount} {language === 'hi' ? 'आइटम' : 'items'})
                  </p>
                  <p className="text-2xl font-bold text-blue-600">₹{formatIndianCurrency(cartTotal)}</p>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                {t.checkout}
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-900 flex-1">{item.name}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-bold w-8 text-center text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeItemCompletely(item.id)}
                      className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
