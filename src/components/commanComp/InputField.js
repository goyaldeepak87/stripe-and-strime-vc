import React, { useState } from 'react'
import { useField } from 'formik';
import { Eye, EyeOff } from 'react-feather';

export default function InputField({ label, type, placeholder, ...props }) {
    const [field, meta] = useField(props);
    const [inputType, setInputType] = useState(type); // Manage input type state

    const togglePasswordVisibility = () => {
        setInputType((prevType) => (prevType === 'password' ? 'text' : 'password'));
    };

    return (
        <div className='relative'>
            <label className="block text-gray-700">{label}</label>
            <input
                type={inputType}
                {...field}
                {...props}
                placeholder={placeholder}
                className="w-full p-3 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {label === "Password" ? (
                <div
                className="absolute right-3 top-9 text-[12px] text-gray-500 mt-1 cursor-pointer"
                onClick={togglePasswordVisibility}
            >
                {inputType === "password" ? <EyeOff /> : <Eye />}
            </div>
            ) : null}
            {meta.touched && meta.error ? (
                <div className="absolute text-[12px] text-red-500">{meta.error}</div>
            ) : null}
        </div>
    )
}
