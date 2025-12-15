'use client';

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

export default function AuthInitializer({children}: {children: React.ReactNode}) {
    const initializeAuth = useAuthStore((s)=> s.initializeAuth);

    useEffect(()=>{
        initializeAuth()
    },[]);

    return <>{children}</>;
}