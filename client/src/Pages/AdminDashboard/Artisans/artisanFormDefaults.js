export const ARTISAN_FORM_TABS = [
  { id: "basic", label: "Basic Info" },
  { id: "profile", label: "Profile Image" },
  { id: "about", label: "About" },
  { id: "social", label: "Social Links" },
];

export const defaultArtisanFields = {
  name: "",
  slug: "",
  status: "active",
  bio: "",
  location: "",
  story: "",
  social: {
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",
  },
};

export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function artisanToForm(artisan) {
  if (!artisan) return { ...defaultArtisanFields };

  return {
    name: artisan.name || "",
    slug: artisan.slug || "",
    status: artisan.status || "active",
    bio: artisan.bio || "",
    location: artisan.location || "",
    story: artisan.story || "",
    social: {
      website: artisan.social?.website || "",
      facebook: artisan.social?.facebook || "",
      instagram: artisan.social?.instagram || "",
      twitter: artisan.social?.twitter || "",
    },
  };
}

export function formToPayload(formFields, images) {
  return {
    name: formFields.name,
    slug: formFields.slug || slugify(formFields.name),
    status: formFields.status || "active",
    bio: formFields.bio || "",
    location: formFields.location || "",
    story: formFields.story || "",
    social: formFields.social || {},
    images: images || [],
  };
}
