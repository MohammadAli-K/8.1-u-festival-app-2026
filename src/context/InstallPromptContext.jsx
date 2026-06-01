import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const InstallPromptContext = createContext(null);

/**
 * Early-capture store set up by the inline script in index.html. It holds any
 * `beforeinstallprompt` event that fired before React mounted.
 * @returns {{ prompt: any, listeners: Array<(prompt: any) => void> } | null}
 */
function getInstallStore() {
  if (typeof window === 'undefined') return null;
  return window.__pwaInstall ?? null;
}

export function InstallPromptProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(() => getInstallStore()?.prompt ?? null);

  useEffect(() => {
    const store = getInstallStore();
    if (!store) return undefined;
    // Sync with anything captured before this effect ran.
    setDeferredPrompt(store.prompt);
    const listener = (prompt) => setDeferredPrompt(prompt);
    store.listeners.push(listener);
    return () => {
      const idx = store.listeners.indexOf(listener);
      if (idx !== -1) store.listeners.splice(idx, 1);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const store = getInstallStore();
    const prompt = store?.prompt ?? deferredPrompt;
    if (!prompt) return { outcome: 'unavailable' };
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (store) store.prompt = null;
    setDeferredPrompt(null);
    return choice;
  }, [deferredPrompt]);

  const value = { deferredPrompt, promptInstall };

  return (
    <InstallPromptContext.Provider value={value}>{children}</InstallPromptContext.Provider>
  );
}

export function useInstallPrompt() {
  const ctx = useContext(InstallPromptContext);
  if (!ctx) throw new Error('useInstallPrompt must be used within InstallPromptProvider');
  return ctx;
}
