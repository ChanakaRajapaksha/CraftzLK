export const defaultPromoBannerFields = {
  heading: "",
  title: "",
  description: "",
  buttonText: "Shop Now",
  buttonUrl: "",
  displayOrder: "",
  status: "active",
};

export function bannerFromRecord(record) {
  return {
    heading: record.heading || "",
    title: record.title || record.heading || "",
    description: record.description || "",
    buttonText: record.buttonText || "Shop Now",
    buttonUrl: record.buttonUrl || record.link || "",
    displayOrder: record.displayOrder ?? "",
    status: record.status || "active",
  };
}

export function formToPayload(formFields, desktopImage, mobileImage) {
  return {
    heading: formFields.heading,
    title: formFields.title || formFields.heading,
    description: formFields.description || "",
    buttonText: formFields.buttonText || "Shop Now",
    buttonUrl: formFields.buttonUrl || "",
    link: formFields.buttonUrl || "",
    desktopImage: desktopImage || "",
    mobileImage: mobileImage || "",
    displayOrder: Number(formFields.displayOrder) || 0,
    status: formFields.status || "active",
  };
}
