// Custom Service Worker with Push Notification Support
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference lib="webworker" />

// Type assertions for service worker global scope
const sw = self as unknown as ServiceWorkerGlobalScope & {
  __WB_DISABLE_DEV_LOGS: boolean;
};

// Disable development logs in production
sw.__WB_DISABLE_DEV_LOGS = true;

// Handle push notifications
sw.addEventListener("push", (event) => {
  console.log("[SW] Push notification received", event);

  if (!event.data) {
    console.log("[SW] Push event but no data");
    return;
  }

  const data = event.data.json();
  const title = data.title || "Aura";
  const options: NotificationOptions = {
    body: data.body || data.message || "You have a new notification",
    icon: data.icon || "/icons/icon-192x192.svg",
    badge: "/icons/icon-192x192.svg",
    tag: data.tag || "aura-notification",
    data: {
      url: data.url || "/",
      notificationId: data.notificationId,
      type: data.type,
    },
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    sw.registration.showNotification(title, options)
  );
});

// Handle notification clicks
sw.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked", event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    sw.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (sw.clients.openWindow) {
          return sw.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
sw.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed", event);
  
  // Track notification dismissal if needed
  const data = event.notification.data;
  if (data?.notificationId) {
    // Could send analytics or mark as dismissed
    console.log("[SW] Notification dismissed:", data.notificationId);
  }
});

// Background sync for offline notifications
sw.addEventListener("sync", (event) => {
  console.log("[SW] Background sync", (event as any).tag);

  if ((event as any).tag === "sync-notifications") {
    (event as any).waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  try {
    // Fetch pending notifications when back online
    const response = await fetch("/api/notifications?unread=true");
    if (response.ok) {
      const data = await response.json();
      console.log("[SW] Synced notifications:", data);
    }
  } catch (error) {
    console.error("[SW] Failed to sync notifications:", error);
  }
}

// Handle messages from the client
sw.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    sw.skipWaiting();
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: "1.0.0" });
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Install event
sw.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker");
  sw.skipWaiting();
});

// Activate event
sw.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker");
  event.waitUntil(sw.clients.claim());
});

console.log("[SW] Service Worker loaded");
