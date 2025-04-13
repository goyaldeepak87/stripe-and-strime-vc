'use client'

import { useEffect, useState, useCallback } from "react";
import NaveBar from "@/components/NaveBar";
import MeetingsTable from "@/components/commanComp/MeetingsTable";
import LoginFormModel from "@/components/auth/LoginFormModel";
import { getMyBookedMeetings } from "@/utils/APIs";

export default function JoinStreaming() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLogin, setUserLogin] = useState(false);
    

    const fetchSessions = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            
            if (!token) {
                console.warn("No authentication token found");
                setSessions([]);
                return;
            }
            
            const bookedMeetings = await getMyBookedMeetings();
            setSessions(bookedMeetings);
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
            setSessions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    return (
        <>
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