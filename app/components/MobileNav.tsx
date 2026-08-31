'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const navItems = [
    { href: '/dashboard', icon: '🏠', label: 'Home' },
    { href: '/communities', icon: '👥', label: 'Communities' },
    { href: '/leagues', icon: '⚽', label: 'Leagues' },
    { href: '/cups', icon: '🏆', label: 'Cups' },
    { href: '/admin', icon: '👑', label: 'Admin' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition ${
                isActive(item.href)
                  ? 'text-green-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Spacer to prevent content from hiding under nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}