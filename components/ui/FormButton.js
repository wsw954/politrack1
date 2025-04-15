// components/ui/FormButton.js
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
      className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
