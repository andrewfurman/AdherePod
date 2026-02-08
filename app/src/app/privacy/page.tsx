import Link from "next/link";
import { Heart } from "lucide-react";

export const metadata = {
  title: "Privacy Policy & Terms of Service | AdherePod",
  description:
    "Privacy Policy, Terms of Service, and SMS consent information for AdherePod medication adherence platform.",
};

export default function PrivacyPage() {
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
            &larr; Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">
          Privacy Policy &amp; Terms of Service
        </h1>
        <p className="text-muted-foreground mb-12">
          Last updated: February 7, 2026
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* About AdherePod                                                   */}
        {/* ---------------------------------------------------------------- */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-3">About AdherePod</h2>
          <div className="border border-border rounded-lg p-6 space-y-3">
            <p className="text-muted-foreground leading-relaxed">
              AdherePod is a voice-native medication adherence platform designed
              for elderly and low-literacy users. We help patients manage their
              medications through simple voice conversation and automated
              reminders.
            </p>
            <ul className="text-muted-foreground text-sm space-y-1">
              <li>
                <strong>Address:</strong> 1700 Manor Rd, Havertown, PA 19083
              </li>
              <li>
                <strong>Phone:</strong> 203-470-9996
              </li>
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:support@adherepod.com"
                  className="underline hover:text-foreground"
                >
                  support@adherepod.com
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* SMS Opt-In Form                                                   */}
        {/* ---------------------------------------------------------------- */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-3">
            SMS Medication Reminders
          </h2>
          <div className="border border-border rounded-lg p-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Enter your phone number below to opt in to SMS medication
              reminders from AdherePod.
            </p>

            {/* Phone number input */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium mb-1"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="(555) 555-5555"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled
              />
            </div>

            {/* Consent checkbox */}
            <div className="flex items-start gap-3">
              <input
                id="sms-consent"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border"
                disabled
              />
              <label
                htmlFor="sms-consent"
                className="text-sm text-muted-foreground leading-relaxed"
              >
                By checking this box, you agree to receive SMS/text messages
                from AdherePod regarding your medication reminders and health
                notifications. Message frequency varies. Message and data rates
                may apply. Reply STOP to opt out, HELP for help. View our{" "}
                <a href="#privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="#terms" className="underline hover:text-foreground">
                  Terms of Service
                </a>
                .
              </label>
            </div>

            {/* Submit button */}
            <button
              disabled
              className="inline-flex items-center justify-center rounded-md bg-primary/50 px-4 py-2 text-sm font-medium text-primary-foreground cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </section>

        {/* ================================================================ */}
        {/* PRIVACY POLICY                                                    */}
        {/* ================================================================ */}
        <section id="privacy" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-bold mb-1">Privacy Policy</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Effective Date: February 7, 2026
          </p>

          {/* 1 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">1. Introduction</h3>
            <p className="text-muted-foreground leading-relaxed">
              AdherePod (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
              respects your privacy and is committed to protecting your personal
              and health information. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you use
              our medication adherence platform, including our website, voice
              assistant, email services, and SMS/text messaging services.
            </p>
          </div>

          {/* 2 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">
              2. Information We Collect
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We may collect the following types of information:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2 text-muted-foreground leading-relaxed">
              <li>
                <strong>Personal Information:</strong> Name, email address,
                phone number
              </li>
              <li>
                <strong>Medication Data:</strong> Medication names, dosages,
                schedules, reminder preferences
              </li>
              <li>
                <strong>Voice Conversation Transcripts:</strong> Recordings and
                transcripts of interactions with our voice assistant
              </li>
              <li>
                <strong>Health Information:</strong> Information related to your
                medications and adherence patterns
              </li>
              <li>
                <strong>Usage Data:</strong> Device information, browser type, IP
                address, pages visited, and interaction patterns
              </li>
            </ul>
          </div>

          {/* 3 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">
              3. SMS/Text Messaging
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              If you opt in to receive SMS/text messages from AdherePod, we will
              send you medication reminders, health notifications, and account
              updates via text message. Message frequency varies based on your
              medication schedule and preferences. Message and data rates may
              apply. You can opt out at any time by replying <strong>STOP</strong>{" "}
              to any message. For help, reply <strong>HELP</strong> or contact us
              at support@adherepod.com or 203-470-9996.
            </p>
          </div>

          {/* 4 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">
              4. SMS Data Sharing
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">
                We do not share, sell, rent, or otherwise disclose your phone
                number or SMS opt-in data with any third parties or affiliates
                for marketing or promotional purposes.
              </strong>
            </p>
          </div>

          {/* 5 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">
              5. How We Use Your Information
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2 text-muted-foreground leading-relaxed">
              <li>Send medication reminders via email and SMS</li>
              <li>Deliver daily medication summary reports</li>
              <li>
                Send account notifications (password resets, security alerts)
              </li>
              <li>Improve and optimize our services and user experience</li>
              <li>
                Provide voice assistant functionality for medication management
              </li>
            </ul>
          </div>

          {/* 6 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">6. Data Security</h3>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your
              data:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2 text-muted-foreground leading-relaxed">
              <li>
                <strong>Encryption at rest:</strong> AES-256 encryption via
                Neon/AWS for all stored data
              </li>
              <li>
                <strong>Encryption in transit:</strong> TLS encryption for all
                data transmitted between your device and our servers
              </li>
              <li>
                <strong>Password hashing:</strong> bcrypt hashing algorithm for
                all user passwords
              </li>
              <li>
                <strong>Encrypted sessions:</strong> JWT-based encrypted session
                tokens
              </li>
            </ul>
          </div>

          {/* 7 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">7. Your Rights</h3>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2 text-muted-foreground leading-relaxed">
              <li>
                <strong>Access:</strong> Request a copy of the personal
                information we hold about you
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate or
                incomplete information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information
              </li>
              <li>
                <strong>Opt-Out of SMS:</strong> Reply <strong>STOP</strong> to
                any SMS message to immediately opt out of text messaging
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:support@adherepod.com"
                className="underline hover:text-foreground"
              >
                support@adherepod.com
              </a>{" "}
              or call 203-470-9996.
            </p>
          </div>
        </section>

        {/* Divider */}
        <hr className="border-border mb-12" />

        {/* ================================================================ */}
        {/* TERMS OF SERVICE                                                  */}
        {/* ================================================================ */}
        <section id="terms" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-bold mb-1">Terms of Service</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Effective Date: February 7, 2026
          </p>

          {/* 1 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">1. Introduction</h3>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service (&quot;Terms&quot;) govern your use of the
              AdherePod platform, including our website, voice assistant, email
              services, and SMS/text messaging services (collectively, the
              &quot;Services&quot;). By accessing or using our Services, you
              agree to be bound by these Terms. If you do not agree, please do
              not use our Services.
            </p>
          </div>

          {/* 2 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">2. Services</h3>
            <p className="text-muted-foreground leading-relaxed">
              AdherePod provides a medication adherence platform that includes:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2 text-muted-foreground leading-relaxed">
              <li>
                Voice-powered medication management assistant
              </li>
              <li>
                Automated email medication reminders and daily summaries
              </li>
              <li>
                SMS/text message medication reminders
              </li>
              <li>
                Pill identification assistance
              </li>
              <li>
                Medication tracking and adherence reporting
              </li>
            </ul>
          </div>

          {/* 3 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">
              3. SMS/Text Messaging Terms
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              By opting in to AdherePod SMS services, you consent to receive the
              following types of text messages:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2 text-muted-foreground leading-relaxed">
              <li>
                <strong>Medication reminders:</strong> Alerts when it is time to
                take your medications
              </li>
              <li>
                <strong>Health notifications:</strong> Important updates about
                your medication schedule
              </li>
              <li>
                <strong>Account updates:</strong> Security alerts and account
                verification messages
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Message frequency varies based on your medication schedule and
              account activity. Message and data rates may apply depending on
              your mobile carrier and plan. AdherePod is not responsible for any
              fees charged by your carrier.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong>Opt-Out:</strong> You may opt out of SMS messages at any
              time by replying <strong>STOP</strong> to any message you receive
              from us. After opting out, you will receive a one-time
              confirmation message. You will no longer receive SMS messages from
              AdherePod unless you opt in again.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong>Help:</strong> For assistance, reply <strong>HELP</strong>{" "}
              to any message, email us at{" "}
              <a
                href="mailto:support@adherepod.com"
                className="underline hover:text-foreground"
              >
                support@adherepod.com
              </a>
              , or call 203-470-9996.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong>Carrier Liability:</strong> Carriers are not liable for
              delayed or undelivered messages. AdherePod does not guarantee
              message delivery and is not responsible for messages that are not
              received due to carrier issues, device incompatibility, or other
              factors outside our control.
            </p>
          </div>

          {/* 4 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">
              4. Health Information Disclaimer
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              <strong>AdherePod is NOT a medical device and does NOT provide
              medical advice.</strong> The information and services provided by
              AdherePod are intended solely to assist with medication adherence
              and are not a substitute for professional medical advice,
              diagnosis, or treatment. Always seek the advice of your physician
              or other qualified health provider with any questions you may have
              regarding a medical condition or medication. Never disregard
              professional medical advice or delay seeking it because of
              information provided by AdherePod.
            </p>
          </div>

          {/* 5 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">
              5. Intellectual Property
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              All content, features, and functionality of the AdherePod platform
              — including but not limited to text, graphics, logos, icons,
              images, audio, software, and the overall design — are the
              exclusive property of AdherePod and are protected by United States
              and international copyright, trademark, and other intellectual
              property laws. You may not reproduce, distribute, modify, or
              create derivative works from any content without our prior written
              consent.
            </p>
          </div>

          {/* 6 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">
              6. Limitation of Liability
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by applicable law, AdherePod and
              its officers, directors, employees, and agents shall not be liable
              for any indirect, incidental, special, consequential, or punitive
              damages, or any loss of profits or revenues, whether incurred
              directly or indirectly, or any loss of data, use, goodwill, or
              other intangible losses resulting from (a) your use of or
              inability to use the Services; (b) any unauthorized access to or
              use of our servers or any personal information stored therein; (c)
              any interruption or cessation of transmission to or from the
              Services; or (d) any bugs, viruses, or the like that may be
              transmitted through the Services by any third party.
            </p>
          </div>

          {/* 7 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">
              7. Changes to Terms
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. If we make
              material changes, we will notify you by email or through a
              prominent notice on our platform. Your continued use of the
              Services after any changes become effective constitutes your
              acceptance of the revised Terms. We encourage you to review these
              Terms periodically.
            </p>
          </div>

          {/* 8 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">8. Contact Us</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service or our
              Privacy Policy, please contact us:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2 text-muted-foreground leading-relaxed">
              <li>
                <strong>Phone:</strong> 203-470-9996
              </li>
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:support@adherepod.com"
                  className="underline hover:text-foreground"
                >
                  support@adherepod.com
                </a>
              </li>
              <li>
                <strong>Address:</strong> 1700 Manor Rd, Havertown, PA 19083
              </li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-8 mt-12 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Home
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            &copy; 2026 AdherePod. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
