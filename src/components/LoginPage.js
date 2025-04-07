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

  // Redirect to the home page if the user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Login successful! Redirecting...");
      router.push(RdirectUrlData.Home);// Replace "/home" with your desired route
    }
  }, [isAuthenticated, router]);

  // Show error message if login fails
  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

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