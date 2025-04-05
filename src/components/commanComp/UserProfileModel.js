import React from 'react'
import GifComp from '../GifComp'
import { VideocallData } from '@/lang'

export default function UserProfileModel() {
    return (
        <>
            <div className='flex items-center'>
                <img
                    className="h-30 w-30 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                />
                <div className='ml-8 flex items-center justify-between w-full'>
                    <div>
                        <div className='text-2xl font-bold mt-2'>Guest User</div>
                        <div className='text-sm text-gray-500'>Phone - +1 234 567 890</div>
                        <div className='text-sm text-gray-500'>E-mail - guestuser@gmail.com</div>
                        <div className='text-sm text-gray-500'>Adress - 123 Main Street, Springfield, IL 62704, USA</div>
                    </div>
                    <div className='cursor-pointer'>
                        <GifComp {...VideocallData} />
                    </div>
                </div>

            </div>
            <div>
                <div className='text-2xl font-bold mt-6 mt-5'>Creating My Own Path</div>
                Every step you take, no matter how small, brings you closer to your goals. Progress isn't always loud or obvious, but every bit of effort matters. Keep showing up, even when it’s hard. Stay consistent, trust your journey, and believe in your ability to grow. You don’t have to be perfect—just be committed. Success doesn’t come overnight, but it does come to those who keep moving forward. Don’t compare your path to others; your journey is unique. Focus on growth, stay grounded, and never stop believing that you're capable of amazing things. You’ve got this—keep going
            </div>
        </>
    )
}
