import React from 'react'
import { Phone } from 'react-feather'

export default function UserList(props) {
    const userName  = props?.email?.split("@")[0].charAt(0).toUpperCase() + props.email.split("@")[0].slice(1) || "Guest User";
    console.log("UserList", userName);
    return (
        <div className="flex pl-6 items-center pt-[8px] pb-[8px]" style={{ borderBottom: "1px solid oklch(70.5% .213 47.604)" }}>
            <img
                className="h-15 w-15 rounded-full"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
            />
            <div className='flex w-full justify-between items-center lg:px-6'>
                <div className='flex flex-col justify-center'>
                    <h1 className='text-1xl font-semibold'>{userName}</h1>
                    <p className='text-gray-500'>live call.</p>
                </div>
                <div className='flex items-center'>
                    <Phone className='text-gray-500' size={20} />
                </div>
            </div>
        </div>
    )
}
