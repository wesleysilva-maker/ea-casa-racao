import type { Metadata } from "next";
import "./globals.css";
import UpdateNotification from "./components/UpdateNotification";

export const metadata: Metadata = {
  title: "EA Casa de Ração",
  description: "Tudo para seu Pet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <UpdateNotification />
        {children}
      </body>
    </html>
  );
}
