import { ArrowLeft, Check, ImagePlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { palettes, templates } from "../data/templates";
import { limits } from "../data/limits";
import { uploadImageToSupabase } from "../lib/uploadImage";
import { ImageAsset, PersonalInformation } from "../types/portfolio";

interface Props {
  onBack: () => void;
  onBuild: (templateId: string, paletteId: string, owner: PersonalInformation) => void;
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
  github: ""
};

export function Onboarding({ onBack, onBuild }: Props) {
  const [step, setStep] = useState(1);
  const [templateId, setTemplateId] = useState(templates[0].id);
  const [paletteId, setPaletteId] = useState(templates[0].defaultPaletteId);
  const [profileImage, setProfileImage] = useState<ImageAsset | undefined>();
  const draftUploadProjectId = useMemo(() => `draft-${crypto.randomUUID()}`, []);
  const { register, handleSubmit, watch } = useForm<FormValues>({ defaultValues: defaults });
  const values = watch();
  const palette = palettes.find((item) => item.id === paletteId)!;

  const uploadImage = async (file?: File) => {
    if (!file) return;
    try {
      setProfileImage(await uploadImageToSupabase({
        file,
        projectId: draftUploadProjectId,
        slot: "profile-image",
        alt: values.fullName ? `${values.fullName} profile image` : "Profile image",
        label: "Uploading profile image",
      }));
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) console.error(error);
    }
  };

  const submit = (data: FormValues) => {
    const socialLinks = [
      { platform: "Website", url: data.website },
      { platform: "LinkedIn", url: data.linkedin },
      { platform: "GitHub", url: data.github }
    ].filter((link) => link.url);
    onBuild(templateId, paletteId, {
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
      profileImage
    });
  };

  return (
    <main className="onboarding">
      <header className="onboarding-header">
        <button className="ghost" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <div className="steps">
          {[1, 2, 3].map((item) => <span key={item} className={step === item ? "active" : ""}>{item}</span>)}
        </div>
      </header>

      {step === 1 && (
        <section>
          <h1>Select a template</h1>
          <div className="template-grid">
            {templates.map((template) => (
                <button key={template.id} className={`template-card ${templateId === template.id ? "selected" : ""}`} onClick={() => setTemplateId(template.id)}>
                <div className={`mini-preview ${template.id}`} style={{ "--p": palette.primary, "--a": palette.accent, "--bg": palette.background, "--s": palette.surface, "--b": palette.border } as React.CSSProperties}>
                  <span />
                  <strong />
                  <small />
                  <i />
                </div>
                <span>{template.name}</span>
                <small>{template.description}</small>
                {templateId === template.id && <Check className="check" size={18} />}
              </button>
            ))}
          </div>
          <button className="primary-step" onClick={() => setStep(2)}>Continue</button>
        </section>
      )}

      {step === 2 && (
        <section>
          <h1>Select a color palette</h1>
          <div className="palette-grid">
            {palettes.map((item) => (
              <button key={item.id} className={`palette-card ${paletteId === item.id ? "selected" : ""}`} onClick={() => setPaletteId(item.id)}>
                <span>{item.name}</span>
                <div>{[item.primary, item.secondary, item.accent, item.background, item.surface, item.text, item.muted, item.border].map((color) => <i key={color} style={{ background: color }} />)}</div>
              </button>
            ))}
          </div>
          <div className="step-actions">
            <button className="ghost" onClick={() => setStep(1)}>Back</button>
            <button onClick={() => setStep(3)}>Continue</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit(submit)} className="info-form">
          <h1>Enter basic information</h1>
          <Field label="Full name" limit={limits.fullName} value={values.fullName} input={<input maxLength={limits.fullName} {...register("fullName", { required: true, maxLength: limits.fullName })} />} />
          <Field label="Professional title" limit={limits.professionalTitle} value={values.professionalTitle} input={<input maxLength={limits.professionalTitle} {...register("professionalTitle", { required: true })} />} />
          <Field label="Hero headline" limit={limits.heroHeadline} value={values.heroHeadline} input={<input maxLength={limits.heroHeadline} {...register("heroHeadline")} />} />
          <Field label="Email address" value={values.email} input={<input type="email" {...register("email", { required: true })} />} />
          <div className="form-pair">
            <Field label="Phone number" value={values.phone} input={<input {...register("phone")} />} />
            <Field label="Location" value={values.location} input={<input {...register("location")} />} />
          </div>
          <Field label="Short description" limit={limits.shortDescription} value={values.shortDescription} input={<textarea maxLength={limits.shortDescription} {...register("shortDescription", { required: true })} />} />
          <Field label="About description" limit={limits.aboutDescription} value={values.aboutDescription} input={<textarea maxLength={limits.aboutDescription} {...register("aboutDescription")} />} />
          <div className="form-pair">
            <Field label="Portfolio username" value={values.username} input={<input {...register("username", { required: true })} />} />
            <Field label="Contact info" value={values.contactInfo} input={<input {...register("contactInfo")} />} />
          </div>
          <div className="form-pair">
            <Field label="Website" value={values.website} input={<input {...register("website")} />} />
            <Field label="LinkedIn" value={values.linkedin} input={<input {...register("linkedin")} />} />
          </div>
          <Field label="GitHub" value={values.github} input={<input {...register("github")} />} />
          <label className="upload-slot">
            <ImagePlus size={20} />
            <span>{profileImage ? profileImage.alt : "Upload profile or hero image"}</span>
            <input type="file" accept="image/*" onChange={(event) => uploadImage(event.target.files?.[0])} />
          </label>
          <div className="step-actions">
            <button type="button" className="ghost" onClick={() => setStep(2)}>Back</button>
            <button type="submit">Build Layout</button>
          </div>
        </form>
      )}
    </main>
  );
}

function Field({ label, input, limit, value }: { label: string; input: React.ReactNode; limit?: number; value?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      {input}
      {limit && <small>{Math.max(0, limit - (value?.length || 0))} characters remaining</small>}
    </label>
  );
}
