import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Inter } from "next/font/google";
import { LayoutWrapper } from "@/utils/layout.wrapper";
import { ReduxProvider } from "@/store/providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className} suppressHydrationWarning>
        <ReduxProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </ReduxProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
