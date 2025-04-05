
// NEXT_PUBLIC_BASE_URL = http://localhost:8003/v1
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51R9ONz2aFywf1JUEg7uaP6ouz6TvPP3ZU2JLeXkOX1TFTIipoHku1G0wbaUZFRJW3qGLqRkAkgVuABSt06tarc4J00ndfTXt4C
// NEXT_PUBLIC_STRIPE_SECRET_KEY = sk_test_51R9ONz2aFywf1JUEgc6yDNswm4pzy2rROt0H55lqmoWMmjpYynAhFOi4fUemOKOYo7KG5TukTXucsPuRFFUDg9au0033Vbf48w

"use client"

import UserList from '@/components/commanComp/UserList'
import UserProfileModel from '@/components/commanComp/UserProfileModel'
import NaveBar from '@/components/NaveBar'
import axios from 'axios'
import React, { useEffect } from 'react'

export default function page() {

 
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8003/v1/user/api/profile', {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log("Response", response.data); // Log the response data
      return response.data; // Return the data for further use
    } catch (error) {
      console.error("Error fetching user profile:", error.message);
      // Handle the error appropriately (e.g., show a toast notification or set an error state)
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userProfile = await fetchUserProfile();
      console.log("User Profile", userProfile); // Log the fetched user profile
    };
    fetchData();
  }, []); // Empty dependency array to run once on component mount

  return (
    <div>
      <NaveBar />
      <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
        <div className='text-2xl font-bold mt-10'>
          Pocket Live Calls User
        </div>
        <div className='mt-10'>
          <div className="flex h-[calc(100vh-176px)]">
            <div className='w-1/3 h-full overflow-y-auto pb-6 pl-6 border border-gray-500'>
              <UserList />
              <UserList />
              <UserList />
              <UserList />
              <UserList />
              <UserList />
              <UserList />
            </div>
            <div className='w-1/2 ml-10' style={{ width: "63.5%" }}>
              <UserProfileModel />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
