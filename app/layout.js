// app/layout.js
import "@/app/globals.css"; // ← This is required to activate Tailwind!
import AuthProvider from "@/components/providers/AuthProvider";
import NavBar from "@/components/layouts/NavBar";

export const metadata = {
  title: "Politrack",
  description: "Track how politicians vote and what laws really mean",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavBar />
          <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
