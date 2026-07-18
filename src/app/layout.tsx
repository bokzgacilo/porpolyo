import type { Metadata } from "next";
import type { ReactNode } from "react";
import { UploadOverlay } from "../components/UploadOverlay";
import { Provider } from "../components/ui/provider";
import "../styles.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Porpolyo",
  description: "Build and publish a polished portfolio.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>
          <UploadOverlay />
          {children}
        </Provider>
        <Analytics />
      </body>
    </html>
  );
}
