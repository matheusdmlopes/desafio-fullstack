"use client";
import { ApolloProvider } from "@apollo/client";
import { client } from "../lib/apollo";
import Header from "../components/layout/Header";
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
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </ApolloProvider>
      </body>
    </html>
  );
}
