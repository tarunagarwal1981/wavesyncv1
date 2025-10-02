'use client';

import Link from 'next/link';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { getCurrentUserWithProfile } from '@/lib/auth/session';

interface NavbarProps {
  user?: any;
  profile?: any;
}

export function Navbar({ user, profile }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/dashboard">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  WaveSync
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href="/dashboard"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/assignments"
                className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Assignments
              </Link>
              <Link
                href="/dashboard/certificates"
                className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Certificates
              </Link>
              <Link
                href="/dashboard/tickets"
                className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Travel
              </Link>
              <Link
                href="/dashboard/documents"
                className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Documents
              </Link>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden md:flex md:items-center md:space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.rank || 'Seafarer'}
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.employee_id || user?.email}
                </p>
              </div>
              
              {/* Avatar */}
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {(profile?.rank || profile?.full_name || user?.email || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard/profile"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Profile
                </Link>
                <LogoutButton variant="secondary" />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="bg-white p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/dashboard"
            className="text-gray-900 block px-3 py-2 text-base font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/assignments"
            className="text-gray-500 block px-3 py-2 text-base font-medium"
          >
            Assignments
          </Link>
          <Link
            href="/dashboard/certificates"
            className="text-gray-500 block px-3 py-2 text-base font-medium"
          >
            Certificates
          </Link>
          <Link
            href="/dashboard/tickets"
            className="text-gray-500 block px-3 py-2 text-base font-medium"
          >
            Travel
          </Link>
          <Link
            href="/dashboard/documents"
            className="text-gray-500 block px-3 py-2 text-base font-medium"
          >
            Documents
          </Link>
          
          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex items-center justify-between px-3 py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {profile?.rank || 'Seafarer'}
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.employee_id || user?.email}
                </p>
              </div>
              <LogoutButton variant="danger" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
