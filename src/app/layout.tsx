import type { Metadata } from "next";
import type { ReactNode } from "react";
import { UploadOverlay } from "../components/UploadOverlay";
import { Provider } from "../components/ui/provider";
import "../styles.css";

export const metadata: Metadata = {
  title: "Porpolyo",
  description: "Build and publish a polished portfolio.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>
          <UploadOverlay />
          {children}
        </Provider>
      </body>
    </html>
  );
}
