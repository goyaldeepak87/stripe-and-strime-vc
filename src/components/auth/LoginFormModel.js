import React from 'react';
import { LoaderData, SignupData } from "@/lang";
import Socialicon from "@/components/commanComp/Socialicon";
import InputField from "@/components/commanComp/InputField";
import { Formik, Form } from 'formik';
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/reudux/slice/authSlice";
import GifComp from '../GifComp';
import { toast } from 'react-toastify';

// Validation Function
const validateLoginForm = (values) => {
    const errors = {};
    if (!values.email) {
        errors.email = "Email is required";
    }
    if (!values.password) {
        errors.password = "Password is required";
    }
    if (!values.role) {
        errors.role = "Please select a role";
    }
    return errors;
};

export default function LoginFormModel(props) {
    const dispatch = useDispatch();
    const { loading, isAuthenticated } = useSelector((state) => state.auth);

    return (
        <div className={`${props?.with ? props.with : "w-1/2"} relative p-10`}>
            {props.with && (
                <div
                    className='absolute right-[17px] top-[14px] text-[22px] font-black cursor-pointer'
                    onClick={() => props.setUserLogin(false)}
                >
                    X
                </div>
            )}
            <h2 className="text-2xl font-bold text-orange-600">Account Access</h2>
            {/* <p className="text-gray-500">
                Don't have an account?{" "}
                <a href="#" className="text-orange-600 font-semibold">
                    Sign Up
                </a>
            </p> */}

            <Formik
                initialValues={{ email: '', password: '', role: '' }}
                validate={validateLoginForm}
                onSubmit={async (values, { setSubmitting }) => {
                    try {
                        const result = await dispatch(loginUser(values)).unwrap();
                        console.log("result", result);
                        if (result.statusCode === 200) {
                            toast.success("Login successful! Redirecting...");
                            props?.setUserLogin && typeof props.setUserLogin === 'function' && props.setUserLogin(false);
                        }
                    } catch (error) {
                        toast.error(error.message);
                    }
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
                        {/* Role Dropdown */}
                        <div className="mt-4 relative">
    <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
        Role As
    </label>
    <div className="relative">
        <select
            name="role"
            value={values.role}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full border rounded-lg p-[10px] border border-black mb-2 appearance-none"
        >
            <option value="" label="Select role" />
            <option value="host" label="Host" />
            <option value="audience" label="Audience" />
        </select>
        <div className="pointer-events-none absolute inset-y-0 top-[-5px] right-[9px] flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
        </div>
    </div>
    {errors.role && touched.role && (
        <div className="absolute text-[12px] text-red-500 top-[74px]">{errors.role}</div>
    )}
</div>

                        {/* Email Field */}
                        <div>
                            <InputField
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="mt-4">
                            <InputField
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="Enter 6 characters or more"
                            />
                            {/* <a href="#" className="text-sm text-orange-600 float-right mt-1">
                                Forgot Password?
                            </a> */}
                        </div>

                        {/* Remember Me */}
                        {/* <div className="flex items-center mt-4">
                            <input type="checkbox" className="mr-2" />
                            <label className="text-gray-700">Remember me</label>
                        </div> */}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300 shadow-md ${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                            disabled={loading}
                        >
                            {loading ? <GifComp {...LoaderData} /> : "AUTHENTICATE"}
                        </button>
                    </Form>
                )}
            </Formik>

            {/* Social Login */}
            <div className="mt-6 text-center text-gray-500">or login with</div>
            <div className="flex justify-center mt-4 space-x-4">
                {SignupData.map((item) => (
                    <div key={item.id}>
                        <Socialicon {...item} />
                    </div>
                ))}
            </div>
        </div>
    );
}
