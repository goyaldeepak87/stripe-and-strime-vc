'use client'
import React from 'react';
import Lottie from 'react-lottie';
import animationData from '@/components/images/Animation.json'; // Import your JSON animation file
 // Replace with the actual path to your JSON animation file

export default function GifComp({animation}) {
console.log("animation",animation)
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animation?.img || animationData, // Use the animation prop or fallback to a default animation
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
        },
    };

    return (
        <div>
            <Lottie
                options={defaultOptions}
                height={animation?.height || 120}
                width={animation?.width || 120}
                // isStopped={isStopped}
                // isPaused={isPaused}
            />
        </div>
    );
}