import { create } from "zustand";
import { useQuery } from "@tanstack/react-query";
import api from "./api";
import { useEffect } from "react";

export const useSessionStore = create<SessionState>((set) => ({
    isAuthenticated: false,
    setAuthenticated: (v) => set({ isAuthenticated: v }),
}));


export function useSessionProbe() {
    const setAuthenticated = useSessionStore((s) => s.setAuthenticated);

    const query = useQuery({
        queryKey: ["session.probe"],
        queryFn: async () => {
            const res = await api.get("/balance/usd")
            return res.data;
        },
        retry: false,
        staleTime: 5_000,
        meta: { isSessionProbe: true },
    })

    useEffect(() => {
        if (query.isSuccess) setAuthenticated(true);
        if (query.isError) setAuthenticated(false);
    }, [query.isSuccess, query.isError, setAuthenticated]);



}