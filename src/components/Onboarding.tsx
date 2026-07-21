"use client";

import {
  Badge,
  Box,
  Button,
  Container,
  Field,
  Flex,
  Heading,
  HStack,
  Image,
  Input,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  File,
  Files,
  ImagePlus,
  LayoutTemplate,
  Lock,
} from "lucide-react";
import { nanoid } from "nanoid";
import { useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { brandFont } from "../data/brand";
import { limits } from "../data/limits";
import { palettes, templates } from "../data/templates";
import { ProjectUsernameTakenError } from "../lib/projects";
import { uploadImageToSupabase } from "../lib/uploadImage";
import { ImageAsset, PersonalInformation } from "../types/portfolio";
import { ColorModeButton } from "./ui/color-mode";

interface Props {
  onBack: () => void;
  onBuild: (
    templateId: string,
    paletteId: string,
    owner: PersonalInformation,
  ) => void | Promise<void>;
}

type FormValues = Omit<PersonalInformation, "socialLinks" | "profileImage"> & {
  heroHeadline: string;
  website: string;
  linkedin: string;
  github: string;
};

const defaults: FormValues = {
  fullName: "Ariel Jericko Gacilo",
  professionalTitle: "Full-Stack Developer",
  email: "hello@example.com",
  phone: "",
  contactInfo: "",
  location: "Manila, Philippines",
  heroHeadline: "I design and build practical web products.",
  shortDescription: "A developer focused on responsive interfaces, useful tools, and clean implementation.",
  aboutDescription: "I work across product design and frontend engineering to turn ideas into clear, fast, maintainable web experiences.",
  username: "ariel-portfolio",
  website: "",
  linkedin: "",
  github: "",
};

const steps = [
  { number: 1, label: "Type" },
  { number: 2, label: "Template" },
  { number: 3, label: "Palette" },
  { number: 4, label: "Basic information" },
];

export function Onboarding({ onBack, onBuild }: Props) {
  const [step, setStep] = useState(1);
  const [portfolioType, setPortfolioType] = useState<"single-page">("single-page");
  const [templateId, setTemplateId] = useState(templates[0].id);
  const [paletteId, setPaletteId] = useState(templates[0].defaultPaletteId);
  const [profileImage, setProfileImage] = useState<ImageAsset | undefined>();
  const [isUploading, setIsUploading] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildError, setBuildError] = useState("");
  const generatedUsername = useRef(
    `${defaults.username}-${nanoid(5).toLowerCase().replace(/[^a-z0-9]/g, "x")}`,
  );
  const draftUploadProjectId = useRef<string>();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { ...defaults, username: generatedUsername.current },
  });
  const values = watch();

  const uploadImage = async (file?: File) => {
    if (!file) return;
    setIsUploading(true);
    setBuildError("");
    try {
      setProfileImage(await uploadImageToSupabase({
        file,
        projectId: draftUploadProjectId.current ??= `draft-${nanoid()}`,
        slot: "profile-image",
        alt: values.fullName ? `${values.fullName} profile image` : "Profile image",
        label: "Uploading profile image",
      }));
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setBuildError(error instanceof Error ? error.message : "Could not upload the image.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const submit = async (data: FormValues) => {
    const socialLinks = [
      { platform: "Website", url: data.website },
      { platform: "LinkedIn", url: data.linkedin },
      { platform: "GitHub", url: data.github },
    ].filter((link) => link.url);
    setBuildError("");
    setIsBuilding(true);
    try {
      await onBuild(templateId, paletteId, {
        fullName: data.fullName,
        professionalTitle: data.professionalTitle,
        email: data.email,
        phone: data.phone,
        contactInfo: data.contactInfo,
        location: data.location,
        heroHeadline: data.heroHeadline,
        shortDescription: data.shortDescription,
        aboutDescription: data.aboutDescription,
        username: data.username,
        socialLinks,
        profileImage,
      });
    } catch (error) {
      if (error instanceof ProjectUsernameTakenError) {
        setError(
          "username",
          { type: "server", message: error.message },
          { shouldFocus: true },
        );
        return;
      }
      setBuildError(
        error instanceof Error ? error.message : "Could not create the project.",
      );
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <Box bg="bg" color="fg" minH="100vh">
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex="docked"
        bg="bg/80"
        backdropFilter="blur(10px)"
        borderBottom="1px solid"
        borderColor="border"
      >
        <Container maxW="6xl" py={3}>
          <Flex justify="space-between" align="center" gap={4}>
            <HStack gap={2.5} align="baseline">
              <Heading
                as="span"
                fontFamily={brandFont}
                fontWeight="bold"
                fontSize="2xl"
                letterSpacing="-0.01em"
                lineHeight="1"
              >
                porpolyo
              </Heading>
              <Text color="fg.muted" fontSize="sm" display={{ base: "none", sm: "block" }}>
                / new portfolio
              </Text>
            </HStack>
            <HStack gap={2}>
              <ColorModeButton />
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft size={16} />
                <Box as="span" display={{ base: "none", sm: "inline" }}>Dashboard</Box>
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="6xl" py={{ base: 8, md: 10 }}>
        <Stack gap={{ base: 8, md: 10 }}>
          <Flex
            justify="space-between"
            align={{ base: "flex-start", lg: "flex-end" }}
            direction={{ base: "column", lg: "row" }}
            gap={6}
          >
            <Stack gap={2} maxW="2xl">
              <Badge colorPalette="blue" variant="subtle" rounded="full" px={3} alignSelf="flex-start">
                Create a portfolio
              </Badge>
              <Heading size={{ base: "2xl", md: "3xl" }} letterSpacing="-0.02em">
                {step === 1 && "Choose your portfolio type"}
                {step === 2 && "Choose your starting point"}
                {step === 3 && "Pick a color direction"}
                {step === 4 && "Tell us about your work"}
              </Heading>
              <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }}>
                {step === 1 && "Choose how visitors will move through your portfolio."}
                {step === 2 && "Select a layout you can refine later in the visual editor."}
                {step === 3 && "Choose a palette for the initial design. Every color remains editable."}
                {step === 4 && "Add the core information used to generate your portfolio content."}
              </Text>
            </Stack>
            <StepIndicator currentStep={step} />
          </Flex>

          {step === 1 && (
            <Stack gap={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={5} maxW="4xl">
                <Button
                  type="button"
                  variant="plain"
                  display="block"
                  h="auto"
                  p={6}
                  whiteSpace="normal"
                  textAlign="left"
                  aria-pressed={portfolioType === "single-page"}
                  bg="bg.panel"
                  rounded="xl"
                  border="1px solid"
                  borderColor="blue.solid"
                  boxShadow="0 0 0 1px var(--chakra-colors-blue-solid)"
                  transition="border-color 0.2s, box-shadow 0.2s, transform 0.2s"
                  _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                  _focusVisible={{ outline: "2px solid", outlineColor: "blue.solid", outlineOffset: "2px" }}
                  onClick={() => setPortfolioType("single-page")}
                >
                  <Stack gap={5}>
                    <Flex justify="space-between" align="flex-start" gap={4}>
                      <Flex boxSize={12} rounded="lg" bg="blue.subtle" color="blue.fg" align="center" justify="center">
                        <File size={23} aria-hidden="true" />
                      </Flex>
                      <Flex bg="blue.solid" color="blue.contrast" rounded="full" boxSize={6} align="center" justify="center">
                        <Check size={14} aria-hidden="true" />
                      </Flex>
                    </Flex>
                    <Stack gap={1.5}>
                      <Heading size="md">Single page</Heading>
                      <Text color="fg.muted" fontSize="sm">
                        Keep every section in one focused, scrollable portfolio.
                      </Text>
                    </Stack>
                  </Stack>
                </Button>

                <Button
                  type="button"
                  variant="plain"
                  display="block"
                  h="auto"
                  p={6}
                  whiteSpace="normal"
                  textAlign="left"
                  disabled
                  aria-describedby="multipage-status"
                  bg="bg.subtle"
                  rounded="xl"
                  border="1px solid"
                  borderColor="border"
                  opacity={0.7}
                  cursor="not-allowed"
                >
                  <Stack gap={5}>
                    <Flex justify="space-between" align="flex-start" gap={4}>
                      <Flex boxSize={12} rounded="lg" bg="bg.muted" color="fg.muted" align="center" justify="center">
                        <Files size={23} aria-hidden="true" />
                      </Flex>
                      <Badge id="multipage-status" variant="subtle" colorPalette="gray" rounded="full" px={2.5}>
                        <Lock size={12} aria-hidden="true" /> Locked
                      </Badge>
                    </Flex>
                    <Stack gap={1.5}>
                      <Heading size="md">Multipage</Heading>
                      <Text color="fg.muted" fontSize="sm">
                        Organize your work across separate pages. Coming later.
                      </Text>
                    </Stack>
                  </Stack>
                </Button>
              </SimpleGrid>
              <Flex justify="flex-end">
                <Button size="lg" colorPalette="blue" onClick={() => setStep(2)}>
                  Continue to templates <ArrowRight size={17} />
                </Button>
              </Flex>
            </Stack>
          )}

          {step === 2 && (
            <Stack gap={6}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                {templates.map((template) => {
                  const isSelected = templateId === template.id;
                  const previewPalette = palettes.find((item) => item.id === template.defaultPaletteId) ?? palettes[0];
                  return (
                    <Button
                      key={template.id}
                      type="button"
                      variant="plain"
                      display="block"
                      h="auto"
                      p={0}
                      whiteSpace="normal"
                      aria-pressed={isSelected}
                      textAlign="left"
                      rounded="xl"
                      bg="bg.panel"
                      border="1px solid"
                      borderColor={isSelected ? "blue.solid" : "border"}
                      boxShadow={isSelected ? "0 0 0 1px var(--chakra-colors-blue-solid)" : "sm"}
                      overflow="hidden"
                      transition="border-color 0.2s, box-shadow 0.2s, transform 0.2s"
                      _hover={{ borderColor: "blue.solid", shadow: "md", transform: "translateY(-2px)" }}
                      _focusVisible={{ outline: "2px solid", outlineColor: "blue.solid", outlineOffset: "2px" }}
                      onClick={() => {
                        setTemplateId(template.id);
                        setPaletteId(template.defaultPaletteId);
                      }}
                    >
                      <TemplatePreview palette={previewPalette} templateId={template.id} />
                      <Stack p={5} gap={2}>
                        <HStack justify="space-between" align="flex-start" gap={3}>
                          <Heading size="md">{template.name}</Heading>
                          {isSelected && (
                            <Flex bg="blue.solid" color="blue.contrast" rounded="full" boxSize={6} align="center" justify="center">
                              <Check size={14} />
                            </Flex>
                          )}
                        </HStack>
                        <Text color="fg.muted" fontSize="sm">{template.description}</Text>
                      </Stack>
                    </Button>
                  );
                })}
              </SimpleGrid>
              <Flex justify="space-between" gap={3}>
                <Button size="lg" variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft size={17} /> Back
                </Button>
                <Button size="lg" colorPalette="blue" onClick={() => setStep(3)}>
                  Continue to colors <ArrowRight size={17} />
                </Button>
              </Flex>
            </Stack>
          )}

          {step === 3 && (
            <Stack gap={6}>
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={5}>
                {palettes.map((item) => {
                  const isSelected = paletteId === item.id;
                  const colors = [item.primary, item.secondary, item.accent, item.background, item.surface, item.text, item.muted, item.border];
                  return (
                    <Button
                      key={item.id}
                      type="button"
                      variant="plain"
                      display="block"
                      h="auto"
                      whiteSpace="normal"
                      aria-pressed={isSelected}
                      p={5}
                      textAlign="left"
                      bg="bg.panel"
                      rounded="xl"
                      border="1px solid"
                      borderColor={isSelected ? "blue.solid" : "border"}
                      boxShadow={isSelected ? "0 0 0 1px var(--chakra-colors-blue-solid)" : "sm"}
                      transition="border-color 0.2s, box-shadow 0.2s, transform 0.2s"
                      _hover={{ borderColor: "blue.solid", shadow: "md", transform: "translateY(-2px)" }}
                      _focusVisible={{ outline: "2px solid", outlineColor: "blue.solid", outlineOffset: "2px" }}
                      onClick={() => setPaletteId(item.id)}
                    >
                      <HStack justify="space-between" mb={4}>
                        <Heading size="sm">{item.name}</Heading>
                        {isSelected && <Check size={18} />}
                      </HStack>
                      <SimpleGrid columns={4} gap={2}>
                        {colors.map((color, index) => (
                          <Box
                            key={`${color}-${index}`}
                            bg={color}
                            aspectRatio={1}
                            rounded="md"
                            border="1px solid"
                            borderColor="blackAlpha.200"
                          />
                        ))}
                      </SimpleGrid>
                    </Button>
                  );
                })}
              </SimpleGrid>
              <Flex justify="space-between" gap={3}>
                <Button size="lg" variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft size={17} /> Back
                </Button>
                <Button size="lg" colorPalette="blue" onClick={() => setStep(4)}>
                  Continue to details <ArrowRight size={17} />
                </Button>
              </Flex>
            </Stack>
          )}

          {step === 4 && (
            <Box as="form" onSubmit={handleSubmit(submit)}>
              <Stack gap={5}>
                <FormSection title="Profile" description="The main details displayed throughout your portfolio.">
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <FormField label="Full name" required error={errors.fullName?.message} helper={`${Math.max(0, limits.fullName - (values.fullName?.length || 0))} characters remaining`}>
                      <Input maxLength={limits.fullName} {...register("fullName", { required: "Full name is required", maxLength: limits.fullName })} />
                    </FormField>
                    <FormField label="Professional title" required error={errors.professionalTitle?.message} helper={`${Math.max(0, limits.professionalTitle - (values.professionalTitle?.length || 0))} characters remaining`}>
                      <Input maxLength={limits.professionalTitle} {...register("professionalTitle", { required: "Professional title is required" })} />
                    </FormField>
                    <FormField label="Email address" required error={errors.email?.message}>
                      <Input type="email" {...register("email", { required: "Email address is required" })} />
                    </FormField>
                    <FormField label="Phone number">
                      <Input type="tel" {...register("phone")} />
                    </FormField>
                    <FormField label="Location">
                      <Input {...register("location")} />
                    </FormField>
                    <FormField label="Contact info">
                      <Input {...register("contactInfo")} />
                    </FormField>
                  </SimpleGrid>
                </FormSection>

                <FormSection title="Introduction" description="Shape the first impression and your about section.">
                  <Stack gap={4}>
                    <FormField label="Hero headline" helper={`${Math.max(0, limits.heroHeadline - (values.heroHeadline?.length || 0))} characters remaining`}>
                      <Input maxLength={limits.heroHeadline} {...register("heroHeadline")} />
                    </FormField>
                    <FormField label="Short description" required error={errors.shortDescription?.message} helper={`${Math.max(0, limits.shortDescription - (values.shortDescription?.length || 0))} characters remaining`}>
                      <Textarea minH="24" resize="vertical" maxLength={limits.shortDescription} {...register("shortDescription", { required: "Short description is required" })} />
                    </FormField>
                    <FormField label="About description" helper={`${Math.max(0, limits.aboutDescription - (values.aboutDescription?.length || 0))} characters remaining`}>
                      <Textarea minH="32" resize="vertical" maxLength={limits.aboutDescription} {...register("aboutDescription")} />
                    </FormField>
                  </Stack>
                </FormSection>

                <FormSection title="Publishing and links" description="Set your public slug, profile image, and professional links.">
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <FormField label="Portfolio username" required error={errors.username?.message}>
                      <Input
                        {...register("username", {
                          required: "Portfolio username is required",
                          onChange: () => clearErrors("username"),
                        })}
                      />
                    </FormField>
                    <FormField label="Website">
                      <Input type="url" placeholder="https://example.com" {...register("website")} />
                    </FormField>
                    <FormField label="LinkedIn">
                      <Input type="url" placeholder="https://linkedin.com/in/..." {...register("linkedin")} />
                    </FormField>
                    <FormField label="GitHub">
                      <Input type="url" placeholder="https://github.com/..." {...register("github")} />
                    </FormField>
                  </SimpleGrid>
                  <Box
                    as="label"
                    display="flex"
                    alignItems="center"
                    gap={4}
                    mt={4}
                    p={4}
                    rounded="lg"
                    border="1px dashed"
                    borderColor="border.emphasized"
                    bg="bg.subtle"
                    cursor={isUploading ? "wait" : "pointer"}
                    _hover={{ borderColor: "blue.solid" }}
                  >
                    {profileImage ? (
                      <Image src={profileImage.url} alt={profileImage.alt} boxSize={12} rounded="full" objectFit="cover" />
                    ) : (
                      <Flex boxSize={12} rounded="full" bg="blue.subtle" color="blue.fg" align="center" justify="center" flexShrink={0}>
                        <ImagePlus size={21} />
                      </Flex>
                    )}
                    <Stack gap={0} flex={1}>
                      <Text fontWeight="semibold">{isUploading ? "Uploading image..." : profileImage ? "Profile image uploaded" : "Add a profile image"}</Text>
                      <Text color="fg.muted" fontSize="sm">PNG, JPG, WebP, or GIF.</Text>
                    </Stack>
                    <Input display="none" type="file" accept="image/*" disabled={isUploading} onChange={(event) => uploadImage(event.target.files?.[0])} />
                  </Box>
                </FormSection>

                {buildError && (
                  <Box role="alert" p={4} rounded="lg" bg="red.subtle" color="red.fg" border="1px solid" borderColor="red.muted">
                    {buildError}
                  </Box>
                )}

                <Flex justify="space-between" gap={3} pt={1}>
                  <Button size="lg" type="button" variant="outline" onClick={() => setStep(3)} disabled={isBuilding}>
                    <ArrowLeft size={17} /> Back
                  </Button>
                  <Button size="lg" type="submit" colorPalette="blue" loading={isBuilding} loadingText="Creating project" disabled={isUploading}>
                    <LayoutTemplate size={18} /> Build portfolio
                  </Button>
                </Flex>
              </Stack>
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <HStack gap={{ base: 2, sm: 3 }} aria-label={`Step ${currentStep} of ${steps.length}`}>
      {steps.map((item, index) => {
        const isCurrent = item.number === currentStep;
        const isComplete = item.number < currentStep;
        return (
          <HStack key={item.number} gap={{ base: 2, sm: 3 }}>
            <HStack gap={2} aria-current={isCurrent ? "step" : undefined}>
              <Flex
                boxSize={8}
                rounded="full"
                align="center"
                justify="center"
                bg={isCurrent || isComplete ? "blue.solid" : "bg.muted"}
                color={isCurrent || isComplete ? "blue.contrast" : "fg.muted"}
                fontSize="sm"
                fontWeight="bold"
              >
                {isComplete ? <Check size={15} /> : item.number}
              </Flex>
              <Text fontSize="sm" fontWeight={isCurrent ? "semibold" : "medium"} color={isCurrent ? "fg" : "fg.muted"} display={{ base: isCurrent ? "block" : "none", sm: "block" }}>
                {item.label}
              </Text>
            </HStack>
            {index < steps.length - 1 && <Box w={{ base: 3, sm: 6 }} h="1px" bg={isComplete ? "blue.solid" : "border"} />}
          </HStack>
        );
      })}
    </HStack>
  );
}

function TemplatePreview({ palette, templateId }: { palette: (typeof palettes)[number]; templateId: string }) {
  if (templateId === "neo-brutal") {
    return (
      <Image
        src="/assets/neo-brutalism.png"
        alt=""
        w="full"
        h="48"
        objectFit="cover"
        borderBottom="1px solid"
        borderColor="border"
        aria-hidden="true"
      />
    );
  }

  if (templateId === "blank") {
    return (
      <Box
        bg={palette.background}
        p={4}
        h="48"
        borderBottom="1px solid"
        borderColor="border"
        aria-hidden="true"
      >
        <Flex
          h="full"
          align="center"
          justify="center"
          border="1px dashed"
          borderColor={palette.border}
          bg={palette.surface}
          rounded="lg"
        >
          <Stack align="center" gap={2} color={palette.muted}>
            <LayoutTemplate size={28} />
            <Text fontSize="xs" fontWeight="medium">Empty editable section</Text>
          </Stack>
        </Flex>
      </Box>
    );
  }
  return (
    <Box bg={palette.background} p={4} h="48" borderBottom="1px solid" borderColor="border" aria-hidden="true">
      <Box h="full" border="1px solid" borderColor={palette.border} rounded={templateId === "neo-brutal" ? "none" : "lg"} bg={palette.surface} overflow="hidden">
        <Flex px={3} py={2} align="center" justify="space-between" borderBottom="1px solid" borderColor={palette.border}>
          <Box w="16" h="2" rounded="full" bg={palette.primary} />
          <HStack gap={1.5}>
            {[0, 1, 2].map((item) => <Box key={item} w="5" h="1.5" rounded="full" bg={palette.muted} />)}
          </HStack>
        </Flex>
        <SimpleGrid columns={2} gap={3} p={3} alignItems="center">
          <Stack gap={2}>
            <Box w="12" h="1.5" rounded="full" bg={palette.accent} />
            <Box w="full" h="4" rounded="sm" bg={palette.primary} />
            <Box w="4/5" h="2" rounded="full" bg={palette.muted} />
            <Box w="16" h="5" rounded="md" bg={palette.accent} />
          </Stack>
          <Box h="24" rounded={templateId === "neo-brutal" ? "none" : "md"} bg={palette.secondary} border="1px solid" borderColor={palette.border} />
        </SimpleGrid>
      </Box>
    </Box>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Box bg="bg.panel" border="1px solid" borderColor="border" rounded="xl" p={{ base: 5, md: 6 }}>
      <Stack gap={5}>
        <Stack gap={1}>
          <Heading size="md">{title}</Heading>
          <Text color="fg.muted" fontSize="sm">{description}</Text>
        </Stack>
        {children}
      </Stack>
    </Box>
  );
}

function FormField({ label, children, helper, error, required = false }: { label: string; children: ReactNode; helper?: string; error?: string; required?: boolean }) {
  return (
    <Field.Root required={required} invalid={Boolean(error)}>
      <Field.Label>{label}<Field.RequiredIndicator /></Field.Label>
      {children}
      {helper && <Field.HelperText>{helper}</Field.HelperText>}
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  );
}
