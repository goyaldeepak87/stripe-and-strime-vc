'use client';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import UserMenu from './UserMenu';
import { RdirectUrlData } from '@/lang/RdirectUrl';
import { useSelector } from 'react-redux';

export default function NavBar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const isHost = user && user.data?.result?.user?.guestUser?.role ;
    console.log(isHost)
    const navLinks = [
        { name: 'Explore Sessions', href: RdirectUrlData.Home },
        { name: 'Team', href: '#' },
        { name: 'Projects', href: '#' },
        // { name: 'My Created Sessions', href: href: RdirectUrlData.CREATESESSION },
        ...(isHost === "host"  ? [{ name: 'My Created Sessions', href: RdirectUrlData.CREATESESSION}] : [] ),
        // { name: 'My Bookings', href: RdirectUrlData.MYBOOKINGS },
        ...(isHost == "audience" ? [{ name: 'My Bookings', href: RdirectUrlData.MYBOOKINGS }]: [] ),
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div>
            <nav className="bg-gray-800">
                <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                    <div className="relative flex h-16 items-center justify-between">
                        <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                            <button 
                                type="button" 
                                className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-none focus:ring-inset" 
                                onClick={toggleMobileMenu}
                                aria-controls="mobile-menu" 
                                aria-expanded={isMobileMenuOpen}
                            >
                                <span className="absolute -inset-0.5"></span>
                                <span className="sr-only">Open main menu</span>

                                <svg className={`${isMobileMenuOpen ? 'hidden' : 'block'} size-6`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>

                                <svg className={`${isMobileMenuOpen ? 'block' : 'hidden'} size-6`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                            <div className="flex shrink-0 items-center">
                                <img className="h-8 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" alt="Your Company" />
                            </div>
                            <div className="hidden sm:ml-6 sm:block">
                                <div className="flex space-x-4">
                                    {navLinks.map((link) => {
                                        const isActive = pathname === link.href;
                                        return (
                                            <Link 
                                                key={link.name}
                                                href={link.href} 
                                                className={`rounded-md px-3 py-2 text-sm font-medium ${
                                                    isActive 
                                                        ? 'bg-gray-900 text-white' 
                                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                }`}
                                                aria-current={isActive ? 'page' : undefined}
                                            >
                                                {link.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                            {/* Notification Button */}
                            <button
                                type="button"
                                className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none"
                            >
                                <span className="absolute -inset-1.5"></span>
                                <span className="sr-only">View notifications</span>
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                                    />
                                </svg>
                            </button>

                            {/* User Menu */}
                            <UserMenu />
                        </div>
                    </div>
                </div>

                <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`} id="mobile-menu">
                    <div className="space-y-1 px-2 pt-2 pb-3">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`block rounded-md px-3 py-2 text-base font-medium ${
                                        isActive 
                                            ? 'bg-gray-900 text-white' 
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </div>
    );
}