'use client'

import GifComp from '@/components/GifComp'
import LoginForm from '@/components/LoginPage'
import { successPayment } from '@/lang'
import { updatePaymentStatus } from '@/reudux/slice/authSlice'
import { getpaymentSuccess } from '@/utils/APIs'
import axios from 'axios'
import { useSearchParams, useParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export default function page() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id');
  const dispatch = useDispatch();
  const paymentStatus = useSelector((state) => state.auth.paymentStatus);
  
  (function () {
    setTimeout(() => {
      window.location.href = "/"
    }, 2000)
  })();

  const checkPaymentSuccess = async () => {
    const result = await getpaymentSuccess({ sessionId })
      .then((result) => {
        console.log("sessionId==>", result?.statusCode)
        if (result?.statusCode === 200) {
          if (result?.data?.result?.payment_status === "completed") {
            dispatch(updatePaymentStatus("paid"));
          }
        }
        // console.log("dtaa==>", result)
        // console.log("User Profile:", response.data.result);
      })
      .catch((error) => {
        // console.error("Error fetching user profile:", error);
      });
  }
  useEffect(() => {
    checkPaymentSuccess()
  }, [sessionId])
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <GifComp {...successPayment} />
    </div>
  )
}
