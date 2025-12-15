"use client";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const {data} = await api.post("/api/auth/login", form);
      
      //validation
      if(!data.user || !data.accessToken){
        throw new Error("Invalid login response from server");
      }
      
      // Save to global store
      setAuth(data.user, data.accessToken);

      router.replace('/')
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message || err?.message || "Login failed. Please try again.";
      setError(serverMessage);
    }finally{
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  return (
    <div className="flex h-screen items-center justify-center bg-[#212121] text-white">
      <form
        className="w-96 p-6 bg-[#171717] rounded-lg h-3/5 flex flex-col justify-center items-center relative"
        onSubmit={handleLogin}
        aria-label="login form"
      >
        <h2 className="text-3xl mb-4 font-bold absolute top-6 text-white shadow-2xl">Welcome Back</h2>
        {error && (
          <p role="alert" className="text-red-500 mb-2 text-sm wrap-break-word">
            {error}
          </p>
        )}

        <div className="relative w-full mb-4">
          <input
            type="text"
            name="email"
            id="email"
            value={form.email}
            onChange={handleChange}
            placeholder=" "
            required
            className="peer block w-full border border-gray-300 rounded-md px-4 pt-4 pb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <label
            htmlFor="email"
            className={`absolute left-4 text-gray-500 transition-all cursor-text
              ${
                form.email
                  ? "top-0 text-sm text-blue-500"
                  : "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-sm peer-focus:text-blue-500"
              }
            `}
          >
            Email
          </label>
        </div>

        <div className="relative w-full mb-4">
          <input
            type="password"
            name="password"
            id="password"
            value={form.password}
            onChange={handleChange}
            placeholder=" "
            required
            className="peer block w-full border border-gray-300 rounded-md px-4 pt-4 pb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <label
            htmlFor="password"
            className={`absolute left-4 text-gray-500 transition-all cursor-text
              ${
                form.password
                  ? "top-0 text-sm text-blue-500"
                  : "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-sm peer-focus:text-blue-500"
              }
            `}
          >
            Password
          </label>
        </div>

        <button
          className={`w-full bg-[#444444] hover:bg-green-700 p-2 rounded font-bold transition cursor-pointer ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Logging in…" : "Log In"}
        </button>
        <p className="mt-4 text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-blue-400">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
