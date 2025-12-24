"use client";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Signup = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/signup", form);
      setAuth(data.user, data.accessToken);
      router.replace("/");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Signup failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#212121] px-4">
      <form
        className="w-full max-w-md bg-[#171717] p-8 rounded-xl shadow-2xl flex flex-col gap-6"
        onSubmit={handleSignup}
        aria-label="signup form"
      >
        <div className="text-center mb-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Create Account
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Join us to start chatting with AI
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-200 text-center">
            {error}
          </div>
        )}

        {/* Username Field */}
        <div className="relative">
          <input
            type="text"
            name="username"
            id="username"
            value={form.username}
            onChange={handleChange}
            placeholder=" "
            required
            className="peer block w-full rounded-lg border border-[#424242] bg-[#2f2f2f] px-4 pt-5 pb-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
          />
          <label
            htmlFor="username"
            className={`
              absolute left-4 transition-all duration-200 pointer-events-none text-gray-400
              peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base
              peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-400
              ${form.username ? "top-1 text-xs text-blue-400" : ""}
            `}
          >
            Username
          </label>
        </div>

        {/* Email Field */}
        <div className="relative">
          <input
            type="email"
            name="email"
            id="email"
            value={form.email}
            onChange={handleChange}
            placeholder=" "
            required
            className="peer block w-full rounded-lg border border-[#424242] bg-[#2f2f2f] px-4 pt-5 pb-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
          />
          <label
            htmlFor="email"
            className={`
              absolute left-4 transition-all duration-200 pointer-events-none text-gray-400
              peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base
              peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-400
              ${form.email ? "top-1 text-xs text-blue-400" : ""}
            `}
          >
            Email address
          </label>
        </div>

        {/* Password Field */}
        <div className="relative">
          <input
            type="password"
            name="password"
            id="password"
            value={form.password}
            onChange={handleChange}
            placeholder=" "
            required
            className="peer block w-full rounded-lg border border-[#424242] bg-[#2f2f2f] px-4 pt-5 pb-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
          />
          <label
            htmlFor="password"
            className={`
              absolute left-4 transition-all duration-200 pointer-events-none text-gray-400
              peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base
              peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-400
              ${form.password ? "top-1 text-xs text-blue-400" : ""}
            `}
          >
            Password
          </label>
        </div>

        {/* Action Button */}
        <button
          disabled={loading}
          className={`
            w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 cursor-pointer
            ${loading 
              ? "bg-[#333] cursor-not-allowed opacity-70" 
              : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-500/20"
            }
          `}
        >
          {loading ? (
             <span className="flex items-center justify-center gap-2">
             <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
             </svg>
             Creating Account...
           </span>
          ) : (
            "Sign Up"
          )}
        </button>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;