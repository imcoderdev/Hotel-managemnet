'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { requestNotificationPermission, notifyNewOrder, playNotificationSound } from '@/lib/notifications';

interface Order {
  id: string;
  table_number: number;
  total: number;
  status: string;
}

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  useEffect(() => {
    // Request notification permission
    requestNotificationPermission().then((granted) => {
      if (granted) {
        console.log('✅ Notifications enabled globally');
      }
    });

    // Set up realtime subscription for new orders
    const channel = supabase
      .channel('global-orders-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('🔔 New order notification received:', payload);
          const newOrder = payload.new as Order;
          
          // Only notify for waiting orders
          if (newOrder.status === 'waiting') {
            // Play sound
            playNotificationSound();

            // Show browser notification
            notifyNewOrder({
              tableNumber: newOrder.table_number,
              total: newOrder.total,
              orderId: newOrder.id,
              itemCount: 1
            });

            // Show toast notification
            toast.success(`🔔 New Order from Table ${newOrder.table_number}!`, {
              duration: 5000,
              action: {
                label: 'View Orders',
                onClick: () => {
                  window.location.href = '/owner/orders';
                }
              }
            });
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      {children}
    </>
  );
}
