import Link from "next/link";
import Image from "next/image";
import {
  Star,
  TrendingUp,
  DollarSign,
  Pill,
  Mic,
  Bell,
  Users,
  ArrowRight,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { AdherepodLogo } from "@/components/adherepod-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Medicare Advantage Star Ratings | AdherePod",
  description:
    "Improve your Medicare Advantage Star Ratings with voice-native medication adherence technology. Target PDC measures D08, D09, D10.",
  openGraph: {
    title: "Medicare Advantage Star Ratings | AdherePod",
    description:
      "Improve your Medicare Advantage Star Ratings with voice-native medication adherence technology.",
    images: [{ url: "/og/og-medicare.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/og-medicare.png"],
  },
};

export default function MedicareAdvantagePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AdherepodLogo size={64} />
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
      <section className="py-20 px-4 sm:px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <Star className="h-14 w-14 mx-auto mb-6 opacity-90" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Improve Your Star Ratings with Better Medication Adherence
          </h1>
          <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto mb-8">
            Medicare Advantage plans lose millions in quality bonus payments due
            to medication non-adherence. AdherePod&apos;s voice-native platform
            targets the hardest-to-reach populations.
          </p>
          <a href="mailto:sales@adherepod.com">
            <Button size="lg" variant="secondary">
              Schedule a Demo
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </a>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 px-4 sm:px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <TrendingUp className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">
              The Medication Adherence Problem
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Non-adherence is the single largest driver of preventable
              healthcare costs in the United States.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                stat: "50%",
                desc: "of elderly patients don\u2019t follow medication recommendations",
              },
              {
                stat: "$300B",
                desc: "in avoidable healthcare costs from non-adherence annually",
              },
              {
                stat: "10%",
                desc: "of hospitalizations caused by medication non-adherence",
              },
              {
                stat: "36\u201359%",
                desc: "adherence rates for diabetes medications in elderly populations",
              },
            ].map((item) => (
              <Card key={item.stat} className="text-center">
                <CardHeader>
                  <CardTitle className="text-3xl sm:text-4xl text-primary">
                    {item.stat}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  {item.desc}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Stars Matter */}
      <section className="py-20 px-4 sm:px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <DollarSign className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Why Star Ratings Matter</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The 4-star threshold is the most important financial milestone for
              any Medicare Advantage plan.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {[
              {
                stat: "5%",
                desc: "quality bonus payment from CMS for plans achieving 4+ stars",
              },
              {
                stat: "70% vs 65%",
                desc: "rebate difference between 4.5\u20135.0 star plans and 3.5\u20134.0 star plans",
              },
              {
                stat: "13.4\u201317.6%",
                desc: "revenue increase from improving 3-star to 4-star rating",
              },
              {
                stat: "Only 40%",
                desc: "of MA contracts currently earn 4+ stars",
              },
            ].map((item) => (
              <Card key={item.stat} className="text-center">
                <CardHeader>
                  <CardTitle className="text-2xl sm:text-3xl text-primary">
                    {item.stat}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  {item.desc}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-muted-foreground text-center text-base leading-relaxed">
              The Medicare Advantage Star Rating system directly impacts revenue
              through quality bonus payments. Plans rated 4 stars or above
              receive a 5% bonus on their benchmark payments. For a plan with
              100,000 members, this can mean tens of millions in additional
              revenue.
            </p>
          </div>
        </div>
      </section>

      {/* The Three Measures That Matter Most */}
      <section className="py-20 px-4 sm:px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Pill className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">
              The Three Measures That Matter Most
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Part D medication adherence measures are triple-weighted in the
              Star Rating calculation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold w-fit mb-2">
                  D08
                </div>
                <CardTitle className="text-xl">Diabetes Medications</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Proportion of Days Covered (PDC) &gt;= 80% for diabetes
                medications. Includes oral diabetes drugs and insulin.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold w-fit mb-2">
                  D09
                </div>
                <CardTitle className="text-xl">
                  Hypertension (RASAs)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Proportion of Days Covered (PDC) &gt;= 80% for Renin
                Angiotensin System Antagonists. Critical for blood pressure
                management.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold w-fit mb-2">
                  D10
                </div>
                <CardTitle className="text-xl">
                  Cholesterol (Statins)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Proportion of Days Covered (PDC) &gt;= 80% for statin
                medications. Essential for cardiovascular risk reduction.
              </CardContent>
            </Card>
          </div>
          <div className="max-w-4xl mx-auto rounded-xl border border-amber-300 bg-amber-50 p-6 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-3 text-amber-600" />
            <p className="text-amber-900 font-semibold text-base leading-relaxed">
              Triple-weighted &mdash; these 3 Part D adherence measures account
              for approximately 1/3 of your entire Part D Star Rating. Improving
              medication adherence is the single highest-leverage action for Star
              Rating improvement.
            </p>
          </div>
        </div>
      </section>

      {/* Image */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="relative w-full aspect-[1200/630] rounded-xl overflow-hidden shadow-md">
          <Image src="/og/og-medicare.png" alt="Medicare Advantage Star Ratings" fill className="object-cover" />
        </div>
      </div>

      {/* How AdherePod Helps */}
      <section className="py-20 px-4 sm:px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Mic className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">How AdherePod Helps</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A voice-native device designed from the ground up for the
              populations that need it most.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Voice-native design for elderly and low-literacy populations \u2014 the hardest-to-reach members",
              "Daily medication reminders targeting PDC >= 80% threshold",
              "Specifically designed for diabetes, hypertension, and cholesterol medications",
              "No smartphone or app literacy required",
              "Proactive adherence tracking and caregiver alerts",
              "Plug-and-play device that works out of the box",
            ].map((text) => (
              <Card key={text}>
                <CardContent className="flex items-start gap-3 pt-6">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <p className="text-foreground text-sm leading-relaxed">
                    {text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Example */}
      <section className="py-20 px-4 sm:px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <DollarSign className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Return on Investment</h2>
          </div>
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                For a plan with 100,000 members:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground text-base leading-relaxed text-center">
                Improving medication adherence from 70% to 80% PDC across
                diabetes, hypertension, and statin measures could improve your
                Star Rating by{" "}
                <span className="font-bold text-primary">0.5&ndash;1.0 stars</span>.
              </p>
              <p className="text-foreground text-base leading-relaxed text-center">
                At 4+ stars, that&apos;s approximately{" "}
                <span className="font-bold text-primary text-2xl">$50M+</span>{" "}
                in additional annual quality bonus payments.
              </p>
              <p className="text-muted-foreground text-xs text-center pt-4 border-t border-border">
                Estimates based on publicly available CMS quality bonus payment
                data. Actual results vary.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <Users className="h-10 w-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">
            Ready to improve your Star Ratings?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            See how AdherePod can help your plan reach the 4-star threshold and
            unlock millions in quality bonus payments.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href="mailto:sales@adherepod.com">
              <Button size="lg" variant="secondary">
                Schedule a Demo
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </a>
            <Link href="/device">
              <Button
                size="lg"
                variant="secondary"
              >
                Learn More About the Device
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <AdherepodLogo size={20} />
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
