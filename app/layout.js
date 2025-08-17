// app/layout.js
import "@/app/globals.css";
import { Inter } from "next/font/google";
import AuthProvider from "@/components/providers/AuthProvider";
import NavBar from "@/components/layouts/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Politrack",
  description: "Track how politicians vote and what laws really mean",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <AuthProvider>
          <NavBar />
          <main className="container py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
