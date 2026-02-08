import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Tablet,
  Wifi,
  Camera,
  Mic,
  Volume2,
  Sun,
  Power,
  Monitor,
  Users,
  Building2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "The AdherePod Device | AdherePod",
  description:
    "A dedicated tablet that sits in your home and manages your medications through voice. No smartphone required.",
  openGraph: {
    title: "The AdherePod Device | AdherePod",
    description:
      "A dedicated tablet that sits in your home and manages your medications through voice. No smartphone required.",
    images: [{ url: "/og/og-device.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/og-device.png"],
  },
};

export default function DevicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            <span className="text-xl font-bold">AdherePod</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Tablet className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            The AdherePod Device
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A dedicated tablet that sits in your home and manages your
            medications through voice. No smartphone required. No app store. No
            setup.
          </p>
          <Badge variant="secondary" className="text-sm px-4 py-1">
            Coming Soon
          </Badge>
        </div>
      </section>

      {/* Vision */}
      <section className="bg-muted py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">
            A New Kind of Health Device
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-10">
            The AdherePod device is a custom Samsung tablet pre-loaded with the
            AdherePod platform. It&apos;s an always-on, always-listening
            medication assistant that sits on your kitchen counter or nightstand.
            Just plug it in and start talking.
          </p>
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <p className="text-foreground">
                No smartphone required &mdash; works independently
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <p className="text-foreground">
                No app store, no downloads, no updates to manage
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <p className="text-foreground">
                Pre-configured and ready to use out of the box
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: Power,
                title: "Unbox & Plug In",
                desc: "Your AdherePod arrives pre-configured. Just plug it in and connect to your WiFi network. That's it.",
              },
              {
                step: "2",
                icon: Mic,
                title: "Add Your Medications",
                desc: "Tell AdherePod your medications by voice, or have a caregiver set them up through the web dashboard.",
              },
              {
                step: "3",
                icon: CheckCircle2,
                title: "Stay on Track",
                desc: "Receive daily reminders, have voice check-ins, and build your adherence record over time.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <item.icon className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24 px-4 sm:px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Purpose-built hardware for medication management. Every detail
              designed for simplicity.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Monitor,
                title: "Always-On Display",
                desc: "Large screen showing your daily medication schedule. High contrast, large text for easy reading.",
              },
              {
                icon: Camera,
                title: "Built-In Camera",
                desc: "Point your pills at the camera for instant identification. Never wonder 'what is this pill?' again.",
              },
              {
                icon: Mic,
                title: "Voice Interaction",
                desc: "Built-in speaker and microphone for hands-free voice conversation with your medication assistant.",
              },
              {
                icon: Wifi,
                title: "WiFi Connected",
                desc: "Cloud sync keeps your data safe and enables caregiver access through the web dashboard.",
              },
              {
                icon: Sun,
                title: "High Contrast Display",
                desc: "Large text, bold colors, and high contrast designed specifically for low-vision users.",
              },
              {
                icon: Power,
                title: "Simple Controls",
                desc: "Physical volume and power buttons. No complex menus or settings to navigate.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-background border border-border rounded-lg p-6"
              >
                <item.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="relative w-full aspect-[1200/630] rounded-xl overflow-hidden shadow-md">
          <Image src="/og/og-device.png" alt="AdherePod tablet device" fill className="object-cover" />
        </div>
      </div>

      {/* Who It's For */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">
            Who it&apos;s for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                title: "Elderly patients living independently",
                desc: "Managing medications without daily caregiver assistance",
              },
              {
                icon: Volume2,
                title: "Patients managing 5+ medications",
                desc: "Complex regimens that are easy to get confused about",
              },
              {
                icon: Users,
                title: "Caregivers who can't be there every day",
                desc: "Monitor adherence remotely through the web dashboard",
              },
              {
                icon: ArrowRight,
                title: "Medicare Advantage plans",
                desc: "Improve Star Ratings through better medication adherence scores",
              },
              {
                icon: Building2,
                title: "Assisted living facilities",
                desc: "Per-resident medication management with staff oversight",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border border-border rounded-lg p-6"
              >
                <item.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon / Waitlist */}
      <section className="bg-muted py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Join the Waitlist</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Be the first to know when the AdherePod device is available.
          </p>
          <a href="mailto:sales@adherepod.com?subject=AdherePod%20Device%20Waitlist">
            <Button size="lg">
              Email Us to Join the Waitlist
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </a>
          <p className="text-sm text-muted-foreground mt-4">
            sales@adherepod.com
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="border border-border rounded-lg p-8 sm:p-10 text-center">
            <h2 className="text-3xl font-bold mb-6">Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Pricing will be announced soon. We&apos;re exploring both direct
              purchase and subscription models to make AdherePod accessible to
              everyone.
            </p>
            <p className="text-muted-foreground">
              Interested in bulk pricing for your organization?{" "}
              <a
                href="mailto:sales@adherepod.com?subject=AdherePod%20Bulk%20Pricing%20Inquiry"
                className="text-primary hover:underline"
              >
                Contact us
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span className="font-semibold">AdherePod</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; 2026 AdherePod. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
