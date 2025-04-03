'use client';
import React from 'react'
import Image from 'next/image';
import GifComp from './GifComp';
// import { Button } from '@/components/ui/button';

export default function CardCompUI(values) {
    console.log("CardCompUI",values)
    return (
        <div>
            <div className="flex items-center justify-center min-h bg-orange-200">
                <div className="relative w-64 p-6 bg-white rounded-2xl shadow-lg text-center">
                    <div className= {`absolute -top-${values?.topShift} left-${values?.leftShift} transform -translate-x-1/2 w-32 h-20`}
                    style={{
                        top: `-${values?.topShiftIline}px`,
                        left: `${values?.lftShiftIline}px`,
                      }}
                    >
                        <GifComp animation={values.animation}/>
                    </div>
                    <h2 className="mt-12 text-lg font-semibold">Product Name</h2>
                    <p className="text-gray-500 text-sm mt-2">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tenetur doloremque adipisci quaerat.
                    </p>
                    <p className="text-2xl font-bold mt-4">$12</p>
                    {/* <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white w-full py-2 rounded-lg">
          Add to Cart
        </Button> */}
                    <button
                        //   onClick={onClick}
                        className="mt-4 bg-orange-500 hover:bg-orange-600 text-white w-full py-2 rounded-lg transition duration-300 shadow-md"
                    >
                        {/* {children} */}Add to Cart
                    </button>
                </div>
            </div>
        </div>
    )
}
