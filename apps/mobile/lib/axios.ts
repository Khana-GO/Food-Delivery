import axios from 'axios';

console.log(process.env.BACKEND_API_URL);

export const api = axios.create({
    baseURL: process.env.BACKEND_API_URL || 'http://localhost:3000/api',
    // withCredentials: true,
    headers:{
        'Content-Type': 'application/json',
    }

})