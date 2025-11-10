'use client';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#222831] to-[#1a1f26]">
      {children}
    </div>
  );
}
