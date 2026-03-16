import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "Smart E-library",
  description: "An AI-powered smart e-library is a digital, user-centric platform integrating artificial intelligence, IoT, and cloud computing to revolutionize access to information",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Toaster
          position="top-middle"
          richColors
          closeButton
          toastOptions={{ duration: 4000 }}
        />
      </body>
    </html>
  );
}