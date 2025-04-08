import { io } from 'socket.io-client';

const socket = io('http://localhost:8003'); // Update if your backend URL is different

export default socket;