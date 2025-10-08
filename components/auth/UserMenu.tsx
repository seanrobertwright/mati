'use client';

import { useState } from 'react';
import { createClient } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';
import { LogOut, User as UserIcon } from 'lucide-react';

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    
    await supabase.auth.signOut();
    
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <UserIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{user.email}</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">
                <div className="font-medium truncate">{user.email}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Role: {user.app_metadata?.role || 'employee'}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {loading ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

