'use client'

import GifComp from '@/components/GifComp'
import LoginForm from '@/components/LoginPage'
import { successPayment } from '@/lang'
import React from 'react'

export default function page() {
  (function () {
    setTimeout(() => {
      window.location.href = "/"
    }, 2000)
  })();
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <GifComp {...successPayment}/>
    </div>
  )
}
