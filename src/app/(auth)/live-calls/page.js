
import UserList from '@/components/commanComp/UserList'
import UserProfileModel from '@/components/commanComp/UserProfileModel'
import NaveBar from '@/components/NaveBar'
import React from 'react'

export default function page() {
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
