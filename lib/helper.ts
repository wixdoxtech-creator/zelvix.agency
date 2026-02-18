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

const CART_STORAGE_KEY = "zelvix_cart_items";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getCart<T = unknown>(key = CART_STORAGE_KEY): T[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function setCart<T = unknown>(items: T[], key = CART_STORAGE_KEY) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(items));
}

export function deleteCart(key = CART_STORAGE_KEY) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(key);
}

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
