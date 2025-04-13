'use client'

import { useEffect, useState, useCallback } from "react";
import NaveBar from "@/components/NaveBar";
import MeetingsTable from "@/components/commanComp/MeetingsTable";
import LoginFormModel from "@/components/auth/LoginFormModel";

export default function JoinStreaming() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLogin, setUserLogin] = useState(false);
    
    // API base URL - could be extracted to environment variable
    const API_BASE_URL = "http://localhost:4000/v1/user/api";

    const fetchSessions = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            
            if (!token) {
                console.error("No authentication token found");
                setLoading(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/my-booked-meetings`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setSessions(data?.data?.bookedMeetings || []);
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
            // Optionally show an error toast/notification
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    return (
        <>
            <NaveBar />
            <div className="height-table bg-orange-200">
                <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center mb-6 h-[40px]">
                        <h1 className="text-2xl font-bold">My Booked Sessions</h1>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <MeetingsTable 
                            setUserLogin={setUserLogin} 
                            meetings={sessions || []} 
                            type="audience"
                        />
                    )}
                </div>
            </div>
            
            {/* Login Modal - only render when needed */}
            {userLogin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white shadow-lg rounded-lg w-full max-w-md overflow-hidden">
                        <LoginFormModel setUserLogin={setUserLogin} with="w-full" />
                    </div>
                </div>
            )}
        </>
    );
}