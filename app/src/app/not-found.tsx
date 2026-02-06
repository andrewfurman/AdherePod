import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";

export default async function NotFound() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <Heart className="h-12 w-12 text-red-500 mb-6" />
      <h1 className="text-4xl font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <div className="flex gap-3">
        {session?.user ? (
          <Link href="/my-medications">
            <Button>
              Go to My Medications
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        ) : (
          <>
            <Link href="/">
              <Button variant="outline">Home</Button>
            </Link>
            <Link href="/sign-in">
              <Button>
                Sign In
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
