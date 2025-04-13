'use client'

import { useEffect, useState, useCallback } from "react";
import NaveBar from "@/components/NaveBar";
import MeetingsTable from "@/components/commanComp/MeetingsTable";
import LoginFormModel from "@/components/auth/LoginFormModel";
import { getMeetings } from "@/utils/APIs";

export default function Home() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLogin, setUserLogin] = useState(false);
  
  // API base URL - could be extracted to environment variable

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMeetings();
      setSessions(data?.data?.meetings || []);
    } catch (error) {
      console.log("Failed to fetch sessions:", error);
      // Could show error message to user here
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    
    // Optional: set up polling to refresh sessions periodically
    // const intervalId = setInterval(fetchSessions, 60000);
    // return () => clearInterval(intervalId);
  }, [fetchSessions]);

  return (
    <>
      <NaveBar />
      <div className="height-table pt-20 bg-orange-200">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8" style={{height:"100%"}}>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <MeetingsTable 
              setUserLogin={setUserLogin} 
              meetings={sessions} 
              type="mybooking"
            />
          )}
        </div>
        
        {/* Login Modal - only render when needed */}
        {userLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white shadow-lg rounded-lg flex max-w-md w-full">
              <LoginFormModel setUserLogin={setUserLogin} with="w-full" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}