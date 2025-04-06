'use client'

import GifComp from '@/components/GifComp'
import LoginForm from '@/components/LoginPage'
import { successPayment } from '@/lang'
import axios from 'axios'
import { useSearchParams, useParams } from 'next/navigation'
import React, { useEffect } from 'react'

export default function page() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id');
  
  const checkPaymentSuccess = async() =>{
    const result = await axios.get(`http://localhost:8003/v1/user/api/payment_success?session_id=${sessionId}`,)
    console.log("dtaa==>", result)
  }
  // (function () {
  //   setTimeout(() => {
  //     window.location.href = "/"
  //   }, 2000)
  // })();
  useEffect(()=>{
    checkPaymentSuccess()
  },[sessionId])
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <GifComp {...successPayment}/>
    </div>
  )
}
