// components/user/ActivityCard.js
export default function ActivityCard({
  icon = "ℹ️",
  message = "",
  type = "info",
}) {
  const typeStyles = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    success: "bg-green-50 border-green-200 text-green-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
    danger: "bg-red-50 border-red-200 text-red-900",
    muted: "bg-gray-50 border-gray-200 text-gray-700",
  };

  return (
    <div
      className={`flex items-start border rounded-md p-4 shadow-sm ${
        typeStyles[type] || typeStyles.info
      }`}
    >
      <div className="text-2xl mr-4">{icon}</div>
      <div className="text-sm leading-relaxed">{message}</div>
    </div>
  );
}
