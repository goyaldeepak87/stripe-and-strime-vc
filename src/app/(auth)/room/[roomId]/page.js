"use client"

import React, { useEffect, useState, useRef } from 'react';
const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt");
import { useSearchParams, useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomID = params.roomId;
  const role_str = searchParams.get('role') || 'Host';
  const containerRef = useRef(null);

  console.log("roomId", role_str);

  const appID = 1706485646;
  const serverSecret = "9f1949ad6a73b8f90c9d85a995b284f0";
  console.log("sdasd", appID, serverSecret);

  const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID || "", Date.now().toString(), "deepak");

  const role =
    role_str === 'Host'
      ? ZegoUIKitPrebuilt.Host
      : role_str === 'Cohost'
        ? ZegoUIKitPrebuilt.Cohost
        : ZegoUIKitPrebuilt.Audience;

  const sharedLinks = [];
  if (role === ZegoUIKitPrebuilt.Host || role === ZegoUIKitPrebuilt.Cohost) {
    // zp.startCamera();
    sharedLinks.push({
      name: 'Join as co-host',
      url: window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomID=' + roomID + '&role=Cohost',
    });
  }
  sharedLinks.push({
    name: 'Join as audience',
    url: window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomID=' + roomID + '&role=Audience',
  });

  let myMeeting = async (element) => {
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    // start the call
    console.log("role", role)
    zp.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.LiveStreaming,
        config: {
          // role:'Host'
          role
        },
      },
      sharedLinks,
    });
  };

  useEffect(() => {
    // Ensure that the roomID is available before joining
    if (!roomID) {
      return;
    }
    if(containerRef.current){
      myMeeting(containerRef.current);
    }
  }, [roomID]);  // Only re-run when roomID changes

  return (
    <div ref={containerRef}>
      {/* Room content will load here once Zego SDK is initialized */}
    </div>
  );
}
