'use client'
import { useState } from "react";
import LoginFormModel from "@/components/auth/LoginFormModel";
import CardCompUI from "@/components/CardCompUI";
import LoginForm from "@/components/LoginPage";
import NaveBar from "@/components/NaveBar";
import { animations } from "@/lang";

export default function Home() {
  const [userLogin, setUserLogin] = useState(false)
  return (
    <>
      <NaveBar />
      <div className="flex items-center justify-evenly min-h bg-orange-200">
        {animations.map((values, index) => (
          <CardCompUI setUserLogin = {setUserLogin} key={index} {...values} /> // Replace with the actual path to your JSON animation file
        ))}
      </div>
      {userLogin && (
        <div className="absolute w-full top-0">
          <div className="flex min-h-screen items-center justify-center customBlack">
            <div className="bg-white shadow-lg rounded-lg flex max-w-4xl w-full" style={{ width: "34%" }}>
              {/* Left Section - Login Form */}
              <LoginFormModel setUserLogin ={setUserLogin} with="w-full"/>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
