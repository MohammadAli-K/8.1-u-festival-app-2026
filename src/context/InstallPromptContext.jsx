import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const InstallPromptContext = createContext(null);

export function InstallPromptProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return { outcome: 'unavailable' };
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
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
