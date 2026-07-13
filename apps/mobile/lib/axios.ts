import { Platform } from "react-native";
import axios from "axios";

const baseURL =
  Platform.OS === "web"
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});