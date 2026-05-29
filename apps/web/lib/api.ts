import axios from "axios";

function resolveProdBase(): string | undefined {
    // 1. Next.js environment variables use process.env
    // Requires your .env to have: NEXT_PUBLIC_API_BASE=your_value
    const envBase = process.env.NEXT_PUBLIC_API_BASE?.trim();

    if (envBase) return envBase;

    // Fallback when no env is provided
    if (typeof window !== "undefined") {
        const { protocol, hostname } = window.location;
        return `${protocol}//${hostname}:3001/api/v1`;
    }
    return undefined;
}

// 2. Next.js uses process.env.NODE_ENV to check environment mode
const baseURL = process.env.NODE_ENV === "development" ? "/api/v1" : resolveProdBase();

export const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
