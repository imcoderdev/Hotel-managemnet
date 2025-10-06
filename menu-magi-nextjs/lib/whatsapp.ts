/**
 * WhatsApp Integration for India
 * Free notification channel (450M+ users in India)
 */

/**
 * Format phone number for WhatsApp (Indian format)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Add +91 prefix if not present
  if (!cleaned.startsWith('91')) {
    cleaned = '91' + cleaned;
  }

  return cleaned;
}

/**
 * Generate WhatsApp share URL
 */
export function getWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

/**
 * Generate order confirmation message for WhatsApp
 */
export function getOrderConfirmationMessage(order: {
  orderId: string;
  restaurantName: string;
  tableNumber: number;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}): string {
  const itemsList = order.items
    .map((item) => `• ${item.name} x${item.quantity} - ₹${item.price}`)
    .join('\n');

  return `
🍽️ *Order Confirmed!*

📍 Restaurant: ${order.restaurantName}
🪑 Table: ${order.tableNumber}
🆔 Order ID: ${order.orderId}

📋 *Items:*
${itemsList}

💰 *Total: ₹${order.total}*

✅ Your order is being prepared.
⏱️ Estimated time: 15-20 minutes

Thank you for your order! 🙏
`.trim();
}

/**
 * Generate new order alert for restaurant owner
 */
export function getNewOrderAlertMessage(order: {
  orderId: string;
  tableNumber: number;
  total: number;
  itemCount: number;
  customerName?: string;
}): string {
  return `
🔔 *New Order Alert!*

🆔 Order: ${order.orderId.slice(0, 8)}
🪑 Table: ${order.tableNumber}
👤 Customer: ${order.customerName || 'Guest'}
📦 Items: ${order.itemCount}
💰 Amount: ₹${order.total}

⚡ Check your dashboard for details.
`.trim();
}

/**
 * Generate order ready notification
 */
export function getOrderReadyMessage(order: {
  orderId: string;
  tableNumber: number;
}): string {
  return `
✅ *Order Ready!*

🆔 Order: ${order.orderId.slice(0, 8)}
🪑 Table: ${order.tableNumber}

Your order is ready for pickup! 🎉
`.trim();
}

/**
 * Generate QR code sharing message
 */
export function getQRShareMessage(restaurantName: string, qrUrl: string): string {
  return `
🍽️ *${restaurantName}*

📱 Scan QR code to view menu and order!
🔗 ${qrUrl}

✨ No app needed - Order directly from your phone!
🚀 Fast, Easy, Contactless
`.trim();
}

/**
 * Open WhatsApp in browser/app
 */
export function openWhatsApp(phone: string, message: string): void {
  const url = getWhatsAppUrl(phone, message);
  window.open(url, '_blank');
}

/**
 * Share on WhatsApp (using Web Share API if available)
 */
export async function shareOnWhatsApp(
  message: string,
  phone?: string
): Promise<boolean> {
  try {
    // Try Web Share API first (mobile)
    if (navigator.share) {
      await navigator.share({
        text: message,
      });
      return true;
    }

    // Fallback to WhatsApp URL
    if (phone) {
      openWhatsApp(phone, message);
      return true;
    }

    // Generic WhatsApp share (no phone number)
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    return true;
  } catch (error) {
    console.error('WhatsApp share failed:', error);
    return false;
  }
}

/**
 * Validate Indian phone number
 */
export function isValidIndianPhone(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Indian phone numbers are 10 digits (or 12 with +91)
  if (cleaned.length === 10) {
    return /^[6-9]\d{9}$/.test(cleaned); // Must start with 6-9
  }

  if (cleaned.length === 12) {
    return /^91[6-9]\d{9}$/.test(cleaned); // +91 followed by valid number
  }

  return false;
}
