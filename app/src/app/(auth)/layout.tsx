import Link from "next/link";
import { AdherepodLogo } from "@/components/adherepod-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-8"
        >
          <AdherepodLogo size={32} />
          <span className="text-2xl font-bold">AdherePod</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
