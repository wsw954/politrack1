// app/layout.js
import "@/app/globals.css"; // ← This is required to activate Tailwind!
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata = {
  title: "Politrack",
  description: "Track how politicians vote and what laws really mean",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
