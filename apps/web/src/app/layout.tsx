import type { Metadata } from "next";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://zeroreject.gov.in";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "ZeroReject (PramaanFix) — Sovereign Pre-Submission Digital Governance Audit",
    template: "%s | ZeroReject (PramaanFix)",
  },
  description:
    "Autonomous pre-flight cross-document mismatch reconciler and self-healing bureaucracy engine eliminating >60% citizen rejection traps across Indian digital governance portals (EPFO, Passport Seva, e-District, NSP).",
  keywords: [
    "ZeroReject",
    "PramaanFix",
    "civic tech",
    "digital governance",
    "Aadhaar PAN name mismatch",
    "e-District automation",
    "OpenCV document normalizer",
    "Playwright bureaucracy agent",
    "India public services",
    "indic phonetics",
    "double metaphone",
    "statutory affidavit generator",
    "FORGE '26 Hackathon",
    "Track 1 Civic Pulse",
  ],
  authors: [{ name: "ZeroReject Autonomous Engineering Team", url: APP_URL }],
  creator: "ZeroReject Core Architecture Group",
  publisher: "ZeroReject Sovereign Civic Systems",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ZeroReject (PramaanFix) — Sovereign Pre-Submission Digital Governance Audit",
    description:
      "Autonomous pre-flight document reconciliation & self-healing digital governance agent. 100% Free AI stack, deterministic Indic phonetics, and adaptive OpenCV compiler.",
    url: APP_URL,
    siteName: "ZeroReject (PramaanFix)",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZeroReject (PramaanFix) — Sovereign Pre-Flight Digital Bureaucracy Reconciler",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZeroReject (PramaanFix) — Pre-Flight Bureaucracy Reconciler",
    description:
      "Autonomous pre-flight cross-document mismatch reconciler and self-healing bureaucracy agent for Indian public governance.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "ZeroReject (PramaanFix)",
      "applicationCategory": "GovernmentApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR",
      },
      "featureList": [
        "Indic Phonetic Name Reconciliation (Double Metaphone + Jaro-Winkler)",
        "Deterministic OpenCV Document Byte & Pixel Compaction",
        "Statutory 'One-and-the-Same Person' Affidavit Synthesis (ReportLab)",
        "Self-Healing Playwright Execution Agent with Checkpoint Recovery",
        "100% Free Multimodal OCR and Local Statutory RAG",
      ],
      "license": "https://opensource.org/licenses/MIT",
    },
    {
      "@type": "GovernmentService",
      "serviceType": "Public Governance Document Pre-Submission Verification",
      "provider": {
        "@type": "Organization",
        "name": "ZeroReject Sovereign Civic Systems",
        "url": APP_URL,
      },
      "areaServed": {
        "@type": "Country",
        "name": "India",
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "Indian Citizens, MSMEs, and Common Service Center (CSC) Operators",
      },
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Why do over 60% of citizen applications fail on Indian government portals?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Applications predominantly fail due to cross-script name variations (e.g., Devanagari to Latin initials), strict biometric file upload constraints (e.g., signatures strictly between 10KB and 20KB at 140x60px), and fragile portal sessions vulnerable to 502 Bad Gateway timeouts.",
          },
        },
        {
          "@type": "Question",
          "name": "How does ZeroReject reconcile name mismatches without guessing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "ZeroReject strictly enforces deterministic Indic phonetic reconciliation using a weighted composite of Double Metaphone, Jaro-Winkler similarity, and Token-Sort Levenshtein distance, grounded in official Passport Seva Annexure 'E' and EPFO Joint Declaration statutory rules.",
          },
        },
        {
          "@type": "Question",
          "name": "Does ZeroReject require paid API keys to operate?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. ZeroReject runs 100% free out-of-the-box using local CPU OCR (Pytesseract/EasyOCR), BM25 hybrid statutory RAG, and an intelligent 4-tier free LLM router (Groq free tier, OpenRouter :free models, local Ollama, or deterministic fallback legal compiler).",
          },
        },
        {
          "@type": "Question",
          "name": "How does the Playwright agent handle government portal crashes?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The agent maintains a stateful checkpoint journal. When an HTTP 502 or network glitch occurs, it automatically rolls back to the last verified step, adapts DOM selectors, and resumes filing seamlessly without losing citizen inputs, pausing only at the final OTP consent gate.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="min-h-screen bg-[#F6F4EE] text-[#111625] antialiased selection:bg-[#162A45] selection:text-white">
        {/* Semantic Accessibility Landmark: Skip to Content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 bg-[#162A45] text-white px-4 py-2 rounded-md font-mono text-xs shadow-lg outline-none"
        >
          Skip to main content
        </a>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
