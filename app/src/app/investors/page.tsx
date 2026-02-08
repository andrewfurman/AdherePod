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
            Voice-Native Medication Adherence
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
              Medication non-adherence is a $300 billion problem
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-5xl font-bold text-primary">
                  50%
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                of elderly patients don&apos;t follow treatment recommendations
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-5xl font-bold text-primary">
                  $300B
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                annual cost of medication non-adherence in the US
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-5xl font-bold text-primary">
                  125,000
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                deaths per year attributed to medication non-adherence
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-primary">
                  The Gap
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Current solutions require smartphone literacy that elderly
                patients lack
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Slide 3: Our Solution ── */}
      <section className="bg-muted py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Our Solution
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              AdherePod is a voice-native medication management platform
            </p>
          </div>
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative w-full aspect-[1200/630] rounded-xl overflow-hidden shadow-md">
              <Image src="/og/og-investors.png" alt="AdherePod in action" fill className="object-cover" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Voice-native</h3>
                <p className="text-muted-foreground">
                  No screens, no apps, no confusion
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Plug-and-play device
                </h3>
                <p className="text-muted-foreground">
                  A dedicated device for the home &mdash; just plug in and start
                  talking
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Pill className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  AI-powered assistant
                </h3>
                <p className="text-muted-foreground">
                  A voice assistant that knows your medications, schedule, and
                  interactions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Automated reminders
                </h3>
                <p className="text-muted-foreground">
                  Email and SMS reminders so no dose is ever missed
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Slide 4: How It Works ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            How It Works
          </h2>
          <div className="space-y-8">
            {[
              {
                num: "1",
                text: "Voice conversation to add and manage medications",
              },
              {
                num: "2",
                text: "Automated daily reminders via email and SMS",
              },
              {
                num: "3",
                text: "Camera-based pill identification",
              },
              {
                num: "4",
                text: "Caregiver dashboard for remote monitoring",
              },
            ].map((item) => (
              <div key={item.num} className="flex items-center gap-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  {item.num}
                </div>
                <p className="text-xl text-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Slide 5: Market Size ── */}
      <section className="bg-muted py-24 px-4 sm:px-6">
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
                  $300B
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

      {/* ── Slide 6: Business Model ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            Business Model
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <DollarSign className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">
                  B2B: Per-Member-Per-Month
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Medicare Advantage plans pay for adherence improvement. Revenue
                scales with enrolled member count.
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
                  Data Insights (Future)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Anonymized adherence analytics for pharmaceutical companies and
                health systems.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Slide 7: Traction ── */}
      <section className="bg-muted py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            What We&apos;ve Built
          </h2>
          <div className="space-y-5">
            {[
              "Working voice-native web app live at adherepod.com",
              "Real-time AI voice assistant with GPT-4o Realtime",
              "Medication CRUD with voice and web interfaces",
              "Email reminder system with SendGrid integration",
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

      {/* ── Slide 8: Why Now ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            Why Now
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: Star,
                text: "AI voice technology is finally good enough (GPT-4o Realtime API)",
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

      {/* ── Slide 9: Team ── */}
      <section className="bg-muted py-24 px-4 sm:px-6">
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

      {/* ── Slide 10: The Ask ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">The Ask</h2>
            <p className="text-4xl sm:text-5xl font-bold text-primary">
              Seed Round
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Engineering</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Build the dedicated tablet device and expand platform
                capabilities
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pilot Programs</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Launch pilots with 2-3 Medicare Advantage plans
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sales &amp; Marketing</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Build sales team targeting MA plan administrators
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compliance</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Complete SOC 2 and HIPAA certifications
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Slide 11: Contact ── */}
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
