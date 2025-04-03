'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'
import { RdirectUrlData } from '@/lang/RdirectUrl'

export default function UserMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter(); // Initialize the router

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleSignOut = () => {
        router.push(RdirectUrlData.LOGIN); // Redirect to the login page
    };

    return (
        <div className="relative ml-3">
            <button
                type="button"
                className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none"
                id="user-menu-button"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                onClick={toggleMenu}
            >
                <span className="sr-only">Open user menu</span>
                <img
                    className="h-8 w-8 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 cursor-pointer"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    onClick={() => {
                        handleSignOut();
                        closeMenu();
                    }}
                >
                    <button
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        id="user-menu-item-2"
                    >
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
}
