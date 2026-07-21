import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { api } from "../../lib/axios";

import {
  saveAccessToken,
  saveRefreshToken,
  getAccessToken,
  deleteTokens,
} from "../../lib/secure-storage";

import { User, UserRole } from "@food_delivery/types";


// ===============================
// Types
// ===============================

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}


interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}


interface AuthContextType {

  // Current logged-in user
  user: User | null;


  // Used while checking existing login session
  loading: boolean;


  // Quickly check authentication status
  isAuthenticated: boolean;


  // Current user's role
  role: UserRole | null;


  // Authentication actions
  login: (data: LoginResponse) => Promise<void>;

  logout: () => Promise<void>;

  register: (
    data: RegisterData
  ) => Promise<void>;

}



// ===============================
// Create Context
// ===============================

const AuthContext =
  createContext<AuthContextType | null>(null);




// ===============================
// Auth Provider
//
// This component wraps the whole app.
// Every screen inside this provider can access:
//
// user
// login()
// logout()
// role
//
// using useAuth()
// ===============================


export function AuthProvider(
{
 children
}:{
 children: React.ReactNode;
}){


 const [user,setUser] =
 useState<User | null>(null);


 const [loading,setLoading] =
 useState(true);



 // ===================================
 // Runs once when application starts
 //
 // Purpose:
 // Check if user already logged in.
 //
 // Example:
 //
 // User closes app yesterday
 // Opens today
 //
 // We check SecureStore
 // If token exists:
 // restore user session
 // ===================================

 useEffect(()=>{

   restoreSession();

 },[]);



 const restoreSession = async()=>{

   try{


    const token =
      await getAccessToken();



    // No token means user never logged in
    if(!token){

      setLoading(false);

      return;
    }



    // Token exists,
    // ask backend for current user

    const response =
      await api.get("/auth/me");



    setUser(
      response.data.user
    );



   }
   catch(error){

     // Token expired or invalid

     await deleteTokens();

     setUser(null);

   }
   finally{

     setLoading(false);

   }

 };





 // ===================================
 // LOGIN
 //
 // Backend returns:
 //
 // {
 //   accessToken,
 //   refreshToken,
 //   user
 // }
 //
 // We:
 //
 // 1. Save tokens securely
 // 2. Store user in memory
 //
 // ===================================


 const login = async(
 data:LoginResponse
 )=>{


   await saveAccessToken(
     data.accessToken
   );


   await saveRefreshToken(
     data.refreshToken
   );



   setUser(
     data.user
   );

 };





 // ===================================
 // LOGOUT
 //
 // Remove:
 //
 // 1. Secure tokens
 // 2. Current user state
 //
 // ===================================


 const logout = async()=>{


   try{


    await deleteTokens();


    setUser(null);


   }
   catch(error){

    console.log(
      "Logout error",
      error
    );

   }

 };





 // ===================================
 // REGISTER
 //
 // Usually:
 //
 // Call backend register API
 // Then login automatically
 //
 // ===================================


 const register = async(
 data:RegisterData
 )=>{


   const response =
   await api.post(
     "/auth/register",
     data
   );



   const loginData =
   response.data;



   await login(
     loginData
   );


 };





 return (

<AuthContext.Provider

 value={{

   user,


   loading,


   isAuthenticated:
      !!user,


   role:
      user?.role ?? null,


   login,


   logout,


   register,


 }}

>


 {children}


</AuthContext.Provider>

 );

}





// ===================================
// Custom Hook
//
// Instead of:
// useContext(AuthContext)
//
// We use:
// useAuth()
//
// Example:
//
// const {user,logout}=useAuth();
//
// ===================================


export function useAuth(){


 const context =
 useContext(
   AuthContext
 );


 if(!context){

   throw new Error(
    "useAuth must be used inside AuthProvider"
   );

 }


 return context;

}