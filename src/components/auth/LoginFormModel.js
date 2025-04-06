import React from 'react'
import { LoaderData, SignupData } from "@/lang";
import Socialicon from "@/components/commanComp/Socialicon";
import InputField from "@/components/commanComp/InputField";
import { Formik, Form } from 'formik';
import { validateLoginForm } from "@/utils/validationSchema";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/reudux/slice/authSlice";
import GifComp from '../GifComp';

export default function LoginFormModel(props) {
      const dispatch = useDispatch();
      const { loading, isAuthenticated } = useSelector((state) => state.auth);
    return (
        <>
            <div className={`${props?.with ? props.with : "w-1/2"} relative p-10`}>
            {props.with ? <div className='absolute right-[17px] top-[14px] text-[22px] font-black cursor-pointer' onClick={()=>props.setUserLogin(false)}>X</div>:""}
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
                        dispatch(loginUser(values));
                        // props.setUserLogin(false)
                    }}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                    }) => (
                        <Form className="mt-6">
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

                            <button
                                type="submit"
                                className={`w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300 shadow-md ${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                    }`}
                                disabled={loading} // Disable button while loading
                            >
                                {loading ? <GifComp {...LoaderData} /> : "LOGIN"}
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
        </>
    )
}
