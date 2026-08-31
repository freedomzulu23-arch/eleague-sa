'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileMenuProps {
  onLogout?: () => void;
}

export default function MobileMenu({ onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/communities', label: 'Communities', icon: '👥' },
    { href: '/create-community', label: 'Create Community', icon: '➕' },
    { href: '/create-league', label: 'Create League', icon: '⚽' },
    { href: '/cups', label: 'Cups', icon: '🏆' },
    { href: '/cups/create', label: 'Create Cup', icon: '➕' },
    { href: '/admin', label: 'Admin Dashboard', icon: '👑' },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    if (onLogout) onLogout();
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg hover:bg-zinc-800 transition"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span className={`block h-0.5 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-0.5 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="fixed top-16 right-4 left-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 z-50 md:hidden shadow-2xl">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive(item.href)
                      ? 'bg-green-900/30 text-green-400'
                      : 'hover:bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/30 transition"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}