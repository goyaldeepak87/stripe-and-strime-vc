'use client'

import React from 'react'

export default function Socialicon(props) {
    return (
        <>
            <button className="flex items-center px-4 py-2 border rounded-lg cursor-no-drop">
                <img
                    src={props?.icon}
                    alt={props?.label}
                    className="w-5 h-5 mr-2"
                />
                {props?.label}
            </button>
        </>
    )
}
