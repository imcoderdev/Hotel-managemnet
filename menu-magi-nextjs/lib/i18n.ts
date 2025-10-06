/**
 * Multi-language support for India
 * English + Hindi
 */

export const translations = {
  en: {
    // Navigation
    menu: 'Menu',
    cart: 'Cart',
    orders: 'Orders',
    dashboard: 'Dashboard',
    logout: 'Logout',

    // Actions
    order: 'Order Now',
    addToCart: 'Add to Cart',
    checkout: 'Checkout',
    placeOrder: 'Place Order',
    confirm: 'Confirm',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    back: 'Back',

    // Labels
    table: 'Table',
    tableNumber: 'Table Number',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Tax',
    gst: 'GST',
    cgst: 'CGST',
    sgst: 'SGST',
    price: 'Price',
    quantity: 'Quantity',
    category: 'Category',
    name: 'Name',
    description: 'Description',
    image: 'Image',

    // Status
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    delivered: 'Delivered',
    cancelled: 'Cancelled',

    // Messages
    orderPlaced: 'Order placed successfully!',
    orderCancelled: 'Order cancelled',
    itemAdded: 'Item added to cart',
    emptyCart: 'Your cart is empty',
    selectTable: 'Please select a table',
    thankYou: 'Thank you for your order!',

    // Menu
    available: 'Available',
    unavailable: 'Unavailable',
    veg: 'Veg',
    nonVeg: 'Non-Veg',

    // Owner Dashboard
    menuItems: 'Menu Items',
    activeOrders: 'Active Orders',
    todayRevenue: 'Today\'s Revenue',
    addMenuItem: 'Add Menu Item',
    editMenuItem: 'Edit Menu Item',
    deleteMenuItem: 'Delete Menu Item',
    qrCode: 'QR Code',
    downloadQR: 'Download QR Code',

    // Customer
    scanQR: 'Scan QR Code',
    viewMenu: 'View Menu',
    trackOrder: 'Track Order',
    orderStatus: 'Order Status',
  },
  hi: {
    // Navigation
    menu: 'मेनू',
    cart: 'कार्ट',
    orders: 'ऑर्डर',
    dashboard: 'डैशबोर्ड',
    logout: 'लॉगआउट',

    // Actions
    order: 'अभी ऑर्डर करें',
    addToCart: 'कार्ट में डालें',
    checkout: 'चेकआउट',
    placeOrder: 'ऑर्डर करें',
    confirm: 'पुष्टि करें',
    cancel: 'रद्द करें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    save: 'सहेजें',
    back: 'वापस',

    // Labels
    table: 'टेबल',
    tableNumber: 'टेबल नंबर',
    total: 'कुल',
    subtotal: 'उपयोग',
    tax: 'कर',
    gst: 'जीएसटी',
    cgst: 'सीजीएसटी',
    sgst: 'एसजीएसटी',
    price: 'कीमत',
    quantity: 'मात्रा',
    category: 'श्रेणी',
    name: 'नाम',
    description: 'विवरण',
    image: 'चित्र',

    // Status
    pending: 'लंबित',
    preparing: 'तैयार हो रहा है',
    ready: 'तैयार',
    delivered: 'डिलीवर किया गया',
    cancelled: 'रद्द',

    // Messages
    orderPlaced: 'ऑर्डर सफलतापूर्वक दिया गया!',
    orderCancelled: 'ऑर्डर रद्द कर दिया गया',
    itemAdded: 'आइटम कार्ट में जोड़ा गया',
    emptyCart: 'आपका कार्ट खाली है',
    selectTable: 'कृपया एक टेबल चुनें',
    thankYou: 'आपके ऑर्डर के लिए धन्यवाद!',

    // Menu
    available: 'उपलब्ध',
    unavailable: 'अनुपलब्ध',
    veg: 'शाकाहारी',
    nonVeg: 'मांसाहारी',

    // Owner Dashboard
    menuItems: 'मेनू आइटम',
    activeOrders: 'सक्रिय ऑर्डर',
    todayRevenue: 'आज का राजस्व',
    addMenuItem: 'मेनू आइटम जोड़ें',
    editMenuItem: 'मेनू आइटम संपादित करें',
    deleteMenuItem: 'मेनू आइटम हटाएं',
    qrCode: 'क्यूआर कोड',
    downloadQR: 'क्यूआर कोड डाउनलोड करें',

    // Customer
    scanQR: 'क्यूआर कोड स्कैन करें',
    viewMenu: 'मेनू देखें',
    trackOrder: 'ऑर्डर ट्रैक करें',
    orderStatus: 'ऑर्डर की स्थिति',
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

/**
 * Get translation for a key in selected language
 */
export function translate(
  key: TranslationKey,
  language: Language = 'en'
): string {
  return translations[language][key] || translations.en[key] || key;
}

/**
 * Hook for using translations in components
 */
export function useTranslation(defaultLanguage: Language = 'en') {
  const [language, setLanguage] = React.useState<Language>(defaultLanguage);

  const t = (key: TranslationKey): string => {
    return translate(key, language);
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  return { t, language, setLanguage, toggleLanguage };
}

// For Server Components
export function getTranslation(language: Language = 'en') {
  return (key: TranslationKey): string => {
    return translate(key, language);
  };
}

import React from 'react';
