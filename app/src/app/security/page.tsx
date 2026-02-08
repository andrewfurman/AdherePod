import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Shield,
  Lock,
  Key,
  Users,
  Database,
  FileCheck,
  Eye,
  Trash2,
  Server,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Security & Compliance | AdherePod",
  description:
    "Learn about AdherePod's security measures and SOC 2 / HIPAA compliance progress.",
  openGraph: {
    title: "Security & Compliance | AdherePod",
    description:
      "Learn about AdherePod's security measures and SOC 2 / HIPAA compliance progress.",
    images: [{ url: "/og/og-security.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/og-security.png"],
  },
};

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "Encryption at Rest",
      description:
        "All data encrypted with AES-256 via Neon PostgreSQL on AWS with KMS key management.",
    },
    {
      icon: Shield,
      title: "Encryption in Transit",
      description:
        "TLS 1.2/1.3 encryption on all connections. All API endpoints served over HTTPS.",
    },
    {
      icon: Key,
      title: "Password Security",
      description:
        "Passwords hashed with bcrypt. Minimum 8 characters required. Never stored in plain text.",
    },
    {
      icon: Lock,
      title: "Encrypted Sessions",
      description:
        "JWE (JSON Web Encryption) tokens via NextAuth v5 for tamper-proof session management.",
    },
    {
      icon: Users,
      title: "Role-Based Access Control",
      description:
        "Admin and user roles with server-side enforcement on all API routes.",
    },
    {
      icon: Key,
      title: "Secure Password Reset",
      description:
        "Cryptographically random tokens (crypto.randomBytes), SHA-256 hashed, with 1-hour expiry.",
    },
    {
      icon: Shield,
      title: "CSRF Protection",
      description:
        "Built-in Cross-Site Request Forgery protection via NextAuth framework.",
    },
    {
      icon: FileCheck,
      title: "Audit Logging",
      description:
        "Email delivery tracking with SendGrid webhooks. Voice conversation logging with full transcripts.",
    },
    {
      icon: Trash2,
      title: "Cascade Data Deletion",
      description:
        "When a user account is deleted, all associated data (medications, conversations, emails) is automatically removed.",
    },
    {
      icon: Eye,
      title: "Per-User Data Isolation",
      description:
        "All API routes scoped to authenticated user. No cross-user data access possible.",
    },
  ];

  const infrastructurePartners = [
    {
      name: "Vercel",
      certifications: "SOC 2 Type II, ISO 27001, HIPAA-eligible",
      description: "Application hosting and serverless functions",
    },
    {
      name: "Neon",
      certifications: "SOC 2 Type II, HIPAA-compliant, BAA available",
      description: "Serverless PostgreSQL database",
    },
    {
      name: "SendGrid / Twilio",
      certifications: "SOC 2 Type II",
      description: "Email delivery and SMS services",
    },
    {
      name: "Vanta",
      certifications: "Compliance automation",
      description: "Continuous security monitoring and compliance management",
    },
  ];

  const roadmapItems = [
    "Business Associate Agreements (BAAs) with all vendors",
    "Formal HIPAA risk assessment",
    "Third-party penetration testing",
    "Multi-factor authentication (MFA)",
    "Enhanced audit logging and monitoring",
    "Written security policies and incident response plan",
  ];

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
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Security &amp; Compliance
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Protecting your health data with enterprise-grade security. We take
            the privacy and security of your medication and health information
            seriously.
          </p>
        </div>
      </section>

      {/* Compliance Roadmap */}
      <section className="py-16 px-4 sm:px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Compliance Roadmap
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SOC 2 Type II */}
            <div className="border border-border rounded-lg p-6 bg-background">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">SOC 2 Type II</h3>
                <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-medium">
                  In Progress
                </span>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Partnered with Vanta
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                SOC 2 Type II certification demonstrates that AdherePod has
                established and follows strict information security policies. We
                are actively working through the Vanta compliance automation
                platform to achieve this certification.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Expected 2026</span>
              </div>
            </div>

            {/* HIPAA */}
            <div className="border border-border rounded-lg p-6 bg-background">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">HIPAA</h3>
                <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-medium">
                  In Progress
                </span>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Partnered with Vanta
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                HIPAA compliance ensures we meet the strict requirements for
                protecting electronic Protected Health Information (ePHI). As a
                healthcare platform handling medication data and voice
                conversations, HIPAA compliance is a top priority.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Expected 2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Have Today */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            What We Have Today
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Our current security measures protect your data at every layer of
            the application.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityFeatures.map((feature) => (
              <div
                key={feature.title}
                className="border border-border rounded-lg p-6 bg-background"
              >
                <feature.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure Partners */}
      <section className="py-16 px-4 sm:px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Infrastructure Partners
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            We build on trusted, compliance-ready infrastructure from
            industry-leading providers.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {infrastructurePartners.map((partner) => (
              <div
                key={partner.name}
                className="border border-border rounded-lg p-6 bg-background text-center"
              >
                <Server className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{partner.name}</h3>
                <p className="text-xs font-medium text-primary mb-2">
                  {partner.certifications}
                </p>
                <p className="text-muted-foreground text-sm">
                  {partner.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="relative w-full aspect-[1200/630] rounded-xl overflow-hidden shadow-md">
          <Image src="/og/og-security.png" alt="Healthcare data security" fill className="object-cover" />
        </div>
      </div>

      {/* What We're Working On */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            What We&apos;re Working On
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Our ongoing efforts to strengthen security and achieve full
            compliance.
          </p>
          <div className="max-w-2xl mx-auto space-y-4">
            {roadmapItems.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 border border-border rounded-lg p-4 bg-background"
              >
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4 sm:px-6 bg-muted">
        <div className="max-w-4xl mx-auto text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl font-bold mb-4">Security Questions?</h2>
          <p className="text-muted-foreground text-lg mb-2">
            For security questions or to report a vulnerability, contact us at{" "}
            <a
              href="mailto:support@adherepod.com"
              className="text-primary hover:underline font-medium"
            >
              support@adherepod.com
            </a>
          </p>
          <p className="text-muted-foreground text-lg">
            Phone:{" "}
            <a
              href="tel:203-470-9996"
              className="text-primary hover:underline font-medium"
            >
              203-470-9996
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
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
