"use client"

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export default function page() {
  const router = useRouter('')
  const [roomId, setRoomId] = useState("")
  return (
    <div>
      <input type="text" placeholder='enter room id' value={roomId} onChange={(e)=>setRoomId(e.target.value)}/>
      <button type='submit' onClick={()=>router.push(`/room/${roomId}?room=audience`)}>join</button>
    </div>
  )
}
