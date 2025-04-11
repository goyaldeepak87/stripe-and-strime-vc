'use client';
import React, { useEffect } from "react";
import GifComp from "./GifComp";
import { LoginData } from "@/lang";
import { useRouter } from 'next/navigation';
import { RdirectUrlData } from "@/lang/RdirectUrl";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import LoginFormModel from "./auth/LoginFormModel";

const LoginForm = () => {
  const router = useRouter(); // Initialize the router
  const { isAuthenticated, error } = useSelector((state) => state.auth);

  // Redirect to home page if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(RdirectUrlData.Home);
    }
  }, [isAuthenticated, router]);

  // If user is already authenticated, don't render the login form
  if (isAuthenticated) {
    return null; // Return nothing while redirecting to prevent flash of login form
  }

  // Only render the login form if user is not authenticated

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0d1b2a] to-[#1b263b]">
      <div className="bg-white shadow-lg rounded-lg flex max-w-4xl w-full">
        {/* Left Section - Login Form */}
        <LoginFormModel />
        {/* Right Section - Illustration */}
        <div className="w-1/2 hidden lg:flex items-center justify-center">
          <GifComp {...LoginData} />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;