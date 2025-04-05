'use client';
import React, { use, useState } from 'react'
import Image from 'next/image';
import GifComp from './GifComp';
// import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';
import { useSelector } from 'react-redux';
import LoginFormModel from './auth/LoginFormModel';

export default function CardCompUI({setUserLogin, ...values}) {
    const { isAuthenticated } = useSelector((state) => state.auth);
    

    const makePayment = async (e) => {
        console.log("Make Payment", values)
        const cardData = {
            id: e.id,
            title: e.title,
            price: e.price,
            active: e.active,
            prodectId: e.prodectId,
        }

        console.log("CardData", cardData)
        // // values.preventDefault();
        // console.log("Clicked",process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, process.env.NEXT_PUBLIC_BASE_URL, values)
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        const response = await fetch(`http://localhost:8003/v1/user/api/checkout_sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cardData),
        });

        const session = await response.json();
        console.log("Session", session)
        const result = await stripe.redirectToCheckout({
            sessionId: session.id,
        });
        console.log("Result", result)
        if (result.error) {
            console.log("Error", result.error.message);
        }
    }

    return (
        <div>
            <div className="flex items-center justify-center min-h bg-orange-200">
                <div className="relative w-73 p-6 bg-white rounded-2xl shadow-lg text-center">
                    <div className={`absolute -top-${values?.topShift} left-${values?.leftShift} transform -translate-x-1/2 w-32 h-20`}
                        style={{
                            top: `-${values?.topShiftIline}px`,
                            left: `${values?.lftShiftIline}px`,
                        }}
                    >
                        <GifComp animation={values.animation} />
                    </div>
                    <h2 className="mt-12 text-lg font-semibold">{values.title}</h2>
                    <p className="text-gray-500 text-sm mt-2">
                        {values.text}
                    </p>
                    <p className="text-2xl font-bold mt-4">{values.price}</p>
                    <button
                        onClick={() =>
                        (isAuthenticated ? makePayment(values) : setUserLogin(true)
                        )}
                        disabled={values.active}
                        className={`mt-4 ${!values.active ? "cursor-pointer" : "cursor-no-drop"} ${!values.active ? "bg-orange-500" : "bg-customOrange"} hover:bg-orange-600 text-white w-full py-2 rounded-lg transition duration-300 shadow-md`}
                    >
                        {!values.active ? "Add to Cart" : "Not Available"}
                    </button>
                </div>
            </div>
        </div>
    )
}
