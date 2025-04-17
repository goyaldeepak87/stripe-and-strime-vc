"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaDollarSign } from "react-icons/fa";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import NaveBar from "@/components/NaveBar";
import { useSelector } from "react-redux";
import { RdirectUrlData } from "@/lang/RdirectUrl";
import MeetingsTable from "@/components/commanComp/MeetingsTable";
import { createSession, getHostSessions } from "@/utils/APIs";

// Validation schema - defined outside component to prevent recreation
const SessionSchema = Yup.object().shape({
    title: Yup.string()
        .required("Title is required")
        .min(10, "Title must be at least 10 characters")
        .max(15, "Title must not exceed 15 characters"),
    description: Yup.string()
        .required("Description is required")
        .min(12, "Title must be at least 10 characters")
        .max(43, "Title must not exceed 15 characters"),
    roomId: Yup.string(),
    scheduledFor: Yup.string(),
    price: Yup.number()
        .typeError("Price must be a number")
        .required("Price is required")
        .positive("Price must be positive"),
});

// Initial form values - defined outside component
const initialValues = {
    title: "",
    description: "",
    scheduledFor: "",
    roomId: "",
    price: "",
};

export default function CreateSession() {
    const router = useRouter();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { user, isAuthenticated } = useSelector((state) => state.auth);

    // API base URL - could be moved to environment variables
    const API_BASE_URL = "http://localhost:4000/v1/user/api";

    // Fetch sessions with error handling
    const fetchSessions = useCallback(async () => {
        try {
            setLoading(true);

            if (!localStorage.getItem("token")) {
                console.warn("No authentication token found");
                return;
            }

            const sessionsData = await getHostSessions();
            setSessions(sessionsData);
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
            // Implement error handling - could add toast notification here
        } finally {
            setLoading(false);
        }
    }, []);

    // Create a new session
    // Create a new session
    const handleCreateSession = useCallback(async (values, { resetForm, setSubmitting }) => {
        try {
            await createSession(values);

            // Success handling
            resetForm();
            setShowCreateModal(false);
            fetchSessions(); // Refresh the list

            // Could add success toast notification here
        } catch (error) {
            // Could add error toast notification here
            console.log("Session creation failed:", error);
        } finally {
            setSubmitting(false);
        }
    }, [fetchSessions]);

    // Start a session
    const startSession = useCallback((roomId) => {
        if (!user?.username) {
            console.error("Username not found");
            return;
        }

        localStorage.setItem("username", user.username);
        router.push(`${RdirectUrlData.ROME}/${roomId}?role=host`);
    }, [user, router]);

    // Load sessions on component mount
    useEffect(() => {
        if (!isAuthenticated) {
            router.push(`${RdirectUrlData.Home}`);
            return;
        }
        fetchSessions();
    }, [fetchSessions, router, isAuthenticated]);

    if (!isAuthenticated) {
        return <div className="bg-orange-200"></div>
    }

    return (
        <div>
            <div className="height-table bg-orange-200">
                <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">My Created Sessions</h1>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-white px-4 py-2 rounded-lg flex items-center gap-2 bg-orange-500 hover:bg-orange-600 transition"
                        >
                            <FaPlus />
                            <span>Create Session</span>
                        </button>
                    </div>

                    {/* Loading state */}
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <MeetingsTable meetings={sessions} type="host" />
                    )}

                    {/* Create Session Modal - only render when needed */}
                    {showCreateModal && (
                        <div className="fixed inset-0 customBlack bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 mx-4 max-h-screen overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Create New Session</h2>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                    >
                                        &times;
                                    </button>
                                </div>

                                <Formik
                                    initialValues={initialValues}
                                    validationSchema={SessionSchema}
                                    onSubmit={handleCreateSession}
                                >
                                    {({ errors, touched, isSubmitting, setFieldValue }) => (
                                        <Form className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Session Title *
                                                </label>
                                                <Field
                                                    type="text"
                                                    name="title"
                                                    className={`w-full p-2 border ${errors.title && touched.title ? 'border-red-500' : 'border-gray-300'
                                                        } rounded focus:ring-orange-500 focus:border-orange-500`}
                                                />
                                                <ErrorMessage name="title" component="div" className="text-red-500 text-xs mt-1" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Description *
                                                </label>
                                                <Field
                                                    as="textarea"
                                                    name="description"
                                                    className={`w-full p-2 border ${errors.description && touched.description ? 'border-red-500' : 'border-gray-300'
                                                        } rounded h-24 focus:ring-orange-500 focus:border-orange-500`}
                                                />
                                                <ErrorMessage name="description" component="div" className="text-red-500 text-xs mt-1" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Room ID (Optional)
                                                </label>
                                                <Field
                                                    type="text"
                                                    name="roomId"
                                                    className="w-full p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
                                                    placeholder="Leave empty for random ID"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    If left empty, a random room ID will be generated
                                                </p>
                                            </div>

                                            <Field
                                                type="datetime-local"
                                                name="scheduledFor"
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
                                                min={new Date().toISOString().slice(0, 16)}
                                                onChange={(e) => {
                                                    // Make sure the value is properly set in Formik
                                                    setFieldValue("scheduledFor", e.target.value);
                                                }}
                                            />

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Price *
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                        <FaDollarSign className="text-gray-500" />
                                                    </div>
                                                    <Field
                                                        type="text"
                                                        name="price"
                                                        className={`w-full p-2 pl-8 border ${errors.price && touched.price ? 'border-red-500' : 'border-gray-300'
                                                            } rounded focus:ring-orange-500 focus:border-orange-500`}
                                                        style={{ appearance: 'textfield' }}
                                                    />
                                                </div>
                                                <ErrorMessage name="price" component="div" className="text-red-500 text-xs mt-1" />
                                            </div>

                                            <div className="flex justify-end space-x-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCreateModal(false)}
                                                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                                                >
                                                    {isSubmitting ? 'Creating...' : 'Create Session'}
                                                </button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}