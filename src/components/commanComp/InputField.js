import React from 'react'
import { useField } from 'formik';

export default function InputField({ label, type, placeholder, ...props }) {
    const [field, meta] = useField(props);

    return (
        <div>
            <label className="block text-gray-700">{label}</label>
            <input
                type={type}
                {...field}
                {...props}
                placeholder={placeholder}
                className="w-full p-3 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {meta.touched && meta.error ? (
                <div className="absolute text-[12px] text-red-500">{meta.error}</div>
            ) : null}
        </div>
    )
}
