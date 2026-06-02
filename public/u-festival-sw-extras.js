/**
 * U Festival PWA — extra service worker handlers (imported via Workbox generateSW).
 * Push: JSON payload { title, body } (or text JSON). Demo: postMessage from client
 * (browsers cannot synthesize PushEvent without a server).
 */
function showFromPayload(data) {
  const title = (data && data.title) || '❤️U Festival';
  const body = (data && data.body) || '';
  return self.registration.showNotification(title, {
    body,
    icon: '/icons/logo-white-192.webp',
    badge: '/icons/logo-white-192.webp',
  });
}

self.addEventListener('push', (event) => {
  let data = {};
  try {
    if (event.data) {
      try {
        data = event.data.json();
      } catch {
        const text = event.data.text();
        if (text) data = JSON.parse(text);
      }
    }
  } catch {
    data = {};
  }
  event.waitUntil(showFromPayload(data));
});

self.addEventListener('message', (event) => {
  const d = event.data;
  if (!d || d.type !== 'U_FESTIVAL_DEMO_NOTIFY') return;
  event.waitUntil(showFromPayload({ title: d.title, body: d.body }));
});
