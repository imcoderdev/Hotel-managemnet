/**
 * Browser Push Notifications (No External Service Needed)
 * Works on all modern browsers
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
}

export function sendLocalNotification(
  title: string,
  options?: NotificationOptions
) {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/badge.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options,
    });

    // Play notification sound
    playNotificationSound();

    // Auto-close after 5 seconds unless requireInteraction is true
    if (!options?.requireInteraction) {
      setTimeout(() => notification.close(), 5000);
    }

    // Click handler
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options?.data?.url) {
        window.location.href = options.data.url;
      }
    };

    return notification;
  }
}

export function playNotificationSound() {
  try {
    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound
    oscillator.frequency.value = 800; // Frequency in Hz
    oscillator.type = 'sine';
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    // Play
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Try to also play notification.mp3 if it exists (optional)
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Silently fail if file doesn't exist, beep already played
    });
  } catch (error) {
    console.warn('Audio playback failed:', error);
    // Fallback: Try vibration on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }
}

/**
 * Check if notifications are supported and enabled
 */
export function areNotificationsEnabled(): boolean {
  return (
    'Notification' in window && Notification.permission === 'granted'
  );
}

/**
 * Show order notification with order details
 */
export function notifyNewOrder(orderData: {
  tableNumber: number;
  total: number;
  orderId: string;
  itemCount: number;
}) {
  sendLocalNotification('🔔 New Order Received!', {
    body: `Table ${orderData.tableNumber} • ${orderData.itemCount} items • ₹${orderData.total}`,
    tag: `order-${orderData.orderId}`,
    requireInteraction: true,
    data: {
      orderId: orderData.orderId,
      url: `/owner/orders`,
    },
  });
}

/**
 * Show order status change notification
 */
export function notifyOrderStatus(
  orderId: string,
  status: string,
  tableNumber: number
) {
  const statusMessages = {
    pending: '⏳ Order Pending',
    preparing: '👨‍🍳 Preparing Your Order',
    ready: '✅ Order Ready!',
    delivered: '🎉 Order Delivered',
    cancelled: '❌ Order Cancelled',
  };

  const title = statusMessages[status as keyof typeof statusMessages] || status;

  sendLocalNotification(title, {
    body: `Table ${tableNumber} • Order #${orderId.slice(0, 8)}`,
    tag: `status-${orderId}`,
    data: {
      orderId,
      url: `/customer/confirmation/${orderId}`,
    },
  });
}
