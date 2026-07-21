import axios from "axios";
import {Platform} from "react-native";
import { getAccessToken } from "./secure-storage";



const BASE_URL =
 Platform.OS === "web"
 ? process.env.EXPO_PUBLIC_API_URL_WEB
 : process.env.EXPO_PUBLIC_API_URL_MOBILE;



export const api = axios.create({

 baseURL:BASE_URL,

 headers:{
   "Content-Type":"application/json"
 }

});



// REQUEST INTERCEPTOR
//
// Purpose:
// Automatically attach JWT access token
// to every API request.
//
// Without interceptor:
//
// api.get("/profile",{
//   headers:{
//    Authorization:`Bearer token`
//   }
// })
//
// We would need to repeat this everywhere.
//
// Interceptor runs before every request,
// gets token from SecureStore,
// and adds:
//
// Authorization: Bearer <accessToken>
//
// Example:
//
// GET /profile
//
// Authorization:
// Bearer eyJhbGciOi...
//

api.interceptors.request.use(
 async(config)=>{

   const token = await getAccessToken();


   if(token){

    config.headers.Authorization =
      `Bearer ${token}`;

   }


   return config;

 },

(error)=>{

 return Promise.reject(error);

}

);