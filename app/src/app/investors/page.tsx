import {
  Heart,
  TrendingUp,
  DollarSign,
  Users,
  Mic,
  Pill,
  Star,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Globe,
  Smartphone,
  Target,
  Building2,
  ShoppingCart,
  FlaskConical,
  Camera,
  Bell,
  BookOpen,
  RefreshCw,
  Search,
  Stethoscope,
  Activity,
  Zap,
  Shield,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Investors | AdherePod",
  description:
    "AdherePod investor pitch deck. Voice-native medication adherence platform targeting Medicare Advantage Star Ratings.",
  openGraph: {
    title: "Investors | AdherePod",
    description:
      "Voice-native medication adherence platform targeting Medicare Advantage Star Ratings.",
    images: [{ url: "/og/og-investors.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/og-investors.png"],
  },
};

export default function InvestorsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Slide 1: Title ── */}
      <section className="bg-primary text-primary-foreground min-h-[80vh] flex items-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center w-full">
          <Heart className="h-16 w-16 mx-auto mb-8" />
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6">
            AdherePod
          </h1>
          <p className="text-2xl sm:text-3xl font-medium opacity-90 mb-4">
            The Smart Medication Adherence Platform
          </p>
          <p className="text-lg opacity-75 mb-2">
            Better adherence. Better outcomes. Lower costs.
          </p>
          <p className="text-lg opacity-75">Seed Round &mdash; 2026</p>
        </div>
      </section>

      {/* ── Slide 2: The Problem ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">The Problem</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Medication non-adherence is a $528 billion crisis
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-5xl font-bold text-primary">
                  50%
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                of chronic disease patients don&apos;t take meds as prescribed
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-5xl font-bold text-primary">
                  $528B
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                annual cost of non-adherence in the U.S., including $100&ndash;$300B in
                direct avoidable medical costs
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-5xl font-bold text-primary">
                  100K+
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                preventable deaths per year
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-5xl font-bold text-primary">
                  25%
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                of U.S. hospitalizations caused by medication non-adherence
              </CardContent>
            </Card>
          </div>
          <div className="max-w-4xl mx-auto rounded-xl border border-border bg-muted p-6 text-center">
            <p className="text-muted-foreground">
              Non-adherence is the single largest driver of avoidable healthcare
              spending &mdash; yet most payers lack the tools to address it
              effectively at scale.
            </p>
          </div>
        </div>
      </section>

      {/* ── Slide 3: The Payer Opportunity ── */}
      <section className="bg-muted py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              The Payer Opportunity
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-4xl sm:text-5xl font-bold text-primary">
                  $100&ndash;$300B
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                in potential annual savings for payers by systematically
                addressing medication adherence
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Star className="h-10 w-10 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Medicare Star Ratings</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Adherence is a key quality metric &mdash; small improvements can
                be the difference between 3 and 4 stars, unlocking significant
                bonus payments
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Proven ROI</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Medicare plans avoided $27&ndash;$46.6B in costs (2013&ndash;2018)
                from better adherence in just 3 drug classes
              </CardContent>
            </Card>
          </div>
          <div className="max-w-3xl mx-auto rounded-xl border border-primary/30 bg-primary/5 p-6">
            <p className="text-foreground text-center italic">
              &ldquo;Even small shifts in adherence can be the difference
              between 3 and 4 stars&hellip; that&apos;s a return you don&apos;t walk
              away from.&rdquo;
            </p>
            <p className="text-muted-foreground text-center text-sm mt-2">
              &mdash; Becker&apos;s Payer Issues
            </p>
          </div>
        </div>
      </section>

      {/* ── Slide 4: Our Solution ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Our Solution
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A voice-native medication management platform with a smart
              in-home device &mdash; built-in screen, camera, and connectivity.
              Designed for seniors who may not be tech-savvy, with zero-setup onboarding.
            </p>
          </div>
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative w-full aspect-[1200/630] rounded-xl overflow-hidden shadow-md">
              <Image src="/og/og-investors.png" alt="AdherePod in action" fill className="object-cover" />
            </div>
          </div>
          <div className="max-w-xl mx-auto rounded-xl border-2 border-primary bg-primary/5 p-5 text-center mb-16">
            <p className="text-4xl font-bold text-primary mb-1">98%</p>
            <p className="text-foreground font-medium">
              adherence rate achieved in pilot studies with smart dispensers
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Source: JMIR Formative Research &mdash; In-Home Medication
              Dispensing System Pilot Study (2022)
            </p>
          </div>

          {/* Platform Capabilities */}
          <h3 className="text-2xl font-bold text-center mb-10">
            Platform Capabilities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">
                  Optical Rx Enrollment
                </h4>
                <p className="text-muted-foreground text-sm">
                  Camera scans bottle labels to auto-enroll medications &mdash;
                  no manual data entry
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Pill className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">
                  Smart Dispensing
                </h4>
                <p className="text-muted-foreground text-sm">
                  Physical pill storage and automated dispensing at scheduled
                  times with alerts
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">
                  Multi-Channel Reminders
                </h4>
                <p className="text-muted-foreground text-sm">
                  Screen alerts, voice prompts, text messages, and automated
                  phone calls
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">
                  Medication Coaching
                </h4>
                <p className="text-muted-foreground text-sm">
                  Personalized voice guidance on food interactions, timing, side
                  effects, and contraindications
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">
                  Refill Automation
                </h4>
                <p className="text-muted-foreground text-sm">
                  Tracks remaining doses, contacts pharmacy for refills, alerts
                  on Rx renewals
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">
                  Price Optimization
                </h4>
                <p className="text-muted-foreground text-sm">
                  Compares pharmacy prices, suggests generics, and applies
                  discount programs
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">
                  Provider Integration
                </h4>
                <p className="text-muted-foreground text-sm">
                  Sends prior auth requests, notifies doctors of lapses,
                  facilitates calls
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">
                  Adherence Analytics
                </h4>
                <p className="text-muted-foreground text-sm">
                  Real-time dashboards for care managers, trend reports for
                  providers and payers
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Slide 5: How It Works ── */}
      <section className="bg-muted py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Seamless patient experience from unboxing to daily use
          </p>
          <div className="space-y-8">
            {[
              {
                num: "1",
                title: "Plug In & Connect",
                text: "Built-in cellular or auto Wi-Fi setup. No manual configuration needed.",
              },
              {
                num: "2",
                title: "Scan Medications",
                text: "Show prescription bottles to the camera. AI reads labels automatically.",
              },
              {
                num: "3",
                title: "Automated Dispensing",
                text: "Pills dispensed on schedule with voice prompts and screen alerts.",
              },
              {
                num: "4",
                title: "Ongoing Support",
                text: "Refills, reminders, price shopping, and provider coordination \u2014 all handled.",
              },
            ].map((item) => (
              <div key={item.num} className="flex items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  {item.num}
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Slide 6: Market Size ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            Market Opportunity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center border-2 border-primary/20">
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  TAM
                </p>
                <CardTitle className="text-5xl font-bold text-primary">
                  $528B
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Annual cost of medication non-adherence
              </CardContent>
            </Card>
            <Card className="text-center border-2 border-primary/40">
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  SAM
                </p>
                <CardTitle className="text-5xl font-bold text-primary">
                  $12.7B
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Medicare Advantage Star Rating quality bonus payments
              </CardContent>
            </Card>
            <Card className="text-center border-2 border-primary">
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  SOM
                </p>
                <CardTitle className="text-5xl font-bold text-primary">
                  $500M+
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Addressable market in first 3 years targeting MA plans with
                below-4-star ratings
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="text-center p-6 rounded-lg bg-background border border-border">
              <p className="text-4xl font-bold text-foreground mb-2">34M+</p>
              <p className="text-muted-foreground">
                Medicare Advantage enrollees
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-background border border-border">
              <p className="text-4xl font-bold text-foreground mb-2">10,000</p>
              <p className="text-muted-foreground">
                Americans turn 65 every day
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Slide 7: Business Model ── */}
      <section className="bg-muted py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            Business Model
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <DollarSign className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">
                  B2B: Per-Member-Per-Month
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Medicare Advantage plans pay $3&ndash;$8 PMPM for adherence
                improvement. Revenue scales with enrolled member count.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Smartphone className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">
                  B2C: Device + Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Direct device sales to consumers with monthly subscription for
                ongoing service.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">
                  Data &amp; Analytics Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Anonymized adherence analytics for pharma companies, real-world
                evidence packages, and SaaS dashboards for payer care management
                teams.
              </CardContent>
            </Card>
          </div>

          {/* GLP-1 Data Gap */}
          <div className="max-w-4xl mx-auto rounded-xl border border-primary/30 bg-primary/5 p-6 mb-16">
            <h3 className="text-xl font-bold text-center mb-4">
              Unlocking the GLP-1 Data Gap
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">78%</p>
                <p className="text-muted-foreground text-sm">
                  of members using GLP-1 weight-loss drugs pay out of pocket
                  &mdash; invisible to payer claims data
                </p>
              </div>
              <div className="text-center">
                <p className="text-foreground font-medium mb-2">
                  AdherePod captures it all
                </p>
                <p className="text-muted-foreground text-sm">
                  Real-time dose-level data on all medications, including
                  out-of-pocket drugs that never appear in claims
                </p>
              </div>
            </div>
          </div>

          {/* Unit Economics */}
          <h3 className="text-2xl font-bold text-center mb-4">
            Unit Economics: Why $3&ndash;$8 PMPM Works
          </h3>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            MA plans that reach 4+ stars earn ~$50 PMPM in CMS bonus payments.
            Medication adherence drives 1/3 of their Star Rating. AdherePod
            pays for itself many times over.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="text-center">
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  AdherePod Cost
                </p>
                <CardTitle className="text-4xl font-bold text-foreground">
                  $3&ndash;$8
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                per member per month
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  CMS Bonus Earned
                </p>
                <CardTitle className="text-4xl font-bold text-primary">
                  ~$50
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                per member per month at 4+ stars
              </CardContent>
            </Card>
            <Card className="text-center border-2 border-primary">
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Plan ROI
                </p>
                <CardTitle className="text-4xl font-bold text-primary">
                  6&ndash;16x
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                return on investment for the health plan
              </CardContent>
            </Card>
          </div>
          <div className="max-w-4xl mx-auto rounded-xl border border-border bg-background p-6">
            <p className="text-sm text-muted-foreground text-center">
              <span className="font-semibold text-foreground">Example:</span>{" "}
              A 100K-member MA plan paying $5 PMPM = $6M/year to AdherePod.
              Reaching 4+ stars unlocks ~$60M/year in CMS bonus payments
              &mdash; a{" "}
              <span className="font-semibold text-primary">10x return</span>.
            </p>
          </div>
        </div>
      </section>

      {/* ── Slide 8: Competitive Differentiation ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Competitive Differentiation
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Existing solutions are timers and buzzers. AdherePod is an
              AI-native medication intelligence platform.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">
                  AI-Native Adherence Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Not timers and buzzers &mdash; an AI voice assistant that
                understands medications, interactions, and patient context
              </CardContent>
            </Card>
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <Camera className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">
                  Scan-and-Go Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Zero setup, no app, no caregiver required. Show the bottle to
                the camera and you&apos;re enrolled.
              </CardContent>
            </Card>
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <Globe className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">
                  Full Concierge Automation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Refills, price shopping, prior authorizations, and provider
                outreach &mdash; all handled automatically
              </CardContent>
            </Card>
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <Activity className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">
                  Real-Time Dose-Level Data
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Captures all medications including out-of-pocket drugs invisible
                to claims &mdash; a data asset competitors can&apos;t match
              </CardContent>
            </Card>
          </div>
          <h3 className="text-2xl font-bold text-center mb-8">
            vs. Existing Solutions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Capability
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-primary">
                    AdherePod
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    MedaCube
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Hero
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    MedMinder
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">AI voice assistant</td>
                  <td className="text-center py-3 px-4 text-primary font-bold">&#10003;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">Camera-based Rx enrollment</td>
                  <td className="text-center py-3 px-4 text-primary font-bold">&#10003;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">Automated dispensing</td>
                  <td className="text-center py-3 px-4 text-primary font-bold">&#10003;</td>
                  <td className="text-center py-3 px-4">&#10003;</td>
                  <td className="text-center py-3 px-4">&#10003;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">Price optimization</td>
                  <td className="text-center py-3 px-4 text-primary font-bold">&#10003;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">Prior auth &amp; provider coordination</td>
                  <td className="text-center py-3 px-4 text-primary font-bold">&#10003;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">Refill automation</td>
                  <td className="text-center py-3 px-4 text-primary font-bold">&#10003;</td>
                  <td className="text-center py-3 px-4">&#10003;</td>
                  <td className="text-center py-3 px-4">&#10003;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Payer analytics &amp; GLP-1 data</td>
                  <td className="text-center py-3 px-4 text-primary font-bold">&#10003;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                  <td className="text-center py-3 px-4">&mdash;</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Slide 9: Traction ── */}
      <section className="bg-muted py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            What We&apos;ve Built
          </h2>
          <div className="space-y-5">
            {[
              "Working voice-native web app live at adherepod.com",
              "Real-time AI voice assistant with OpenAI Realtime Voice API",
              "Medication CRUD with voice and web interfaces",
              "Email reminder system with SendGrid integration",
              "Provider dashboard with patient management and clinical notes",
              "Admin dashboard with user management and impersonation",
              "Automated test suite with Playwright",
              "SOC 2 and HIPAA compliance in progress with Vanta",
            ].map((item) => (
              <div key={item} className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-lg text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Slide 10: Why Now ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            Why Now
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: Star,
                text: "AI voice technology is finally good enough (OpenAI Realtime Voice API)",
              },
              {
                icon: Users,
                text: "54% of Medicare beneficiaries now enrolled in MA plans \u2014 and growing",
              },
              {
                icon: TrendingUp,
                text: "CMS increasing focus on quality measures and Star Ratings",
              },
              {
                icon: DollarSign,
                text: "Star Rating bonus payments have quadrupled since 2015",
              },
              {
                icon: Building2,
                text: "$50B CMS Rural Health Transformation Program (2026\u20132030) \u2014 funds earmarked for remote patient monitoring, digital tools, and telehealth",
              },
            ].map((item) => (
              <Card key={item.text}>
                <CardHeader>
                  <item.icon className="h-8 w-8 text-primary mb-2" />
                </CardHeader>
                <CardContent className="text-foreground text-lg font-medium">
                  {item.text}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Slide 11: Go-To-Market Strategy ── */}
      <section className="bg-muted py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            Go-To-Market Strategy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-t-4 border-t-primary/40">
              <CardHeader>
                <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">
                  Phase 1
                </p>
                <CardTitle className="text-xl">Pilot &amp; Prove</CardTitle>
                <p className="text-sm text-muted-foreground">2026&ndash;2027</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    Partner with 2&ndash;3 Medicare Advantage plans for pilot deployments
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    Leverage CMS Rural Health funding for initial rural rollouts
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    Target high-burden chronic disease populations (diabetes, CHF, hypertension)
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    Generate clinical evidence and ROI data
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-primary/60">
              <CardHeader>
                <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">
                  Phase 2
                </p>
                <CardTitle className="text-xl">Scale &amp; Expand</CardTitle>
                <p className="text-sm text-muted-foreground">2027&ndash;2028</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    Expand to 10+ payer partnerships nationally
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    Launch SaaS analytics platform for care management teams
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    Pursue Medicaid managed care and commercial payer channels
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    Build pharmacy network integrations
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">
                  Phase 3
                </p>
                <CardTitle className="text-xl">Platform &amp; Data</CardTitle>
                <p className="text-sm text-muted-foreground">2028&ndash;2030</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    Scale to 100K+ devices deployed
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    Launch pharma data insights business line
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    International expansion (UK, EU single-payer markets)
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    Pursue FDA clearance for clinical-grade monitoring
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Slide 12: Team ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Image
                  src="/gage-clifton.jpg"
                  alt="Gage Clifton"
                  width={96}
                  height={96}
                  className="rounded-full mx-auto mb-2 object-cover w-24 h-24"
                />
                <CardTitle>Gage Clifton</CardTitle>
                <p className="text-sm text-muted-foreground font-medium">
                  Head of Product
                </p>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Deep experience working with the nation&apos;s largest health
                insurance companies. Passionate about simplifying medical
                adherence.
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Image
                  src="/andrew-furman.jpg"
                  alt="Andrew Furman"
                  width={96}
                  height={96}
                  className="rounded-full mx-auto mb-2 object-cover w-24 h-24"
                />
                <CardTitle>Andrew Furman</CardTitle>
                <p className="text-sm text-muted-foreground font-medium">
                  Head of Engineering
                </p>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Experienced agentive AI developer with deep expertise in LLM
                integrations and voice agents for healthcare.
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Image
                  src="/tyler.jpg"
                  alt="Tyler Kaufman"
                  width={96}
                  height={96}
                  className="rounded-full mx-auto mb-2 object-cover w-24 h-24"
                />
                <CardTitle>Tyler Kaufman</CardTitle>
                <p className="text-sm text-muted-foreground font-medium">
                  Head of Partnerships
                </p>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Strategic partnerships leader with proven track record in
                performance marketing and revenue growth across healthcare and
                technology.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Slide 13: The Ask ── */}
      <section className="bg-muted py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">The Ask</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <Card className="text-center border-2 border-primary">
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Seed Round
                </p>
                <CardTitle className="text-5xl font-bold text-primary">
                  $3M&ndash;$5M
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Target raise amount
              </CardContent>
            </Card>
            <Card className="text-center border-2 border-primary/40">
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Pre-Money Valuation
                </p>
                <CardTitle className="text-4xl sm:text-5xl font-bold text-primary">
                  $12M&ndash;$18M
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Working product, 3 co-founders, $12.7B addressable market,
                AI voice healthcare sector raising at premium multiples
              </CardContent>
            </Card>
            <Card className="text-center border-2 border-primary/20">
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Round Structure
                </p>
                <CardTitle className="text-4xl font-bold text-primary">
                  SAFE / Priced
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Flexible structure for the right partners
              </CardContent>
            </Card>
          </div>
          <h3 className="text-2xl font-bold text-center mb-8">
            Use of Funds
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Engineering</CardTitle>
                  <span className="text-2xl font-bold text-primary">40%</span>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Build the dedicated tablet device and expand platform
                capabilities
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Pilot Programs</CardTitle>
                  <span className="text-2xl font-bold text-primary">25%</span>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Launch pilots with 2&ndash;3 Medicare Advantage plans
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Sales &amp; Partnerships
                  </CardTitle>
                  <span className="text-2xl font-bold text-primary">20%</span>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Build sales team targeting MA plan administrators and strategic
                partners
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Compliance &amp; Ops
                  </CardTitle>
                  <span className="text-2xl font-bold text-primary">15%</span>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Complete SOC 2 and HIPAA certifications
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Slide 14: Exit Strategy ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <Target className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Exit Strategy &amp; Strategic Landscape
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The medication adherence market is projected to grow from $4.9B to
              $9.4B by 2030 (14% CAGR), creating significant acquisition
              interest.
            </p>
          </div>
          <div className="max-w-4xl mx-auto rounded-xl border border-primary/30 bg-primary/5 p-5 text-center mb-12">
            <p className="text-foreground font-semibold text-base">
              Currently in active partnership conversations across all five
              acquirer categories
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                  <Star className="h-8 w-8 text-primary" />
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    Primary
                  </div>
                </div>
                <CardTitle className="text-lg">
                  Medicare Advantage Payers
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                UnitedHealth / Optum, Humana, CVS / Aetna, Elevance Health.
                Star Rating improvement directly impacts billions in CMS bonus
                payments.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Smartphone className="h-8 w-8 text-primary mb-1" />
                <CardTitle className="text-lg">
                  Health Tech Platforms
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Omnicell, Teladoc, Inovalon. Expanding chronic care and
                patient-facing adherence capabilities.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Pill className="h-8 w-8 text-primary mb-1" />
                <CardTitle className="text-lg">
                  Pharmacy Benefit Managers
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                CVS Caremark, Express Scripts. Direct interest in adherence for
                rebate optimization and plan performance.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <ShoppingCart className="h-8 w-8 text-primary mb-1" />
                <CardTitle className="text-lg">Retail Pharmacy</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Amazon Pharmacy, Walgreens. Building medication management
                ecosystems to increase patient lifetime value.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <FlaskConical className="h-8 w-8 text-primary mb-1" />
                <CardTitle className="text-lg">
                  Pharmaceutical Companies
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Pfizer, Lilly, AstraZeneca. Drug manufacturers benefit directly
                when patients stay on therapy longer.
              </CardContent>
            </Card>
          </div>
          <h3 className="text-2xl font-bold text-center mb-8">
            Comparable Exits in Healthcare
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl sm:text-4xl font-bold text-primary">
                  $8.0B
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                CVS &rarr; Signify Health
                <br />
                <span className="text-xs">MA quality improvement</span>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl sm:text-4xl font-bold text-primary">
                  $11.0B
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                KKR &rarr; Cotiviti
                <br />
                <span className="text-xs">Health plan analytics</span>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl sm:text-4xl font-bold text-primary">
                  $7.3B
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Nordic Capital &rarr; Inovalon
                <br />
                <span className="text-xs">Health plan SaaS</span>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl sm:text-4xl font-bold text-primary">
                  $753M
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Amazon &rarr; PillPack
                <br />
                <span className="text-xs">Medication management</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Slide 15: Contact ── */}
      <section className="bg-primary text-primary-foreground py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">
            Let&apos;s Talk
          </h2>
          <div className="space-y-3 text-lg">
            <p>
              <span className="opacity-75">Email:</span>{" "}
              <a
                href="mailto:investors@adherepod.com"
                className="underline underline-offset-4 hover:opacity-80 transition-opacity"
              >
                investors@adherepod.com
              </a>
            </p>
            <p>
              <span className="opacity-75">Phone:</span>{" "}
              <a
                href="tel:+12034709996"
                className="underline underline-offset-4 hover:opacity-80 transition-opacity"
              >
                203-470-9996
              </a>
            </p>
            <p>
              <span className="opacity-75">Website:</span>{" "}
              <a
                href="https://adherepod.com"
                className="underline underline-offset-4 hover:opacity-80 transition-opacity"
              >
                adherepod.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ── Sources ── */}
      <section className="py-12 px-4 sm:px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Sources
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
            <li>
              American College of Cardiology &mdash; Texting programs improve
              medication adherence in chronic disease
            </li>
            <li>
              Magellan Health Insights &mdash; Prescription Predicament: Impact
              of Rising Drug Costs on Adherence (2024)
            </li>
            <li>
              PQA Alliance &mdash; Medication Adherence Measures Help Medicare
              Avoid Up to $46.6B in Costs
            </li>
            <li>
              Becker&apos;s Payer Issues &mdash; Why Smart Plans Double Down on
              Medication Strategy for Star Ratings
            </li>
            <li>
              PAN Foundation &mdash; Medication Non-Adherence: A Common and
              Costly Problem
            </li>
            <li>
              BCBS Kansas &mdash; Can Employers and Payers Afford to Cover GLP-1
              Drugs?
            </li>
            <li>
              JMIR Formative Research &mdash; In-Home Medication Dispensing
              System Pilot Study (2022)
            </li>
            <li>
              CMS &mdash; $50 Billion Rural Health Transformation Program
              Announcement
            </li>
            <li>
              Tradeoffs &mdash; Breaking Down Trump&apos;s $50 Billion Rural Health
              Fund (2026)
            </li>
          </ol>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Heart className="h-5 w-5 text-red-500" />
            <span className="font-semibold">AdherePod</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            &copy; 2026 AdherePod. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
