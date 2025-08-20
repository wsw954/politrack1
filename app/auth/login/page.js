//app/auth/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import useRequireGuest from "@/lib/auth/useRequireGuest";
import FormInput from "@/components/ui/FormInput";
import FormButton from "@/components/ui/FormButton";
import FormError from "@/components/ui/FormError";
import Card from "@/components/ui/Card";

export default function LoginPage() {
  const allowGuest = useRequireGuest();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!allowGuest) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
      return;
    }

    // Fetch session to get user role
    const session = await getSession();
    setLoading(false);

    if (session?.user?.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/user/dashboard");
    }
  };

  return (
    <section className="py-16">
      <div className="max-w-md mx-auto">
        <Card className="w-full space-y-6">
          {/* Let global h2 tokens apply (text-neutral-dark); remove raw blue */}
          <h2 className="text-2xl font-bold text-center">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <div>
              <FormInput
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-sm text-primary hover:underline mt-1 ml-1
                           focus:outline-none focus:ring-2 focus:ring-primary/30 rounded"
              >
                {showPassword ? "Hide password" : "Show password"}
              </button>
            </div>

            <FormError message={error} />
            <FormButton loading={loading}>Login</FormButton>
          </form>
        </Card>
      </div>
    </section>
  );
}
