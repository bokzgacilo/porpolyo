import type { Metadata } from "next";
import { Link, Text } from "@chakra-ui/react";
import {
  LegalList,
  LegalListItem,
  LegalPage,
  type LegalSection,
} from "../../components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms and Conditions | Porpolyo",
  description: "The terms that apply when using Porpolyo.",
};

const lastUpdated = "July 17, 2026";

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of these Terms",
    content: (
      <Text>
        These Terms and Conditions (“Terms”) govern your access to and use of
        Porpolyo (the “Service”). By accessing the Service, signing in, or creating a
        portfolio, you agree to these Terms and the Privacy Policy. If you do not agree,
        do not use the Service.
      </Text>
    ),
  },
  {
    id: "service",
    title: "The Service",
    content: (
      <Text>
        Porpolyo is a portfolio-building tool that lets users create, customize, save,
        preview, and publish portfolio websites. Features may include templates, design
        controls, image storage, project analytics, public portfolio links, and related
        tools. Some features may be experimental, incomplete, or changed over time.
      </Text>
    ),
  },
  {
    id: "eligibility-and-accounts",
    title: "Eligibility and accounts",
    content: (
      <>
        <Text>
          You must be legally able to enter into these Terms. The Service is not intended
          for children under 13, or a higher minimum age required by local law.
        </Text>
        <Text>
          Account access uses Google sign-in through Supabase. You are responsible for
          safeguarding your Google account and devices, for activity performed through
          your session, and for providing accurate information. Notify us promptly if
          you suspect unauthorized use.
        </Text>
      </>
    ),
  },
  {
    id: "user-content",
    title: "Your content and license to operate the Service",
    content: (
      <>
        <Text>
          You retain ownership of the text, images, links, portfolio information, and
          other material you submit (“User Content”). You represent that you own or have
          permission to use and publish that content and that it does not violate law or
          another person’s rights.
        </Text>
        <Text>
          You grant us a worldwide, non-exclusive, royalty-free license to host, store,
          reproduce, adapt for technical formatting, display, and distribute User Content
          only as reasonably necessary to operate, secure, and provide the Service. For
          published portfolios, this includes displaying content publicly at your chosen URL.
        </Text>
      </>
    ),
  },
  {
    id: "publishing",
    title: "Publishing and public information",
    content: (
      <>
        <Text>
          Drafts are intended to remain owner-accessible, but uploaded images currently
          use public storage URLs and should not be treated as confidential. When you
          publish a portfolio, its content and included contact information become public
          and may be copied, cached, indexed, or shared by others.
        </Text>
        <Text>
          You are responsible for reviewing your content before publishing, maintaining
          accurate contact and link information, and removing sensitive information you
          do not want publicly available.
        </Text>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: (
      <>
        <Text>You may not use the Service to:</Text>
        <LegalList>
          <LegalListItem>Break the law or facilitate unlawful, fraudulent, or deceptive activity.</LegalListItem>
          <LegalListItem>Infringe intellectual property, privacy, publicity, or other rights.</LegalListItem>
          <LegalListItem>Upload malware, harmful code, or content intended to disrupt systems.</LegalListItem>
          <LegalListItem>Attempt unauthorized access, bypass security, scrape excessively, or interfere with the Service.</LegalListItem>
          <LegalListItem>Impersonate others, misrepresent affiliation, harass, threaten, exploit, or abuse people.</LegalListItem>
          <LegalListItem>Publish illegal, sexually exploitative, or otherwise seriously harmful content.</LegalListItem>
          <LegalListItem>Use the Service in a way that places unreasonable load on its infrastructure.</LegalListItem>
        </LegalList>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party services and links",
    content: (
      <Text>
        The Service relies on third parties such as Google and Supabase and may display
        links supplied by users. We do not control third-party services, websites, terms,
        security, availability, or content. Your use of them is governed by their own terms
        and policies.
      </Text>
    ),
  },
  {
    id: "availability",
    title: "Changes, availability, and beta features",
    content: (
      <Text>
        We may modify, suspend, limit, or discontinue any part of the Service. We do not
        promise uninterrupted operation, permanent storage, compatibility with every
        browser or device, or that a public URL will always remain available. Keep your
        own copy of important content and exported project data.
      </Text>
    ),
  },
  {
    id: "deletion-and-suspension",
    title: "Deletion, suspension, and termination",
    content: (
      <>
        <Text>
          You may delete individual project records through project settings. Project
          deletion may not automatically remove previously uploaded image objects or your
          authentication account; contact us to request removal of remaining account data
          or files.
        </Text>
        <Text>
          We may suspend or terminate access, remove content, or preserve information when
          reasonably necessary to address violations, security threats, legal requests, or
          risk to users or the Service. Sections that by nature should survive termination,
          including ownership, disclaimers, liability, and dispute terms, will survive.
        </Text>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    content: (
      <Text>
        To the fullest extent permitted by law, the Service is provided “as is” and “as
        available,” without warranties of any kind, whether express, implied, or statutory,
        including warranties of merchantability, fitness for a particular purpose,
        non-infringement, accuracy, availability, or data preservation. We do not guarantee
        employment, clients, search ranking, traffic, or other results from a portfolio.
      </Text>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    content: (
      <Text>
        To the fullest extent permitted by law, Porpolyo and its developer will not be
        liable for indirect, incidental, special, consequential, exemplary, or punitive
        damages, or for loss of profits, opportunities, goodwill, content, or data arising
        from the Service. Where liability cannot be excluded, total liability will not
        exceed the amount you paid to use the Service during the 12 months before the claim,
        or USD 50 if you paid nothing. Mandatory consumer rights remain unaffected.
      </Text>
    ),
  },
  {
    id: "indemnity",
    title: "Indemnity",
    content: (
      <Text>
        To the extent permitted by law, you agree to defend, indemnify, and hold harmless
        Porpolyo and its developer from claims, losses, liabilities, and reasonable costs
        arising from your User Content, your misuse of the Service, or your violation of
        these Terms or another person’s rights.
      </Text>
    ),
  },
  {
    id: "law-and-disputes",
    title: "Applicable law and disputes",
    content: (
      <Text>
        These Terms are governed by the laws applicable where the developer is established,
        without overriding mandatory consumer protections that apply to you. Before filing
        a formal claim, you agree to contact us and attempt in good faith to resolve the
        dispute informally. Any unresolved dispute may be brought before a court with
        competent jurisdiction.
      </Text>
    ),
  },
  {
    id: "general",
    title: "General terms",
    content: (
      <Text>
        If any provision is unenforceable, the remaining provisions continue in effect.
        Failure to enforce a provision is not a waiver. You may not transfer these Terms
        without our consent; we may transfer them as part of a reorganization or transfer
        of the Service. These Terms and the Privacy Policy form the agreement concerning
        your use of Porpolyo.
      </Text>
    ),
  },
  {
    id: "changes-and-contact",
    title: "Changes and contact",
    content: (
      <>
        <Text>
          We may update these Terms as the Service changes. The revision date appears at
          the top. Continued use after updated Terms take effect means you accept them,
          to the extent permitted by law.
        </Text>
        <Text>
          Questions or notices: {" "}
          <Link href="mailto:bokzgacilo@gmail.com" color="blue.solid">
            bokzgacilo@gmail.com
          </Link>
          . Developer website: {" "}
          <Link href="https://bokzgacilo.com" target="_blank" rel="noreferrer" color="blue.solid">
            bokzgacilo.com
          </Link>
          .
        </Text>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal · Terms"
      title="Terms and Conditions"
      description="The rules for using Porpolyo, publishing your work, and keeping control of the content you create."
      lastUpdated={lastUpdated}
      sections={sections}
    />
  );
}
