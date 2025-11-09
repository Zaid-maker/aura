"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function ServiceWorkerRegistration() {
  const { data: session } = useSession();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("[PWA] Service Worker registered:", registration);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute

          // Handle service worker updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker is available
                  console.log("[PWA] New content available!");
                  
                  // Show update notification
                  toast.info("A new version is available!", {
                    action: {
                      label: "Reload",
                      onClick: () => {
                        newWorker.postMessage({ type: "SKIP_WAITING" });
                        window.location.reload();
                      },
                    },
                    duration: 10000,
                  });
                }
              });
            }
          });

          // Request notification permission if user is logged in
          if (session?.user) {
            requestNotificationPermission(registration);
          }
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error);
        });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("[PWA] Message from SW:", event.data);
        
        if (event.data.type === "NOTIFICATION_CLICKED") {
          // Handle notification click events
          console.log("[PWA] Notification clicked:", event.data.notificationId);
        }
      });

      // Handle online/offline events
      window.addEventListener("online", () => {
        console.log("[PWA] Back online");
        toast.success("You're back online!");
        
        // Trigger background sync
        if ("serviceWorker" in navigator && "sync" in navigator.serviceWorker) {
          navigator.serviceWorker.ready.then((registration) => {
            return (registration as any).sync.register("sync-notifications");
          });
        }
      });

      window.addEventListener("offline", () => {
        console.log("[PWA] Gone offline");
        toast.warning("You're offline. Some features may be limited.");
      });
    }
  }, [session]);

  return null;
}

async function requestNotificationPermission(registration: ServiceWorkerRegistration) {
  // Check if notifications are supported
  if (!("Notification" in window)) {
    console.log("[PWA] Notifications not supported");
    return;
  }

  // Check current permission
  if (Notification.permission === "granted") {
    // Subscribe to push notifications
    await subscribeToPushNotifications(registration);
  } else if (Notification.permission !== "denied") {
    // Request permission after a delay (better UX)
    setTimeout(async () => {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("[PWA] Notification permission granted");
        await subscribeToPushNotifications(registration);
      }
    }, 5000); // Wait 5 seconds before asking
  }
}

async function subscribeToPushNotifications(registration: ServiceWorkerRegistration) {
  try {
    // Check if push is supported
    if (!("pushManager" in registration)) {
      console.log("[PWA] Push notifications not supported");
      return;
    }

    // Get existing subscription or create new one
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Subscribe to push notifications
      // Note: You'll need to generate VAPID keys for production
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!publicKey) {
        console.log("[PWA] VAPID public key not configured");
        return;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      console.log("[PWA] Push subscription created:", subscription);
    }

    // Send subscription to server
    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
      }),
    });

    console.log("[PWA] Push subscription saved to server");
  } catch (error) {
    console.error("[PWA] Failed to subscribe to push notifications:", error);
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
