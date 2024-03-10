import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Authentication",
};

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex items-center justify-center h-screen">
      {children}
    </div>
  );
}