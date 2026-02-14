import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

export function parseImageArray(value?: string) {
  if (!value) return [];

  try {
    const fixed = value.replace(/'/g, '"');

    const data = JSON.parse(fixed);
    console.log("this is the data", data);
    return data;
  } catch {
    return [];
  }
}
