'use client';
import React from "react";
import GifComp from "./GifComp";
import { LoginData, SignupData } from "@/lang";
import { useRouter } from 'next/navigation'
import Socialicon from "./commanComp/Socialicon";
import { RdirectUrlData } from "@/lang/RdirectUrl";
import InputField from "./commanComp/InputField";
import { Formik, Form } from 'formik';
import { validateLoginForm } from "@/utils/validationSchema";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "@/reudux/slice/authSlice";


const LoginForm = () => {
  const router = useRouter(); // Initialize the router
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
console.log("isAuthenticated-->", isAuthenticated)
  const handleLogin = (event) => {
    event.preventDefault();  // Prevent page reload on form submission
    router.push(RdirectUrlData.Home); // Redirect to the new page (e.g., homepage after login)
  };
  if(isAuthenticated){
    router.push(RdirectUrlData.Home);
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0d1b2a] to-[#1b263b]">
      <div className="bg-white shadow-lg rounded-lg flex max-w-4xl w-full">
        {/* Left Section - Login Form */}
        <div className="w-1/2 p-10">
          <h2 className="text-2xl font-bold text-gray-900">Login</h2>
          <p className="text-gray-500">
            Don't have an account?{" "}
            <a href="#" className="text-orange-600 font-semibold">
              Sign Up
            </a>
          </p>

          <Formik
            initialValues={{ email: '', password: '' }}
            validate={validateLoginForm}
            onSubmit={(values) => {
              dispatch(loginSuccess(values))
              // alert(JSON.stringify(values, null, 2));
            }}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              // isSubmitting,
              /* and other goodies */
            }) => (
              <Form className="mt-6">
                {/* {JSON.stringify(values)} */}
                <div>
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="mt-4">
                  <InputField
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Enter 6 characters or more"
                  />
                  <a href="#" className="text-sm text-orange-600 float-right mt-1">
                    Forgot Password?
                  </a>
                </div>

                <div className="flex items-center mt-4">
                  <input type="checkbox" className="mr-2" />
                  <label className="text-gray-700">Remember me</label>
                </div>

                <button className="w-full mt-6 mt-4 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300 shadow-md cursor-pointer"
                  type="submit"
                >
                  LOGIN
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center text-gray-500">or login with</div>

          <div className="flex justify-center mt-4 space-x-4">
            {SignupData.map((item) => (
              <div key={item.id}>
                <Socialicon {...item} />
              </div>
            ))}

          </div>
        </div>

        {/* Right Section - Illustration */}
        <div className="w-1/2 hidden lg:flex items-center justify-center">
          <GifComp {...LoginData} />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
