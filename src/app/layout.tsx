'use client';

import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

import { store } from "@/store/route";
import { Provider } from "react-redux";

const inter = Inter({ subsets: ["latin"] });
const robotoMono = Roboto_Mono({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${robotoMono.className} antialiased`}>
        <ThemeProvider>
          <Provider store={store}>
            <main className="min-h-screen">{children}</main>
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
