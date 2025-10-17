'use client';

import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { store } from "@/store/route";
import { Provider } from "react-redux";
import { Header } from "@/components/Header";
import { Bounce, ToastContainer } from "react-toastify";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });
const robotoMono = Roboto_Mono({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); 

  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <body className={`${inter.className} ${robotoMono.className} antialiased`}>
        <ThemeProvider>
          <Provider store={store}>
            
            {pathname !== "/login" && <Header />}

            <main className="min-h-screen">
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
              />
              {children}
            </main>
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
