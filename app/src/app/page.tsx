"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  Pill,
  Activity,
  ShieldCheck,
  Bluetooth,
  BarChart3,
  DollarSign,
  Users,
  Heart,
  MessageCircle,
  Bell,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            <span className="text-xl font-bold">AdherePod</span>
          </a>
          <div className="flex items-center gap-3">
            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
              <a href="#who" className="hover:text-foreground transition-colors">Who It&apos;s For</a>
              <a href="#team" className="hover:text-foreground transition-colors">Team</a>
            </div>
            {/* Auth buttons — always visible */}
            {session?.user ? (
              <Link href="/my-medications">
                <Button size="sm">
                  <span className="hidden sm:inline">Go to My Medications</span>
                  <span className="sm:hidden">My Meds</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-2">
            <a
              href="#features"
              className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#who"
              className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Who It&apos;s For
            </a>
            <a
              href="#team"
              className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Team
            </a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-12 pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            Voice-Native Health Platform
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Your medications, managed.
            <br />
            <span className="text-muted-foreground">No screens. No confusion.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            AdherePod is a plug-and-play device that sits in your home and manages
            your medications through simple voice conversation. Designed for people
            who need health management to just work.
          </p>
          {!session?.user && (
            <div className="flex items-center justify-center gap-3 mb-10">
              <Link href="/sign-up">
                <Button size="lg">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" size="lg">Sign In</Button>
              </Link>
            </div>
          )}
          {session?.user && (
            <div className="flex items-center justify-center mb-10">
              <Link href="/my-medications">
                <Button size="lg">
                  Go to My Medications
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          )}
          <div className="max-w-3xl mx-auto mt-12">
            <Image
              src="/hero-image.png"
              alt="Elderly woman talking to AdherePod at her kitchen table"
              width={960}
              height={540}
              className="w-full rounded-2xl shadow-lg"
              priority
            />
          </div>
        </div>
      </section>

      {/* Voice-First Callout */}
      <section className="py-16 px-4 sm:px-6 bg-muted">
        <div className="max-w-4xl mx-auto text-center">
          <Mic className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl font-bold mb-4">Just talk to it.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-background rounded-lg p-6 border border-border">
              <p className="text-muted-foreground italic">
                &ldquo;AdherePod, what pills do I take this morning?&rdquo;
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 border border-border">
              <p className="text-muted-foreground italic">
                &ldquo;AdherePod, my blood pressure reading is ready.&rdquo;
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 border border-border">
              <p className="text-muted-foreground italic">
                &ldquo;AdherePod, did I take my evening pills?&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything your health needs in one device</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              No apps to download. No menus to navigate. Just plug in, pair your devices, and start talking.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Mic className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Voice-Native Interface</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                All interactions happen through natural voice conversation.
                No screens, no apps, no buttons. Supports multiple languages.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Bluetooth className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Device Integration</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Connects to blood pressure monitors, glucose meters, pulse oximeters,
                scales, and wearables. Automatic data capture.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Pill className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Medication Management</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Voice-guided pill identification and scheduling. Cross-references
                medications for dangerous interactions.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ShieldCheck className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Interaction Alerts</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Automatically flags dangerous drug interactions and advisories
                to discuss with your doctor before it&apos;s too late.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Activity className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Adherence Tracking</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Logs medication doses and vitals automatically. Builds a
                comprehensive adherence score over time.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Provider &amp; Payer Platform</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Real-time dashboards for physicians. Shares adherence data with
                insurance to unlock savings and better care.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-muted">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: Mic, title: "Talk", desc: "Have a live voice conversation with AdherePod about your medications, schedule, and health questions." },
              { step: "2", icon: MessageCircle, title: "Discuss", desc: "AdherePod helps you manage your medications, check for interactions, and track your adherence over time." },
              { step: "3", icon: Bell, title: "Get Notified", desc: "Receive reminders and new health advice via phone call or SMS when it's time to take your medications or when the system has guidance for you." },
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

      {/* Who It's For */}
      <section id="who" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Built for everyone in the care chain</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: "Elderly Patients", desc: "Managing multiple chronic conditions without tech frustration." },
              { icon: Users, title: "Caregivers", desc: "Peace of mind knowing your loved one is taking their medications." },
              { icon: ShieldCheck, title: "Providers", desc: "Reliable adherence and vitals data between office visits." },
              { icon: DollarSign, title: "Payers & Insurers", desc: "Reduce costs through verified adherence and early intervention." },
              { icon: Mic, title: "Low-Literacy Users", desc: "No reading required. Voice-only interaction from setup to daily use." },
              { icon: Activity, title: "Chronic Care Programs", desc: "Plug-and-play integration into existing care management workflows." },
            ].map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <item.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  {item.desc}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-24 px-4 sm:px-6 bg-muted">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <Image
                  src="/gage-clifton.jpg"
                  alt="Gage Clifton"
                  width={80}
                  height={80}
                  className="rounded-full mx-auto mb-2 object-cover"
                />
                <CardTitle>Gage Clifton</CardTitle>
                <p className="text-xs text-muted-foreground font-medium">CEO</p>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Visionary founder most passionate about simplifying medical
                adherence and helping people navigate their health journeys.
                Deep experience working with all of the nation&apos;s largest
                health insurance companies.
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Image
                  src="/andrew-furman.jpg"
                  alt="Andrew Furman"
                  width={80}
                  height={80}
                  className="rounded-full mx-auto mb-2 object-cover"
                />
                <CardTitle>Andrew Furman</CardTitle>
                <p className="text-xs text-muted-foreground font-medium">CTO</p>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Experienced agentive AI developer with deep expertise in LLM
                integrations and voice agents built to serve the healthcare
                industry.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Health management that just works.</h2>
          <p className="text-lg opacity-90 mb-8">
            No screens. No confusion. Just plug in and start talking.
          </p>
          {!session?.user && (
            <Link href="/sign-up">
              <Button size="lg" variant="secondary">
                Sign Up Free
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span className="font-semibold">AdherePod</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; 2026 AdherePod. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
