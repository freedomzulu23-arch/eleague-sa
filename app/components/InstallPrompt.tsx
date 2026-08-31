'use client';

import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed the prompt before
    if (localStorage.getItem('pwa-prompt-dismissed') === 'true') {
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app was installed
    const installedHandler = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
        setShowPrompt(false);
      } else {
        console.log('User dismissed the install prompt');
        // Remember that user dismissed
        localStorage.setItem('pwa-prompt-dismissed', 'true');
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Install error:', error);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:bottom-24 md:max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-5 z-50 shadow-2xl">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
          ⚽
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm">Install eLeague SA</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Install the app for a faster, offline experience.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}