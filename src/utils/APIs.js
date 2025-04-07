import axios from "axios";
import { DefaultHeader } from "./DefaultHeader";
import { API_BASE_URL } from "@/config/appBaseUrl";

export const getUserProfile = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/user/api/user_list`, {
            headers: {
                ...await DefaultHeader(),
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching user profile:", error.message);
        throw error; // Rethrow the error for further handling if needed
    }
}

export const getpaymentSuccess = async ({sessionId}) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/user/api/payment_success?session_id=${sessionId}`, {
            headers: {
                ...await DefaultHeader(),
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching payment success:", error.message);
        throw error; // Rethrow the error for further handling if needed
    }
}


export const productPayment = async (cardData) => {  
    try {
        const res = await axios.post(`${API_BASE_URL}/user/api/checkout_sessions`, cardData, {
            headers: {
                ...await DefaultHeader(),
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching payment:", error.message);
        throw error; // Rethrow the error for further handling if needed
    }
}

