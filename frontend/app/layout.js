import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "Library Portal",
  description: "City Public Library System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ duration: 4000 }}
        />
      </body>
    </html>
  );
}