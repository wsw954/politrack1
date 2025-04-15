// components/ui/FormError.js
export default function FormError({ message }) {
  return (
    <div className="text-red-600 text-sm font-medium bg-red-100 border border-red-300 rounded p-2">
      {message}
    </div>
  );
}
