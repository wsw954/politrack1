//app/auth/login/page.js

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "@/components/ui/FormInput";
import FormButton from "@/components/ui/FormButton";
import FormError from "@/components/ui/FormError";
import Card from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Placeholder logic until NextAuth signIn is added
    setTimeout(() => {
      setLoading(false);
      router.push("/user/dashboard"); // Redirect mock
    }, 1000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="max-w-md w-full space-y-6">
        <h2 className="text-2xl font-bold text-center text-blue-800">
          Sign In
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <FormError message={error} />
          <FormButton loading={loading}>Login</FormButton>
        </form>
      </Card>
    </main>
  );
}
