import type { Metadata } from "next";
import { Link, Text } from "@chakra-ui/react";
import {
  LegalList,
  LegalListItem,
  LegalPage,
  type LegalSection,
} from "../../components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Porpolyo",
  description: "How Porpolyo collects, uses, stores, and shares personal information.",
};

const lastUpdated = "July 17, 2026";

const sections: LegalSection[] = [
  {
    id: "scope",
    title: "Scope and who we are",
    content: (
      <>
        <Text>
          This Privacy Policy explains how Porpolyo (the “Service,” “we,” “us,” or
          “our”) handles information when you visit, sign in, build, save, or publish
          a portfolio. Porpolyo is developed and operated by the developer identified
          at bokzgacilo.com.
        </Text>
        <Text>
          This policy covers Porpolyo and its portfolio-building features. A published
          portfolio may contain links to third-party websites that follow their own
          privacy practices.
        </Text>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    content: (
      <>
        <Text>We collect the information needed to provide the Service:</Text>
        <LegalList>
          <LegalListItem>
            <strong>Account and authentication information.</strong> When you sign in
            with Google, Google and Supabase may provide an account identifier, email
            address, display name, profile image, and authentication metadata. We do
            not receive your Google password.
          </LegalListItem>
          <LegalListItem>
            <strong>Portfolio and profile information.</strong> This includes project
            IDs and titles, public usernames, template and palette choices, profile
            details, professional information, email address, optional phone number,
            contact information, location, biography, social links, portfolio sections,
            project content, design settings, publishing status, SEO and social-sharing
            metadata, and created or updated timestamps.
          </LegalListItem>
          <LegalListItem>
            <strong>Uploaded images.</strong> We store images you upload for profiles,
            projects, favicons, and social previews, together with related file and
            portfolio information such as the storage path, slot, and alternative text.
          </LegalListItem>
          <LegalListItem>
            <strong>Basic usage and technical information.</strong> Porpolyo may store
            daily view totals for a published project. Supabase, hosting, domain, and
            network providers may also process standard request and security data such
            as IP address, browser or device information, timestamps, and diagnostic
            logs when delivering the Service.
          </LegalListItem>
        </LegalList>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    content: (
      <LegalList>
        <LegalListItem>Authenticate you and maintain your session.</LegalListItem>
        <LegalListItem>Create, save, edit, preview, publish, and delete portfolio projects.</LegalListItem>
        <LegalListItem>Store and serve uploaded images and published portfolio content.</LegalListItem>
        <LegalListItem>Display basic project analytics and operate security controls.</LegalListItem>
        <LegalListItem>Maintain, troubleshoot, protect, and improve the Service.</LegalListItem>
        <LegalListItem>Respond to support, privacy, legal, or abuse requests.</LegalListItem>
      </LegalList>
    ),
  },
  {
    id: "public-content",
    title: "Drafts, published portfolios, and public images",
    content: (
      <>
        <Text>
          Draft project records are intended to be available only to the signed-in
          owner. When you publish, the selected portfolio content becomes publicly
          available at its public username URL and may be viewed, shared, cached, or
          indexed by search engines and other third parties.
        </Text>
        <Text>
          Porpolyo currently generates public Supabase Storage URLs for uploaded
          images. Anyone with an image URL may be able to access it, even if the image
          was uploaded while a portfolio was still a draft. Do not upload confidential,
          sensitive, or third-party material you are not authorized to publish.
        </Text>
      </>
    ),
  },
  {
    id: "browser-storage",
    title: "Browser storage and sessions",
    content: (
      <>
        <Text>
          Supabase Auth stores and refreshes authentication session information in your
          browser so you can remain signed in. This may include access and refresh
          tokens. You can clear browser site data to remove locally stored session
          information, although server-side session records may continue until they
          expire or are revoked.
        </Text>
        <Text>
          Porpolyo does not currently use advertising cookies or third-party behavioral
          advertising trackers. If that changes, this policy will be updated and any
          consent required by applicable law will be requested.
        </Text>
      </>
    ),
  },
  {
    id: "sharing",
    title: "How information is shared",
    content: (
      <>
        <Text>We do not sell personal information. Information may be shared with:</Text>
        <LegalList>
          <LegalListItem>
            <strong>Supabase,</strong> which provides authentication, database, and file
            storage infrastructure.
          </LegalListItem>
          <LegalListItem>
            <strong>Google,</strong> when you choose Google OAuth for sign-in.
          </LegalListItem>
          <LegalListItem>
            <strong>Hosting, domain, network, and technical providers</strong> that help
            deliver, secure, and maintain the Service.
          </LegalListItem>
          <LegalListItem>
            <strong>The public,</strong> for content and contact details that you choose
            to publish in a portfolio.
          </LegalListItem>
          <LegalListItem>
            <strong>Authorities or other parties</strong> when reasonably necessary to
            comply with law, protect rights and safety, investigate abuse, or complete
            a business transfer.
          </LegalListItem>
        </LegalList>
      </>
    ),
  },
  {
    id: "retention-and-deletion",
    title: "Retention and deletion",
    content: (
      <>
        <Text>
          Project records are generally kept while you use the Service. Deleting a
          portfolio through the project controls removes its project database record,
          subject to operational backups and legal requirements.
        </Text>
        <Text>
          At present, deleting a project does not necessarily delete its previously
          uploaded image objects or your Supabase authentication account. To request
          deletion of remaining files, account information, or other personal data,
          email us. We may retain limited records where reasonably necessary for
          security, fraud prevention, dispute resolution, or legal compliance.
        </Text>
      </>
    ),
  },
  {
    id: "security-and-transfers",
    title: "Security and international processing",
    content: (
      <>
        <Text>
          We use reasonable technical and organizational measures, including Supabase
          authentication and owner-scoped data access, to protect information. No
          online system is completely secure, and we cannot guarantee absolute security.
        </Text>
        <Text>
          Porpolyo and its providers may process information in countries other than
          yours. Those countries may have different data-protection rules. Where
          required, service providers use measures intended to protect transferred data.
        </Text>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your choices and privacy rights",
    content: (
      <>
        <Text>
          Depending on where you live, you may have rights to access, correct, delete,
          restrict, object to, or receive a copy of your personal information, and to
          withdraw consent where processing relies on consent. You may edit portfolio
          information in the builder and delete individual projects from project settings.
        </Text>
        <Text>
          To make another request, contact us using the details below. We may need to
          verify your identity before completing a request. You may also have the right
          to complain to your local data-protection authority.
        </Text>
      </>
    ),
  },
  {
    id: "children",
    title: "Children’s privacy",
    content: (
      <Text>
        The Service is not directed to children under 13, or a higher minimum age where
        required by local law. If you believe a child has provided personal information
        without appropriate permission, contact us so we can review and remove it.
      </Text>
    ),
  },
  {
    id: "changes-and-contact",
    title: "Changes and contact",
    content: (
      <>
        <Text>
          We may update this policy as the Service, providers, or legal requirements
          change. The date at the top shows the latest revision. Material changes may
          also be communicated through the Service where appropriate.
        </Text>
        <Text>
          Privacy questions and requests: {" "}
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

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal · Privacy"
      title="Privacy Policy"
      description="A plain-language explanation of what Porpolyo stores, why it is used, when your portfolio becomes public, and how to request access or deletion."
      lastUpdated={lastUpdated}
      sections={sections}
    />
  );
}
