'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { registry } from '@/lib/safety-framework';

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get all modules with navigation
  const modulesWithNav = registry.getModulesWithNavigation();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-gray-900 text-white
          transform transition-transform duration-200 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/dashboard" className="text-xl font-bold hover:text-gray-300">
            Safety Dashboard
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {/* Home link */}
            <li>
              <Link
                href="/dashboard"
                className={`
                  block px-4 py-2 rounded-md transition-colors
                  ${
                    pathname === '/dashboard'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                Home
              </Link>
            </li>

            {/* Module navigation items */}
            {modulesWithNav.map((module) =>
              module.navigation?.map((navItem, idx) => {
                const fullHref = `/dashboard${navItem.href}`;
                const isActive = pathname.startsWith(fullHref);

                return (
                  <li key={`${module.id}-${idx}`}>
                    <Link
                      href={fullHref}
                      className={`
                        flex items-center gap-3 px-4 py-2 rounded-md transition-colors
                        ${
                          isActive
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }
                      `}
                    >
                      {navItem.icon && <navItem.icon />}
                      <span>{navItem.label}</span>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 text-sm text-gray-400">
          <p>{registry.getModuleCount()} modules loaded</p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
