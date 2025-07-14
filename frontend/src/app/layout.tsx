"use client";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <ApolloProvider client={client}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
