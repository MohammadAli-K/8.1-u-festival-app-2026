import { registerSW } from 'virtual:pwa-register';

/**
 * Registers the Vite-generated Workbox service worker (production / preview).
 */
export function registerPwa() {
  registerSW({
    immediate: true,
    onRegistered(registration) {
      if (import.meta.env.DEV && registration) {
        // eslint-disable-next-line no-console
        console.debug('[PWA] Service worker registered', registration.scope);
      }
    },
    onRegisterError(error) {
      // eslint-disable-next-line no-console
      console.error('[PWA] Service worker registration failed', error);
    },
  });
}
