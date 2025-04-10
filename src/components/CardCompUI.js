'use client';
import React, { use, useState } from 'react'
import Image from 'next/image';
import GifComp from './GifComp';
// import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';
import { useSelector } from 'react-redux';
import LoginFormModel from './auth/LoginFormModel';
import { productPayment } from '@/utils/APIs';
import { useRouter } from 'next/navigation';
import { RdirectUrlData } from '@/lang/RdirectUrl';

export default function CardCompUI({ setUserLogin, ...values }) {
    const router = useRouter();
    const { isAuthenticated, user, paymentStatus } = useSelector((state) => state.auth);
    const uuId = user?.data?.result?.user?.guestUser?.uuid;
    // const makePayment = async (e) => {
    //     console.log("Make Payment", values)
    //     const cardData = {
    //         uuid: uuId,
    //         id: e.id,
    //         title: e.title,
    //         price: e.price,
    //         active: e.active,
    //         prodectId: e.prodectId,
    //     }

    //     console.log("CardData", cardData)
    //     // // values.preventDefault();
    //     // console.log("Clicked",process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, process.env.NEXT_PUBLIC_BASE_URL, values)
    //     const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    //     const response = await fetch(`http://localhost:8003/v1/user/api/checkout_sessions`, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(cardData),
    //     });

    //     const session = await response.json();
    //     console.log("Session", session)
    //     const result = await stripe.redirectToCheckout({
    //         sessionId: session.id,
    //     });
    //     console.log("Result", result)
    //     if (result.error) {
    //         console.log("Error", result.error.message);
    //     }
    // }

    const makePayment = async (e) => {
        try {
            console.log("Make Payment", values);

            const cardData = {
                uuid: uuId,
                id: e.id,
                title: e.title,
                price: e.price,
                active: e.active,
                prodectId: e.prodectId,
            };

            console.log("CardData", cardData);

            const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

            // Call the productPayment API
            const session = await productPayment(cardData);
            console.log("Session", session);

            // Redirect to Stripe Checkout
            const result = await stripe.redirectToCheckout({
                sessionId: session.id,
            });
            if (result.error) {
                console.error("Stripe Checkout Error:", result.error.message);
            }
        } catch (error) {
            console.error("Error during payment process:", error.message);
        }
    };

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
                    <p className="text-2xl font-bold mt-4">${values.price}</p>
                    <button
                        onClick={() => {
                            if (!isAuthenticated) {
                                // User not logged in, show login modal
                                setUserLogin(true);
                            } else if (paymentStatus === "paid") {
                                // User logged in and has paid, redirect to create-channel
                                router.push(RdirectUrlData.CREATECHANNEL);
                            } else {
                                // User logged in but hasn't paid, process payment
                                makePayment(values);
                            }
                        }}
                        disabled={values.active}
                        className={`mt-4 ${!values?.active ? "cursor-pointer" : "cursor-no-drop"} ${!values?.active ? "bg-orange-500" : "bg-customOrange"} hover:bg-orange-600 text-white w-full py-2 rounded-lg transition duration-300 shadow-md`}
                    >
                        {!values.active ? (
                            <>
                                {!isAuthenticated
                                    ? "Login to Continue"
                                    : paymentStatus === "paid"
                                        ? "Go to Channel"
                                        : "Add to Cart"}
                            </>
                        ) : (
                            "Not Available"
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
