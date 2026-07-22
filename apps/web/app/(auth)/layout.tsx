import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-8 bg-background px-4 py-8">
      <div className="flex items-center gap-2">
        <Image src="/subtrack.png" alt="SubTrack" width={36} height={36} priority />
        <span className="text-[19px] font-bold text-text-primary">SubTrack</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
