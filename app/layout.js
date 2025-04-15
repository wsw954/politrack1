// app/layout.js
export const metadata = {
  title: "Politrack",
  description: "Track how politicians vote and what laws really mean",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
