import { nanoid } from "nanoid";
import { PersonalInformation, Portfolio, PortfolioSection } from "../types/portfolio";

const now = () => new Date().toISOString();

export function createDefaultPortfolio(templateId: string, paletteId: string, owner: PersonalInformation): Portfolio {
  const baseSections: Omit<PortfolioSection, "id">[] = templateId === "blank"
    ? [
        {
          type: "custom",
          label: "Blank section",
          visible: true,
          locked: false,
          order: 0,
          content: {},
          settings: {
            layoutMode: "stack",
            stackDirection: "column",
            stackAlign: "stretch",
            stackJustify: "flex-start",
            stackGap: 16,
            layoutWrap: false,
            spacing: "large",
            contentWidth: "wide",
          },
          customLayers: [],
        },
      ]
    : [
    {
      type: "header",
      label: "Header",
      visible: true,
      locked: true,
      order: 0,
      content: {
        logoText: owner.fullName,
        contactButton: "Contact",
        tabletNavigationMode: "text",
        mobileNavigationMode: "text",
      },
      settings: { spacing: "small", contentWidth: "wide" }
    },
    {
      type: "hero",
      label: "Hero",
      visible: true,
      locked: false,
      order: 1,
      variant: "Text left, image right",
      content: {
        eyebrow: `Available for ${owner.professionalTitle.toLowerCase()} work`,
        headline: owner.heroHeadline || `${owner.fullName} builds thoughtful digital work.`,
        description: owner.shortDescription,
        primaryCta: "View Projects",
        secondaryCta: "Contact Me",
        image: owner.profileImage
      },
      settings: { spacing: "large", contentWidth: "wide", alignment: "left" }
    },
    {
      type: "projects",
      label: "Projects",
      visible: true,
      locked: false,
      order: 2,
      content: {
        title: "Selected projects",
        description: "A focused sample of recent work, roles, and outcomes.",
        items: [
          { id: nanoid(), title: "Portfolio Platform", description: "A responsive portfolio system with reusable sections and publish-ready pages.", tags: ["React", "Design System"], projectUrl: "", repositoryUrl: "", role: "Lead Developer", completionDate: "2026", featured: true },
          { id: nanoid(), title: "Commerce Redesign", description: "A cleaner storefront experience with faster product discovery and stronger conversion paths.", tags: ["Shopify", "UX"], projectUrl: "", repositoryUrl: "", role: "UI Developer", completionDate: "2025", featured: false }
        ]
      },
      settings: { spacing: "large", contentWidth: "wide" }
    },
    {
      type: "certifications",
      label: "Certifications",
      visible: true,
      locked: false,
      order: 3,
      content: {
        title: "Certifications",
        items: [
          { id: nanoid(), name: "Professional Certification", organization: "Issuing Organization", issueDate: "2026", expirationDate: "", credentialId: "ABC-123", credentialUrl: "" }
        ]
      },
      settings: { spacing: "medium", contentWidth: "standard" }
    },
    {
      type: "services",
      label: "Services",
      visible: true,
      locked: false,
      order: 4,
      content: {
        title: "Services",
        subtitle: "Practical ways to work together.",
        items: [
          { id: nanoid(), title: "Website Build", description: "Responsive websites with clean content structure and reliable implementation.", startingPrice: "$1,500", ctaText: "Start a project", contactLink: `mailto:${owner.email}` },
          { id: nanoid(), title: "UI Review", description: "A focused audit of interface hierarchy, responsive behavior, and conversion friction.", startingPrice: "$450", ctaText: "Book review", contactLink: `mailto:${owner.email}` }
        ]
      },
      settings: { spacing: "large", contentWidth: "wide" }
    },
    {
      type: "about",
      label: "About",
      visible: true,
      locked: false,
      order: 5,
      content: {
        title: "About me",
        description: owner.aboutDescription || owner.shortDescription,
        skills: ["Frontend", "Product Design", "Responsive UI", "Client Collaboration"],
        experienceSummary: "5+ years building practical digital products.",
        availability: "Open to selected projects",
        resumeUrl: ""
      },
      settings: { spacing: "large", contentWidth: "standard" }
    },
    {
      type: "footer",
      label: "Footer",
      visible: true,
      locked: true,
      order: 6,
      content: {
        message: "Let’s build something useful.",
        copyright: `© ${new Date().getFullYear()} ${owner.fullName}. All rights reserved.`
      },
      settings: { spacing: "medium", contentWidth: "wide" }
    }
      ];

  return {
    id: nanoid(),
    title: `${owner.fullName || "Untitled"} Portfolio`,
    templateId,
    paletteId,
    head: {
      title: `${owner.fullName} - ${owner.professionalTitle}`,
      description: owner.shortDescription,
      keywords: `${owner.fullName}, ${owner.professionalTitle}, portfolio`,
      author: owner.fullName,
      canonicalUrl: "",
      favicon: "",
      ogTitle: `${owner.fullName} Portfolio`,
      ogDescription: owner.shortDescription,
      ogImage: owner.profileImage?.url || "",
      twitterTitle: `${owner.fullName} Portfolio`,
      twitterDescription: owner.shortDescription,
      twitterImage: owner.profileImage?.url || "",
      robots: "index,follow"
    },
    owner,
    sections: baseSections.map((section) => ({ ...section, id: nanoid() })),
    settings: {
      stickyHeader: true,
      public: false,
      breakpointWidths: { tablet: 768, mobile: 390 },
      bodyLayout: {
        layoutMode: "stack",
        stackDirection: "column",
        stackAlign: "stretch",
        stackJustify: "flex-start",
        stackGap: 0,
        layoutWrap: false,
      },
    },
    createdAt: now(),
    updatedAt: now()
  };
}
