export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-8 bg-background px-4 py-8">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,var(--color-accent)_0%,var(--color-accent-dark)_100%)] text-sm font-bold text-white">
          S
        </div>
        <span className="text-[19px] font-bold text-text-primary">SubTrack</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
