'use client'; // Client Component

import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "@/store/route";

const inter = Inter({ subsets: ["latin"] });
const robotoMono = Roboto_Mono({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${robotoMono.className} antialiased`}>
        <Provider store={store}>
          <main className="min-h-screen">{children}</main>
        </Provider>
      </body>
    </html>
  );
}
