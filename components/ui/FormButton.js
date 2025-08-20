// components/ui/FormButton.js
"use client";
export default function FormButton({
  children,
  loading = false,
  type = "submit",
  className = "",
}) {
  return (
    <button
      type={type}
      disabled={loading}
      className={`w-full bg-primary hover:bg-primary-dark text-white font-semibold
                  py-2 px-4 rounded-md shadow transition duration-150 ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-primary/30
                  disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
